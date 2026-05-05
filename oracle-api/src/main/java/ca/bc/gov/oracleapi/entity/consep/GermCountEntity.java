package ca.bc.gov.oracleapi.entity.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/** Represents one row in consep.cns_t_germ_count — one wide row per test (ria_skey). */
@Getter
@Setter
@Entity
@Table(name = "CNS_T_GERM_COUNT", schema = "CONSEP")
@Schema(description = "Represents the daily germination count data for a test in CONSEP")
public class GermCountEntity {

  @Id
  @Column(name = "RIA_SKEY", precision = 10, scale = 0, nullable = false)
  private BigDecimal riaSkey;

  // ── Slot 1 ────────────────────────────────────────────────────────────────
  @Column(name = "DAILY_GERM_SKEY1", precision = 10, scale = 0)
  private BigDecimal dailyGermSkey1;

  @Column(name = "COUNT_DT1")
  private LocalDate countDt1;

  @Column(name = "DAY_NO_OF_TEST1", precision = 5, scale = 0)
  private Integer dayNoOfTest1;

  @Column(name = "REP1_NO_SEEDS_GERM1", precision = 5, scale = 0)
  private Integer rep1NoSeedsGerm1;

  @Column(name = "REP2_NO_SEEDS_GERM1", precision = 5, scale = 0)
  private Integer rep2NoSeedsGerm1;

  @Column(name = "REP3_NO_SEEDS_GERM1", precision = 5, scale = 0)
  private Integer rep3NoSeedsGerm1;

  @Column(name = "REP4_NO_SEEDS_GERM1", precision = 5, scale = 0)
  private Integer rep4NoSeedsGerm1;

  @Column(name = "CUMULATIVE_GERM1", precision = 7, scale = 4)
  private BigDecimal cumulativeGerm1;

  // ── Slot 2 ────────────────────────────────────────────────────────────────
  @Column(name = "DAILY_GERM_SKEY2", precision = 10, scale = 0)
  private BigDecimal dailyGermSkey2;

  @Column(name = "COUNT_DT2")
  private LocalDate countDt2;

  @Column(name = "DAY_NO_OF_TEST2", precision = 5, scale = 0)
  private Integer dayNoOfTest2;

  @Column(name = "REP1_NO_SEEDS_GERM2", precision = 5, scale = 0)
  private Integer rep1NoSeedsGerm2;

  @Column(name = "REP2_NO_SEEDS_GERM2", precision = 5, scale = 0)
  private Integer rep2NoSeedsGerm2;

  @Column(name = "REP3_NO_SEEDS_GERM2", precision = 5, scale = 0)
  private Integer rep3NoSeedsGerm2;

  @Column(name = "REP4_NO_SEEDS_GERM2", precision = 5, scale = 0)
  private Integer rep4NoSeedsGerm2;

  @Column(name = "CUMULATIVE_GERM2", precision = 7, scale = 4)
  private BigDecimal cumulativeGerm2;

  // ── Slot 3 ────────────────────────────────────────────────────────────────
  @Column(name = "DAILY_GERM_SKEY3", precision = 10, scale = 0)
  private BigDecimal dailyGermSkey3;

  @Column(name = "COUNT_DT3")
  private LocalDate countDt3;

  @Column(name = "DAY_NO_OF_TEST3", precision = 5, scale = 0)
  private Integer dayNoOfTest3;

  @Column(name = "REP1_NO_SEEDS_GERM3", precision = 5, scale = 0)
  private Integer rep1NoSeedsGerm3;

  @Column(name = "REP2_NO_SEEDS_GERM3", precision = 5, scale = 0)
  private Integer rep2NoSeedsGerm3;

  @Column(name = "REP3_NO_SEEDS_GERM3", precision = 5, scale = 0)
  private Integer rep3NoSeedsGerm3;

  @Column(name = "REP4_NO_SEEDS_GERM3", precision = 5, scale = 0)
  private Integer rep4NoSeedsGerm3;

