package ca.bc.gov.backendstartapi.report.html;

import static org.springframework.aot.hint.MemberCategory.DECLARED_FIELDS;
import static org.springframework.aot.hint.MemberCategory.INTROSPECT_DECLARED_METHODS;
import static org.springframework.aot.hint.MemberCategory.INTROSPECT_PUBLIC_METHODS;
import static org.springframework.aot.hint.MemberCategory.INVOKE_DECLARED_CONSTRUCTORS;
import static org.springframework.aot.hint.MemberCategory.INVOKE_DECLARED_METHODS;
import static org.springframework.aot.hint.MemberCategory.INVOKE_PUBLIC_METHODS;

import ca.bc.gov.backendstartapi.report.Sprr001MainRow;
import ca.bc.gov.backendstartapi.report.Sprr001OwnershipRow;
import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder;
import com.openhtmltopdf.outputdevice.helper.ExternalResourceControlPriority;
import com.openhtmltopdf.pdfboxout.PdfBoxForm;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import java.util.stream.Stream;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.aot.hint.TypeReference;
import org.thymeleaf.context.AbstractEngineContext;
import org.thymeleaf.context.IContext;
import org.thymeleaf.context.IEngineContext;
import org.thymeleaf.context.IExpressionContext;
import org.thymeleaf.context.ITemplateContext;
import org.thymeleaf.expression.Lists;
import org.thymeleaf.expression.Numbers;
import org.thymeleaf.expression.Strings;
import org.thymeleaf.standard.expression.AdditionExpression;
import org.thymeleaf.standard.expression.AdditionSubtractionExpression;
import org.thymeleaf.standard.expression.AndExpression;
import org.thymeleaf.standard.expression.EqualsNotEqualsExpression;
import org.thymeleaf.standard.expression.GreaterLesserExpression;
import org.thymeleaf.standard.expression.IStandardConversionService;
import org.thymeleaf.standard.expression.IStandardExpressionParser;
import org.thymeleaf.standard.expression.IStandardVariableExpressionEvaluator;
import org.thymeleaf.standard.expression.MultiplicationDivisionRemainderExpression;
import org.thymeleaf.standard.expression.OrExpression;
import org.thymeleaf.templatemode.TemplateMode;

/**
 * GraalVM native-image hints for HTML reports (Thymeleaf + OpenHTMLtoPDF + PDFBox).
 *
 * <p>Everything reporting needs in a native image is registered here; there is no JSON metadata.
 * Recorded with the native-image tracing agent while rendering SPRR001 (see {@code
 * NativeImageFlowsIntegrationTest}), then written as hints.
 */
class HtmlReportRuntimeHints implements RuntimeHintsRegistrar {

