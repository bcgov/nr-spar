package ca.bc.gov.backendstartapi.dto;

import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.media.Schema;

/** DTO for saving (draft) registration form progress for both A-class and B-class seedlots. */
@Schema(description = """
        A DTO for saving A-class and B-class registration form.
        """)
public record SaveSeedlotFormDto(
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