  @Column(name = "CUMULATIVE_GERM3", precision = 7, scale = 4)
  private BigDecimal cumulativeGerm3;

  // ── Slot 4 ────────────────────────────────────────────────────────────────
  @Column(name = "DAILY_GERM_SKEY4", precision = 10, scale = 0)
  private BigDecimal dailyGermSkey4;

  @Column(name = "COUNT_DT4")
  private LocalDate countDt4;

  @Column(name = "DAY_NO_OF_TEST4", precision = 5, scale = 0)
  private Integer dayNoOfTest4;

  @Column(name = "REP1_NO_SEEDS_GERM4", precision = 5, scale = 0)
  private Integer rep1NoSeedsGerm4;

  @Column(name = "REP2_NO_SEEDS_GERM4", precision = 5, scale = 0)
  private Integer rep2NoSeedsGerm4;

  @Column(name = "REP3_NO_SEEDS_GERM4", precision = 5, scale = 0)
  private Integer rep3NoSeedsGerm4;

  @Column(name = "REP4_NO_SEEDS_GERM4", precision = 5, scale = 0)
  private Integer rep4NoSeedsGerm4;

  @Column(name = "CUMULATIVE_GERM4", precision = 7, scale = 4)
  private BigDecimal cumulativeGerm4;

  // ── Slot 5 ────────────────────────────────────────────────────────────────
  @Column(name = "DAILY_GERM_SKEY5", precision = 10, scale = 0)
  private BigDecimal dailyGermSkey5;

  @Column(name = "COUNT_DT5")
  private LocalDate countDt5;

  @Column(name = "DAY_NO_OF_TEST5", precision = 5, scale = 0)
  private Integer dayNoOfTest5;

  @Column(name = "REP1_NO_SEEDS_GERM5", precision = 5, scale = 0)
  private Integer rep1NoSeedsGerm5;

  @Column(name = "REP2_NO_SEEDS_GERM5", precision = 5, scale = 0)
  private Integer rep2NoSeedsGerm5;

  @Column(name = "REP3_NO_SEEDS_GERM5", precision = 5, scale = 0)
  private Integer rep3NoSeedsGerm5;

  @Column(name = "REP4_NO_SEEDS_GERM5", precision = 5, scale = 0)
  private Integer rep4NoSeedsGerm5;

  @Column(name = "CUMULATIVE_GERM5", precision = 7, scale = 4)
  private BigDecimal cumulativeGerm5;

  // ── Slot 6 ────────────────────────────────────────────────────────────────
  @Column(name = "DAILY_GERM_SKEY6", precision = 10, scale = 0)
  private BigDecimal dailyGermSkey6;

  @Column(name = "COUNT_DT6")
  private LocalDate countDt6;

  @Column(name = "DAY_NO_OF_TEST6", precision = 5, scale = 0)
  private Integer dayNoOfTest6;

  @Column(name = "REP1_NO_SEEDS_GERM6", precision = 5, scale = 0)
  private Integer rep1NoSeedsGerm6;

  @Column(name = "REP2_NO_SEEDS_GERM6", precision = 5, scale = 0)
  private Integer rep2NoSeedsGerm6;

  @Column(name = "REP3_NO_SEEDS_GERM6", precision = 5, scale = 0)
  private Integer rep3NoSeedsGerm6;

  @Column(name = "REP4_NO_SEEDS_GERM6", precision = 5, scale = 0)
  private Integer rep4NoSeedsGerm6;

  @Column(name = "CUMULATIVE_GERM6", precision = 7, scale = 4)
  private BigDecimal cumulativeGerm6;

  // ── Slot 7 ────────────────────────────────────────────────────────────────
  @Column(name = "DAILY_GERM_SKEY7", precision = 10, scale = 0)
  private BigDecimal dailyGermSkey7;

  @Column(name = "COUNT_DT7")
  private LocalDate countDt7;

  @Column(name = "DAY_NO_OF_TEST7", precision = 5, scale = 0)
  private Integer dayNoOfTest7;

