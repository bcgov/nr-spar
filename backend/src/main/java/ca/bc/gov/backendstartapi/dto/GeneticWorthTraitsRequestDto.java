package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/** This class represents the JSON request body when doing genetic worth calculations. */
@Schema(description = "An object representing the request body for the genetic worth calculations.")
public record GeneticWorthTraitsRequestDto(
    @NotNull String parentTreeNumber,
    BigDecimal coneCount,
    BigDecimal pollenCount,
    List<GeneticWorthTraitsDto> geneticTraits) {}
