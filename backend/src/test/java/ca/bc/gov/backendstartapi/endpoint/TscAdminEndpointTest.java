package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
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
class TscAdminEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private TscAdminService tscAdminService;

  @Test
  @DisplayName("getSeedlotsForReviewing_successTest")
  @WithMockUser(roles = "SPAR_SPR_TREE_SEED_CENTRE_ADMIN")
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
}