package ca.bc.gov.backendstartapi.report;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import net.sf.jasperreports.engine.DefaultJasperReportsContext;
import net.sf.jasperreports.engine.fonts.FontFamily;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ReportFontExtensionTest {

  @Test
  @DisplayName("Arial is registered as a Jasper font family so SPRR001 can fill without OS fonts")
  void arialFamilyIsAvailable() {
    List<FontFamily> families =
        DefaultJasperReportsContext.getInstance().getExtensions(FontFamily.class);

    assertThat(families).extracting(FontFamily::getName).contains("Arial");
    assertThat(getClass().getResource("/fonts/LiberationSans-Regular.ttf")).isNotNull();
    assertThat(getClass().getResource("/fonts/LiberationSans-Bold.ttf")).isNotNull();
    assertThat(getClass().getResource("/fonts/LiberationSans-Italic.ttf")).isNotNull();
    assertThat(getClass().getResource("/fonts/LiberationSans-BoldItalic.ttf")).isNotNull();
  }

  @Test
  @DisplayName("jasperreports-fonts DejaVu families remain registered beside SPAR Arial")
  void dejavuFamiliesStillRegistered() {
    List<FontFamily> families =
        DefaultJasperReportsContext.getInstance().getExtensions(FontFamily.class);

    assertThat(families).extracting(FontFamily::getName).contains("DejaVu Sans");
  }
}
