package ca.bc.gov.backendstartapi.util;

import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class ValueUtilTest {

  @Test
  void hasValueFalseTest() {
    Assertions.assertFalse(ValueUtil.hasValue(null));
    Assertions.assertFalse(ValueUtil.hasValue(""));
    Assertions.assertFalse(ValueUtil.hasValue("  "));
    Assertions.assertFalse(ValueUtil.hasValue(BigDecimal.ZERO));
    Assertions.assertFalse(ValueUtil.hasValue(Integer.valueOf(0)));
    Assertions.assertFalse(ValueUtil.hasValue(Character.valueOf(' ')));
    Assertions.assertFalse(ValueUtil.hasValue(Long.valueOf(0L)));
    Assertions.assertFalse(ValueUtil.hasValue(Double.valueOf(0D)));
    Assertions.assertFalse(ValueUtil.hasValue(List.of()));
    Assertions.assertFalse(ValueUtil.hasValue(Optional.empty()));
    // Class not handled:
    Assertions.assertFalse(ValueUtil.hasValue(new Seedlot("1")));
  }

  @Test
  void hasValueTrueTest() {
    Assertions.assertTrue(ValueUtil.hasValue("any"));
    Assertions.assertTrue(ValueUtil.hasValue(BigDecimal.ONE));
    Assertions.assertTrue(ValueUtil.hasValue(BigDecimal.ONE.negate()));
    Assertions.assertTrue(ValueUtil.hasValue(Integer.valueOf(155)));
    Assertions.assertTrue(ValueUtil.hasValue(Integer.MIN_VALUE));
    Assertions.assertTrue(ValueUtil.hasValue(Character.valueOf('A')));
    Assertions.assertTrue(ValueUtil.hasValue(Character.valueOf('\\')));
    Assertions.assertTrue(ValueUtil.hasValue(Character.valueOf('@')));
    Assertions.assertTrue(ValueUtil.hasValue(LocalDateTime.now()));
    Assertions.assertTrue(ValueUtil.hasValue(LocalDate.now()));
    Assertions.assertTrue(ValueUtil.hasValue(Long.valueOf(155L)));
    Assertions.assertTrue(ValueUtil.hasValue(Long.MIN_VALUE));
    Assertions.assertTrue(ValueUtil.hasValue(Double.valueOf(999.698D)));
    Assertions.assertTrue(ValueUtil.hasValue(Double.valueOf(-999.698D)));
    Assertions.assertTrue(ValueUtil.hasValue(List.of(11)));
    Assertions.assertTrue(ValueUtil.hasValue(List.of("23")));
    Assertions.assertTrue(ValueUtil.hasValue(Boolean.TRUE));
    Assertions.assertTrue(ValueUtil.hasValue(Boolean.FALSE));
    Assertions.assertTrue(ValueUtil.hasValue(Optional.of(123)));
  }

  @Test
  void isValueEqualFalseTest() {
    Assertions.assertFalse(ValueUtil.isValueEqual(null, null));
    Assertions.assertFalse(ValueUtil.isValueEqual(0, "0"));
    Assertions.assertFalse(ValueUtil.isValueEqual("0", "00"));
    Assertions.assertFalse(ValueUtil.isValueEqual(new BigDecimal("11"), new BigDecimal("1")));
    Assertions.assertFalse(ValueUtil.isValueEqual(Integer.valueOf(0), Integer.valueOf(0)));
    Assertions.assertFalse(ValueUtil.isValueEqual(Integer.valueOf(0), Integer.valueOf(1)));
    Assertions.assertFalse(ValueUtil.isValueEqual(Integer.valueOf(0), 0));
    Assertions.assertFalse(ValueUtil.isValueEqual(Character.valueOf('A'), Character.valueOf(' ')));
    Assertions.assertFalse(ValueUtil.isValueEqual(' ', Character.valueOf(' ')));
    Assertions.assertFalse(ValueUtil.isValueEqual(LocalDateTime.now(), LocalDateTime.now()));
    Assertions.assertFalse(
        ValueUtil.isValueEqual(LocalDateTime.now(), LocalDateTime.now().minusSeconds(1L)));
    Assertions.assertFalse(ValueUtil.isValueEqual(LocalDate.now(), LocalDate.now().minusDays(1L)));
    Assertions.assertFalse(ValueUtil.isValueEqual(Long.valueOf(1L), Long.valueOf(0L)));
    Assertions.assertFalse(ValueUtil.isValueEqual(Double.valueOf(1D), Double.valueOf(0D)));
    Assertions.assertFalse(ValueUtil.isValueEqual(Boolean.FALSE, Boolean.TRUE));
  }

  @Test
  void isValueEqualTrueTest() {
    final LocalDateTime localDateTime = LocalDateTime.now();
    final LocalDate localDate = LocalDate.now();

    Assertions.assertTrue(ValueUtil.isValueEqual("0", "0"));
    Assertions.assertTrue(ValueUtil.isValueEqual(new BigDecimal("11"), new BigDecimal("11.00")));
    Assertions.assertTrue(ValueUtil.isValueEqual(Integer.valueOf(1), Integer.valueOf(1)));
    Assertions.assertTrue(ValueUtil.isValueEqual('A', Character.valueOf('A')));
    Assertions.assertTrue(ValueUtil.isValueEqual(localDateTime, localDateTime));
    Assertions.assertTrue(ValueUtil.isValueEqual(localDate, localDate));
    Assertions.assertTrue(ValueUtil.isValueEqual(Long.valueOf(1L), Long.valueOf(1L)));
    Assertions.assertTrue(ValueUtil.isValueEqual(Double.valueOf(1D), Double.valueOf(1D)));
    Assertions.assertTrue(ValueUtil.isValueEqual(Boolean.FALSE, Boolean.FALSE));
    Assertions.assertTrue(ValueUtil.isValueEqual(Boolean.TRUE, Boolean.TRUE));
    Assertions.assertTrue(ValueUtil.isValueEqual(true, Boolean.TRUE));
  }
}
