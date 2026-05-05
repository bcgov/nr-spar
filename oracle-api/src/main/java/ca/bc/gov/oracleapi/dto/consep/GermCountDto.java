package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** A DTO containing all daily germination count fields for a test from consep.cns_t_germ_count. */
public record GermCountDto(

    @Schema(description = "Request item activity key", example = "12345")
    BigDecimal riaSkey,

    // ── Slot 1 ──────────────────────────────────────────────────────────────
    BigDecimal dailyGermSkey1,
    LocalDate countDt1,
    Integer dayNoOfTest1,
    Integer rep1NoSeedsGerm1,
    Integer rep2NoSeedsGerm1,
    Integer rep3NoSeedsGerm1,
    Integer rep4NoSeedsGerm1,
    BigDecimal cumulativeGerm1,

    // ── Slot 2 ──────────────────────────────────────────────────────────────
    BigDecimal dailyGermSkey2,
    LocalDate countDt2,
    Integer dayNoOfTest2,
    Integer rep1NoSeedsGerm2,
    Integer rep2NoSeedsGerm2,
    Integer rep3NoSeedsGerm2,
    Integer rep4NoSeedsGerm2,
    BigDecimal cumulativeGerm2,

    // ── Slot 3 ──────────────────────────────────────────────────────────────
    BigDecimal dailyGermSkey3,
    LocalDate countDt3,
    Integer dayNoOfTest3,
    Integer rep1NoSeedsGerm3,
    Integer rep2NoSeedsGerm3,
    Integer rep3NoSeedsGerm3,
    Integer rep4NoSeedsGerm3,
    BigDecimal cumulativeGerm3,

    // ── Slot 4 ──────────────────────────────────────────────────────────────
    BigDecimal dailyGermSkey4,
    LocalDate countDt4,
    Integer dayNoOfTest4,
    Integer rep1NoSeedsGerm4,
    Integer rep2NoSeedsGerm4,
    Integer rep3NoSeedsGerm4,
    Integer rep4NoSeedsGerm4,
    BigDecimal cumulativeGerm4,

    // ── Slot 5 ──────────────────────────────────────────────────────────────
    BigDecimal dailyGermSkey5,
    LocalDate countDt5,
    Integer dayNoOfTest5,
    Integer rep1NoSeedsGerm5,
    Integer rep2NoSeedsGerm5,
    Integer rep3NoSeedsGerm5,
    Integer rep4NoSeedsGerm5,
    BigDecimal cumulativeGerm5,

    // ── Slot 6 ──────────────────────────────────────────────────────────────
    BigDecimal dailyGermSkey6,
    LocalDate countDt6,
    Integer dayNoOfTest6,
    Integer rep1NoSeedsGerm6,
    Integer rep2NoSeedsGerm6,
    Integer rep3NoSeedsGerm6,
    Integer rep4NoSeedsGerm6,
    BigDecimal cumulativeGerm6,

    // ── Slot 7 ──────────────────────────────────────────────────────────────
    BigDecimal dailyGermSkey7,
    LocalDate countDt7,
    Integer dayNoOfTest7,
    Integer rep1NoSeedsGerm7,
    Integer rep2NoSeedsGerm7,
    Integer rep3NoSeedsGerm7,
    Integer rep4NoSeedsGerm7,
    BigDecimal cumulativeGerm7,

    // ── Slot 8 ──────────────────────────────────────────────────────────────
    BigDecimal dailyGermSkey8,
    LocalDate countDt8,
    Integer dayNoOfTest8,
    Integer rep1NoSeedsGerm8,
    Integer rep2NoSeedsGerm8,
    Integer rep3NoSeedsGerm8,
    Integer rep4NoSeedsGerm8,
    BigDecimal cumulativeGerm8,

    // ── Slot 9 ──────────────────────────────────────────────────────────────
    BigDecimal dailyGermSkey9,
    LocalDate countDt9,
    Integer dayNoOfTest9,
    Integer rep1NoSeedsGerm9,
    Integer rep2NoSeedsGerm9,
    Integer rep3NoSeedsGerm9,
    Integer rep4NoSeedsGerm9,
    BigDecimal cumulativeGerm9,

    // ── Slot 10 ─────────────────────────────────────────────────────────────
    BigDecimal dailyGermSkey10,
    LocalDate countDt10,
    Integer dayNoOfTest10,
    Integer rep1NoSeedsGerm10,
    Integer rep2NoSeedsGerm10,
    Integer rep3NoSeedsGerm10,
    Integer rep4NoSeedsGerm10,
    BigDecimal cumulativeGerm10,

    // ── Slot 11 ─────────────────────────────────────────────────────────────
    BigDecimal dailyGermSkey11,
    LocalDate countDt11,
    Integer dayNoOfTest11,
    Integer rep1NoSeedsGerm11,
    Integer rep2NoSeedsGerm11,
    Integer rep3NoSeedsGerm11,
    Integer rep4NoSeedsGerm11,
    BigDecimal cumulativeGerm11,

    // ── Slot 12 ─────────────────────────────────────────────────────────────
    BigDecimal dailyGermSkey12,
    LocalDate countDt12,
    Integer dayNoOfTest12,
    Integer rep1NoSeedsGerm12,
    Integer rep2NoSeedsGerm12,
    Integer rep3NoSeedsGerm12,
    Integer rep4NoSeedsGerm12,
    BigDecimal cumulativeGerm12,

    // ── Slot 13 ─────────────────────────────────────────────────────────────
    BigDecimal dailyGermSkey13,
    LocalDate countDt13,
    Integer dayNoOfTest13,
    Integer rep1NoSeedsGerm13,
    Integer rep2NoSeedsGerm13,
    Integer rep3NoSeedsGerm13,
    Integer rep4NoSeedsGerm13,
    BigDecimal cumulativeGerm13,

    // ── Audit ────────────────────────────────────────────────────────────────
    @Schema(description = "User ID that created the record")
    String entryUserid,

    @Schema(description = "Timestamp when the record was created")
    LocalDateTime entryTimestamp,

    @Schema(description = "User ID that last updated the record")
    String updateUserid,

    @Schema(description = "Timestamp of the last update")
    LocalDateTime updateTimestamp

) {}
