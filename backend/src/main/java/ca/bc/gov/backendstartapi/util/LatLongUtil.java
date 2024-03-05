package ca.bc.gov.backendstartapi.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class LatLongUtil {

  public static int[] decimalToDegree(BigDecimal decimalLatLong) {
    int degree = decimalLatLong.intValue();
    decimalLatLong = decimalLatLong.subtract(new BigDecimal(degree));

    decimalLatLong = decimalLatLong.multiply(new BigDecimal(60));
    int minutes = decimalLatLong.intValue();

    decimalLatLong = decimalLatLong.subtract(new BigDecimal(minutes));
    decimalLatLong = decimalLatLong.multiply(new BigDecimal(60));

    int seconds = decimalLatLong.intValue();

    return new int[] {degree, minutes, seconds};
  }

  public static BigDecimal degreeToDecimal(int[] degreeLatLong) {
    BigDecimal degree = new BigDecimal(degreeLatLong[0]);
    BigDecimal minutes =
        new BigDecimal(degreeLatLong[1]).divide(new BigDecimal(60), 10, RoundingMode.HALF_UP);
    BigDecimal seconds =
        new BigDecimal(degreeLatLong[2]).divide(new BigDecimal(3600), 10, RoundingMode.HALF_UP);

    BigDecimal sum = degree.add(minutes).add(seconds);

    return sum;
  }

  public static BigDecimal degreeToMinutes(int[] degreeLatLong) {
    BigDecimal degree = new BigDecimal(degreeLatLong[0] * 60);
    BigDecimal minutes = new BigDecimal(degreeLatLong[1]);
    BigDecimal seconds = new BigDecimal(degreeLatLong[2] / 60);

    BigDecimal sum = degree.add(minutes).add(seconds);

    return sum;
  }
}
