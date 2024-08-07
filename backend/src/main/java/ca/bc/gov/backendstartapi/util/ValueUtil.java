package ca.bc.gov.backendstartapi.util;

import ca.bc.gov.backendstartapi.config.SparLog;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

/** This class contains methods for handling objects values and comparing. */
@NoArgsConstructor(access = AccessLevel.NONE)
public final class ValueUtil {

  /**
   * Check if a variable has value. Note that only objects should be handled here, meaning that
   * primitive as int, char, long should not be used here. If the class it's a Boolean, will return
   * true if it's different from null, because 'false' it's a value.
   *
   * @param obj The variable to check
   * @return true if has, false otherwise.
   */
  public static boolean hasValue(Object obj) {
    if (obj == null) {
      return false;
    }
    if (obj instanceof String str) {
      return !str.isBlank();
    }
    if (obj instanceof BigDecimal big) {
      return big.compareTo(BigDecimal.ZERO) != 0;
    }
    if (obj instanceof Integer intVal) {
      return intVal != 0;
    }
    if (obj instanceof Character charVal) {
      return charVal.charValue() != ' ';
    }
    if (obj instanceof LocalDateTime localDateTime) {
      ZonedDateTime zdt = localDateTime.atZone(ZoneId.systemDefault());
      return zdt.toInstant().toEpochMilli() > 0L;
    }
    if (obj instanceof LocalDate localDate) {
      ZonedDateTime zdt = localDate.atStartOfDay(ZoneId.systemDefault());
      return zdt.toInstant().toEpochMilli() > 0L;
    }
    if (obj instanceof Long longValue) {
      return longValue != 0L;
    }
    if (obj instanceof Double doubleValue) {
      return doubleValue != 0D;
    }
    if (obj instanceof Page<?> page) {
      return page.hasContent();
    }
    if (obj instanceof List<?> list) {
      return !list.isEmpty();
    }
    if (obj instanceof Boolean) {
      return true;
    }
    if (obj instanceof Optional<?> opt) {
      return opt.isPresent();
    }
    SparLog.warn("Class not handled {}", obj.getClass());
    return false;
  }

  /**
   * Compare two objects checking if they have the same content/value. If one of the objects are
   * null, then will return false. If they have different classes, will return null. If it's not an
   * expected class, will log in the WARN level and return false.
   *
   * @param objOne First object to compare.
   * @param objTwo Second object to compare.
   * @return true if they are, false otherwise.
   */
  public static boolean isValueEqual(Object objOne, Object objTwo) {
    if (!hasValue(objOne) || !hasValue(objTwo)) {
      return false;
    }
    if (objOne.getClass() != objTwo.getClass()) {
      return false;
    }

    if (objOne.getClass() == BigDecimal.class) {
      return BigDecimal.class.cast(objOne).compareTo(BigDecimal.class.cast(objTwo)) == 0;
    }
    if (objOne.getClass() == LocalDateTime.class) {
      return LocalDateTime.class.cast(objOne).isEqual(LocalDateTime.class.cast(objTwo));
    }
    if (objOne.getClass() == LocalDate.class) {
      return LocalDate.class.cast(objOne).isEqual(LocalDate.class.cast(objTwo));
    }
    return objOne.equals(objTwo);
  }
}
