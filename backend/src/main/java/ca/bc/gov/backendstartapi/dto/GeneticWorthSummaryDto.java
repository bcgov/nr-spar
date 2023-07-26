package ca.bc.gov.backendstartapi.dto;

import java.math.BigDecimal;
import java.util.List;

/** This class represents the JSON that will be returned when doing the GW calculations. */
public record GeneticWorthSummaryDto(
    BigDecimal effectivePopulationSizeNe,
    BigDecimal coancestry,
    int numberOfSmpParentFromOutside,
    List<GeneticWorthTraitsDto> geneticTraits) {}
