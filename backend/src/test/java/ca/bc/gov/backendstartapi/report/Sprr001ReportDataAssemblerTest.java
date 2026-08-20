package ca.bc.gov.backendstartapi.report;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.dto.ForestClientLocationDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.dto.SeedPlanZoneDto;
import ca.bc.gov.backendstartapi.dto.SeedlotBclassFormDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCollectionGeometryDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormCollectionDtoClassB;
import ca.bc.gov.backendstartapi.dto.SeedlotFormExtractionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormInterimDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOwnershipDto;
import ca.bc.gov.backendstartapi.dto.oracle.OrgUnitDistrictDto;
import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.MethodOfPaymentEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotSourceEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionMethod;
import ca.bc.gov.backendstartapi.enums.ForestClientExpiredEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientStatusEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientTypeEnum;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.repository.MethodOfPaymentRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotCollectionMethodRepository;
import ca.bc.gov.backendstartapi.service.ForestClientService;
import ca.bc.gov.backendstartapi.service.SeedlotService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class Sprr001ReportDataAssemblerTest {

  @Mock private SeedlotService seedlotService;
  @Mock private ForestClientService forestClientService;
  @Mock private MethodOfPaymentRepository methodOfPaymentRepository;
  @Mock private SeedlotCollectionMethodRepository seedlotCollectionMethodRepository;
  @Mock private Provider oracleApiProvider;

  private Sprr001ReportDataAssembler assembler;

  private static final String SEEDLOT_NUMBER = "53001";
  private static final EffectiveDateRange DATE_RANGE =
      new EffectiveDateRange(LocalDate.now().minusDays(1), LocalDate.now().plusYears(1));

  @BeforeEach
  void setup() {
    assembler =
        new Sprr001ReportDataAssembler(
            seedlotService,
            forestClientService,
            methodOfPaymentRepository,
            seedlotCollectionMethodRepository,
            Mappers.getMapper(Sprr001OwnershipRowMapper.class),
            oracleApiProvider);
  }

  @Test
  @DisplayName("assemble builds the SPRR001 master row for a B-class seedlot")
  void assemble_shouldPopulateMainRow() {
    Seedlot seedlot = baseSeedlot();
    seedlot.setSeedlotSource(new SeedlotSourceEntity("CUS", "Custom", DATE_RANGE, false));
    stubHappyPath(seedlot, bclassForm());

    Sprr001MainRow master = assembler.assemble(seedlot).mainRow();

    assertEquals(SEEDLOT_NUMBER, master.getSeedlotNumber());
    assertEquals("spar", master.getDbName());
    assertEquals("PND", master.getStatus());
    assertEquals("B", master.getGeneticClass());
    assertEquals("CUS", master.getSeedlotSourceCode());
    assertEquals("Y", master.getToBeRegistrdInd());
    assertEquals("ACME", master.getClientAcronym());
    assertEquals("Climbing", master.getConeCollectionMethodDesc());
    assertEquals("2", master.getConeCollectionMethod2Code());
    assertEquals("12", master.getGwGvo());
    assertEquals("North", master.getCollectionLatDesc());
    assertEquals("West", master.getCollectionLongDesc());
    assertEquals("M", master.getSpz());
    assertEquals(BigDecimal.ZERO, master.getOverrideCnt());
    assertEquals("100.50", master.getGeoArea());
    assertEquals("Interior Douglas-fir", master.getSpeciesDesc());
    assertEquals("Cariboo-Chilcotin Natural Resource District", master.getCollectionOrgUnitDesc());
    assertNull(master.getCollectionProv());
    assertEquals("declarer", master.getSubmittedByUser());
  }

  @Test
  @DisplayName("assemble builds ownership rows with payment and funding descriptions")
  void assemble_shouldPopulateOwnershipRows() {
    Seedlot seedlot = baseSeedlot();
    stubHappyPath(seedlot, bclassForm());

    Sprr001ReportData data = assembler.assemble(seedlot);

    assertEquals(1, data.ownershipRows().size());
    assertEquals("00012797", data.ownershipRows().get(0).getClientNumber());
    assertEquals("Client account", data.ownershipRows().get(0).getMethodOfPaymentDesc());
    assertEquals("Incremental Tree Improvement", data.ownershipRows().get(0).getSparFundSrceDesc());
  }

  @Test
  @DisplayName("assemble uses the approved user when it is not the copied-lot sentinel")
  void assemble_approvedUser_shouldPrintOnReport() {
    Seedlot seedlot = baseSeedlot();
    seedlot.setApprovedUserId("approver");
    stubHappyPath(seedlot, bclassForm());

    assertEquals("approver", assembler.assemble(seedlot).mainRow().getSubmittedByUser());
  }

  @Test
  @DisplayName("assemble skips blank genetic-worth traits and ownership without payment codes")
  void assemble_skipsBlankTraitsAndPaymentCodes() {
    Seedlot seedlot = baseSeedlot();
    SeedlotFormOwnershipDto ownership =
        new SeedlotFormOwnershipDto(
            "00012797", "00", new BigDecimal("100"), BigDecimal.ZERO, BigDecimal.ZERO, null, "ITC");
    SeedlotBclassFormDto form =
        new SeedlotBclassFormDto(
            bclassCollection(),
            List.of(ownership),
            bclassForm().interimStep(),
            bclassForm().extractionStep(),
            bclassForm().collectionGeometry(),
            List.of(new SeedPlanZoneDto("M", "Maritime", false)),
            List.of(
                new GeneticWorthTraitsDto(null, new BigDecimal("9"), null, null),
                new GeneticWorthTraitsDto("GVO", null, null, null),
                new GeneticWorthTraitsDto("AD", new BigDecimal("5"), null, null)));
    stubHappyPath(seedlot, form);

    Sprr001ReportData data = assembler.assemble(seedlot);

    assertEquals("5", data.mainRow().getGwAd());
    assertNull(data.mainRow().getGwGvo());
    assertNull(data.ownershipRows().get(0).getMethodOfPaymentDesc());
  }

  @Test
  @DisplayName("assemble tolerates missing forest client and empty cone methods")
  void assemble_missingClientAndMethods_shouldSucceed() {
    Seedlot seedlot = baseSeedlot();
    seedlot.setIntendedForCrownLand(false);
    seedlot.setSourceInBc(null);
    seedlot.setApplicantClientNumber(null);

    SeedlotFormCollectionDtoClassB collection = bclassCollection();
    SeedlotFormInterimDto interim =
        new SeedlotFormInterimDto(null, null, null, null, null, "OCV");
    SeedlotFormExtractionDto extraction =
        new SeedlotFormExtractionDto(null, null, null, null, null, null, null, null);
    SeedlotBclassFormDto form =
        new SeedlotBclassFormDto(
            collection, List.of(), interim, extraction, null, List.of(), List.of());

    when(seedlotService.buildBclassFormData(seedlot)).thenReturn(form);
    when(seedlotCollectionMethodRepository.findAllBySeedlot_id(SEEDLOT_NUMBER))
        .thenReturn(List.of());
    when(forestClientService.fetchClient(anyString())).thenReturn(Optional.empty());

    Sprr001ReportData data = assembler.assemble(seedlot);

    assertNotNull(data.mainRow());
    assertEquals("N", data.mainRow().getToBeRegistrdInd());
    assertNull(data.mainRow().getBcSource());
    assertNull(data.mainRow().getConeCollectionMethodDesc());
    assertNull(data.mainRow().getGeoArea());
    assertEquals(0, data.ownershipRows().size());
  }

  @Test
  @DisplayName("assemble hides the COPIED_LOT sentinel and falls back to declaration user")
  void assemble_copiedLotSentinel_shouldFallBackToDeclarationUser() {
    Seedlot seedlot = baseSeedlot();
    seedlot.setApprovedUserId("COPIED_LOT");
    SeedlotBclassFormDto form = bclassForm();

    when(seedlotService.buildBclassFormData(seedlot)).thenReturn(form);
    when(seedlotCollectionMethodRepository.findAllBySeedlot_id(SEEDLOT_NUMBER))
        .thenReturn(List.of());
    when(methodOfPaymentRepository.findAllByMethodOfPaymentCodeIn(List.of("CLA")))
        .thenReturn(List.of());
    stubForestClient();

    Sprr001ReportData data = assembler.assemble(seedlot);

    assertEquals("declarer", data.mainRow().getSubmittedByUser());
  }

  private void stubHappyPath(Seedlot seedlot, SeedlotBclassFormDto form) {
    when(seedlotService.buildBclassFormData(seedlot)).thenReturn(form);
    when(oracleApiProvider.getVegetationCode("FDI"))
        .thenReturn(Optional.of(new CodeDescriptionDto("FDI", "Interior Douglas-fir")));
    when(oracleApiProvider.getAllDistrictOrgUnits())
        .thenReturn(
            List.of(new OrgUnitDistrictDto(73, "Cariboo-Chilcotin Natural Resource District")));
    when(oracleApiProvider.getAllValidFundingSources())
        .thenReturn(List.of(new CodeDescriptionDto("ITC", "Incremental Tree Improvement")));
    stubForestClient();

    ConeCollectionMethodEntity method1 = new ConeCollectionMethodEntity();
    method1.setConeCollectionMethodCode(1);
    method1.setDescription("Climbing");
    ConeCollectionMethodEntity method2 = new ConeCollectionMethodEntity();
    method2.setConeCollectionMethodCode(2);
    method2.setDescription("Squirrel cache");
    when(seedlotCollectionMethodRepository.findAllBySeedlot_id(SEEDLOT_NUMBER))
        .thenReturn(
            List.of(
                new SeedlotCollectionMethod(seedlot, method1),
                new SeedlotCollectionMethod(seedlot, method2)));

    MethodOfPaymentEntity payment = new MethodOfPaymentEntity("CLA", "Client account", DATE_RANGE);
    when(methodOfPaymentRepository.findAllByMethodOfPaymentCodeIn(List.of("CLA")))
        .thenReturn(List.of(payment));
  }

  private Seedlot baseSeedlot() {
    Seedlot seedlot = new Seedlot(SEEDLOT_NUMBER);
    seedlot.setApplicantClientNumber("00012797");
    seedlot.setApplicantLocationCode("00");
    seedlot.setApplicantEmailAddress("a@b.ca");
    seedlot.setVegetationCode("FDI");
    seedlot.setIntendedForCrownLand(true);
    seedlot.setSourceInBc(true);
    seedlot.setElevation(800);
    seedlot.setGeneticClass(new GeneticClassEntity("B", "B class", DATE_RANGE));
    seedlot.setSeedlotStatus(new SeedlotStatusEntity("PND", "Pending", DATE_RANGE));
    seedlot.setAuditInformation(new AuditInformation("creator"));
    seedlot.setDeclarationOfTrueInformationUserId("declarer");
    seedlot.setDeclarationOfTrueInformationTimestamp(
        LocalDateTime.of(2024, Month.DECEMBER, 1, 10, 0));
    return seedlot;
  }

  private SeedlotBclassFormDto bclassForm() {
    SeedlotFormOwnershipDto ownership =
        new SeedlotFormOwnershipDto(
            "00012797",
            "00",
            new BigDecimal("100"),
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            "CLA",
            "ITC");
    SeedlotFormInterimDto interim =
        new SeedlotFormInterimDto(
            "00012797",
            "00",
            LocalDate.of(2024, Month.OCTOBER, 1),
            LocalDate.of(2024, Month.OCTOBER, 31),
            null,
            "OCV");
    SeedlotFormExtractionDto extraction =
        new SeedlotFormExtractionDto(
            "00012797",
            "00",
            LocalDate.of(2024, Month.NOVEMBER, 1),
            LocalDate.of(2024, Month.NOVEMBER, 30),
            "00012797",
            "00",
            LocalDate.of(2024, Month.DECEMBER, 1),
            LocalDate.of(2024, Month.DECEMBER, 31));
    SeedlotCollectionGeometryDto geometry =
        new SeedlotCollectionGeometryDto(
            SEEDLOT_NUMBER,
            "{\"type\":\"Polygon\"}",
            1,
            new BigDecimal("100.50"),
            new BigDecimal("40.00"),
            LocalDateTime.of(2024, Month.SEPTEMBER, 15, 12, 0),
            1);
    return new SeedlotBclassFormDto(
        bclassCollection(),
        List.of(ownership),
        interim,
        extraction,
        geometry,
        List.of(new SeedPlanZoneDto("M", "Maritime", false)),
        List.of(new GeneticWorthTraitsDto("GVO", new BigDecimal("12"), null, null)));
  }

  private SeedlotFormCollectionDtoClassB bclassCollection() {
    return new SeedlotFormCollectionDtoClassB(
        "00012797",
        "00",
        LocalDate.of(2024, Month.SEPTEMBER, 1),
        LocalDate.of(2024, Month.SEPTEMBER, 30),
        new BigDecimal("2"),
        new BigDecimal("4"),
        new BigDecimal("8"),
        "comment",
        List.of(1, 2),
        "South ridge",
        73,
        "Y",
        new BigDecimal("500"),
        "CLIMB",
        "M",
        "Y",
        "001",
        "Y",
        "N",
        null,
        "GT5",
        "N",
        "N",
        null,
        49,
        30,
        0,
        123,
        0,
        0,
        800,
        600,
        1000,
        600,
        1000,
        49,
        0,
        50,
        0,
        122,
        0,
        124,
        0,
        0,
        0,
        0,
        0,
        null,
        'N',
        'W',
        "CDF",
        "Coastal Douglas-fir",
        "mm",
        '1',
        12,
        null);
  }

  private void stubForestClient() {
    ForestClientDto client =
        new ForestClientDto(
            "00012797",
            "ACME FORESTS",
            null,
            null,
            ForestClientStatusEnum.ACT,
            ForestClientTypeEnum.C,
            "ACME");
    ForestClientLocationDto location =
        new ForestClientLocationDto(
            "00012797",
            "00",
            "Office",
            "01382",
            "123 Main St",
            null,
            null,
            "VICTORIA",
            "BC",
            "V8W1A1",
            "CANADA",
            null,
            null,
            null,
            null,
            null,
            ForestClientExpiredEnum.N,
            ForestClientExpiredEnum.N,
            null,
            null);
    when(forestClientService.fetchClient(anyString())).thenReturn(Optional.of(client));
    when(forestClientService.fetchSingleClientLocation(anyString(), anyString()))
        .thenReturn(location);
  }
}
