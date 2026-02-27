package ca.bc.gov.oracleapi.dto.consep;

/**
 * A DTO containing the return fields for
 * assigning a germinator ID to an existing {@link ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity}.
 */
public record GerminatorTrayAssignGerminatorIdResponseDto(
    Integer germinatorTrayId,
    String germinatorId
) {
}