  @Column(name = "REP1_NO_SEEDS_GERM7", precision = 5, scale = 0)
  private Integer rep1NoSeedsGerm7;

  @Column(name = "REP2_NO_SEEDS_GERM7", precision = 5, scale = 0)
  private Integer rep2NoSeedsGerm7;

  @Column(name = "REP3_NO_SEEDS_GERM7", precision = 5, scale = 0)
  private Integer rep3NoSeedsGerm7;

  @Column(name = "REP4_NO_SEEDS_GERM7", precision = 5, scale = 0)
  private Integer rep4NoSeedsGerm7;

  @Column(name = "CUMULATIVE_GERM7", precision = 7, scale = 4)
  private BigDecimal cumulativeGerm7;

  // ── Slot 8 ────────────────────────────────────────────────────────────────
  @Column(name = "DAILY_GERM_SKEY8", precision = 10, scale = 0)
  private BigDecimal dailyGermSkey8;

  @Column(name = "COUNT_DT8")
  private LocalDate countDt8;

  @Column(name = "DAY_NO_OF_TEST8", precision = 5, scale = 0)
  private Integer dayNoOfTest8;

  @Column(name = "REP1_NO_SEEDS_GERM8", precision = 5, scale = 0)
  private Integer rep1NoSeedsGerm8;

  @Column(name = "REP2_NO_SEEDS_GERM8", precision = 5, scale = 0)
  private Integer rep2NoSeedsGerm8;

  @Column(name = "REP3_NO_SEEDS_GERM8", precision = 5, scale = 0)
  private Integer rep3NoSeedsGerm8;

  @Column(name = "REP4_NO_SEEDS_GERM8", precision = 5, scale = 0)
  private Integer rep4NoSeedsGerm8;

  @Column(name = "CUMULATIVE_GERM8", precision = 7, scale = 4)
  private BigDecimal cumulativeGerm8;

  // ── Slot 9 ────────────────────────────────────────────────────────────────
  @Column(name = "DAILY_GERM_SKEY9", precision = 10, scale = 0)
  private BigDecimal dailyGermSkey9;

  @Column(name = "COUNT_DT9")
  private LocalDate countDt9;

  @Column(name = "DAY_NO_OF_TEST9", precision = 5, scale = 0)
  private Integer dayNoOfTest9;

  @Column(name = "REP1_NO_SEEDS_GERM9", precision = 5, scale = 0)
  private Integer rep1NoSeedsGerm9;

  @Column(name = "REP2_NO_SEEDS_GERM9", precision = 5, scale = 0)
  private Integer rep2NoSeedsGerm9;

  @Column(name = "REP3_NO_SEEDS_GERM9", precision = 5, scale = 0)
  private Integer rep3NoSeedsGerm9;

  @Column(name = "REP4_NO_SEEDS_GERM9", precision = 5, scale = 0)
  private Integer rep4NoSeedsGerm9;

  @Column(name = "CUMULATIVE_GERM9", precision = 7, scale = 4)
  private BigDecimal cumulativeGerm9;

  // ── Slot 10 ───────────────────────────────────────────────────────────────
  @Column(name = "DAILY_GERM_SKEY10", precision = 10, scale = 0)
  private BigDecimal dailyGermSkey10;

  @Column(name = "COUNT_DT10")
  private LocalDate countDt10;

  @Column(name = "DAY_NO_OF_TEST10", precision = 5, scale = 0)
  private Integer dayNoOfTest10;

  @Column(name = "REP1_NO_SEEDS_GERM10", precision = 5, scale = 0)
  private Integer rep1NoSeedsGerm10;

  @Column(name = "REP2_NO_SEEDS_GERM10", precision = 5, scale = 0)
  private Integer rep2NoSeedsGerm10;

  @Column(name = "REP3_NO_SEEDS_GERM10", precision = 5, scale = 0)
  private Integer rep3NoSeedsGerm10;

  @Column(name = "REP4_NO_SEEDS_GERM10", precision = 5, scale = 0)
  private Integer rep4NoSeedsGerm10;

