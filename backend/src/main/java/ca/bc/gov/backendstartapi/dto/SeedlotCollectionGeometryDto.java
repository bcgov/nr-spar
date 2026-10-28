package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Collection area geometry metadata for a Class B seedlot. */
@Schema(description = "Collection area geometry for a Class B seedlot.")
public record SeedlotCollectionGeometryDto(
    @Schema(description = "Seedlot number.", example = "53001") String seedlotNumber,
    @Schema(description = "GeoJSON geometry in WGS-84 (SRID 4326).") String geometryGeoJson,
    @Schema(description = "Feature class key from legacy spatial utils.") Integer featureClassSkey,
    @Schema(description = "Computed polygon area (m²).") BigDecimal featureArea,
    @Schema(description = "Computed polygon perimeter (m).") BigDecimal featurePerimeter,
    @Schema(description = "Observation date.") LocalDateTime observationDate,
    @Schema(description = "Optimistic lock revision count.") int revisionCount) {}
