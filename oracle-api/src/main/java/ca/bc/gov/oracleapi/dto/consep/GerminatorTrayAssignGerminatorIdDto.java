package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * A DTO containing the fields needed for
 * assigning a germinator ID to an existing {@link ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity}.
 */
public record GerminatorTrayAssignGerminatorIdDto(
    @Schema(description = "Primary key of the germinator tray", example = "101")
    @NotNull
    Integer germinatorTrayId,

    @Schema(description = "Germinator ID to assign to the tray", example = "1")
    @Size(max = 1)
    @NotBlank
    String germinatorId
) {
}
