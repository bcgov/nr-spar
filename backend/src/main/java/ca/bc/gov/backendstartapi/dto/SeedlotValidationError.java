package ca.bc.gov.backendstartapi.dto;

/** A single field-level validation error for the seedlot submission form. */
public record SeedlotValidationError(String fieldId, String message) {}
