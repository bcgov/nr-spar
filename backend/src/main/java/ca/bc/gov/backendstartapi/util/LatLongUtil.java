package ca.bc.gov.backendstartapi.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** This class contains methods for lat and long conversions. */
public class LatLongUtil {

  static int DECIMAL_SCALE = 5;
  static int DIVISION_SCALE = 100; // For better precision
  static BigDecimal CONVERSION_FACTOR = new BigDecimal(60);

  /**
   * Convert a decimal latitude or longitude to a list of degrees, minutes and seconds.
   *
   * @param decimalValue The decimal representation of a latitude or longitude.
   * @return An array of integer containing always 3 numbers.
   */
  public static Integer[] decimalDegreeToDms(BigDecimal decimalValue) {
    Integer degree = decimalValue.intValue();
    BigDecimal remainVal = decimalValue.abs().subtract(new BigDecimal(degree).abs());

    remainVal = remainVal.multiply(new BigDecimal(60));
    Integer minute = remainVal.intValue();

    remainVal = remainVal.subtract(new BigDecimal(minute));
    remainVal = remainVal.multiply(new BigDecimal(60));

    Integer second = remainVal.intValue();

    return new Integer[] {degree, minute, second};
  }

  /**
   * Convert a list of degrees, minutes and seconds to decimal value.
   *
   * @param dmsVals An array of integer values containing 3 numbers.
   * @return The decimal representation of a latitude or longitude.
   */
  public static BigDecimal dmsToDecimalDegree(Integer[] dmsVals) {
    BigDecimal degree = new BigDecimal(dmsVals[0]).abs();
    BigDecimal minutes =
        new BigDecimal(dmsVals[1]).divide(new BigDecimal(60), DIVISION_SCALE, RoundingMode.HALF_UP);
    BigDecimal seconds =
        new BigDecimal(dmsVals[2])
            .divide(new BigDecimal(3600), DIVISION_SCALE, RoundingMode.HALF_UP);

    BigDecimal decimalVal =
        degree.add(minutes).add(seconds).setScale(DECIMAL_SCALE, RoundingMode.HALF_UP);

    boolean isNegative = dmsVals[0] < 0;

    return isNegative ? decimalVal.negate() : decimalVal;
  }

  /**
   * Convert a list of degrees, minutes and seconds to minutes.
   *
   * @param dmsVals An array of integer values containing 3 numbers.
   * @return The minutes representation of a latitude or longitude.
   */
  public static BigDecimal dmsToMinute(Integer[] dmsVals) {
    BigDecimal degree = new BigDecimal(dmsVals[0]).multiply(CONVERSION_FACTOR);
    BigDecimal minute = new BigDecimal(dmsVals[1]);
    BigDecimal second =
        new BigDecimal(dmsVals[2]).divide(CONVERSION_FACTOR, DIVISION_SCALE, RoundingMode.HALF_UP);

    minute = minute.add(degree.abs()).add(second).setScale(DECIMAL_SCALE, RoundingMode.HALF_UP);

    // Return negative minute
    if (degree.compareTo(BigDecimal.ZERO) < 0) {
      return minute.negate();
    }
    return minute;
  }

  /**
   * Convert minute to a list of degrees, minutes and seconds.
   *
   * @param minuteSum the total minutes of a DMS.
   * @return An array of integer values containing 3 numbers.
   */
  public static Integer[] minuteToDms(BigDecimal minuteSum) {
    BigDecimal decDegree =
        minuteSum.divide(CONVERSION_FACTOR, DIVISION_SCALE, RoundingMode.HALF_UP);
    Integer degree = decDegree.setScale(0, RoundingMode.HALF_UP).intValue();
    Integer minute =
        minuteSum.abs().remainder(CONVERSION_FACTOR).setScale(0, RoundingMode.HALF_UP).intValue();

    // The system does not use second in reality, this is preserved as the legacy system
    // store this value regardless.
    Integer second = 0;

    return new Integer[] {degree, minute, second};
  }
}
