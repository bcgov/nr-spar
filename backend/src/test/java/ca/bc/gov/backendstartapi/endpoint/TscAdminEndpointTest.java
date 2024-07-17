package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.dto.SeedlotStatusResponseDto;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.service.SeedlotService;
import ca.bc.gov.backendstartapi.service.TscAdminService;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TscAdminEndpoint.class)
@ContextConfiguration
@ExtendWith(SpringExtension.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_TSC_ADMIN")
class TscAdminEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private TscAdminService tscAdminService;

  @MockBean private SeedlotService seedlotService;

  private static final String WHOLE_SEEDLOT_FORM_JSON =
      """
        {
        "seedlotFormCollectionDto": {
          "collectionClientNumber": "00012797",
          "collectionLocnCode": "02",
          "collectionStartDate": "2023-12-06T00:00:00Z",
          "collectionEndDate": "2023-12-06T00:00:00Z",
          "noOfContainers": 2,
          "volPerContainer": 4,
          "clctnVolume": 8,
          "seedlotComment": "Any comment",
          "coneCollectionMethodCodes": [1, 2]
        },
        "seedlotFormOwnershipDtoList": [
          {
            "ownerClientNumber": "00012797",
            "ownerLocnCode": "02",
            "originalPctOwned": 100,
            "originalPctRsrvd": 100,
            "originalPctSrpls": 5,
            "methodOfPaymentCode": "CLA",
            "sparFundSrceCode": "ITC"
          }
        ],
        "seedlotFormInterimDto": {
          "intermStrgClientNumber": "00012797",
          "intermStrgLocnCode": "01",
          "intermStrgStDate": "2023-12-06T00:00:00Z",
          "intermStrgEndDate": "2023-12-06T00:00:00Z",
          "intermStrgLocn": "Some location",
          "intermFacilityCode": "OCV"
        },
        "seedlotFormOrchardDto": {
          "primaryOrchardId": "405",
          "femaleGameticMthdCode": "F3",
          "maleGameticMthdCode": "M3",
          "controlledCrossInd": false,
          "biotechProcessesInd": true,
          "pollenContaminationInd": false,
          "pollenContaminationPct": 22,
          "contaminantPollenBv": 45.6,
          "pollenContaminationMthdCode": "true"
        },
        "seedlotFormParentTreeSmpDtoList": [
          {
            "seedlotNumber": "87",
            "parentTreeId": 4023,
            "parentTreeNumber": "87",
            "coneCount": 1,
            "pollenCount": 5,
            "smpSuccessPct": 6,
            "nonOrchardPollenContamPct": 2,
            "amountOfMaterial": 50,
            "proportion": 100,
            "parentTreeGeneticQualities": [
              {
                "geneticTypeCode": "BV",
                "geneticWorthCode": "GVO",
                "geneticQualityValue": 18
              }
            ]
          }
        ],
        "seedlotFormExtractionDto": {
          "extractoryClientNumber": "00012797",
          "extractoryLocnCode": "01",
          "extractionStDate": "2023-12-06T00:00:00Z",
          "extractionEndDate": "2023-12-06T00:00:00Z",
          "storageClientNumber": "00012797",
          "storageLocnCode": "01",
          "temporaryStrgStartDate": "2023-12-06T00:00:00Z",
          "temporaryStrgEndDate": "2023-12-06T00:00:00Z"
        }
      }
      """;

  @Test
  @DisplayName("getSeedlotsForReviewing_successTest")
  void getSeedlotsForReviewing_successTest() throws Exception {
    Integer page = 0;
    Integer size = 10;
    Seedlot seedlot = new Seedlot("63712");
    seedlot.setApplicantClientNumber("00012345");

    Page<Seedlot> pageResult = new PageImpl<>(List.of(seedlot));
    when(tscAdminService.getTscAdminSeedlots(page, size)).thenReturn(pageResult);

    mockMvc
        .perform(
            get("/api/tsc-admin/seedlots?page={page}&size={size}", page, size)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(header().string("X-TOTAL-COUNT", "1"))
        .andExpect(jsonPath("$[0].id").value("63712"))
        .andExpect(jsonPath("$[0].applicantClientNumber").value("00012345"))
        .andReturn();
  }

  @Test
  @DisplayName("getSeedlotsForReviewing_successTest")
  @WithAnonymousUser
  void getSeedlotsForReviewing_unauthorizedTest() throws Exception {
    mockMvc
        .perform(
            get("/api/tsc-admin/seedlots")
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized())
        .andReturn();
  }

  @Test
  @DisplayName("Approves a seedlot number")
  void approveOrDisapproveSeedlot_approve_shouldSuceed() throws Exception {
    String seedlotNumber = "63223";
    String approved = "APP";

    when(tscAdminService.updateSeedlotStatus(seedlotNumber, approved))
        .thenReturn(new Seedlot(seedlotNumber));

    String url = String.format("/api/tsc-admin/seedlots/%s/status/%s", seedlotNumber, approved);

    mockMvc
        .perform(
            post(url)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNoContent())
        .andReturn();
  }

  @Test
  @DisplayName("Seedlot approval attempt seedlot not found should fail")
  void approveOrDisapproveSeedlot_seedlotNotFound_shouldFail() throws Exception {
    String seedlotNumber = "63223";
    String approved = "APP";

    when(tscAdminService.updateSeedlotStatus(seedlotNumber, approved))
        .thenThrow(new SeedlotNotFoundException());

    String url = String.format("/api/tsc-admin/seedlots/%s/status/%s", seedlotNumber, approved);

    mockMvc
        .perform(
            post(url)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andReturn();
  }

  @Test
  @DisplayName("Edit seedlot should succeed")
  void editSeedlot_shouldSucceed() throws Exception {
    String seedlotNumber = "63012";
    SeedlotStatusResponseDto res = new SeedlotStatusResponseDto(seedlotNumber, "SUB");
    when(seedlotService.updateSeedlotWithForm(any(), any(), anyBoolean(), anyBoolean(), any()))
        .thenReturn(res);
    mockMvc
        .perform(
            put(
                    "/api/tsc-admin/seedlots/{seedlotNumber}/edit?statusOnSave={statusOnSave}",
                    seedlotNumber,
                    "APP")
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(WHOLE_SEEDLOT_FORM_JSON))
        .andExpect(status().isOk())
        .andReturn();
  }

  @Test
  @DisplayName("Edit seedlot should fail upon seedlot not found.")
  void editSeedlot_shouldFail() throws Exception {
    String seedlotNumber = "63999";
    when(seedlotService.updateSeedlotWithForm(any(), any(), anyBoolean(), anyBoolean(), any()))
        .thenThrow(new SeedlotNotFoundException());

    mockMvc
        .perform(
            put(
                    "/api/tsc-admin/seedlots/{seedlotNumber}/edit?statusOnSave={statusOnSave}",
                    seedlotNumber,
                    "APP")
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(WHOLE_SEEDLOT_FORM_JSON))
        .andExpect(status().isNotFound())
        .andReturn();
  }

  @Test
  @DisplayName("Edit seedlot should fail with invalid seedlot status.")
  void editSeedlot_invalidStatus_shouldFail() throws Exception {
    String seedlotNumber = "63999";
    when(seedlotService.updateSeedlotWithForm(any(), any(), anyBoolean(), anyBoolean(), any()))
        .thenThrow(new SeedlotNotFoundException());

    mockMvc
        .perform(
            put(
                    "/api/tsc-admin/seedlots/{seedlotNumber}/edit?statusOnSave={statusOnSave}",
                    seedlotNumber,
                    "EXP")
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(WHOLE_SEEDLOT_FORM_JSON))
        .andExpect(status().isBadRequest())
        .andReturn();
  }
}
