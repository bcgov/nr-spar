package ca.bc.gov.backendstartapi.report;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.InputStream;
import net.sf.jasperreports.engine.JasperReport;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ReportResourceServiceTest {

  @Test
  @DisplayName("prepareReports compiles classpath templates into memory")
  void prepareReports_compilesTemplates() {
    ReportResourceService service = new ReportResourceService();
    service.prepareReports();

    assertThat(service.getMainReport()).isNotNull();
    assertThat(service.sprr001TemplateParameters())
        .containsKeys(
            ReportResourceService.PARAM_SPAR_HEADER_SUBREPORT,
            ReportResourceService.PARAM_COMMENTS_SUBREPORT,
            ReportResourceService.PARAM_OWNERSHIP_SUBREPORT,
            ReportResourceService.PARAM_LOGO_IMAGE)
        .extractingByKey(ReportResourceService.PARAM_SPAR_HEADER_SUBREPORT)
        .isInstanceOf(JasperReport.class);
    assertThat(service.sprr001TemplateParameters().get(ReportResourceService.PARAM_LOGO_IMAGE))
        .isInstanceOf(InputStream.class);
  }
}
