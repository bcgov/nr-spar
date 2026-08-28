package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.report.SeedlotRegistrationReportService;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import ca.bc.gov.backendstartapi.service.SaveSeedlotFormService;
import ca.bc.gov.backendstartapi.service.SeedlotCollectionGeometryService;
import ca.bc.gov.backendstartapi.service.SeedlotCopyService;
import ca.bc.gov.backendstartapi.service.SeedlotService;
import ca.bc.gov.backendstartapi.service.parser.ConeAndPollenCountCsvTableParser;
import ca.bc.gov.backendstartapi.service.parser.SmpCalculationCsvTableParser;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Verifies that {@code features.seedlot-b.enabled=false} closes every endpoint annotated with
 * {@code @RequiresSeedlotB}, while endpoints shared with A-class stay reachable.
 */
@WebMvcTest({SeedlotEndpoint.class, SeedlotReportEndpoint.class})
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
@TestPropertySource(properties = "features.seedlot-b.enabled=false")
class SeedlotBFeatureToggleTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private SeedlotService seedlotService;
  @MockitoBean private SeedlotCopyService seedlotCopyService;
  @MockitoBean private SaveSeedlotFormService saveSeedlotFormService;
  @MockitoBean private SeedlotCollectionGeometryService seedlotCollectionGeometryService;
  @MockitoBean private LoggedUserService loggedUserService;
  @MockitoBean private SmpCalculationCsvTableParser smpCalculationCsvTableParser;
  @MockitoBean private ConeAndPollenCountCsvTableParser coneAndPollenCountCsvTableParser;

  @MockitoBean private SeedlotRegistrationReportService seedlotRegistrationReportService;

  private static final String SEEDLOT = "53001";

  @Test
  @DisplayName("B-class form progress reads are forbidden")
  void getFormProgressClassB_isForbidden() throws Exception {
    mockMvc
        .perform(get("/api/seedlots/{n}/b-class-form-progress", SEEDLOT).with(csrf().asHeader()))
        .andExpect(status().isForbidden());

    verify(saveSeedlotFormService, never()).getForm(anyString());
  }

  @Test
  @DisplayName("B-class form progress status reads are forbidden")
  void getFormProgressStatusClassB_isForbidden() throws Exception {
    mockMvc
        .perform(
            get("/api/seedlots/{n}/b-class-form-progress/status", SEEDLOT).with(csrf().asHeader()))
        .andExpect(status().isForbidden());
  }

  @Test
  @DisplayName("B-class form progress saves are forbidden")
  void saveFormProgressClassB_isForbidden() throws Exception {
    mockMvc
        .perform(
            put("/api/seedlots/{n}/b-class-form-progress", SEEDLOT)
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"allStepData\":{},\"progressStatus\":{},\"revisionCount\":0}"))
        .andExpect(status().isForbidden());

    verify(saveSeedlotFormService, never()).saveForm(anyString(), any());
  }

  @Test
  @DisplayName("B-class full form reads are forbidden")
  void getBclassSeedlotFullForm_isForbidden() throws Exception {
    mockMvc
        .perform(get("/api/seedlots/{n}/b-class-full-form", SEEDLOT).with(csrf().asHeader()))
        .andExpect(status().isForbidden());

    verify(seedlotService, never()).getBclassSeedlotFormInfo(anyString());
  }

  @Test
  @DisplayName("B-class submissions are forbidden")
  void submitBclassSeedlotForm_isForbidden() throws Exception {
    mockMvc
        .perform(
            put("/api/seedlots/{n}/b-class-submission", SEEDLOT)
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
        .andExpect(status().isForbidden());
  }

  @Test
  @DisplayName("Collection geometry reads are forbidden")
  void getCollectionGeometry_isForbidden() throws Exception {
    mockMvc
        .perform(get("/api/seedlots/{n}/collection-geometry", SEEDLOT).with(csrf().asHeader()))
        .andExpect(status().isForbidden());

    verify(seedlotCollectionGeometryService, never()).getBySeedlotNumber(anyString());
  }

  @Test
  @DisplayName("SPRR001 report downloads are forbidden")
  void downloadBclassRegistrationReport_isForbidden() throws Exception {
    mockMvc
        .perform(
            get("/api/seedlots/{n}/reports/registration", SEEDLOT)
                .with(csrf().asHeader())
                .accept(MediaType.APPLICATION_PDF))
        .andExpect(status().isForbidden());

    verify(seedlotRegistrationReportService, never())
        .generateBclassRegistrationReport(anyString(), anyString());
  }

  @Test
  @DisplayName("A-class endpoints are untouched by the toggle")
  void aClassEndpoints_areNotBlocked() throws Exception {
    mockMvc
        .perform(get("/api/seedlots/{n}/a-class-form-progress", "63001").with(csrf().asHeader()))
        .andExpect(status().isOk());

    verify(saveSeedlotFormService).getForm("63001");
  }
}
