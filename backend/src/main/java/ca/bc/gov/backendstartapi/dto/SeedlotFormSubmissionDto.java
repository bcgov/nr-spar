package ca.bc.gov.backendstartapi.dto;

import java.util.List;

/** This records represents a JSON body to be sent when saving the Seedlot Form. */
public record SeedlotFormSubmissionDto(
    SeedlotFormCollectionDto seedlotFormCollectionDto,
    List<SeedlotFormOwnershipDto> seedlotFormOwnershipDtoList,
    SeedlotFormInterimDto seedlotFormInterimDto,
    SeedlotFormOrchardDto seedlotFormOrchardDto,
    List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeSmpDtoList,
    SeedlotFormExtractionDto seedlotFormExtractionDto) {}
