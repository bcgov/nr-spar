package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.report.SeedlotRegistrationReportService;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SeedlotReportEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class SeedlotReportEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private SeedlotRegistrationReportService seedlotRegistrationReportService;

  @MockitoBean private LoggedUserService loggedUserService;

  @Test
  @DisplayName("download registration report returns a PDF attachment")
  void downloadBclassRegistrationReport_shouldReturnPdf() throws Exception {
    byte[] pdf = "%PDF-1.4".getBytes();
    when(loggedUserService.getLoggedUserIdirOrBceId()).thenReturn("SPARTest");
    when(seedlotRegistrationReportService.generateBclassRegistrationReport("53001", "SPARTest"))
        .thenReturn(pdf);

    mockMvc
        .perform(
            get("/api/seedlots/53001/reports/registration")
                .with(csrf().asHeader())
                .accept(MediaType.APPLICATION_PDF))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_PDF))
        .andExpect(
            header()
                .string(
                    HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"SPRR001-53001.pdf\""))
        .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
        .andExpect(content().bytes(pdf));
  }
}