  @Override
  public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
    registerResources(hints);
    registerModel(hints);
    registerThymeleaf(hints);
    registerPdfRendering(hints);
    registerImageDecoding(hints);
  }

  /** Our templates, fonts and logo, plus the resources the libraries load at runtime. */
  private static void registerResources(RuntimeHints hints) {
    Stream.of(
            HtmlPdfRenderer.TEMPLATE_DIR + "*.html",
            "fonts/*.ttf",
            "reports/SPRR001/*.jpg",
            "org/thymeleaf/thymeleaf.properties",
            // PDFBox loads metrics for the 14 standard PDF fonts and its fallback font eagerly.
            "org/apache/pdfbox/resources/afm/*.afm",
            "org/apache/pdfbox/resources/glyphlist/*.txt",
            "org/apache/pdfbox/resources/ttf/LiberationSans-Regular.ttf",
            "org/apache/fontbox/cmap/Identity-H",
            "resources/css/XhtmlNamespaceHandler.css",
            "resources/schema/openhtmltopdf/catalog-special.xml")
        .forEach(hints.resources()::registerPattern);
  }

  /** Thymeleaf expressions read the model's properties by reflection. */
  private static void registerModel(RuntimeHints hints) {
    Stream.of(
            Sprr001HtmlModel.class,
            Sprr001HtmlModel.OwnershipLine.class,
            Sprr001MainRow.class,
            Sprr001OwnershipRow.class)
        .forEach(
            type -> hints.reflection().registerType(type, INVOKE_PUBLIC_METHODS, DECLARED_FIELDS));
  }

  /** Expression evaluation (OGNL) and the #strings / #lists / #numbers utility objects. */
  private static void registerThymeleaf(RuntimeHints hints) {
    var reflection = hints.reflection();

    reflection.registerType(
        AbstractEngineContext.class, INTROSPECT_DECLARED_METHODS, INTROSPECT_PUBLIC_METHODS);
    Stream.of(
            IContext.class,
            IEngineContext.class,
            IExpressionContext.class,
            ITemplateContext.class)
        .forEach(type -> reflection.registerType(type, INTROSPECT_DECLARED_METHODS));
    Stream.of(Lists.class, Numbers.class, Strings.class)
        .forEach(type -> reflection.registerType(type, INVOKE_PUBLIC_METHODS));

    // Operators in expressions (+, and, or, ==, >, *): the parser checks operands through static
    // isLeftAllowed/isRightAllowed methods and builds the expression by constructor.
    Stream.of(
            AdditionSubtractionExpression.class,
            AndExpression.class,
            OrExpression.class,
            EqualsNotEqualsExpression.class,
            GreaterLesserExpression.class,
            MultiplicationDivisionRemainderExpression.class)
        .forEach(type -> reflection.registerType(type, INVOKE_DECLARED_METHODS));
    reflection.registerType(AdditionExpression.class, INVOKE_DECLARED_CONSTRUCTORS);

    Stream.of(
            IStandardConversionService.class,
            IStandardExpressionParser.class,
            IStandardVariableExpressionEvaluator.class)
        .forEach(reflection::registerType);
    reflection.registerType(
        TypeReference.of("ognl.OgnlRuntime$ClassPropertyMethodCache"), INVOKE_DECLARED_METHODS);
    reflection.registerType(TemplateMode.class, INVOKE_PUBLIC_METHODS);
  }

  /** OpenHTMLtoPDF and PDFBox call values() on these enums reflectively. */
  private static void registerPdfRendering(RuntimeHints hints) {
    Stream.of(
            BaseRendererBuilder.FSFontUseCase.class,
            ExternalResourceControlPriority.class,
            PdfBoxForm.CheckboxStyle.class,
            PdfRendererBuilder.CacheStore.class,
            Standard14Fonts.FontName.class)
        .forEach(type -> hints.reflection().registerType(type, INVOKE_PUBLIC_METHODS));
    // Protected nested enum, so referenced by name.
    hints
        .reflection()
        .registerType(
            TypeReference.of(
                "com.openhtmltopdf.render.displaylist.DisplayListCollector$CollectFlags"),
            INVOKE_PUBLIC_METHODS);
  }

  /**
   * The JPEG logo is decoded by ImageIO, which finds its readers via service providers and calls
   * back into Java from native code (JNI).
   */
  private static void registerImageDecoding(RuntimeHints hints) {
    hints.reflection().registerType(javax.imageio.spi.ImageReaderSpi.class);
    hints.reflection().registerType(javax.imageio.spi.ImageWriterSpi.class);
    hints
        .reflection()
        .registerType(javax.imageio.spi.ImageReaderWriterSpi.class, INVOKE_PUBLIC_METHODS);

    var jni = hints.jni();
    Stream.of(
            "com.sun.imageio.plugins.jpeg.JPEGImageReader",
            "java.awt.GraphicsEnvironment",
            "java.awt.image.BufferedImage",
            "java.awt.image.ColorModel",
            "java.awt.image.SampleModel",
            "sun.java2d.Disposer")
        .forEach(
            name ->
                jni.registerType(
                    TypeReference.of(name), DECLARED_FIELDS, INVOKE_DECLARED_METHODS));
    Stream.of(
            "java.awt.image.Raster",
            "java.awt.image.SinglePixelPackedSampleModel",
            "javax.imageio.plugins.jpeg.JPEGHuffmanTable",
            "javax.imageio.plugins.jpeg.JPEGQTable",
            "sun.awt.image.IntegerComponentRaster")
        .forEach(name -> jni.registerType(TypeReference.of(name), DECLARED_FIELDS));
  }
}
