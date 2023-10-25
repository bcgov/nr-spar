package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.dto.SeedlotCreateResponseDto;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.CsvTableParsingException;
import ca.bc.gov.backendstartapi.exception.InvalidSeedlotRequestException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.service.SeedlotService;
import ca.bc.gov.backendstartapi.service.parser.ConeAndPollenCountCsvTableParser;
import ca.bc.gov.backendstartapi.service.parser.SmpCalculationCsvTableParser;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@WebMvcTest(SeedlotEndpoint.class)
class SeedlotEndpointTest {

  private final ClassLoader classLoader = getClass().getClassLoader();

  @MockBean private SmpCalculationCsvTableParser smpCalculationCsvTableParser;

  private MockMvc mockMvc;

  @MockBean ConeAndPollenCountCsvTableParser coneAndPollenCountCsvTableParser;

  @MockBean SeedlotService seedlotService;

  private final WebApplicationContext webApplicationContext;

  private static final String USER_ID = "dev-123456789abcdef@idir";

  SeedlotEndpointTest(WebApplicationContext webApplicationContext) {
    this.webApplicationContext = webApplicationContext;
  }

  @BeforeEach
  void setup() {
    this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
  }

  @Test
  void uploadSmpMixTable() throws Exception {
    mockMvc
        .perform(
            MockMvcRequestBuilders.multipart(
                    "/api/seedlots/parent-trees-contribution/smp-calculation-table/upload")
                .file(
                    new MockMultipartFile(
                        "file",
                        "table.csv",
                        null,
                        Objects.requireNonNull(
                            classLoader.getResourceAsStream("csv/smpmix/finalEmptyLine.csv"))))
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.MULTIPART_FORM_DATA))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON));
  }

  @Test
  void uploadConeAndPollenCountTable() throws Exception {
    mockMvc
        .perform(
            MockMvcRequestBuilders.multipart(
                    "/api/seedlots/parent-trees-contribution/cone-pollen-count-table/upload")
                .file(
                    new MockMultipartFile(
                        "file",
                        "table.csv",
                        null,
                        Objects.requireNonNull(
                            classLoader.getResourceAsStream(
                                "csv/contribution/finalEmptyLine.csv"))))
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.MULTIPART_FORM_DATA))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON));
  }

  @Test
  void uploadSmpMixTableWrongExtension() throws Exception {
    mockMvc
        .perform(
            MockMvcRequestBuilders.multipart(
                    "/api/seedlots/parent-trees-contribution/smp-calculation-table/upload")
                .file(
                    new MockMultipartFile(
                        "file",
                        "table.txt",
                        null,
                        Objects.requireNonNull(
                            classLoader.getResourceAsStream("csv/smpmix/finalEmptyLine.csv"))))
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.MULTIPART_FORM_DATA))
        .andExpect(status().isBadRequest())
        .andExpect(status().reason("CSV files only"));
  }

  @Test
  void uploadConeAndPollenCountTableWrongExtension() throws Exception {
    mockMvc
        .perform(
            MockMvcRequestBuilders.multipart(
                    "/api/seedlots/parent-trees-contribution/cone-pollen-count-table/upload")
                .file(
                    new MockMultipartFile(
                        "file",
                        "table.txt",
                        null,
                        Objects.requireNonNull(
                            classLoader.getResourceAsStream(
                                "csv/contribution/finalEmptyLine.csv"))))
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.MULTIPART_FORM_DATA))
        .andExpect(status().isBadRequest())
        .andExpect(status().reason("CSV files only"));
  }

  @Test
  void badRequestForCsvTableParsingException() throws Exception {
    var file = new MockMultipartFile("file", "meh.csv", null, "bad content".getBytes());
    final var errorReason = "reason";
    given(smpCalculationCsvTableParser.parse(file.getResource()))
        .willThrow(new CsvTableParsingException(errorReason));

    mockMvc
        .perform(
            MockMvcRequestBuilders.multipart(
                    "/api/seedlots/parent-trees-contribution/smp-calculation-table/upload")
                .file(file)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.MULTIPART_FORM_DATA))
        .andDo(print())
        .andExpect(status().isBadRequest())
        .andExpect(status().reason(errorReason));
  }

  @Test
  @DisplayName("createSeedlotSuccessTest")
  void createSeedlotSuccessTest() throws Exception {
    String seedlotNumber = "630001";
    String seedlotStatus = "PND";
    SeedlotCreateResponseDto responseDto =
        new SeedlotCreateResponseDto(seedlotNumber, seedlotStatus);

    when(seedlotService.createSeedlot(any())).thenReturn(responseDto);

    String json =
        """
        {
          "applicantClientNumber": "00012797",
          "applicantLocationCode": "01",
          "applicantEmailAddress": "user.lastname@domain.com",
          "vegetationCode": "FDI",
          "seedlotSourceCode": "TPT",
          "toBeRegistrdInd": true,
          "bcSourceInd": true,
          "geneticClassCode": "A"
        }
        """;

    mockMvc
        .perform(
            post("/api/seedlots")
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(json))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.seedlotNumber").value("630001"))
        .andExpect(jsonPath("$.seedlotStatusCode").value("PND"))
        .andReturn();
  }

  @Test
  @DisplayName("createSeedlotBadRequestTest")
  void createSeedlotBadRequestTest() throws Exception {
    when(seedlotService.createSeedlot(any())).thenThrow(new InvalidSeedlotRequestException());

    mockMvc
        .perform(
            post("/api/seedlots")
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content("here"))
        .andDo(print())
        .andExpect(status().isBadRequest())
        .andReturn();
  }

  @Test
  @DisplayName("getUserSeedlotInfoTestDefaultPagination")
  @WithMockUser(roles = "user_read")
  void getUserSeedlotInfoTestDefaultPagination() throws Exception {
    Seedlot seedlotEntity = new Seedlot("0000000");
    List<Seedlot> userSeedlots = new ArrayList<>();
    userSeedlots.add(seedlotEntity);

    String url = String.format("/api/seedlots/users/%s", USER_ID);

    when(seedlotService.getUserSeedlots(USER_ID, 1, 10)).thenReturn(userSeedlots);

    mockMvc
        .perform(get(url).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andReturn();
  }

  @Test
  @DisplayName("getUserSeedlotInfoTestChangePageNumber")
  @WithMockUser(roles = "user_read")
  void getUserSeedlotInfoTestChangePageNumber() throws Exception {
    Seedlot seedlotEntity = new Seedlot("0000001");
    List<Seedlot> userSeedlots = new ArrayList<>();
    userSeedlots.add(seedlotEntity);

    when(seedlotService.getUserSeedlots(USER_ID, 1, 10)).thenReturn(userSeedlots);

    String url = String.format("/api/seedlots/users/%s?page={page}", USER_ID);
    int page = 1;

    mockMvc
        .perform(
            get(url, page)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andReturn();
  }

  @Test
  @DisplayName("getUserSeedlotInfoTestChangePageSize")
  @WithMockUser(roles = "user_read")
  void getUserSeedlotInfoTestChangePageSize() throws Exception {
    Seedlot seedlotEntity = new Seedlot("0000002");
    List<Seedlot> userSeedlots = new ArrayList<>();
    userSeedlots.add(seedlotEntity);
    userSeedlots.add(seedlotEntity);

    String url = String.format("/api/seedlots/users/%s?page=1&size={size}", USER_ID);
    int pageSize = 2;

    when(seedlotService.getUserSeedlots(USER_ID, 1, pageSize)).thenReturn(userSeedlots);

    mockMvc
        .perform(
            get(url, pageSize)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(2))
        .andReturn();
  }

  @Test
  @DisplayName("getSingleSeedlotInfoNotFoundNoPageTest")
  void getSingleSeedlotInfoNotFoundNoPageTest() throws Exception {
    when(seedlotService.getUserSeedlots(USER_ID, 1, 10)).thenReturn(List.of());

    String url = String.format("/api/seedlots/users/%s", USER_ID);

    mockMvc
        .perform(get(url).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(0))
        .andReturn();
  }

  @Test
  @DisplayName("getSingleSeedlotInfoTest")
  @WithMockUser(roles = "user_read")
  void getSingleSeedlotInfoTest() throws Exception {
    Seedlot seedlotEntity = new Seedlot("0000000");

    when(seedlotService.getSingleSeedlotInfo(any())).thenReturn(Optional.of(seedlotEntity));

    mockMvc
        .perform(get("/api/seedlots/0000000").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andReturn();
  }

  @Test
  @DisplayName("getSingleSeedlotInfoNotFoundTest")
  void getSingleSeedlotInfoNotFoundTest() throws Exception {
    when(seedlotService.getSingleSeedlotInfo(any())).thenThrow(new SeedlotNotFoundException());

    mockMvc
        .perform(get("/api/seedlots/0000000").accept(MediaType.APPLICATION_JSON))
        .andDo(print())
        .andExpect(status().isNotFound())
        .andReturn();
  }
}
