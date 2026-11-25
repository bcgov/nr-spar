package ca.bc.gov.backendstartapi.report.html;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.aot.hint.MemberCategory.DECLARED_FIELDS;
import static org.springframework.aot.hint.MemberCategory.INVOKE_DECLARED_CONSTRUCTORS;
import static org.springframework.aot.hint.MemberCategory.INVOKE_DECLARED_METHODS;
import static org.springframework.aot.hint.MemberCategory.INVOKE_PUBLIC_METHODS;

import ca.bc.gov.backendstartapi.report.Sprr001MainRow;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.TypeReference;
import org.springframework.aot.hint.predicate.RuntimeHintsPredicates;
import org.thymeleaf.expression.Strings;
import org.thymeleaf.standard.expression.AdditionExpression;
import org.thymeleaf.standard.expression.AndExpression;

class HtmlReportRuntimeHintsTest {

  private RuntimeHints hints;

  @BeforeEach
  void setUp() {
    hints = new RuntimeHints();
    new HtmlReportRuntimeHints().registerHints(hints, getClass().getClassLoader());
  }

  @Test
  void registersTemplatesFontsAndLibraryResources() {
    var resources = RuntimeHintsPredicates.resource();
    assertTrue(resources.forResource("reports/html/sprr001.html").test(hints));
    assertTrue(resources.forResource("fonts/LiberationSans-Regular.ttf").test(hints));
    assertTrue(resources.forResource("org/thymeleaf/thymeleaf.properties").test(hints));
    assertTrue(resources.forResource("org/apache/fontbox/cmap/Identity-H").test(hints));
  }

  @Test
  void registersModelForReflection() {
    var reflection = RuntimeHintsPredicates.reflection();
    assertTrue(
        reflection.onType(Sprr001HtmlModel.class).withMemberCategories(INVOKE_PUBLIC_METHODS)
            .test(hints));
    assertTrue(
        reflection.onType(Sprr001MainRow.class).withMemberCategories(DECLARED_FIELDS).test(hints));
  }

  @Test
  void registersThymeleafExpressionTypes() {
    var reflection = RuntimeHintsPredicates.reflection();
    assertTrue(
        reflection.onType(Strings.class).withMemberCategories(INVOKE_PUBLIC_METHODS).test(hints));
    assertTrue(
        reflection.onType(AndExpression.class).withMemberCategories(INVOKE_DECLARED_METHODS)
            .test(hints));
    assertTrue(
        reflection.onType(AdditionExpression.class)
            .withMemberCategories(INVOKE_DECLARED_CONSTRUCTORS)
            .test(hints));
    assertTrue(
        reflection.onType(TypeReference.of("ognl.OgnlRuntime$ClassPropertyMethodCache"))
            .test(hints));
  }

  @Test
  void registersPdfRenderingEnums() {
    var reflection = RuntimeHintsPredicates.reflection();
    assertTrue(
        reflection.onType(PdfRendererBuilder.CacheStore.class)
            .withMemberCategories(INVOKE_PUBLIC_METHODS)
            .test(hints));
    assertTrue(
        reflection.onType(
                TypeReference.of(
                    "com.openhtmltopdf.render.displaylist.DisplayListCollector$CollectFlags"))
            .test(hints));
  }

  @Test
  void registersImageDecodingForJni() {
    assertTrue(
        RuntimeHintsPredicates.reflection()
            .onType(javax.imageio.spi.ImageReaderWriterSpi.class)
            .test(hints));
    assertTrue(
        hints
            .jni()
            .getTypeHint(TypeReference.of("com.sun.imageio.plugins.jpeg.JPEGImageReader"))
            != null);
    assertTrue(
        hints.jni().getTypeHint(TypeReference.of("java.awt.image.Raster")) != null);
  }
}
