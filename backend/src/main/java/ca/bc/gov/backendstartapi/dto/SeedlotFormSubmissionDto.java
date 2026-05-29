package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/** This records represents a JSON body to be sent when saving the Seedlot Form. */
@Schema(description = "The JSON object containing all the Seedlot registration form field values.")
public record SeedlotFormSubmissionDto(
    @NotNull @Valid SeedlotFormCollectionDto seedlotFormCollectionDto,
    @NotNull @Valid List<@NotNull @Valid SeedlotFormOwnershipDto> seedlotFormOwnershipDtoList,
    @NotNull @Valid SeedlotFormInterimDto seedlotFormInterimDto,
    @NotNull @Valid SeedlotFormOrchardDto seedlotFormOrchardDto,
    @NotNull @Valid List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList,
    @NotNull @Valid List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeSmpDtoList,
    @NotNull SeedlotFormSmpParentOutsideDto seedlotFormSmpParentOutsideDto,
    @NotNull @Valid SeedlotFormExtractionDto seedlotFormExtractionDto,
    List<SeedlotReviewSeedPlanZoneDto> seedlotReviewSeedPlanZones,
    SeedlotReviewElevationLatLongDto seedlotReviewElevationLatLong,
    List<GeneticWorthTraitsDto> seedlotReviewGeneticWorth,
    SeedlotReviewGeoInformationDto seedlotReviewGeoInformation,
    SeedlotApplicationPatchDto applicantAndSeedlotInfo) {}
