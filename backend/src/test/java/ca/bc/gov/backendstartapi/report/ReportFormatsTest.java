package ca.bc.gov.backendstartapi.report;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ReportFormatsTest {

  @Test
  @DisplayName("yesNo maps boolean flags the way the legacy indicator columns did")
  void yesNo_mapsLegacyIndicators() {
    assertThat(ReportFormats.yesNo(null)).isNull();
    assertThat(ReportFormats.yesNo(true)).isEqualTo("Y");
    assertThat(ReportFormats.yesNo(false)).isEqualTo("N");
  }

  @Test
  @DisplayName("decimal and dmsComponent keep null degrees as null")
  void decimalAndDms_handleNulls() {
    assertThat(ReportFormats.decimal(null)).isNull();
    assertThat(ReportFormats.decimal(12)).isEqualByComparingTo(BigDecimal.valueOf(12));
    assertThat(ReportFormats.dmsComponent(30, null)).isNull();
    assertThat(ReportFormats.dmsComponent(null, 49)).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(ReportFormats.dmsComponent(15, 49)).isEqualByComparingTo(BigDecimal.valueOf(15));
  }

  @Test
  @DisplayName("date and text helpers format or pass through nulls")
  void dateAndText_formatValues() {
    assertThat(ReportFormats.date((LocalDate) null)).isNull();
    assertThat(ReportFormats.date(LocalDate.of(2024, Month.DECEMBER, 1))).isEqualTo("2024-12-01");
    assertThat(ReportFormats.date((LocalDateTime) null)).isNull();
    assertThat(ReportFormats.date(LocalDateTime.of(2024, Month.DECEMBER, 1, 10, 0)))
        .isEqualTo("2024-12-01");
    assertThat(ReportFormats.text(null)).isNull();
    assertThat(ReportFormats.text('N')).isEqualTo("N");
  }

  @Test
  @DisplayName("latitude and longitude descriptions cover each compass code")
  void latLongDesc_coverCompassCodes() {
    assertThat(ReportFormats.latitudeDesc(null)).isNull();
    assertThat(ReportFormats.latitudeDesc('N')).isEqualTo("North");
    assertThat(ReportFormats.latitudeDesc('S')).isEqualTo("South");
    assertThat(ReportFormats.latitudeDesc('X')).isNull();
    assertThat(ReportFormats.longitudeDesc(null)).isNull();
    assertThat(ReportFormats.longitudeDesc('E')).isEqualTo("East");
    assertThat(ReportFormats.longitudeDesc('W')).isEqualTo("West");
    assertThat(ReportFormats.longitudeDesc('X')).isNull();
  }

  @Test
  @DisplayName("numberTreesFromDesc maps known codes and otherwise prints the stored value")
  void numberTreesFromDesc_mapsLegacyBuckets() {
    assertThat(ReportFormats.numberTreesFromDesc(null)).isNull();
    assertThat(ReportFormats.numberTreesFromDesc("1")).isEqualTo("<10");
    assertThat(ReportFormats.numberTreesFromDesc("2")).isEqualTo("11-50");
    assertThat(ReportFormats.numberTreesFromDesc("3")).isEqualTo("50+");
    assertThat(ReportFormats.numberTreesFromDesc("GT5")).isEqualTo("GT5");
  }
}
