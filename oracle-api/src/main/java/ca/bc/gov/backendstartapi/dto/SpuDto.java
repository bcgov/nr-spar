package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** This record respresent a seed plan unit object defined in the active SPU table in postgres. */
@Schema(
    description =
        """
        This record respresent a seed plan unit object defined in the active SPU table in postgres.
        """)
public record SpuDto(
    @Schema(description = "The id that represent a data object", example = "1") String orchardId,
    @Schema(description = "The description/value of a data object", example = "123")
        int seedPlanningUnitId) {}
