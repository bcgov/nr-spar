package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/** This record contains values of a parent tree within user selected orchard(s). */
@Schema(
    description = "This record contains values of a parent tree within user selected orchard(s).")
public record OrchardParentTreeValsDto(
    @Schema(
            description = "The Parent Tree Id, the id in oracle of a parent tree.",
            example = "4423")
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
                "A float number representing the value for the SMP success on parent percentage",
            example = "5",
            type = "number",
            format = "int")
        Integer smpSuccessPerc,
    @Schema(
            description =
                """
                Represents each row of the table, containig traits code, value, and later
                the calculated genetic worh and percentage
                """)
        List<GeneticWorthTraitsDto> geneticTraits) {}
