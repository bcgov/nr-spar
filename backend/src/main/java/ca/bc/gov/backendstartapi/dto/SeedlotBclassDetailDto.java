package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/**
 * Class B enrichments returned by {@code GET /api/seedlots/{seedlotNumber}}. Populated only when
 * {@code genetic_class_code} is {@code B}.
 */
@Schema(description = "Class B-specific enrichments for a seedlot detail response.")
public record SeedlotBclassDetailDto(
    @Schema(description = "Area-of-use seed plan zone slots 1–8 (no primary slot).")
        List<SeedPlanZoneDto> aouSpzList,
    @Schema(
            description =
                "Collection area polygon when present; null when no geometry has been submitted.")
        SeedlotCollectionGeometryDto collectionGeometry,
    @Schema(
            description =
                "Superior provenance (B+) id; set only on migrated legacy B+ seedlots, which are"
                    + " exactly the seedlots that have one.")
        Integer provenanceId,
    @Schema(
            description =
                "Superior provenance description from oracle-api; null when there is no provenance"
                    + " id or the lookup failed.",
            example = "Fraser Valley Provenance")
        String provenanceDescription) {}
