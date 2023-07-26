package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

/** This class represents the JSON for the request and response containing all traits data. */
@Schema(
    description =
        "This class represents the JSON for the request and response containing all traits data.")
public record GeneticWorthTraitsDto(
    String traitCode, BigDecimal traitValue, BigDecimal volumeGrowth, BigDecimal percentage) {}
