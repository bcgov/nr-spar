package ca.bc.gov.backendstartapi.report.html;

import static org.assertj.core.api.Assertions.assertThat;

import ca.bc.gov.backendstartapi.report.SparReportConstants;
import ca.bc.gov.backendstartapi.report.Sprr001MainRow;
import ca.bc.gov.backendstartapi.report.Sprr001ReportData;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Renders the real SPRR001 template end to end (Thymeleaf to XHTML to PDF) and checks the text
 * that lands in the PDF. The rendered sample is written to {@code target/} for visual review.
 */
class Sprr001HtmlTemplateTest {

  private static final ZonedDateTime PRINTED =
      ZonedDateTime.of(2026, 11, 9, 14, 5, 0, 0, ZoneId.of("America/Vancouver"));

  private final HtmlPdfRenderer renderer = new HtmlPdfRenderer();

  @Test
  @DisplayName("Class B sample renders a PDF with every section, its values and page numbers")
  void render_classB_containsSectionsAndValues() throws IOException {
    Sprr001HtmlModel model =
        Sprr001HtmlModel.from(Sprr001HtmlSamples.classB(), "63001", "JSMITH", PRINTED, logo());

    byte[] pdf = renderer.render(Sprr001HtmlReportService.TEMPLATE, Map.of("m", model));
    Files.write(Path.of("target", "sprr001-html-sample.pdf"), pdf);

    String text = text(pdf);
    assertThat(text)
        .contains(
            "Seedlot Registration Report",
            "Seedlot Number: 63001",
            "JSMITH",
            // Page numbers come from CSS counters; the text extractor reads them out of order.
            "Page  of",
            "General Lot Information",
            "Collection From a Natural Stand",
            "FDC - Coastal Douglas-fir",
            "49° 05' 07\"",
            "CWH / xm / 2",
            "Cones collected from 40 trees",
            "Area of Use",
            "shaded area calculated by SPAR",
            "Ownership",
            "Industry Tree Coverage",
            "Interim Cone Storage",
            "RFR OTH CVR VEN",
            "Extraction",
            "TSC  00  TREE SEED CENTRE",
            "Audit History",
            "Declaration",
            "I hereby declare")
        .doesNotContain("Collection From Parent Tree", "Class A Source");
  }

  @Test
  @DisplayName("an empty row still renders, with blank ownership lines and legacy defaults")
  void render_emptyRow_rendersDefaults() throws IOException {
    Sprr001HtmlModel model =
        Sprr001HtmlModel.from(
            new Sprr001ReportData(new Sprr001MainRow(), List.of()), "00000", "JSMITH", PRINTED, "");

    String text = text(renderer.render(Sprr001HtmlReportService.TEMPLATE, Map.of("m", model)));

    assertThat(text).contains("Seedlot Number: 00000", "Ownership", "<10 ___  11-50 ___  50+ ___");
  }

  @Test
  @DisplayName("template output escapes data, so values cannot inject markup")
  void renderHtml_escapesValues() {
    Sprr001ReportData data = Sprr001HtmlSamples.classB();
    data.mainRow().setOrchardComment("<b>bold</b> & co");
    Sprr001HtmlModel model = Sprr001HtmlModel.from(data, "63001", "JSMITH", PRINTED, "");

    String html = renderer.renderHtml(Sprr001HtmlReportService.TEMPLATE, Map.of("m", model));

    assertThat(html).contains("&lt;b&gt;bold&lt;/b&gt; &amp; co").doesNotContain("<b>bold</b>");
  }

  private static String logo() {
    return HtmlPdfRenderer.dataUri(
        SparReportConstants.REPORT_CLASSPATH_DIR + SparReportConstants.SPRR001_LOGO_IMAGE,
        "image/jpeg");
  }

  private static String text(byte[] pdf) throws IOException {
    try (PDDocument doc = Loader.loadPDF(pdf)) {
      return new PDFTextStripper().getText(doc);
    }
  }
}
