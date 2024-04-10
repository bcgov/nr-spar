package ca.bc.gov.backendstartapi.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** This class contains methods for lat and long conversions. */
public class LatLongUtil {

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
   * @param degreeLatLong An array of double values containing always 3 numbers.
   * @return The decimal representation of a latitude or longitude.
   */
  public static BigDecimal dmsToDecimalDegree(Integer[] degreeLatLong) {
    Boolean isNegative = degreeLatLong[0] < 0;

    BigDecimal degree = new BigDecimal(degreeLatLong[0]).abs();
    BigDecimal minutes =
        new BigDecimal(degreeLatLong[1]).divide(new BigDecimal(60), 30000, RoundingMode.HALF_UP);
    BigDecimal seconds =
        new BigDecimal(degreeLatLong[2]).divide(new BigDecimal(3600), 30000, RoundingMode.HALF_UP);

    BigDecimal decimalVal = degree.add(minutes).add(seconds).setScale(6, RoundingMode.HALF_UP);

    return isNegative ? decimalVal.negate() : decimalVal;
  }

  /**
   * Convert a list of degrees, minutes and seconds to minutes representation. I.e.: multiply the
   * degree value by 60, do not change the minutes value, divide the seconds by 60.
   *
   * @param degreeLatLong An array of integer containing always 3 numbers.
   * @return The minutes representation of a latitude or longitude.
   */
  public static BigDecimal degreeToMinutes(Integer[] degreeLatLong) {
    BigDecimal degree = new BigDecimal(degreeLatLong[0] * 60);
    BigDecimal minutes = new BigDecimal(degreeLatLong[1]);
    BigDecimal seconds = new BigDecimal(degreeLatLong[2] / 60);

    BigDecimal sum = degree.add(minutes).add(seconds).setScale(6, RoundingMode.HALF_UP);

    return sum;
  }
}
