package ca.bc.gov.backendstartapi.report;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.exception.ReportGenerationException;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import lombok.Getter;
import net.sf.jasperreports.engine.JasperCompileManager;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

/**
 * Extracts classpath JRXML templates to a writable directory and compiles them to {@code .jasper}
 * files so subreports and images resolve with {@code SUBREPORT_DIR}.
 */
@Service
public class ReportResourceService {

  private static final List<String> JRXML_FILES =
      List.of(
          SparReportConstants.SPRR001_MAIN_JRXML,
          "SPRR001-SEEDLOT_REG_DTL_SR1_Comments.jrxml",
          "SPRR001-SEEDLOT_REG_DTL_SR2_OWNERSHIP.jrxml",
          "SPAR_HEADER.jrxml");

  // Static assets (e.g. images) referenced via SUBREPORT_DIR that only need to be
  // copied alongside the compiled reports, not compiled themselves.
  private static final List<String> STATIC_FILES = List.of(SparReportConstants.SPRR001_LOGO_IMAGE);

  @Getter private Path reportDirectory;

  @PostConstruct
  void prepareReports() {
    try {
      reportDirectory = Files.createTempDirectory("spar-jasper-SPRR001-");
      for (String jrxmlFile : JRXML_FILES) {
        compileReport(jrxmlFile);
      }
      for (String staticFile : STATIC_FILES) {
        copyStaticFile(staticFile);
      }
      SparLog.info("Jasper reports compiled to {}", reportDirectory);
    } catch (IOException e) {
      SparLog.error("Unable to prepare Jasper report directory", e);
      throw new ReportGenerationException("Unable to prepare Jasper report directory", e);
    }
  }

  private void compileReport(String jrxmlFile) throws IOException {
    ClassPathResource resource =
        new ClassPathResource(SparReportConstants.REPORT_CLASSPATH_DIR + jrxmlFile);
    Path targetJrxml = reportDirectory.resolve(jrxmlFile);
    Path targetJasper =
        reportDirectory.resolve(jrxmlFile.replace(".jrxml", ".jasper"));
    try (InputStream inputStream = resource.getInputStream()) {
      Files.copy(inputStream, targetJrxml, StandardCopyOption.REPLACE_EXISTING);
    }
    try {
      JasperCompileManager.compileReportToFile(
          targetJrxml.toString(), targetJasper.toString());
    } catch (Exception e) {
      SparLog.error("Failed to compile Jasper report: " + jrxmlFile, e);
      throw new ReportGenerationException("Failed to compile Jasper report: " + jrxmlFile, e);
    }
  }

  private void copyStaticFile(String fileName) throws IOException {
    ClassPathResource resource =
        new ClassPathResource(SparReportConstants.REPORT_CLASSPATH_DIR + fileName);
    if (!resource.exists()) {
      SparLog.warn(
          "Static report asset {} not found on classpath; report will render without it",
          fileName);
      return;
    }
    Path targetFile = reportDirectory.resolve(fileName);
    try (InputStream inputStream = resource.getInputStream()) {
      Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
    }
  }

  public Path mainReportPath() {
    return reportDirectory.resolve(SparReportConstants.SPRR001_MAIN_JASPER);
  }
}
