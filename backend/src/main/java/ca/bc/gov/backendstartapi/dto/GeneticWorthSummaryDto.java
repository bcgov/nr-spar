package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.List;

/** This class represents the JSON that will be returned by the GW calculations. */
@Schema(
    description =
        """
        This class represents the JSON that will be returned when requesting the
        Genetic Worth calculations.
        """)
public record GeneticWorthSummaryDto(
    @Schema(description = "Contains a list of traits.") List<GeneticWorthTraitsDto> geneticTraits,
    @Schema(
            description = "The calculated value for the Effective Population Size.",
            example = "2.97655")
        BigDecimal neValue) {}
