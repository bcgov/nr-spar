package ca.bc.gov.oracleapi.dto.consep;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

public record GerminatorTrayContentsDto(
    Integer germinatorTrayId,
    String vegetationSt,
    String activityTypeCd,
    LocalDateTime actualStartDate,
    LocalDateTime dateCreated,
    BigDecimal riaSkey,
    String requestId,
    BigDecimal requestSkey,
    String itemId,
    String requestTypeSt,
    String seedlotNumber,
    LocalDateTime soakStartDate,
    LocalDateTime soakEndDate,
    LocalDate seedWithdrawDate,
    LocalDate warmStratStartDate,
    LocalDate drybackStartDate,
    LocalDateTime germinatorEntry,
    LocalDateTime stratStartDate,
    String germinatorId,
    String standardActivityId,
    String testCategoryCd
) {
}
