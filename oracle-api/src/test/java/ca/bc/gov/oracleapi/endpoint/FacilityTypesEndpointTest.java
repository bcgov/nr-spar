package ca.bc.gov.oracleapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.entity.FacilityTypes;
import ca.bc.gov.oracleapi.repository.FacilityTypesRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(FacilityTypesEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class FacilityTypesEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private FacilityTypesRepository facilityTypesRepository;

  @Test
  @DisplayName("findAllSuccessTest")
  void findAllSuccessTest() throws Exception {
    FacilityTypes facilityTypeOcv = new FacilityTypes();
    facilityTypeOcv.setCode("OCV");
    facilityTypeOcv.setDescription("Outside Covered");
    facilityTypeOcv.setEffectiveDate(LocalDate.parse("1905-01-01"));
    facilityTypeOcv.setExpiryDate(LocalDate.parse("9999-12-31"));
    facilityTypeOcv.setUpdateTimeStamp(LocalDate.parse("2004-02-03"));

    FacilityTypes facilityTypeOth = new FacilityTypes();
    facilityTypeOth.setCode("OTH");
    facilityTypeOth.setDescription("Other");
    facilityTypeOth.setEffectiveDate(LocalDate.parse("1905-01-01"));
    facilityTypeOth.setExpiryDate(LocalDate.parse("9999-12-31"));
    facilityTypeOth.setUpdateTimeStamp(LocalDate.parse("2004-02-03"));

    FacilityTypes facilityTypeRfr = new FacilityTypes();
    facilityTypeRfr.setCode("RFR");
    facilityTypeRfr.setDescription("Reefer");
    facilityTypeRfr.setEffectiveDate(LocalDate.parse("1905-01-01"));
    facilityTypeRfr.setExpiryDate(LocalDate.parse("9999-12-31"));
    facilityTypeRfr.setUpdateTimeStamp(LocalDate.parse("2004-02-03"));

    FacilityTypes facilityTypeVrm = new FacilityTypes();
    facilityTypeVrm.setCode("VRM");
    facilityTypeVrm.setDescription("Ventilated Room");
    facilityTypeVrm.setEffectiveDate(LocalDate.parse("1905-01-01"));
    facilityTypeVrm.setExpiryDate(LocalDate.parse("9999-12-31"));
    facilityTypeVrm.setUpdateTimeStamp(LocalDate.parse("2004-02-03"));

    List<FacilityTypes> types = new ArrayList<>();
    types.add(facilityTypeOcv);
    types.add(facilityTypeOth);
    types.add(facilityTypeRfr);
    types.add(facilityTypeVrm);

    when(facilityTypesRepository.findAllValid()).thenReturn(types);

    mockMvc
        .perform(
            get("/api/facility-types")
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].code").value("OCV"))
        .andExpect(jsonPath("$[0].description").value("Outside Covered"))
        .andExpect(jsonPath("$[0].effectiveDate").value("1905-01-01"))
        .andExpect(jsonPath("$[0].expiryDate").value("9999-12-31"))
        .andExpect(jsonPath("$[0].updateTimeStamp").value("2004-02-03"))
        .andExpect(jsonPath("$[1].code").value("OTH"))
        .andExpect(jsonPath("$[1].description").value("Other"))
        .andExpect(jsonPath("$[1].effectiveDate").value("1905-01-01"))
        .andExpect(jsonPath("$[1].expiryDate").value("9999-12-31"))
        .andExpect(jsonPath("$[1].updateTimeStamp").value("2004-02-03"))
        .andExpect(jsonPath("$[2].code").value("RFR"))
        .andExpect(jsonPath("$[2].description").value("Reefer"))
        .andExpect(jsonPath("$[2].effectiveDate").value("1905-01-01"))
        .andExpect(jsonPath("$[2].expiryDate").value("9999-12-31"))
        .andExpect(jsonPath("$[2].updateTimeStamp").value("2004-02-03"))
        .andExpect(jsonPath("$[3].code").value("VRM"))
        .andExpect(jsonPath("$[3].description").value("Ventilated Room"))
        .andExpect(jsonPath("$[3].effectiveDate").value("1905-01-01"))
        .andExpect(jsonPath("$[3].expiryDate").value("9999-12-31"))
        .andExpect(jsonPath("$[3].updateTimeStamp").value("2004-02-03"))
        .andReturn();
  }

  @Test
  @DisplayName("findAllNoAuthorizedTest")
  @WithAnonymousUser
  void findAllNoAuthorizedTest() throws Exception {
    mockMvc
        .perform(
            get("/api/facility-types")
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized())
        .andReturn();
  }
}
