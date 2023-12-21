package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import net.minidev.json.JSONObject;

/** A DTO for saving A-class registration form. */
@Schema(description = """
        A DTO for saving A-class registration form.
        """)
public record SaveAClassSeedlotFormDto(
    @Schema(
            description = "The JSON object that is used in the state on the front-end.",
            example = "any json object")
        JSONObject allStepData,
    @Schema(
            description = "The JSON object that stores the progress on the front-end",
            example = "any json object")
        JSONObject progressStatus) {}
