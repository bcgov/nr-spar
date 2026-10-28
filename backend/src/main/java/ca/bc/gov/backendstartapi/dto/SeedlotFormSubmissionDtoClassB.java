package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/** Request body for submitting a Class B (natural stand) seedlot registration form. */
@Schema(description = "All steps of a Class B seedlot registration form.")
public record SeedlotFormSubmissionDtoClassB(
    @NotNull @Valid SeedlotFormCollectionDtoClassB seedlotFormCollectionDto,
    @NotNull @Valid List<@NotNull @Valid SeedlotFormOwnershipDto> seedlotFormOwnershipDtoList,
    @NotNull @Valid SeedlotFormInterimDto seedlotFormInterimDto,
    @NotNull @Valid SeedlotFormExtractionDto seedlotFormExtractionDto,
    @Schema(description = "Area-of-use SPZ slots 1–8 (no primary slot).")
        List<@Valid SeedPlanZoneDto> aouSpzList,
    @Schema(description = "User-entered genetic worth trait values (B/B+).")
        List<@Valid GeneticWorthTraitsDto> geneticWorthTraits) {}
