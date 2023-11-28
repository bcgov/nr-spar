package ca.bc.gov.backendstartapi.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SeedlotFormSubmissionDto {

  SeedlotFormCollectionDto seedlotFormCollectionDto;
  List<SeedlotFormOwnershipDto> seedlotFormOwnershipDtoList;
  SeedlotFormInterimDto seedlotFormInterimDto;
  SeedlotFormOrchardDto seedlotFormOrchardDto;
  String seedlotFormParentTreeSmpDto; // step 5
  SeedlotFormExtractionDto seedlotFormExtractionDto;
}