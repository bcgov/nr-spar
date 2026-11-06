package ca.bc.gov.backendstartapi.report;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.exception.ReportGenerationException;
import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import lombok.Getter;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperReport;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

/**
 * Compiles classpath JRXML templates into memory so the fill step can pass subreports and the logo
 * as parameters instead of writing {@code .jasper} files to disk.
 */
@Service
public class ReportResourceService {

  static final String PARAM_SPAR_HEADER_SUBREPORT = "SPAR_HEADER_SUBREPORT";
  static final String PARAM_COMMENTS_SUBREPORT = "COMMENTS_SUBREPORT";
  static final String PARAM_OWNERSHIP_SUBREPORT = "OWNERSHIP_SUBREPORT";
  static final String PARAM_LOGO_IMAGE = "LOGO_IMAGE";

  private static final String COMMENTS_JRXML = "SPRR001-SEEDLOT_REG_DTL_SR1_Comments.jrxml";
  private static final String OWNERSHIP_JRXML = "SPRR001-SEEDLOT_REG_DTL_SR2_OWNERSHIP.jrxml";
  private static final String HEADER_JRXML = "SPAR_HEADER.jrxml";

  @Getter private JasperReport mainReport;
  private JasperReport headerReport;
  private JasperReport commentsReport;
  private JasperReport ownershipReport;
  private byte[] logoBytes = new byte[0];

  @PostConstruct
  void prepareReports() {
    mainReport = compileReport(SparReportConstants.SPRR001_MAIN_JRXML);
    headerReport = compileReport(HEADER_JRXML);
    commentsReport = compileReport(COMMENTS_JRXML);
    ownershipReport = compileReport(OWNERSHIP_JRXML);
    logoBytes = loadLogo();
    SparLog.info("Jasper SPRR001 templates compiled in memory");
  }

  /**
   * Parameters the main SPRR001 template needs for in-memory subreports and the title-band logo.
   *
   * @return a fresh map; the logo stream is new for each fill
   */
  public Map<String, Object> sprr001TemplateParameters() {
    Map<String, Object> parameters = new HashMap<>();
    parameters.put(PARAM_SPAR_HEADER_SUBREPORT, headerReport);
    parameters.put(PARAM_COMMENTS_SUBREPORT, commentsReport);
    parameters.put(PARAM_OWNERSHIP_SUBREPORT, ownershipReport);
    parameters.put(PARAM_LOGO_IMAGE, new ByteArrayInputStream(logoBytes));
    return parameters;
  }

  private static JasperReport compileReport(String jrxmlFile) {
    ClassPathResource resource =
        new ClassPathResource(SparReportConstants.REPORT_CLASSPATH_DIR + jrxmlFile);
    if (!resource.exists()) {
      throw new ReportGenerationException(
          "Jasper template not found on classpath: " + jrxmlFile, null);
    }
    try (InputStream inputStream = resource.getInputStream()) {
      return JasperCompileManager.compileReport(inputStream);
    } catch (JRException | IOException e) {
      SparLog.error("Failed to compile Jasper report: " + jrxmlFile, e);
      throw new ReportGenerationException("Failed to compile Jasper report: " + jrxmlFile, e);
    }
  }

  private static byte[] loadLogo() {
    ClassPathResource resource =
        new ClassPathResource(
            SparReportConstants.REPORT_CLASSPATH_DIR + SparReportConstants.SPRR001_LOGO_IMAGE);
    if (!resource.exists()) {
      SparLog.warn(
          "Static report asset {} not found on classpath; report will render without it",
          SparReportConstants.SPRR001_LOGO_IMAGE);
      return new byte[0];
    }
    try (InputStream inputStream = resource.getInputStream()) {
      return inputStream.readAllBytes();
    } catch (IOException e) {
      SparLog.warn("Unable to read report logo " + SparReportConstants.SPRR001_LOGO_IMAGE, e);
      return new byte[0];
    }
  }
}
