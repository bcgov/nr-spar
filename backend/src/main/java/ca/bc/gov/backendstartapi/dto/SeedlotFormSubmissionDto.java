package ca.bc.gov.backendstartapi.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SeedlotFormSubmissionDto {

  SeedlotFormCollectionDto seedlotFormCollectionDto;
  SeedlotFormOwnershipDto seedlotFormOwnershipDto;
  SeedlotFormInterimDto seedlotFormInterimDto;
  SeedlotFormOrchardDto seedlotFormOrchardDto;
  String seedlotFormParentTreeSmpDto; // step 5
  SeedlotFormExtractionDto seedlotFormExtractionDto;
}