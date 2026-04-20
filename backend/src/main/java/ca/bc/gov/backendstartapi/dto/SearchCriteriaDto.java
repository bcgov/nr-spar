package ca.bc.gov.backendstartapi.dto;

import ca.bc.gov.backendstartapi.validation.ValidSearchCriteriaJson;
import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Request body for the setCriteria API.
 *
 * @param criteriaJson the search criteria as a JSON object or array (not a JSON string wrapper)
 */
@Schema(description = "Request body for setting search criteria")
public record SearchCriteriaDto(
    @ValidSearchCriteriaJson
        @Schema(
            description = "Search criteria as JSON",
            example = "{\"status\":\"active\"}")
        JsonNode criteriaJson) {}
