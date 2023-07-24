package ca.bc.gov.backendstartapi.dto;

import java.math.BigDecimal;

public record GeneticWorthTraitsResponseDto(
  String trait,
  BigDecimal volumeGrowth,
  BigDecimal percentage
) {}
