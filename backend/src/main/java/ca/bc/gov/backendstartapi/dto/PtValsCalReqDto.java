package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/** This class represents the JSON request body when doing genetic worth calculations. */
@Schema(description = "An object representing the request body for the genetic worth calculations.")
public record PtValsCalReqDto(
    @Schema(description = "The Parent Tree Id, the id in oracle of a parent tree.", example = "4423")
        @NotNull
        String parentTreeId,
    @Schema(description = "The Parent Tree Number, same as clone number.", example = "4423")
        @NotNull
        String parentTreeNumber,
    @Schema(
            description = "A float number representing the value for the female (cone) count",
            example = "13",
            type = "number",
            format = "float")
        BigDecimal coneCount,
    @Schema(
            description = "A float number representing the value for the male (pollen) count",
            example = "48.5",
            type = "number",
            format = "float")
        BigDecimal pollenCount,
    @Schema(
            description =
                """
                Represents each row of the table, containig traits code, value, and later
                the calculated genetic worh and percentage
                """)
        List<GeneticWorthTraitsDto> geneticTraits) {}
