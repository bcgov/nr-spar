package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request body for the setCriteria API.
 *
 * @param criteriaJson the search criteria as a JSON string
 */
@Schema(description = "Request body for setting search criteria")
public record SearchCriteriaDto(
    @NotNull @NotBlank @Schema(description = "Search criteria as JSON", example = "{\"status\":\"active\"}")
        String criteriaJson) {}
