package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/** This class represents the JSON request body when doing genetic worth calculations. */
@Schema(
    description =
        """
        An object representing the request body for the genetic worth calculations. The
        `parentTreeNumber` contains the clone number, e.g.: 123, `coneCount` is a
        number representing the value for the female (cone) count, `pollenCount` is a
        number representing the value for the male (pollen) count, and finally 
        `geneticTraits` is the object for each row.
        """)
public record GeneticWorthTraitsRequestDto(
    @NotNull String parentTreeNumber,
    BigDecimal coneCount,
    BigDecimal pollenCount,
    List<GeneticWorthTraitsDto> geneticTraits) {}
