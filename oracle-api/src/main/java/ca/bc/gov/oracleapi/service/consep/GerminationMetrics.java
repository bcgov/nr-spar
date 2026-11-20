package ca.bc.gov.oracleapi.service.consep;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Legacy CONSEP germination calculations (issue #2756), verified against stored legacy results.
 *
 * <p>Each replicate's daily count becomes a percentage of its seeds; a day's average is the sum of
 * those percentages over the replicates counted that day; cumulative germination is the running
 * sum of the daily averages. Peak value is the largest cumulative % / test day (earliest day wins
 * a tie), MDG is final cumulative % / final test day, and GV = MDG x peak value. Integer outputs
 * use MS Access {@code CInt} rounding, i.e. half-to-even.
 */
final class GerminationMetrics {

  /** Scale for intermediate divisions; outputs are rounded only at the end. */
  private static final int SCALE = 12;

  private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

  /** Integer results for the test result row. */
  record Result(int germinationPct, int germinationValue, int peakValueGrmPct,
      int peakValueNoDays) {}

  private GerminationMetrics() {}

  /**
   * Running cumulative germination %, one entry per day.
   *
   * @param countsPerDay per day, the four replicate counts (null = not counted that day)
   * @param totalSeeds the four replicates' seed totals (null or 0 = replicate not in use)
   * @param accepted the four replicates' accept flags; rejected replicates are left out
   * @return cumulative % per day, unrounded
   */
  static List<BigDecimal> cumulativePercents(
      List<Integer[]> countsPerDay, Integer[] totalSeeds, boolean[] accepted) {
    List<BigDecimal> out = new ArrayList<>(countsPerDay.size());
    BigDecimal cumulative = BigDecimal.ZERO;
    for (Integer[] counts : countsPerDay) {
      cumulative = cumulative.add(dayAverage(counts, totalSeeds, accepted));
      out.add(cumulative);
    }
    return out;
  }

  /**
   * One day's average germination %: each counted, accepted replicate's count as a % of its
   * seeds, summed and divided by how many replicates were counted. Zero when none were.
   */
  static BigDecimal dayAverage(Integer[] counts, Integer[] totalSeeds, boolean[] accepted) {
    BigDecimal sum = BigDecimal.ZERO;
    int reps = 0;
    for (int r = 0; r < 4; r++) {
      if (!accepted[r] || totalSeeds[r] == null || totalSeeds[r] <= 0 || counts[r] == null) {
        continue;
      }
      sum = sum.add(BigDecimal.valueOf(counts[r]).multiply(HUNDRED)
          .divide(BigDecimal.valueOf(totalSeeds[r]), SCALE, RoundingMode.HALF_EVEN));
      reps++;
    }
    return reps == 0
        ? BigDecimal.ZERO
        : sum.divide(BigDecimal.valueOf(reps), SCALE, RoundingMode.HALF_EVEN);
  }

  /**
   * Germination %, GV and peak value from the cumulative series.
   *
   * @param dayNumbers test day number per day (count date minus germinator entry)
   * @param cumulative cumulative % per day, from {@link #cumulativePercents}
   * @return the integer results, or null when there is no day with a positive day number
   */
  static Result calculate(List<Integer> dayNumbers, List<BigDecimal> cumulative) {
    // Ratios are compared and multiplied as fractions, dividing once at the end: rounding PV or
    // MDG first can push an exact x.5 GV over the half-to-even boundary.
    int peakDay = 0;
    BigDecimal peakCumulative = BigDecimal.ZERO;
    int lastDay = 0;
    BigDecimal finalCumulative = BigDecimal.ZERO;
    for (int i = 0; i < dayNumbers.size(); i++) {
      Integer day = dayNumbers.get(i);
      if (day == null || day <= 0) {
        continue;
      }
      BigDecimal value = cumulative.get(i);
      // value / day > peakCumulative / peakDay; strict, so the earliest day wins a tie
      if (peakDay == 0 || value.multiply(BigDecimal.valueOf(peakDay))
          .compareTo(peakCumulative.multiply(BigDecimal.valueOf(day))) > 0) {
        peakCumulative = value;
        peakDay = day;
      }
      lastDay = day;
      finalCumulative = value;
    }
    if (peakDay == 0) {
      return null;
    }
    BigDecimal gv = finalCumulative.multiply(peakCumulative)
        .divide(BigDecimal.valueOf((long) lastDay * peakDay), SCALE, RoundingMode.HALF_EVEN);
    return new Result(cint(finalCumulative), cint(gv), cint(peakCumulative), peakDay);
  }

  /**
   * The date test day numbers count from, per the Confluence spec: QA tests count from the
   * germinator entry; every other category from begin + soak + strat hours.
   *
   * <p>shortcut: the spec's fractional-day formula is reduced to calendar days (the time of day
   * is dropped), revisit if legacy day numbers disagree.
   *
   * @return the day-zero date, or null when the date it needs is not recorded yet
   */
  static LocalDate dayZero(String testCategoryCd, LocalDateTime actualBegin,
      LocalDate germinatorEntry, Integer soakHours, Integer stratHours) {
    if ("QA".equals(testCategoryCd)) {
      return germinatorEntry;
    }
    if (actualBegin == null) {
      return null;
    }
    long hours = (soakHours == null ? 0 : soakHours) + (stratHours == null ? 0 : stratHours);
    return actualBegin.plusHours(hours).toLocalDate();
  }

  /** MS Access CInt: round half to even. */
  static int cint(BigDecimal value) {
    return value.setScale(0, RoundingMode.HALF_EVEN).intValueExact();
  }
}
