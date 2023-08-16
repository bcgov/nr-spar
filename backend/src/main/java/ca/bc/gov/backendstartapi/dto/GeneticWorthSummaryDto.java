package ca.bc.gov.backendstartapi.dto;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

/** This class represents the JSON that will be returned by the GW calculations. */
@Schema(description = "Keep going from here..")
public record GeneticWorthSummaryDto(List<GeneticWorthTraitsDto> geneticTraits) {}
