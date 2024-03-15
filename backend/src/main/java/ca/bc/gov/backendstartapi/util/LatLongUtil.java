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
  public static double[] decimalToDegree(BigDecimal decimalValue) {
    decimalValue = decimalValue.abs();

    double degree = decimalValue.intValue();
    decimalValue = decimalValue.subtract(new BigDecimal(degree));

    decimalValue = decimalValue.multiply(new BigDecimal(60));
    double minutes = decimalValue.intValue();

    decimalValue = decimalValue.subtract(new BigDecimal(minutes));
    decimalValue = decimalValue.multiply(new BigDecimal(60));

    double seconds = decimalValue.doubleValue();

    return new double[] {degree, minutes, seconds};
  }

  /**
   * Convert a list of degrees, minutes and seconds to decimal value.
   *
   * @param degreeLatLong An array of double values containing always 3 numbers.
   * @return The decimal representation of a latitude or longitude.
   */
  public static BigDecimal degreeToDecimal(double[] degreeLatLong) {
    BigDecimal degree = new BigDecimal(degreeLatLong[0]);
    BigDecimal minutes =
        new BigDecimal(degreeLatLong[1]).divide(new BigDecimal(60), 10, RoundingMode.HALF_UP);
    BigDecimal seconds =
        new BigDecimal(degreeLatLong[2]).divide(new BigDecimal(3600), 10, RoundingMode.HALF_UP);

    BigDecimal sum = degree.add(minutes).add(seconds).setScale(6, RoundingMode.HALF_UP);

    return sum;
  }

  /**
   * Convert a list of degrees, minutes and seconds to minutes representation. I.e.: multiply the
   * degree value by 60, do not change the minutes value, divide the seconds by 60.
   *
   * @param degreeLatLong An array of integer containing always 3 numbers.
   * @return The minutes representation of a latitude or longitude.
   */
  public static BigDecimal degreeToMinutes(double[] degreeLatLong) {
    BigDecimal degree = new BigDecimal(degreeLatLong[0] * 60);
    BigDecimal minutes = new BigDecimal(degreeLatLong[1]);
    BigDecimal seconds = new BigDecimal(degreeLatLong[2] / 60);

    BigDecimal sum = degree.add(minutes).add(seconds).setScale(6, RoundingMode.HALF_UP);

    return sum;
  }
}
