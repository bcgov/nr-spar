package ca.bc.gov.oracleapi.service.consep;

import java.math.BigDecimal;
import java.math.BigInteger;
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

  /** Working precision of the cumulative % before it is stored at scale 4; the metrics are exact. */
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

  /** An exact fraction: a day's average of 1/3 must not become 0.333...3 before rounding. */
  private record Q(BigInteger num, BigInteger den) {
    static final Q ZERO = new Q(BigInteger.ZERO, BigInteger.ONE);

    static Q of(long num, long den) {
      return new Q(BigInteger.valueOf(num), BigInteger.valueOf(den));
    }

    Q plus(Q o) {
      return new Q(num.multiply(o.den).add(o.num.multiply(den)), den.multiply(o.den));
    }

    Q times(Q o) {
      return new Q(num.multiply(o.num), den.multiply(o.den));
    }

    int compareTo(Q o) {
      return num.multiply(o.den).compareTo(o.num.multiply(den));
    }

    /** CInt of the exact value: half-to-even, without ever dividing inexactly. */
    int cint() {
      BigInteger[] qr = num.divideAndRemainder(den);
      int cmp = qr[1].shiftLeft(1).abs().compareTo(den.abs());
      boolean up = cmp > 0 || (cmp == 0 && qr[0].testBit(0));
      return (up ? qr[0].add(BigInteger.valueOf((long) num.signum() * den.signum())) : qr[0])
          .intValueExact();
    }
  }

  /** One day's average % as an exact fraction; same rules as {@link #dayAverage}. */
  private static Q exactDayAverage(Integer[] counts, Integer[] totalSeeds, boolean[] accepted) {
    Q sum = Q.ZERO;
    int reps = 0;
    for (int r = 0; r < 4; r++) {
      if (!accepted[r] || totalSeeds[r] == null || totalSeeds[r] <= 0 || counts[r] == null) {
        continue;
      }
      sum = sum.plus(Q.of(counts[r] * 100L, totalSeeds[r]));
      reps++;
    }
    return reps == 0 ? Q.ZERO : sum.times(Q.of(1, reps));
  }

  /**
   * Germination %, GV and peak value, computed on exact fractions and rounded once at the end:
   * any intermediate rounding can push an exact x.5 result over the half-to-even boundary.
   *
   * @param dayNumbers test day number per day (count date minus day zero)
   * @param countsPerDay per day, the four replicate counts (null = not counted that day)
   * @param totalSeeds the four replicates' seed totals (null or 0 = replicate not in use)
   * @param accepted the four replicates' accept flags; rejected replicates are left out
   * @return the integer results, or null when there is no day with a positive day number
   */
  static Result calculate(List<Integer> dayNumbers, List<Integer[]> countsPerDay,
      Integer[] totalSeeds, boolean[] accepted) {
    int peakDay = 0;
    Q peakCumulative = Q.ZERO;
    int lastDay = 0;
    Q finalCumulative = Q.ZERO;
    Q cumulative = Q.ZERO;
    for (int i = 0; i < dayNumbers.size(); i++) {
      cumulative = cumulative.plus(exactDayAverage(countsPerDay.get(i), totalSeeds, accepted));
      Integer day = dayNumbers.get(i);
      if (day == null || day <= 0) {
        continue;
      }
      // cumulative / day > peakCumulative / peakDay; strict, so the earliest day wins a tie
      if (peakDay == 0 || cumulative.times(Q.of(peakDay, 1))
          .compareTo(peakCumulative.times(Q.of(day, 1))) > 0) {
        peakCumulative = cumulative;
        peakDay = day;
      }
      lastDay = day;
      finalCumulative = cumulative;
    }
    if (peakDay == 0) {
      return null;
    }
    Q gv = finalCumulative.times(peakCumulative).times(Q.of(1, (long) lastDay * peakDay));
    return new Result(finalCumulative.cint(), gv.cint(), peakCumulative.cint(), peakDay);
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
    long hours = (soakHours == null ? 0L : soakHours) + (stratHours == null ? 0L : stratHours);
    return actualBegin.plusHours(hours).toLocalDate();
  }
}
