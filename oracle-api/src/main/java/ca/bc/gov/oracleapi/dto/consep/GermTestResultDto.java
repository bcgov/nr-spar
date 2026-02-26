package ca.bc.gov.oracleapi.dto.consep;

import java.time.LocalDate;

/**
 * A DTO containing the fields returned by finding an activity result, a
 * {@link ca.bc.gov.oracleapi.entity.consep.TestResultEntity} instance.
 */
public record GermTestResultDto(
    LocalDate warmStratStartDate,
    Integer warmStratHours,
    LocalDate drybackStartDate,
    String activityTypeCd,
    Integer soakHours,
    Integer stratHours,
    LocalDate seedWithdrawDate,
    Integer germinatorTrayId
) {
}
