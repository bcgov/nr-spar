package ca.bc.gov.backendstartapi.dto;

import java.math.BigDecimal;
import java.util.List;

/** This record represents each parent tree id to fetch lat long data. */
public record GeospatialRequestDto(
  Long parentTreeId,
  BigDecimal proportion,
  List<GeneticWorthTraitsDto> geneticTraits) {}
