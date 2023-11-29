package ca.bc.gov.backendstartapi.dto;

import java.math.BigDecimal;
import java.util.List;

public record SeedlotFormParentTreeSmpDto(
  String seedlotNumber,
  Integer parentTreeId,
  BigDecimal coneCount,
  BigDecimal pollenPount,
  Integer smpSuccessPct,
  Integer nonOrchardPollenContamPct,
  Integer amountOfMaterial,
  BigDecimal proportion,
  List<ParentTreeGeneticQualityDto> parentTreeGeneticQualities) {}
