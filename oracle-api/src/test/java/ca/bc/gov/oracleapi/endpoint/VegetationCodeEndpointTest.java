package ca.bc.gov.oracleapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.entity.VegetationCode;
import ca.bc.gov.oracleapi.repository.VegetationCodeRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@WebMvcTest(VegetationCodeEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class VegetationCodeEndpointTest {

  private MockMvc mockMvc;

  @MockBean private VegetationCodeRepository vegetationCodeRepository;

  private final WebApplicationContext webApplicationContext;

  VegetationCodeEndpointTest(WebApplicationContext webApplicationContext) {
    this.webApplicationContext = webApplicationContext;
  }

  @BeforeEach
  public void setup() {
    this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
  }

  @Test
  void fetchExistentCode() throws Exception {
    VegetationCode vc =
        new VegetationCode(
            "C1",
            "Code 1",
            LocalDate.of(2020, 1, 1),
            LocalDate.of(2025, 1, 1),
            LocalDateTime.now());

    when(vegetationCodeRepository.findById("C1")).thenReturn(Optional.of(vc));

    mockMvc
        .perform(get("/api/vegetation-codes/C1").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andReturn();
  }

  @Test
  void fetchNonExistentCode() throws Exception {
    VegetationCode vc =
        new VegetationCode(
            "C1",
            "Code 1",
            LocalDate.of(2020, 1, 1),
            LocalDate.of(2025, 1, 1),
            LocalDateTime.now());

    when(vegetationCodeRepository.findById("C1")).thenReturn(Optional.of(vc));
    when(vegetationCodeRepository.findById("C2")).thenReturn(Optional.empty());

    mockMvc
        .perform(
            get("/api/vegetation-codes/C2")
                .with(csrf().asHeader())
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(content().string(""))
        .andReturn();
  }

  @Test
  void searchWithMatches() throws Exception {
    VegetationCode vc =
        new VegetationCode(
            "C1",
            "Code 1",
            LocalDate.of(2020, 1, 1),
            LocalDate.of(2025, 1, 1),
            LocalDateTime.now());

    Pageable pageable = PageRequest.of(0, 20);
    Page<VegetationCode> vegPage = new PageImpl<VegetationCode>(List.of(vc));
    when(vegetationCodeRepository.findByCodeOrDescription("1", pageable)).thenReturn(vegPage);

    mockMvc
        .perform(
            get("/api/vegetation-codes?search=1")
                .with(csrf().asHeader())
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andReturn();
  }

  @Test
  void searchWithNoMatch() throws Exception {
    Pageable pageable = PageRequest.of(0, 20);
    Page<VegetationCode> vegPage = new PageImpl<>(List.of());

    when(vegetationCodeRepository.findByCodeOrDescription("1", pageable)).thenReturn(vegPage);

    mockMvc
        .perform(
            get("/api/vegetation-codes?search=1")
                .with(csrf().asHeader())
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andReturn();
  }

  @Test
  void searchWithNegativePage() throws Exception {
    Pageable pageable = PageRequest.of(0, 20);

    when(vegetationCodeRepository.findByCodeOrDescription("1", pageable))
        .thenThrow(new RuntimeException("Invalid negatative page index"));

    mockMvc
        .perform(
            get("/api/vegetation-codes?search=1&page=-1")
                .with(csrf().asHeader())
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest())
        .andReturn();
  }

  @Test
  void searchWithNonPositivePageSize() throws Exception {
    VegetationCode vc =
        new VegetationCode(
            "C1",
            "Code 1",
            LocalDate.of(2020, 1, 1),
            LocalDate.of(2025, 1, 1),
            LocalDateTime.now());

    Pageable pageable = PageRequest.of(0, 10);
    Page<VegetationCode> vegPage = new PageImpl<VegetationCode>(List.of(vc));

    when(vegetationCodeRepository.findByCodeOrDescription("1", pageable)).thenReturn(vegPage);

    mockMvc
        .perform(
            get("/api/vegetation-codes?search=1&perPage=0")
                .with(csrf().asHeader())
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest())
        .andReturn();
  }

  @Test
  @DisplayName("Find effective by code or description happy path should succeed")
  void findEffectiveByCodeOrDescription_happyPath_shouldSucceed() throws Exception {
    VegetationCode vc =
        new VegetationCode(
            "C1",
            "Code 1",
            LocalDate.of(2020, 1, 1),
            LocalDate.of(2025, 1, 1),
            LocalDateTime.now());

    Pageable pageable = PageRequest.of(0, 10);
    Page<VegetationCode> vegPage = new PageImpl<VegetationCode>(List.of(vc));

    when(vegetationCodeRepository.findByCodeOrDescription("1", pageable)).thenReturn(vegPage);

    mockMvc
        .perform(
            get("/api/vegetation-codes?search=1&page=0&perPage=1")
                .with(csrf().asHeader())
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andReturn();
  }
}
