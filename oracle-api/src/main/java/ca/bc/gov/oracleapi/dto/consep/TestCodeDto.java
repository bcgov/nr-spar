package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * This class represents a {@link ca.bc.gov.oracleapi.entity.consep.TestCodeEntity} object.
 */
@Schema(description = "This class represents a TestCodeEntity with code and description")
public record TestCodeDto(

    @Schema(description = "Code argument for the type or category", example = "MCK")
    String code,

    @Schema(
        description = "Expanded description of the code",
        example = "Moisture content unkilned seed"
    )
    String description
) {
}
