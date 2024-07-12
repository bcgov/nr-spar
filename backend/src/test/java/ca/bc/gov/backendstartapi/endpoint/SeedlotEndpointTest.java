package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.dto.RevisionCountDto;
import ca.bc.gov.backendstartapi.dto.SaveSeedlotFormDtoClassA;
import ca.bc.gov.backendstartapi.dto.SeedlotAclassFormDto;
import ca.bc.gov.backendstartapi.dto.SeedlotDto;
import ca.bc.gov.backendstartapi.dto.SeedlotStatusResponseDto;
import ca.bc.gov.backendstartapi.dto.oracle.SpuDto;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.ClientIdForbiddenException;
import ca.bc.gov.backendstartapi.exception.CsvTableParsingException;
import ca.bc.gov.backendstartapi.exception.InvalidSeedlotRequestException;
import ca.bc.gov.backendstartapi.exception.SeedlotFormProgressNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotSourceNotFoundException;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import ca.bc.gov.backendstartapi.service.SaveSeedlotFormService;
import ca.bc.gov.backendstartapi.service.SeedlotService;
import ca.bc.gov.backendstartapi.service.parser.ConeAndPollenCountCsvTableParser;
import ca.bc.gov.backendstartapi.service.parser.SmpCalculationCsvTableParser;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@WebMvcTest(SeedlotEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class SeedlotEndpointTest {

  private final ClassLoader classLoader = getClass().getClassLoader();

  @MockBean private SmpCalculationCsvTableParser smpCalculationCsvTableParser;

  private MockMvc mockMvc;

  @MockBean ConeAndPollenCountCsvTableParser coneAndPollenCountCsvTableParser;

  @MockBean SeedlotService seedlotService;

  @MockBean SaveSeedlotFormService saveSeedlotFormService;

  @MockBean LoggedUserService loggedUserService;

  private final WebApplicationContext webApplicationContext;

  private static final String CLIENT_ID = "00112233";

  private static final String TEST_PATCH_SEEDLOT_JSON =
      """
            {
                "applicantEmailAddress": "groot@wood.com",
                "seedlotSourceCode": "CUS",
                "toBeRegistrdInd": true,
                "bcSourceInd": false,
                "revisionCount": 1
            }
        """;

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

  private static final String SEEDLOT_FORM_PROGRESS_JSON =
      """
        {
          "allStepData": {},
          "progressStatus": {}
        }
      """;

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
    SeedlotStatusResponseDto responseDto =
        new SeedlotStatusResponseDto(seedlotNumber, seedlotStatus);

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
  @DisplayName("getClientSeedlotInfoTestDefaultPagination")
  void getUserSeedlotInfoTestDefaultPagination() throws Exception {
    Seedlot seedlotEntity = new Seedlot("0000000");
    List<Seedlot> userSeedlots = new ArrayList<>();
    userSeedlots.add(seedlotEntity);

    Optional<Page<Seedlot>> pagedResult = Optional.of(new PageImpl<>(userSeedlots));

    String url = String.format("/api/seedlots/clients/%s", CLIENT_ID);

    when(seedlotService.getSeedlotByClientId(CLIENT_ID, 1, 10)).thenReturn(pagedResult);

    mockMvc
        .perform(get(url).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(0))
        .andReturn();
  }

  @Test
  @DisplayName("getUserSeedlotInfoTestShortClientIds")
  void getUserSeedlotInfoTestShortClientIds() throws Exception {
    Seedlot seedlotEntity = new Seedlot("0000000");
    seedlotEntity.setApplicantClientNumber("00011223");
    List<Seedlot> userSeedlots = new ArrayList<>();
    userSeedlots.add(seedlotEntity);

    Optional<Page<Seedlot>> pagedResult = Optional.of(new PageImpl<>(userSeedlots));

    String url = "/api/seedlots/clients/11223";

    when(seedlotService.getSeedlotByClientId("00011223", 0, 10)).thenReturn(pagedResult);

    mockMvc
        .perform(get(url).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1))
        .andReturn();
  }

  @Test
  @DisplayName("getSingleSeedlotInfoForbidden")
  void getSingleSeedlotInfoForbidden() throws Exception {
    when(seedlotService.getSingleSeedlotInfo(any())).thenThrow(new ClientIdForbiddenException());

    mockMvc
        .perform(get("/api/seedlots/0000000").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isForbidden())
        .andReturn();
  }

  @Test
  @DisplayName("getClientSeedlotInfoTestChangePageNumber")
  void getUserSeedlotInfoTestChangePageNumber() throws Exception {
    Seedlot seedlotEntity = new Seedlot("0000001");
    List<Seedlot> userSeedlots = new ArrayList<>();
    userSeedlots.add(seedlotEntity);

    Optional<Page<Seedlot>> pagedResult = Optional.of(new PageImpl<>(userSeedlots));
    when(seedlotService.getSeedlotByClientId(CLIENT_ID, 1, 10)).thenReturn(pagedResult);

    String url = String.format("/api/seedlots/clients/%s?page={page}", CLIENT_ID);
    int page = 1;

    mockMvc
        .perform(get(url, page).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andReturn();
  }

  @Test
  @DisplayName("getClientSeedlotInfoTestChangePageSize")
  void getUserSeedlotInfoTestChangePageSize() throws Exception {
    Seedlot seedlotEntity = new Seedlot("0000002");
    List<Seedlot> userSeedlots = new ArrayList<>();
    userSeedlots.add(seedlotEntity);
    userSeedlots.add(seedlotEntity);

    String url = String.format("/api/seedlots/clients/%s?page=1&size={size}", CLIENT_ID);
    int pageSize = 2;

    Optional<Page<Seedlot>> pagedResult = Optional.of(new PageImpl<>(userSeedlots));
    when(seedlotService.getSeedlotByClientId(CLIENT_ID, 1, pageSize)).thenReturn(pagedResult);

    mockMvc
        .perform(get(url, pageSize).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(2))
        .andReturn();
  }

  @Test
  @DisplayName("Get seedlots by client ID return empty list")
  void getSingleSeedlotInfoNotFoundNoPageTest() throws Exception {

    Optional<Page<Seedlot>> pagedResult = Optional.of(new PageImpl<>(List.of()));
    when(seedlotService.getSeedlotByClientId(CLIENT_ID, 1, 10)).thenReturn(pagedResult);

    String url = String.format("/api/seedlots/clients/%s", CLIENT_ID);

    mockMvc
        .perform(get(url).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andReturn();
  }

  @Test
  @DisplayName("Get seedlot by id should succeed")
  void getSingleSeedlotInfoTest() throws Exception {
    String seedlotNumber = "0000000";
    Seedlot seedlotEntity = new Seedlot(seedlotNumber);

    SeedlotDto seedlotDto = new SeedlotDto();

    Integer spuId = 7;
    SpuDto spuDto = new SpuDto();
    spuDto.setSeedPlanUnitId(spuId);

    seedlotDto.setSeedlot(seedlotEntity);
    seedlotDto.setPrimarySpz(null);
    seedlotDto.setAdditionalSpzList(List.of());
    seedlotDto.setPrimarySpu(spuDto);

    GeneticWorthTraitsDto traitGvo =
        new GeneticWorthTraitsDto("GVO", null, new BigDecimal("27"), new BigDecimal("85"));
    GeneticWorthTraitsDto traitWwd =
        new GeneticWorthTraitsDto("WWD", null, new BigDecimal("13"), new BigDecimal("87"));
    seedlotDto.setCalculatedValues(List.of(traitGvo, traitWwd));

    when(seedlotService.getSingleSeedlotInfo(any())).thenReturn(seedlotDto);

    mockMvc
        .perform(get("/api/seedlots/0000000").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.seedlot.id").value(seedlotNumber))
        .andExpect(jsonPath("$.primarySpu.seedPlanUnitId").value(spuId))
        .andExpect(jsonPath("$.calculatedValues[0].traitCode").value(traitGvo.traitCode()))
        .andExpect(
            jsonPath("$.calculatedValues[0].calculatedValue").value(traitGvo.calculatedValue()))
        .andExpect(
            jsonPath("$.calculatedValues[0].testedParentTreePerc")
                .value(traitGvo.testedParentTreePerc()))
        .andExpect(jsonPath("$.calculatedValues[1].traitCode").value(traitWwd.traitCode()))
        .andExpect(
            jsonPath("$.calculatedValues[1].calculatedValue").value(traitWwd.calculatedValue()))
        .andExpect(
            jsonPath("$.calculatedValues[1].testedParentTreePerc")
                .value(traitWwd.testedParentTreePerc()))
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

  @Test
  @DisplayName("getSingleSeedlotAclassFullInfoTest")
  void getSingleSeedlotAclassFullInfoTest() throws Exception {
    SeedlotAclassFormDto seedlotFullInfo = new SeedlotAclassFormDto(null, null);

    when(seedlotService.getAclassSeedlotFormInfo(any())).thenReturn(seedlotFullInfo);

    mockMvc
        .perform(get("/api/seedlots/0000000/a-class-full-form").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andReturn();
  }

  @Test
  @DisplayName("getSingleSeedlotAclassFullInfoNotFoundTest")
  void getSingleSeedlotAclassFullInfoNotFoundTest() throws Exception {
    when(seedlotService.getAclassSeedlotFormInfo(any())).thenThrow(new SeedlotNotFoundException());

    mockMvc
        .perform(get("/api/seedlots/0000000/a-class-full-form").accept(MediaType.APPLICATION_JSON))
        .andDo(print())
        .andExpect(status().isNotFound())
        .andReturn();
  }

  @Test
  @DisplayName("patchSeedlotApplicationBadSourceTest")
  void patchSeedlotApplicationBadSourceTest() throws Exception {
    when(seedlotService.patchApplicantInfo(any(), any()))
        .thenThrow(new SeedlotSourceNotFoundException());

    mockMvc
        .perform(
            patch("/api/seedlots/0000000/application-info")
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(TEST_PATCH_SEEDLOT_JSON))
        .andExpect(status().isNotFound())
        .andReturn();
  }

  @Test
  @DisplayName("patchSeedlotApplicationBadIdTest")
  void patchSeedlotApplicationBadIdTest() throws Exception {
    when(seedlotService.patchApplicantInfo(any(), any())).thenThrow(new SeedlotNotFoundException());

    mockMvc
        .perform(
            patch("/api/seedlots/0000000/application-info")
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(TEST_PATCH_SEEDLOT_JSON))
        .andExpect(status().isNotFound())
        .andReturn();
  }

  @Test
  @DisplayName("patchSeedlotApplicationSuccessTest")
  void patchSeedlotApplicationSuccessTest() throws Exception {
    String seedlotNumber = "555888";
    Seedlot testSeedlot = new Seedlot(seedlotNumber);

    when(seedlotService.patchApplicantInfo(any(), any())).thenReturn(testSeedlot);

    String path = String.format("/api/seedlots/%s/application-info", seedlotNumber);

    mockMvc
        .perform(
            patch(path)
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(TEST_PATCH_SEEDLOT_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(testSeedlot.getId()))
        .andReturn();
  }

  @Test
  @DisplayName("Seedlot Form submitted with not found seedlot")
  @WithMockUser(username = "SPARTest", roles = "SPAR_TSC_ADMIN")
  void submitSeedlotForm_notFoundSeedlot_shouldThrowException() throws Exception {
    when(seedlotService.updateSeedlotWithForm(any(), any(), anyBoolean(), anyBoolean(), any()))
        .thenThrow(new SeedlotNotFoundException());

    when(loggedUserService.isTscAdminLogged()).thenReturn(false);

    mockMvc
        .perform(
            put("/api/seedlots/{seedlotNumber}/a-class-submission", 123)
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(WHOLE_SEEDLOT_FORM_JSON))
        .andExpect(status().isNotFound())
        .andReturn();
  }

  @Test
  @DisplayName("Seedlot Form submitted with success")
  @WithMockUser(username = "SPARTest", roles = "SPAR_TSC_ADMIN")
  void submitSeedlotForm_happyPath_shouldSucceed() throws Exception {
    SeedlotStatusResponseDto createResponseDto = new SeedlotStatusResponseDto("123", "PND");

    when(seedlotService.updateSeedlotWithForm(any(), any(), anyBoolean(), anyBoolean(), any()))
        .thenReturn(createResponseDto);

    when(loggedUserService.isTscAdminLogged()).thenReturn(false);

    mockMvc
        .perform(
            put("/api/seedlots/{seedlotNumber}/a-class-submission", 123)
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(WHOLE_SEEDLOT_FORM_JSON))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.seedlotNumber").value("123"))
        .andExpect(jsonPath("$.seedlotStatusCode").value("PND"))
        .andReturn();
  }

  @Test
  @DisplayName("Save seedlot form progress but seedlot not found")
  void saveSeedlotFormProgress_notFoundSeedlot_shouldThrowException() throws Exception {
    doThrow(new SeedlotNotFoundException())
        .when(saveSeedlotFormService)
        .saveFormClassA(any(), any());

    mockMvc
        .perform(
            put("/api/seedlots/{seedlotNumber}/a-class-form-progress", "12345")
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(SEEDLOT_FORM_PROGRESS_JSON))
        .andExpect(status().isNotFound())
        .andReturn();
  }

  @Test
  @DisplayName("Save seedlot form progress should Succeed")
  void saveSeedlotFormProgress_notFoundSeedlot_shouldSucceed() throws Exception {
    when(saveSeedlotFormService.saveFormClassA(any(), any())).thenReturn(new RevisionCountDto(0));

    mockMvc
        .perform(
            put("/api/seedlots/{seedlotNumber}/a-class-form-progress", "12345")
                .with(csrf().asHeader())
                .header("Content-Type", MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(SEEDLOT_FORM_PROGRESS_JSON))
        .andExpect(status().isOk())
        .andReturn();
  }

  @Test
  @DisplayName("Get seedlot form progress but not found")
  void getSeedlotFormProgress_notFound_shouldThrowException() throws Exception {
    when(saveSeedlotFormService.getFormClassA(any()))
        .thenThrow(new SeedlotFormProgressNotFoundException());

    mockMvc
        .perform(
            get("/api/seedlots/{seedlotNumber}/a-class-form-progress", "12345")
                .header("Content-Type", MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andReturn();
  }

  @Test
  @DisplayName("Get seedlot form progress should succeed")
  void getSeedlotFormProgress_shouldSucceed() throws Exception {
    when(saveSeedlotFormService.getFormClassA(any()))
        .thenReturn(new SaveSeedlotFormDtoClassA(null, null, 1));

    mockMvc
        .perform(
            get("/api/seedlots/{seedlotNumber}/a-class-form-progress", "12345")
                .header("Content-Type", MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andReturn();
  }

  @Test
  @DisplayName("Get seedlot form progress status but not found")
  void getSeedlotFormProgressStatus_notFound_shouldThrowException() throws Exception {
    when(saveSeedlotFormService.getFormStatusClassA(any()))
        .thenThrow(new SeedlotFormProgressNotFoundException());

    mockMvc
        .perform(
            get("/api/seedlots/{seedlotNumber}/a-class-form-progress/status", "12345")
                .header("Content-Type", MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andReturn();
  }

  @Test
  @DisplayName("Get seedlot form progress status should succeed")
  void getSeedlotFormProgressStatus_shouldSucceed() throws Exception {
    when(saveSeedlotFormService.getFormStatusClassA(any())).thenReturn(null);

    mockMvc
        .perform(
            get("/api/seedlots/{seedlotNumber}/a-class-form-progress/status", "12345")
                .header("Content-Type", MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andReturn();
  }
}
