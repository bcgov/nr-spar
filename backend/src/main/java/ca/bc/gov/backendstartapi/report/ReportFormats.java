package ca.bc.gov.backendstartapi.report;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Value formatting shared by the SPRR001 bands.
 *
 * <p>These conversions reproduce what the legacy Oracle report cursors returned, so the Jasper
 * templates keep rendering the same text they did on Jasper Server.
 */
final class ReportFormats {

  private static final DateTimeFormatter REPORT_DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd");

  private ReportFormats() {}

  /** Renders a flag the way the legacy indicator columns did. */
  static String yesNo(Boolean value) {
    if (value == null) {
      return null;
    }
    return Boolean.TRUE.equals(value) ? "Y" : "N";
  }

  static BigDecimal decimal(Integer value) {
    return value == null ? null : BigDecimal.valueOf(value);
  }

  /**
   * Minutes and seconds default to zero whenever the matching degrees are present, matching the
   * legacy DMS columns that the templates concatenate without null checks.
   */
  static BigDecimal dmsComponent(Integer value, Integer degrees) {
    if (degrees == null) {
      return null;
    }
    return BigDecimal.valueOf(value == null ? 0 : value);
  }

  static String date(LocalDate value) {
    return value == null ? null : value.format(REPORT_DATE);
  }

  static String date(LocalDateTime value) {
    return value == null ? null : value.format(REPORT_DATE);
  }

  static String text(Character value) {
    return value == null ? null : value.toString();
  }

  static String latitudeDesc(Character code) {
    if (code == null) {
      return null;
    }
    return switch (code) {
      case 'N' -> "North";
      case 'S' -> "South";
      default -> null;
    };
  }

  static String longitudeDesc(Character code) {
    if (code == null) {
      return null;
    }
    return switch (code) {
      case 'E' -> "East";
      case 'W' -> "West";
      default -> null;
    };
  }

  static String numberTreesFromDesc(String code) {
    if (code == null) {
      return null;
    }
    return switch (code) {
      case "1" -> "<10";
      case "2" -> "11-50";
      case "3" -> "50+";
      default -> code;
    };
  }
}
