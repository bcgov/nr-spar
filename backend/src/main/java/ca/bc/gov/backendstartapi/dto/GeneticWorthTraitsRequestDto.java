package ca.bc.gov.backendstartapi.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;

public record GeneticWorthTraitsRequestDto(
  @NotNull String parentTreeNumber,
  BigDecimal coneCount,
  BigDecimal pollenCount,
  BigDecimal ad,
  BigDecimal dfs,
  BigDecimal dfu,
  BigDecimal dfw,
  BigDecimal dsb,
  BigDecimal dsc,
  BigDecimal dsg,
  BigDecimal gvo,
  BigDecimal iws,
  BigDecimal wdu,
  BigDecimal wve,
  BigDecimal wwd) {}
