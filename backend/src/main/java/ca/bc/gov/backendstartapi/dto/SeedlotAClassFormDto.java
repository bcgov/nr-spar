package ca.bc.gov.backendstartapi.dto;

import java.util.List;

import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;

public record SeedlotAClassFormDto(
  Seedlot seedlotData,
  List<SeedlotFormParentTreeSmpDto> parentTrees,
  List<GeneticWorthTraitsDto> calculatedValues
) {};
