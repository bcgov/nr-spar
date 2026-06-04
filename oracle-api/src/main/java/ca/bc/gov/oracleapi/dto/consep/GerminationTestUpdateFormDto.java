package ca.bc.gov.oracleapi.dto.consep;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Fields the FE sends to update a germination test header and its activity.
 *
 * <p>original_test_ind, current_test_ind and test_rank are intentionally
 * absent: the backend computes them (issue #2447 AC #4).
 */
@Schema(
    description =
        "JSON object with the values to update a germination test (header + activity)"
)
public record GerminationTestUpdateFormDto(
    @Schema(description = "Test category code", example = "STD")
    @NotNull
    String testCategoryCode,
    @Schema(description = "Whether the test result is accepted", example = "true")
    @NotNull
    Boolean acceptResultInd,
    @Schema(description = "Whether the test is complete", example = "true")
    @NotNull
    Boolean testCompleteInd,
    @Schema(description = "Germinator id", example = "A")
    @Size(max = 1)
    String germinatorId,
    @Schema(description = "Seed withdrawal date", example = "2026-05-01")
    LocalDate seedWithdrawalDate,
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Actual begin datetime", example = "2026-05-02T08:00:00")
    LocalDateTime actualBeginDateTime,
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Actual end datetime (Test End)", example = "2026-05-20T16:00:00")
    LocalDateTime actualEndDateTime,
    @Schema(description = "Comment for the activity", example = "unkilned portion only")
    @Size(max = 2000)
    String riaComment,
    @Schema(description = "Whether the comment is critical", example = "false")
    Boolean commentIsCritical,
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(
        description =
            "update_timestamp of the test result row as read (optimistic lock)"
    )
    @NotNull
    LocalDateTime testResultUpdateTimestamp,
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "update_timestamp of the activity row as read (optimistic lock)")
    @NotNull
    LocalDateTime riaUpdateTimestamp
) {}
