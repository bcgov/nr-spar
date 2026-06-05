package ca.bc.gov.backendstartapi.response;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * An object with the field name and the respective error messages.
 */
@Schema(description = "An object with fields name and the respective error massages")
public record FieldIssue(String fieldName, String fieldMessage) {}
