package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.entity.ActiveOrchardSpuEntity;
import ca.bc.gov.backendstartapi.repository.ActiveOrchardSeedPlanningUnitRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@WebMvcTest(ActiveOrchardSeedPlanningUnitEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class ActiveOrchardSeedPlanningUnitEndpointTest {

  @MockBean private ActiveOrchardSeedPlanningUnitRepository repository;

  private MockMvc mockMvc;

  private final WebApplicationContext webApplicationContext;

  ActiveOrchardSeedPlanningUnitEndpointTest(WebApplicationContext webApplicationContext) {
    this.webApplicationContext = webApplicationContext;
  }

  @BeforeEach
  void setup() {
    this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
  }

  @Test
  void testSearchActiveDefault() throws Exception {
    List<ActiveOrchardSpuEntity> actives =
        List.of(new ActiveOrchardSpuEntity("000", 1, true, false, false));
    List<ActiveOrchardSpuEntity> inactives =
        List.of(new ActiveOrchardSpuEntity("000", 2, false, false, false));
    given(repository.findByOrchardIdAndActive("000", true)).willReturn(actives);
    given(repository.findByOrchardIdAndActive("000", false)).willReturn(inactives);

    mockMvc
        .perform(get("/api/orchards/000/seed-plan-units").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpectAll(
            jsonPath("$[0].active").value("true"), jsonPath("$[0].seedPlanningUnitId").value("1"));
  }

  @Test
  void testSearchInactiveDefault() throws Exception {
    List<ActiveOrchardSpuEntity> actives =
        List.of(new ActiveOrchardSpuEntity("000", 1, true, false, false));
    List<ActiveOrchardSpuEntity> inactives =
        List.of(new ActiveOrchardSpuEntity("000", 2, false, false, false));
    given(repository.findByOrchardIdAndActive("000", true)).willReturn(actives);
    given(repository.findByOrchardIdAndActive("000", false)).willReturn(inactives);

    mockMvc
        .perform(
            get("/api/orchards/000/seed-plan-units?active=false")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpectAll(
            jsonPath("$[0].active").value("false"), jsonPath("$[0].seedPlanningUnitId").value("2"));
  }
}
