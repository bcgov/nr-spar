package ca.bc.gov.backendstartapi.response;

import io.swagger.v3.oas.annotations.media.Schema;

/** Represents a single field-level validation issue with its name and error message. */
@Schema(description = "An object with fields name and the respective error massages")
public record FieldIssue(String fieldName, String fieldMessage) {}
