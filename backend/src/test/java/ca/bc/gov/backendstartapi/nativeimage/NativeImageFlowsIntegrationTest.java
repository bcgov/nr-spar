package ca.bc.gov.backendstartapi.nativeimage;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.backendstartapi.dto.SeedlotCollectionGeometryDto;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.report.html.HtmlPdfRenderer;
import ca.bc.gov.backendstartapi.report.html.Sprr001HtmlModel;
import ca.bc.gov.backendstartapi.report.html.Sprr001HtmlSamples;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.service.SeedlotCollectionGeometryService;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

/**
 * Exercises the code paths that use reflection or classpath resources a GraalVM native image can't
 * see on its own (Hibernate Spatial + PostGIS, geolatte GeoJSON, PDF rendering), against a real
 * PostGIS database.
 *
 * <p>Two uses:
 *
 * <ul>
 *   <li>Run on a GraalVM JVM with {@code -agentlib:native-image-agent} to record the native-image
 *       metadata these flows need.
 *   <li>Run as a native test to prove the native image handles them.
 * </ul>
 *
 * <p>Disabled unless {@code -Dnative.flows.db-url=jdbc:postgresql://host:port/spar} is given, so
 * normal builds never need a database.
 */
@SpringBootTest
@EnabledIfSystemProperty(named = "native.flows.db-url", matches = ".+")
class NativeImageFlowsIntegrationTest {

  private static final String SEEDLOT = "99001";

  private static final String POLYGON_FEATURE =
      """
      {"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[
        [-125.50,49.08],[-125.48,49.08],[-125.48,49.10],[-125.50,49.10],[-125.50,49.08]]]}}
      """;

  @Autowired private SeedlotCollectionGeometryService geometryService;
  @Autowired private SeedlotRepository seedlotRepository;
  @Autowired private HtmlPdfRenderer htmlPdfRenderer;
  @Autowired private JdbcTemplate jdbcTemplate;

  @DynamicPropertySource
  static void database(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", () -> System.getProperty("native.flows.db-url"));
    registry.add(
        "spring.datasource.username", () -> System.getProperty("native.flows.db-user", "postgres"));
    registry.add(
        "spring.datasource.password",
        () -> System.getProperty("native.flows.db-password", "default"));
    registry.add("spring.datasource.driverClassName", () -> "org.postgresql.Driver");
    registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.PostgreSQLDialect");
    registry.add("spring.jpa.properties.hibernate.default_schema", () -> "spar");
    registry.add("spring.jpa.hibernate.ddl-auto", () -> "none");
    registry.add("spring.jpa.hibernate.generate-ddl", () -> "false");
    registry.add("spring.flyway.enabled", () -> "true");
    registry.add("spring.flyway.locations", () -> "classpath:db/migration");
    registry.add("spring.flyway.baseline-on-migrate", () -> "true");
  }

  /** A TSC admin, with the same claims the Cognito token carries. */
  @BeforeEach
  void loggedInAsTscAdmin() {
    Jwt jwt =
        Jwt.withTokenValue("native-flows")
            .header("alg", "none")
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(600))
            .claim("custom:idp_name", "idir")
            .claim("custom:idp_username", "NATIVE")
            .claim("custom:idp_display_name", "Flows, Native")
            .claim("email", "native@example.com")
            .claim("cognito:groups", List.of("SPAR_TSC_ADMIN"))
            .build();
    SecurityContextHolder.getContext()
        .setAuthentication(
            new JwtAuthenticationToken(jwt, List.of(new SimpleGrantedAuthority("SPAR_TSC_ADMIN"))));
  }

  @AfterEach
  void logOut() {
    SecurityContextHolder.clearContext();
  }

  @BeforeEach
  void seedlotExists() {
    jdbcTemplate.update(
        """
        insert into spar.seedlot (seedlot_number, seedlot_status_code, applicant_client_number,
          applicant_locn_code, applicant_email_address, vegetation_code, genetic_class_code,
          seedlot_source_code, to_be_registrd_ind, bc_source_ind, entry_userid, entry_timestamp,
          update_userid, update_timestamp, revision_count)
        values (?, 'PND', '00012797', '01', 'native@example.com', 'FDC', 'B', 'CUS', true, true,
          'IDIR\\NATIVE', current_timestamp, 'IDIR\\NATIVE', current_timestamp, 0)
        on conflict (seedlot_number) do nothing
        """,
        SEEDLOT);
  }

  @Test
  void collectionGeometry_savesMeasuresAndReadsBack() {
    Seedlot seedlot = seedlotRepository.findById(SEEDLOT).orElseThrow();

    // Same call the B-class submission makes: GeoJSON parse, PostGIS geography measurement
    // (native query + projection), JTS geometry insert, commit.
    geometryService.saveOrUpdate(seedlot, POLYGON_FEATURE, "IDIR\\NATIVE");
    // Second save takes the update path on the existing row.
    geometryService.saveOrUpdate(seedlot, POLYGON_FEATURE, "IDIR\\NATIVE");

    SeedlotCollectionGeometryDto saved = geometryService.getBySeedlotNumber(SEEDLOT);
    assertNotNull(saved.geometryGeoJson());
    assertTrue(saved.geometryGeoJson().contains("Polygon"), saved.geometryGeoJson());
    assertNotNull(saved.featureArea());
    assertTrue(saved.featureArea().doubleValue() > 0);

    // Null GeoJSON deletes the row.
    geometryService.saveOrUpdate(seedlot, null, "IDIR\\NATIVE");
    assertEquals(
        0,
        jdbcTemplate.queryForObject(
            "select count(*) from spar.seedlot_collection_geometry where seedlot_number = ?",
            Integer.class,
            SEEDLOT));
  }

  @Test
  void sprr001_rendersPdf() {
    Sprr001HtmlModel model =
        Sprr001HtmlModel.from(
            Sprr001HtmlSamples.classB(),
            "63001",
            "IDIR\\NATIVE",
            ZonedDateTime.now(ZoneId.of("America/Vancouver")),
            HtmlPdfRenderer.dataUri("reports/SPRR001/spar_bc_logo.jpg", "image/jpeg"));

    byte[] pdf = htmlPdfRenderer.render("sprr001", Map.of("m", model));

    assertTrue(pdf.length > 1000);
    assertEquals("%PDF", new String(pdf, 0, 4));
  }
}
