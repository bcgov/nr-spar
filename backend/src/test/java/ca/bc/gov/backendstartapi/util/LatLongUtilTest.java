package ca.bc.gov.backendstartapi.util;

import java.math.BigDecimal;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class LatLongUtilTest {

  @Test
  void decimalToDegreeTest() {
    double[] degreesLat = LatLongUtil.decimalToDegree(new BigDecimal("-26.296189"));

    Assertions.assertEquals(3, degreesLat.length);
    Assertions.assertEquals(26, degreesLat[0]);
    Assertions.assertEquals(17, degreesLat[1]);
    Assertions.assertEquals(46.2804, degreesLat[2]);

    double[] degreesLong = LatLongUtil.decimalToDegree(new BigDecimal("-48.845176"));

    Assertions.assertEquals(3, degreesLong.length);
    Assertions.assertEquals(48, degreesLong[0]);
    Assertions.assertEquals(50, degreesLong[1]);
    Assertions.assertEquals(42.6336, degreesLong[2]);
  }

  @Test
  void degreeToDecimalTest() {
    BigDecimal decimalLat = LatLongUtil.degreeToDecimal(new double[] {26, 17, 46.2804});
    BigDecimal decimalLong = LatLongUtil.degreeToDecimal(new double[] {48, 50, 42.6336});

    Assertions.assertEquals(new BigDecimal("26.296189"), decimalLat);
    Assertions.assertEquals(new BigDecimal("48.845176"), decimalLong);
  }

  @Test
  void degreeToMinutes() {
    BigDecimal decimalLat = LatLongUtil.degreeToMinutes(new double[] {26, 17, 46.2804});
    BigDecimal decimalLong = LatLongUtil.degreeToMinutes(new double[] {48, 50, 42.6336});

    Assertions.assertEquals(new BigDecimal("1577.771340"), decimalLat);
    Assertions.assertEquals(new BigDecimal("2930.710560"), decimalLong);
  }
}