  @Column(name = "CUMULATIVE_GERM10", precision = 7, scale = 4)
  private BigDecimal cumulativeGerm10;

  // ── Slot 11 ───────────────────────────────────────────────────────────────
  @Column(name = "DAILY_GERM_SKEY11", precision = 10, scale = 0)
  private BigDecimal dailyGermSkey11;

  @Column(name = "COUNT_DT11")
  private LocalDate countDt11;

  @Column(name = "DAY_NO_OF_TEST11", precision = 5, scale = 0)
  private Integer dayNoOfTest11;

  @Column(name = "REP1_NO_SEEDS_GERM11", precision = 5, scale = 0)
  private Integer rep1NoSeedsGerm11;

  @Column(name = "REP2_NO_SEEDS_GERM11", precision = 5, scale = 0)
  private Integer rep2NoSeedsGerm11;

  @Column(name = "REP3_NO_SEEDS_GERM11", precision = 5, scale = 0)
  private Integer rep3NoSeedsGerm11;

  @Column(name = "REP4_NO_SEEDS_GERM11", precision = 5, scale = 0)
  private Integer rep4NoSeedsGerm11;

  @Column(name = "CUMULATIVE_GERM11", precision = 7, scale = 4)
  private BigDecimal cumulativeGerm11;

  // ── Slot 12 ───────────────────────────────────────────────────────────────
  @Column(name = "DAILY_GERM_SKEY12", precision = 10, scale = 0)
  private BigDecimal dailyGermSkey12;

  @Column(name = "COUNT_DT12")
  private LocalDate countDt12;

  @Column(name = "DAY_NO_OF_TEST12", precision = 5, scale = 0)
  private Integer dayNoOfTest12;

  @Column(name = "REP1_NO_SEEDS_GERM12", precision = 5, scale = 0)
  private Integer rep1NoSeedsGerm12;

  @Column(name = "REP2_NO_SEEDS_GERM12", precision = 5, scale = 0)
  private Integer rep2NoSeedsGerm12;

  @Column(name = "REP3_NO_SEEDS_GERM12", precision = 5, scale = 0)
  private Integer rep3NoSeedsGerm12;

  @Column(name = "REP4_NO_SEEDS_GERM12", precision = 5, scale = 0)
  private Integer rep4NoSeedsGerm12;

  @Column(name = "CUMULATIVE_GERM12", precision = 7, scale = 4)
  private BigDecimal cumulativeGerm12;

  // ── Slot 13 ───────────────────────────────────────────────────────────────
  @Column(name = "DAILY_GERM_SKEY13", precision = 10, scale = 0)
  private BigDecimal dailyGermSkey13;

  @Column(name = "COUNT_DT13")
  private LocalDate countDt13;

  @Column(name = "DAY_NO_OF_TEST13", precision = 5, scale = 0)
  private Integer dayNoOfTest13;

  @Column(name = "REP1_NO_SEEDS_GERM13", precision = 5, scale = 0)
  private Integer rep1NoSeedsGerm13;

  @Column(name = "REP2_NO_SEEDS_GERM13", precision = 5, scale = 0)
  private Integer rep2NoSeedsGerm13;

  @Column(name = "REP3_NO_SEEDS_GERM13", precision = 5, scale = 0)
  private Integer rep3NoSeedsGerm13;

  @Column(name = "REP4_NO_SEEDS_GERM13", precision = 5, scale = 0)
  private Integer rep4NoSeedsGerm13;

  @Column(name = "CUMULATIVE_GERM13", precision = 7, scale = 4)
  private BigDecimal cumulativeGerm13;

  // ── Audit ──────────────────────────────────────────────────────────────────
  @Column(name = "ENTRY_USERID", length = 30)
  private String entryUserid;

  @Column(name = "ENTRY_TIMESTAMP")
  private LocalDateTime entryTimestamp;

  @Column(name = "UPDATE_USERID", length = 30)
  private String updateUserid;

  @Column(name = "UPDATE_TIMESTAMP")
  private LocalDateTime updateTimestamp;
}
