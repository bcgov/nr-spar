package ca.bc.gov.backendstartapi.report.html;

import ca.bc.gov.backendstartapi.report.Sprr001MainRow;
import ca.bc.gov.backendstartapi.report.Sprr001OwnershipRow;
import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;

/**
 * GraalVM native-image hints for HTML reports.
 *
 * <p>Templates, fonts and the logo are classpath resources, and Thymeleaf's OGNL expressions read
 * model properties by reflection, so both need registering. This has not been verified in a native
 * build yet; it is the starting point a native smoke test would refine.
 */
class HtmlReportRuntimeHints implements RuntimeHintsRegistrar {

  @Override
  public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
    hints.resources().registerPattern(HtmlPdfRenderer.TEMPLATE_DIR + "*.html");
    hints.resources().registerPattern("fonts/*.ttf");
    hints.resources().registerPattern("reports/SPRR001/*.jpg");

    for (Class<?> type :
        new Class<?>[] {
          Sprr001HtmlModel.class,
          Sprr001HtmlModel.OwnershipLine.class,
          Sprr001MainRow.class,
          Sprr001OwnershipRow.class
        }) {
      hints
          .reflection()
          .registerType(
              type, MemberCategory.INVOKE_PUBLIC_METHODS, MemberCategory.DECLARED_FIELDS);
    }
  }
}
