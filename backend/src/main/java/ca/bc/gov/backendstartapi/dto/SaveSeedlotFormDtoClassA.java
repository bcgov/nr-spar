package ca.bc.gov.backendstartapi.dto;

import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.media.Schema;

/** A DTO for saving A-class registration form. */
@Schema(description = """
        A DTO for saving A-class registration form.
        """)
public record SaveSeedlotFormDtoClassA(
    @Schema(
            description = "The JSON object that is used in the state on the front-end.",
            example = "any json object")
        JsonNode allStepData,
    @Schema(
            description = "The JSON object that stores the progress on the front-end",
            example = "any json object")
        JsonNode progressStatus,
    @Schema(description = "The amount of time this data have been revised", example = "46")
        Integer revisionCount) {}
