package ca.bc.gov.backendstartapi.dto;

import java.math.BigDecimal;
import java.util.List;

public record GeneticWorthSummaryDto(
  BigDecimal effectivePopulationSizeNe,
  BigDecimal coancestry,
  int numberOfSmpParentFromOutside,
  List<GeneticWorthTraitsResponseDto> traits) {}
