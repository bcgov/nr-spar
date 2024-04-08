package ca.bc.gov.backendstartapi.util;

import java.math.BigDecimal;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class LatLongUtilTest {

  @Test
  void decimalToDegreeTest() {
    Integer[] negDegreesLat = LatLongUtil.decimalToDegree(new BigDecimal("-26.296189"));

    Assertions.assertEquals(3, negDegreesLat.length);
    Assertions.assertEquals(-26, negDegreesLat[0]);
    Assertions.assertEquals(17, negDegreesLat[1]);
    Assertions.assertEquals(46, negDegreesLat[2]);

    Integer[] negDegreesLong = LatLongUtil.decimalToDegree(new BigDecimal("-48.845176"));

    Assertions.assertEquals(3, negDegreesLong.length);
    Assertions.assertEquals(-48, negDegreesLong[0]);
    Assertions.assertEquals(50, negDegreesLong[1]);
    Assertions.assertEquals(42, negDegreesLong[2]);
  }

  @Test
  void degreeToDecimalTest() {
    BigDecimal decimalLat = LatLongUtil.degreeToDecimal(new Integer[] {26, 17, 46});
    BigDecimal decimalLong = LatLongUtil.degreeToDecimal(new Integer[] {48, 50, 42});
    BigDecimal negDecimalLat = LatLongUtil.degreeToDecimal(new Integer[] {-26, 17, 46});
    BigDecimal negDecimalLong = LatLongUtil.degreeToDecimal(new Integer[] {-48, 50, 42});

    Assertions.assertEquals(new BigDecimal("26.296111"), decimalLat);
    Assertions.assertEquals(new BigDecimal("48.845000"), decimalLong);
    Assertions.assertEquals(new BigDecimal("-26.296111"), negDecimalLat);
    Assertions.assertEquals(new BigDecimal("-48.845000"), negDecimalLong);
  }

  @Test
  void degreeToMinutes() {
    BigDecimal decimalLat = LatLongUtil.degreeToMinutes(new double[] {26, 17, 46.2804});
    BigDecimal decimalLong = LatLongUtil.degreeToMinutes(new double[] {48, 50, 42.6336});

    Assertions.assertEquals(new BigDecimal("1577.771340"), decimalLat);
    Assertions.assertEquals(new BigDecimal("2930.710560"), decimalLong);
  }
}
