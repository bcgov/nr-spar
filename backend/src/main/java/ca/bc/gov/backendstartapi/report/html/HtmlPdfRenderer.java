package ca.bc.gov.backendstartapi.report.html;

import ca.bc.gov.backendstartapi.exception.ReportGenerationException;
import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder.FontStyle;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.context.annotation.ImportRuntimeHints;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

/**
 * Renders a Thymeleaf template to PDF with OpenHTMLtoPDF.
 *
 * <p>This is the reusable piece a shared reporting library would hold: one template engine, bundled
 * fonts registered once, and native-image hints. Templates live in {@code
 * classpath:reports/html/} and are trusted code: they are never loaded from user input.
 *
 * <p>Templates use Thymeleaf's XML mode, so the output is well-formed XHTML that OpenHTMLtoPDF can
 * parse directly.
 */
@Component
@ImportRuntimeHints(HtmlReportRuntimeHints.class)
public class HtmlPdfRenderer {

  static final String TEMPLATE_DIR = "reports/html/";
  static final String FONT_FAMILY = "Liberation Sans";

  private record BundledFont(String path, int weight, FontStyle style) {}

  private static final List<BundledFont> FONTS =
      List.of(
          new BundledFont("fonts/LiberationSans-Regular.ttf", 400, FontStyle.NORMAL),
          new BundledFont("fonts/LiberationSans-Bold.ttf", 700, FontStyle.NORMAL),
          new BundledFont("fonts/LiberationSans-Italic.ttf", 400, FontStyle.ITALIC),
          new BundledFont("fonts/LiberationSans-BoldItalic.ttf", 700, FontStyle.ITALIC));

  private final TemplateEngine templateEngine;
  private final Map<BundledFont, byte[]> fontBytes;

  /** Creates the renderer with its own classpath template engine and preloaded fonts. */
  public HtmlPdfRenderer() {
    ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
    resolver.setPrefix(TEMPLATE_DIR);
    resolver.setSuffix(".html");
    resolver.setTemplateMode(TemplateMode.XML);
    resolver.setCharacterEncoding("UTF-8");
    resolver.setCacheable(true);
    resolver.setCheckExistence(true);

    templateEngine = new TemplateEngine();
    templateEngine.setTemplateResolver(resolver);

    fontBytes =
        FONTS.stream().collect(Collectors.toUnmodifiableMap(f -> f, f -> readClasspath(f.path())));
  }

  /**
   * Render {@code reports/html/<template>.html} with the given variables to PDF.
   *
   * @param template template name without directory or extension
   * @param variables template variables
   * @return PDF bytes
   */
  public byte[] render(String template, Map<String, Object> variables) {
    String xhtml = renderHtml(template, variables);
    try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
      PdfRendererBuilder builder = new PdfRendererBuilder();
      builder.useFastMode();
      for (BundledFont font : FONTS) {
        byte[] bytes = fontBytes.get(font);
        builder.useFont(
            () -> new ByteArrayInputStream(bytes), FONT_FAMILY, font.weight(), font.style(), true);
      }
      // Base URI only matters for relative links; reports embed images as data: URIs.
      builder.withHtmlContent(xhtml, "classpath:/" + TEMPLATE_DIR);
      builder.toStream(out);
      builder.run();
      return out.toByteArray();
    } catch (IOException | RuntimeException e) {
      throw new ReportGenerationException("Failed to render HTML report: " + template, e);
    }
  }

  /**
   * Render only the XHTML. Useful for debugging layouts in a browser and for tests.
   *
   * @param template template name without directory or extension
   * @param variables template variables
   * @return XHTML string
   */
  public String renderHtml(String template, Map<String, Object> variables) {
    Context context = new Context();
    context.setVariables(variables);
    return templateEngine.process(template, context);
  }

  /**
   * Read a classpath image as a {@code data:} URI so the PDF needs no resource resolution.
   *
   * @param path classpath location
   * @param mediaType e.g. {@code image/jpeg}
   * @return the data URI, or an empty string if the resource is missing
   */
  public static String dataUri(String path, String mediaType) {
    ClassPathResource resource = new ClassPathResource(path);
    if (!resource.exists()) {
      return "";
    }
    String base64 = Base64.getEncoder().encodeToString(readClasspath(path));
    return "data:" + mediaType + ";base64," + base64;
  }

  private static byte[] readClasspath(String path) {
    try (InputStream in = new ClassPathResource(path).getInputStream()) {
      return in.readAllBytes();
    } catch (IOException e) {
      throw new ReportGenerationException("Missing report resource on classpath: " + path, e);
    }
  }
}
