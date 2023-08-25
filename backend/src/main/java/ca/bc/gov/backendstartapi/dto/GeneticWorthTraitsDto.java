package ca.bc.gov.backendstartapi.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

/** This class represents the JSON for the request and response containing all traits data. */
@Schema(
    description =
        "This class represents the JSON for the request and response containing all traits data.")
@JsonInclude(Include.NON_NULL)
public record GeneticWorthTraitsDto(
    @Schema(description = "Represents the trait code, e.g.: gvo, wwd.", example = "gvo")
        String traitCode,
    @Schema(
            description =
                """
            Represents the trait value filled by the user in the form table,
            from the csv file.
            """,
            example = "11.2",
            type = "number",
            format = "float")
        BigDecimal traitValue,
    @Schema(
            description =
                "Contains the genetic worth value for that trait, calculated by the backend.",
            example = "55",
            type = "number",
            format = "float")
        BigDecimal calculatedValue,
    @Schema(
            description =
                "Contains the percentage of contribution for that trait, calculated by the backend",
            example = "56.7",
            type = "number",
            format = "float")
        BigDecimal testedParentTreePerc) {}
