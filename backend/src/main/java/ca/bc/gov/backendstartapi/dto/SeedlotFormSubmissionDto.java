package ca.bc.gov.backendstartapi.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SeedlotFormSubmissionDto {

  seedlotFormCollectionDto seedlotFormCollectionDto;
  String seedlotFormOwnershipDto; // step 2
  String seedlotFormInterimDto; // step 3
  String seedlotFormOrchardDto; // step 4
  String seedlotFormParentTreeSmpDto; // step 5
  String seedlotFormExtractionStorageDto; // step 6
}