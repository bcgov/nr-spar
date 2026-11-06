package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/**
 * Full form data for a submitted Class B (natural stand) seedlot, returned by the
 * {@code GET /{seedlotNumber}/b-class-full-form} endpoint.
 */
@Schema(description = "All form step data for a submitted Class B seedlot.")
public record SeedlotBclassFormDto(
    @Schema(description = "Collection and area-of-use step data.")
        SeedlotFormCollectionDtoClassB collectionStep,
    @Schema(description = "Ownership step data.") List<SeedlotFormOwnershipDto> ownershipStep,
    @Schema(description = "Interim storage step data.") SeedlotFormInterimDto interimStep,
    @Schema(description = "Extraction and storage step data.")
        SeedlotFormExtractionDto extractionStep,
    @Schema(description = "Collection polygon geometry; null when no polygon was captured.")
        SeedlotCollectionGeometryDto collectionGeometry,
    @Schema(description = "Area-of-use SPZ slots 1–8.")
        List<SeedPlanZoneDto> aouSpzList,
    @Schema(description = "User-entered genetic worth trait values.")
        List<GeneticWorthTraitsDto> geneticWorthTraits) {}
