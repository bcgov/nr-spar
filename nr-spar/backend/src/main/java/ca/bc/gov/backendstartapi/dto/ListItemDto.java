package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** This general record is used for an object of a list that consists of an id and value. */
@Schema(
    description =
        """
        This general record is used for an object of a list that consists of an id and value.
        """)
public record ListItemDto(
    @Schema(description = "The id that represent a data object", example = "1") String id,
    @Schema(description = "The description/value of a data object", example = "123")
        String value) {}
