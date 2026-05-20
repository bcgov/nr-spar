package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDate;

/** One daily germination count observation, corresponding to a single numbered slot in the table. */
public record GermCountSlotDto(

    @Schema(description = "Slot position (1–13), preserving the original column numbering", example = "1")
    int slotIndex,

    @Schema(description = "Daily germination surrogate key", example = "1001")
    BigDecimal dailyGermSkey,

    @Schema(description = "Date the count was recorded", example = "2026-04-01")
    LocalDate countDt,

    @Schema(description = "Day number within the test", example = "1")
    Integer dayNoOfTest,

    @Schema(description = "Replicate 1 seeds germinated", example = "10")
    Integer rep1NoSeedsGerm,

    @Schema(description = "Replicate 2 seeds germinated", example = "12")
    Integer rep2NoSeedsGerm,

    @Schema(description = "Replicate 3 seeds germinated", example = "11")
    Integer rep3NoSeedsGerm,

    @Schema(description = "Replicate 4 seeds germinated", example = "9")
    Integer rep4NoSeedsGerm,

    @Schema(description = "Cumulative germination percentage", example = "0.4200")
    BigDecimal cumulativeGerm

) {}
