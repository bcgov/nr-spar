package ca.bc.gov.oracleapi.dto.consep;

import java.time.LocalDateTime;

/**
 * A DTO containing the return fields for
 * creating a new {@link ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity} instance.
 */
public record GerminatorTrayCreateResponseDto(
    String activityTypeCd,
    int germinatorTrayId,
    LocalDateTime actualStartDate
) {
}
