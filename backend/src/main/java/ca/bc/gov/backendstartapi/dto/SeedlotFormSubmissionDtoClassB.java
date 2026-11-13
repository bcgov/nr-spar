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
    @Schema(
            description =
                "Area-of-use SPZ slots 1–8. Not saved on submit: area of use is set by the"
                    + " server, so the stored zones are kept.")
        List<@Valid SeedPlanZoneDto> aouSpzList) {}
