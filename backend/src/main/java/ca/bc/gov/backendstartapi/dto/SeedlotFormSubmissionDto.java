package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/** This records represents a JSON body to be sent when saving the Seedlot Form. */
@Schema(description = "The JSON object containing all the Seedlot registration form field values.")
public record SeedlotFormSubmissionDto(
    SeedlotFormCollectionDto seedlotFormCollectionDto,
    List<SeedlotFormOwnershipDto> seedlotFormOwnershipDtoList,
    SeedlotFormInterimDto seedlotFormInterimDto,
    SeedlotFormOrchardDto seedlotFormOrchardDto,
    List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList,
    List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeSmpDtoList,
    SeedlotFormExtractionDto seedlotFormExtractionDto,
    List<SeedlotReviewSeedPlanZoneDto> seedlotReviewSeedPlanZones,
    SeedlotReviewElevationLatLongDto seedlotReviewElevationLatLong,
    List<GeneticWorthTraitsDto> seedlotReviewGeneticWorth,
    SeedotReviewGeoInformationDto seedotReviewGeographicInformation) {}
