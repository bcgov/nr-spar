package ca.bc.gov.backendstartapi.config;

import static org.springframework.aot.hint.MemberCategory.INVOKE_DECLARED_CONSTRUCTORS;
import static org.springframework.aot.hint.MemberCategory.INVOKE_PUBLIC_METHODS;
import static org.springframework.aot.hint.MemberCategory.UNSAFE_ALLOCATED;

import java.util.UUID;
import java.util.stream.Stream;
import org.geolatte.geom.Complex;
import org.geolatte.geom.Geometry;
import org.geolatte.geom.GeometryType;
import org.geolatte.geom.LineString;
import org.geolatte.geom.Linear;
import org.geolatte.geom.LinearRing;
import org.geolatte.geom.Polygonal;
import org.geolatte.geom.Position;
import org.geolatte.geom.Simple;
import org.geolatte.geom.codec.PostgisWkbDecoder;
import org.geolatte.geom.codec.PostgisWkbV2Encoder;
import org.geolatte.geom.crs.CoordinateSystemAxisDirection;
import org.hibernate.spatial.HSMessageLogger_$logger;
import org.hibernate.spatial.contributor.SpatialFunctionContributor;
import org.hibernate.spatial.contributor.SpatialTypeContributor;
import org.hibernate.spatial.criteria.internal.GeolatteSpatialCriteriaExtension;
import org.hibernate.spatial.criteria.internal.JTSSpatialCriteriaExtension;
import org.hibernate.spatial.integration.SpatialInitializer;
import org.locationtech.jts.geom.Point;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportRuntimeHints;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

/**
 * Native-image hints for Hibernate Spatial and geometry (PostGIS, geolatte, JTS), used by the
 * seedlot collection map. Recorded with the native-image tracing agent (see {@code
 * NativeImageFlowsIntegrationTest}), then written as hints.
 */
@Configuration
@ImportRuntimeHints(HibernateSpatialCloudNativeConfig.class)
public class HibernateSpatialCloudNativeConfig implements RuntimeHintsRegistrar {

  @Override
  public void registerHints(@NonNull RuntimeHints hints, @Nullable ClassLoader classLoader) {
    var reflection = hints.reflection();

    // Hibernate Spatial's logger, and the contributors it loads through ServiceLoader.
    Stream.of(
            HSMessageLogger_$logger.class,
            SpatialFunctionContributor.class,
            SpatialTypeContributor.class,
            GeolatteSpatialCriteriaExtension.class,
            JTSSpatialCriteriaExtension.class,
            SpatialInitializer.class,
            PostgisWkbDecoder.class,
            PostgisWkbV2Encoder.class)
        .forEach(type -> reflection.registerType(type, INVOKE_DECLARED_CONSTRUCTORS));

    // Geometry types Hibernate resolves by class when mapping geometry columns.
    Stream.of(
            Geometry.class,
            Complex.class,
            Simple.class,
            Linear.class,
            Polygonal.class,
            LineString.class,
            LinearRing.class,
            Position.class,
            org.locationtech.jts.geom.Geometry.class,
            Point.class)
        .forEach(reflection::registerType);
    Stream.of(GeometryType.class, CoordinateSystemAxisDirection.class)
        .forEach(type -> reflection.registerType(type, INVOKE_PUBLIC_METHODS));

    // SeedlotCollectionGeometry has a UUID id; without this, startup fails building the
    // SessionFactory with "Class java.util.UUID[] is instantiated reflectively".
    reflection.registerType(UUID[].class, UNSAFE_ALLOCATED);

    // geolatte's CrsRegistry loads its CRS definitions from this classpath file in a static
    // initializer (reached via CoordinateReferenceSystems.WGS84, e.g. from GeometryUtil). If it
    // is missing from the native image, the first geometry call fails with "Could not initialize
    // class".
    hints.resources().registerPattern("spatial_ref_sys.txt");
  }
}
