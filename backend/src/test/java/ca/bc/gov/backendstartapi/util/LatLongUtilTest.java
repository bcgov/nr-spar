package ca.bc.gov.backendstartapi.util;

import java.math.BigDecimal;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class LatLongUtilTest {

  @Test
  void decimalDegreeToDmsTest() {
    Integer[] negDegreesLat = LatLongUtil.decimalDegreeToDms(new BigDecimal("-26.296189"));

    Assertions.assertEquals(3, negDegreesLat.length);
    Assertions.assertEquals(-26, negDegreesLat[0]);
    Assertions.assertEquals(17, negDegreesLat[1]);
    Assertions.assertEquals(46, negDegreesLat[2]);

    Integer[] negDegreesLong = LatLongUtil.decimalDegreeToDms(new BigDecimal("-48.845176"));

    Assertions.assertEquals(3, negDegreesLong.length);
    Assertions.assertEquals(-48, negDegreesLong[0]);
    Assertions.assertEquals(50, negDegreesLong[1]);
    Assertions.assertEquals(42, negDegreesLong[2]);
  }

  @Test
  void dmsToDecimalDegreeTest() {
    BigDecimal decimalLat = LatLongUtil.dmsToDecimalDegree(new Integer[] {26, 17, 46});
    BigDecimal decimalLong = LatLongUtil.dmsToDecimalDegree(new Integer[] {48, 50, 42});
    BigDecimal negDecimalLat = LatLongUtil.dmsToDecimalDegree(new Integer[] {-26, 17, 46});
    BigDecimal negDecimalLong = LatLongUtil.dmsToDecimalDegree(new Integer[] {-48, 50, 42});

    Assertions.assertEquals(new BigDecimal("26.29611"), decimalLat);
    Assertions.assertEquals(new BigDecimal("48.84500"), decimalLong);
    Assertions.assertEquals(new BigDecimal("-26.29611"), negDecimalLat);
    Assertions.assertEquals(new BigDecimal("-48.84500"), negDecimalLong);
  }

  @Test
  void dmsToMinute() {
    BigDecimal minute = LatLongUtil.dmsToMinute(new Integer[] {26, 17, 0});
    Assertions.assertTrue(new BigDecimal("1577.00000").equals(minute));

    BigDecimal negMinute = LatLongUtil.dmsToMinute(new Integer[] {-26, 17, 0});
    Assertions.assertTrue(new BigDecimal("-1577.00000").equals(negMinute));
  }

  @Test
  void minuteToDms() {
    BigDecimal minute = new BigDecimal("1577");
    Integer[] dms = LatLongUtil.minuteToDms(minute);
    Assertions.assertEquals(26, dms[0]);
    Assertions.assertEquals(17, dms[1]);
    Assertions.assertEquals(0, dms[2]);

    BigDecimal negMinute = new BigDecimal("-1577");
    Integer[] negDms = LatLongUtil.minuteToDms(negMinute);
    Assertions.assertEquals(-26, negDms[0]);
    Assertions.assertEquals(17, negDms[1]);
    Assertions.assertEquals(0, negDms[2]);
  }
}
