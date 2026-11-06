package ca.bc.gov.oracleapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;

/** Ministry of Forests district org unit returned by the org-unit-districts endpoint. */
@Schema(description = "A Ministry of Forests district org unit.")
public record OrgUnitDto(
    @Schema(description = "Numeric identifier for the org unit.", example = "45") Integer orgUnitNo,
    @Schema(description = "Org unit code; district codes start with 'D'.", example = "DCC")
        String orgUnitCode,
    @Schema(
            description = "Display name of the org unit.",
            example = "Cariboo-Chilcotin Natural Resource District")
        String orgUnitName,
    @Schema(description = "The district this unit rolls up to. Equals orgUnitNo for districts.")
        Integer rollupDistNo,
    @Schema(description = "Date the org unit became effective.", type = "string", format = "date")
        LocalDate effectiveDate,
    @Schema(description = "Date the org unit expired.", type = "string", format = "date")
        LocalDate expiryDate) {}
