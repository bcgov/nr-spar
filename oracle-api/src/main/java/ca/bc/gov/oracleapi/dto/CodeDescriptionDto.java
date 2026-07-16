package ca.bc.gov.oracleapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;

/**
 * Code-table row with a code, description, and validity window.
 *
 * <p>Used by capture methods, number-of-trees-collected, and seed coast area endpoints.
 */
@Schema(description = "A code table entry with description and validity dates.")
public record CodeDescriptionDto(
    @Schema(description = "Code value.", example = "GPS") String code,
    @Schema(description = "Display description.", example = "GPS") String description,
    @Schema(description = "Date the code became effective.", type = "string", format = "date")
        LocalDate effectiveDate,
    @Schema(description = "Date the code expires.", type = "string", format = "date")
        LocalDate expiryDate) {}
