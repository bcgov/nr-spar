package ca.bc.gov.oracleapi.service.consep;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;

class GerminationMetricsTest {

  private static final Integer[] SEEDS_100 = {100, 100, 100, 100};
  private static final boolean[] ALL_ACCEPTED = {true, true, true, true};
  private static final Integer[] NONE = {0, 0, 0, 0};

  private static Integer[] reps(int r1, int r2, int r3, int r4) {
    return new Integer[] {r1, r2, r3, r4};
  }

  private static GerminationMetrics.Result run(List<Integer> days, List<Integer[]> counts) {
    return GerminationMetrics.calculate(days, counts, SEEDS_100, ALL_ACCEPTED);
  }

  /** The worked example in issue #2756 (seedlot 48887, RIA_SKEY 1068771). */
  @Test
  void issueExample_1068771() {
    var result = run(
        List.of(3, 5, 7, 11, 12, 14, 17, 19, 21),
        List.of(NONE, NONE, reps(79, 80, 80, 75), reps(14, 5, 11, 17), NONE, NONE, NONE,
            reps(0, 1, 1, 0), NONE));

    assertEquals(new GerminationMetrics.Result(91, 48, 78, 7), result);
  }

  /** Legacy STD test for seedlot 48887 (RIA_SKEY 801931): stored 94 / 45 / 91 at day 9. */
  @Test
  void legacyStd_801931() {
    List<Integer[]> counts = List.of(NONE, NONE, reps(54, 51, 62, 65), reps(39, 39, 30, 25),
        reps(4, 2, 2, 2), NONE, NONE, NONE, NONE);

    List<BigDecimal> cumulative =
        GerminationMetrics.cumulativePercents(counts, SEEDS_100, ALL_ACCEPTED);
    // Every stored CUMULATIVE_GERM value on the legacy row.
    assertEquals(0, cumulative.get(2).compareTo(new BigDecimal("58")));
    assertEquals(0, cumulative.get(3).compareTo(new BigDecimal("91.25")));
    assertEquals(0, cumulative.get(8).compareTo(new BigDecimal("93.75")));

    assertEquals(new GerminationMetrics.Result(94, 45, 91, 9),
        run(List.of(2, 5, 7, 9, 12, 14, 16, 19, 21), counts));
  }

  /** Legacy QA test for seedlot 48887 (RIA_SKEY 793686): stored 92 / 36 / 75 at day 9. */
  @Test
  void legacyQa_793686() {
    var result = run(
        List.of(2, 5, 7, 9, 12, 14, 16, 19, 21),
        List.of(NONE, NONE, reps(25, 35, 30, 31), reps(52, 44, 36, 48), reps(14, 11, 22, 14),
            reps(0, 0, 1, 1), reps(0, 0, 1, 0), reps(0, 1, 0, 0), NONE));

    assertEquals(new GerminationMetrics.Result(92, 36, 75, 9), result);
  }

  @Test
  void rejectedReplicateIsLeftOutOfTheAverage() {
    boolean[] rep4Rejected = {true, true, true, false};
    List<BigDecimal> cumulative = GerminationMetrics.cumulativePercents(
        List.<Integer[]>of(reps(30, 30, 30, 90)), SEEDS_100, rep4Rejected);

    assertEquals(0, cumulative.get(0).compareTo(new BigDecimal("30")));
  }

  @Test
  void countIsAPercentOfItsOwnReplicateSeeds() {
    Integer[] seeds = {50, 100, null, 0};
    List<BigDecimal> cumulative = GerminationMetrics.cumulativePercents(
        List.<Integer[]>of(reps(10, 30, 99, 99)), seeds, ALL_ACCEPTED);

    // (20% + 30%) / 2; replicates without seeds are not in use.
    assertEquals(0, cumulative.get(0).compareTo(new BigDecimal("25")));
  }

  @Test
  void tiedPeakTakesTheEarliestDay() {
    // 20/2 = 10 and 40/4 = 10.
    var result = run(List.of(2, 4), List.of(reps(20, 20, 20, 20), reps(20, 20, 20, 20)));

    assertEquals(2, result.peakValueNoDays());
    assertEquals(20, result.peakValueGrmPct());
  }

  @Test
  void exactHalfGvRoundsToEven() {
    // PV 63/3 = 21, MDG 75/14, GV exactly 112.5; rounding MDG first gave 112.500000000003 -> 113.
    var result = run(List.of(3, 14), List.of(reps(63, 63, 63, 63), reps(12, 12, 12, 12)));

    assertEquals(new GerminationMetrics.Result(75, 112, 63, 3), result);
  }

  @Test
  void exactHalfGvWithThirdsRoundsToEven() {
    // Three replicates: day 1 avg 29/3, day 2 cumulative 15; GV = 15 x 29/3 / 2 = 72.5 exactly.
    // Rounding the thirds to 12 places gave 72.5000000000025 -> 73 (PR #2890 review).
    Integer[] seeds = {100, 100, 100, null};
    var result = GerminationMetrics.calculate(List.of(1, 2),
        List.of(new Integer[] {10, 10, 9, null}, new Integer[] {6, 5, 5, null}),
        seeds, ALL_ACCEPTED);

    assertEquals(72, result.germinationValue());
    assertEquals(15, result.germinationPct());
  }

  @Test
  void noUsableDayNumberGivesNoResult() {
    assertNull(run(List.of(0), List.<Integer[]>of(reps(10, 10, 10, 10))));
  }

  @Test
  void dayZero_qaCountsFromGerminatorEntry() {
    LocalDate entry = LocalDate.of(2026, 5, 10);
    assertEquals(entry, GerminationMetrics.dayZero(
        "QA", LocalDateTime.of(2026, 5, 1, 9, 0), entry, 24, 48));
  }

  @Test
  void dayZero_otherCategoriesCountFromBeginPlusSoakAndStrat() {
    // 2026-05-01 20:00 + 24h soak + 48h strat = 2026-05-04 20:00
    assertEquals(LocalDate.of(2026, 5, 4), GerminationMetrics.dayZero(
        "STD", LocalDateTime.of(2026, 5, 1, 20, 0), LocalDate.of(2026, 5, 10), 24, 48));
    assertEquals(LocalDate.of(2026, 5, 1), GerminationMetrics.dayZero(
        "STD", LocalDateTime.of(2026, 5, 1, 20, 0), null, null, null));
  }

  @Test
  void dayZero_nullUntilItsDateIsKnown() {
    assertNull(GerminationMetrics.dayZero("STD", null, LocalDate.of(2026, 5, 10), 24, 0));
    assertNull(GerminationMetrics.dayZero("QA", LocalDateTime.of(2026, 5, 1, 9, 0), null, 0, 0));
  }
}
