package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

/** This class represents the JSON for the request and response containing all traits data. */
@Schema(
    description =
        """
        This class represents the JSON for the request and response containing all traits data.
        `traitCode` represents the code, e.g.: gvo, wwd. `traitValue` represents the value
        filled by the user, e.g.: 11.2, `geneticWorthValue` contains the genetic woth value
        for that trait, and finally `percentage` contains the percentage of contribution
        for that trait.
        """)
public record GeneticWorthTraitsDto(
    String traitCode, BigDecimal traitValue, BigDecimal geneticWorthValue, BigDecimal percentage) {}
