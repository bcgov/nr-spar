package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/** One day's germination counts and per-replicate abnormals in an upsert request. */
@Schema(description = "One day of daily germination counts plus that day's abnormals")
public record DayGermCountDto(
    @NotNull
    @Min(value = 1, message = "slotIndex must be between 1 and 13")
    @Max(value = 13, message = "slotIndex must be between 1 and 13")
    @Schema(description = "Slot position (1-13), selects which numbered columns to write", example = "1")
    Integer slotIndex,

    @Schema(description = "Date the count was recorded", example = "2026-04-01")
    LocalDate countDt,

    @Schema(description = "Day number within the test", example = "1")
    Integer dayNoOfTest,

    @Schema(description = "Replicate 1 seeds germinated this day", example = "10") Integer rep1NoSeedsGerm,
    @Schema(description = "Replicate 2 seeds germinated this day", example = "12") Integer rep2NoSeedsGerm,
    @Schema(description = "Replicate 3 seeds germinated this day", example = "11") Integer rep3NoSeedsGerm,
    @Schema(description = "Replicate 4 seeds germinated this day", example = "9") Integer rep4NoSeedsGerm,

    @Valid @Schema(description = "Replicate 1 abnormals for this day") ReplicateAbnormalDto rep1Abnormal,
    @Valid @Schema(description = "Replicate 2 abnormals for this day") ReplicateAbnormalDto rep2Abnormal,
    @Valid @Schema(description = "Replicate 3 abnormals for this day") ReplicateAbnormalDto rep3Abnormal,
    @Valid @Schema(description = "Replicate 4 abnormals for this day") ReplicateAbnormalDto rep4Abnormal
) {}
