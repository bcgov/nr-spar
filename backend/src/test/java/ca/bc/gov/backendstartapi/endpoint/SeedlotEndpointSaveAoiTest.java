package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.dto.SaveSeedlotAoiDto;
import ca.bc.gov.backendstartapi.dto.SaveSeedlotAoiResponseDto;
import ca.bc.gov.backendstartapi.exception.InvalidSeedlotRequestException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import ca.bc.gov.backendstartapi.service.SaveSeedlotFormService;
import ca.bc.gov.backendstartapi.service.SeedlotService;
import ca.bc.gov.backendstartapi.service.parser.ConeAndPollenCountCsvTableParser;
import ca.bc.gov.backendstartapi.service.parser.SmpCalculationCsvTableParser;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

/**
 * Endpoint-level tests for {@code POST /api/seedlots/{seedlotNumber}/aoi}.
 * Verifies HTTP status codes, JSON response body structure, content-type
 * handling, and error mapping. The service layer is mocked — actual geometry
 * parsing and repair are tested in {@code SeedlotServiceSaveAoiTest}.
 */
@WebMvcTest(SeedlotEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class SeedlotEndpointSaveAoiTest {

  private MockMvc mockMvc;

  @MockBean SeedlotService seedlotService;
  @MockBean SaveSeedlotFormService saveSeedlotFormService;
  @MockBean LoggedUserService loggedUserService;
  @MockBean SmpCalculationCsvTableParser smpCalculationCsvTableParser;
  @MockBean ConeAndPollenCountCsvTableParser coneAndPollenCountCsvTableParser;

  private final WebApplicationContext webApplicationContext;

  SeedlotEndpointSaveAoiTest(WebApplicationContext webApplicationContext) {
    this.webApplicationContext = webApplicationContext;
  }

  @BeforeEach
  void setup() {
    mockMvc =
        MockMvcBuilders.webAppContextSetup(webApplicationContext)
            .apply(springSecurity())
            .build();
  }

  private static final String VALID_AOI_REQUEST =
      """
      {
        "polygon": {
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [[-123.5, 48.5], [-123.4, 48.5], [-123.4, 48.6], [-123.5, 48.6], [-123.5, 48.5]]
            ]
          },
          "properties": {}
        },
        "becZones": ["CDF", "CWH"]
      }
      """;

  // ── Happy path ────────────────────────────────────────────────────

  @Test
  @DisplayName("POST /api/seedlots/{n}/aoi returns 200 with correct response body")
  void saveAoi_validRequest_returns200WithBody() throws Exception {
    LocalDateTime now = LocalDateTime.of(2026, 4, 10, 12, 0, 0);
    given(seedlotService.saveAoi(eq("12345"), any(SaveSeedlotAoiDto.class)))
        .willReturn(new SaveSeedlotAoiResponseDto("12345", true, now, List.of("CDF", "CWH")));

    mockMvc
        .perform(
            post("/api/seedlots/12345/aoi")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(VALID_AOI_REQUEST))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.seedlotNumber").value("12345"))
        .andExpect(jsonPath("$.ok").value(true))
        .andExpect(jsonPath("$.savedAt").exists())
        .andExpect(jsonPath("$.becZones[0]").value("CDF"))
        .andExpect(jsonPath("$.becZones[1]").value("CWH"))
        .andExpect(jsonPath("$.becZones.length()").value(2));
  }

  @Test
  @WithAnonymousUser
  @DisplayName("POST /api/seedlots/{n}/aoi allows local auth-bypassed save without CSRF")
  void saveAoi_localBypass_allowsAnonymousRequestWithoutCsrf() throws Exception {
    LocalDateTime now = LocalDateTime.of(2026, 4, 10, 12, 0, 0);
    given(seedlotService.saveAoi(eq("12345"), any(SaveSeedlotAoiDto.class)))
        .willReturn(new SaveSeedlotAoiResponseDto("12345", true, now, List.of("CDF")));

    mockMvc
        .perform(
            post("/api/seedlots/12345/aoi")
                .contentType(MediaType.APPLICATION_JSON)
                .content(VALID_AOI_REQUEST))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.ok").value(true))
        .andExpect(jsonPath("$.becZones[0]").value("CDF"));
  }

  @Test
  @DisplayName("POST /api/seedlots/{n}/aoi passes becZones from request to service")
  void saveAoi_becZonesPassedThrough() throws Exception {
    given(seedlotService.saveAoi(eq("12345"), any(SaveSeedlotAoiDto.class)))
        .willReturn(new SaveSeedlotAoiResponseDto(
            "12345", true, LocalDateTime.now(), List.of("IDF", "MH", "SBS")));

    String requestWithThreeZones =
        """
        {
          "polygon": {
            "type": "Feature",
            "geometry": {
              "type": "Polygon",
              "coordinates": [[[0,0],[1,0],[1,1],[0,1],[0,0]]]
            },
            "properties": {}
          },
          "becZones": ["IDF", "MH", "SBS"]
        }
        """;

    mockMvc
        .perform(
            post("/api/seedlots/12345/aoi")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestWithThreeZones))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.becZones.length()").value(3))
        .andExpect(jsonPath("$.becZones[0]").value("IDF"))
        .andExpect(jsonPath("$.becZones[2]").value("SBS"));
  }

  @Test
  @DisplayName("POST /api/seedlots/{n}/aoi returns empty becZones when omitted from request")
  void saveAoi_noBecZones_returnsEmptyArray() throws Exception {
    given(seedlotService.saveAoi(eq("12345"), any(SaveSeedlotAoiDto.class)))
        .willReturn(new SaveSeedlotAoiResponseDto(
            "12345", true, LocalDateTime.now(), List.of()));

    String requestNoBec =
        """
        {
          "polygon": {
            "type": "Feature",
            "geometry": {
              "type": "Polygon",
              "coordinates": [[[0,0],[1,0],[1,1],[0,1],[0,0]]]
            },
            "properties": {}
          }
        }
        """;

    mockMvc
        .perform(
            post("/api/seedlots/12345/aoi")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestNoBec))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.becZones").isArray())
        .andExpect(jsonPath("$.becZones.length()").value(0));
  }

  // ── Error cases ───────────────────────────────────────────────────

  @Test
  @DisplayName("POST returns 404 when seedlot doesn't exist")
  void saveAoi_unknownSeedlot_returns404() throws Exception {
    given(seedlotService.saveAoi(eq("99999"), any(SaveSeedlotAoiDto.class)))
        .willThrow(new SeedlotNotFoundException());

    mockMvc
        .perform(
            post("/api/seedlots/99999/aoi")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(VALID_AOI_REQUEST))
        .andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("POST returns 400 when polygon geometry is invalid")
  void saveAoi_invalidGeometry_returns400() throws Exception {
    given(seedlotService.saveAoi(eq("12345"), any(SaveSeedlotAoiDto.class)))
        .willThrow(new InvalidSeedlotRequestException());

    String badRequest =
        """
        {
          "polygon": {
            "type": "Feature",
            "geometry": { "type": "Point", "coordinates": [0, 0] },
            "properties": {}
          }
        }
        """;

    mockMvc
        .perform(
            post("/api/seedlots/12345/aoi")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(badRequest))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("POST returns 415 when content-type is not JSON")
  void saveAoi_wrongContentType_returns415() throws Exception {
    mockMvc
        .perform(
            post("/api/seedlots/12345/aoi")
                .with(csrf())
                .contentType(MediaType.TEXT_PLAIN)
                .content("not json"))
        .andExpect(status().isUnsupportedMediaType());
  }
}
