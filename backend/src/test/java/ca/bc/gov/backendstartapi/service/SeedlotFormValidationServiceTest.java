package ca.bc.gov.backendstartapi.service;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;

import ca.bc.gov.backendstartapi.dto.ForestClientLocationDto;
import ca.bc.gov.backendstartapi.dto.OrchardDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOwnershipDto;
import ca.bc.gov.backendstartapi.entity.ActiveOrchardSpuEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.enums.ForestClientExpiredEnum;
import ca.bc.gov.backendstartapi.exception.SeedlotSubmissionValidationException;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.repository.ConeCollectionMethodRepository;
import ca.bc.gov.backendstartapi.repository.GameticMethodologyRepository;
import ca.bc.gov.backendstartapi.repository.MethodOfPaymentRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(SpringExtension.class)
class SeedlotFormValidationServiceTest {

  @Mock Provider oracleApiProvider;

  @Mock OrchardService orchardService;

  @Mock ForestClientService forestClientService;

  @Mock GameticMethodologyRepository gameticMethodologyRepository;

  @Mock ConeCollectionMethodRepository coneCollectionMethodRepository;

  @Mock MethodOfPaymentRepository methodOfPaymentRepository;

  private SeedlotFormValidationService service;

  @BeforeEach
  void setup() {
    service =
        new SeedlotFormValidationService(
            oracleApiProvider,
            orchardService,
            forestClientService,
            gameticMethodologyRepository,
            coneCollectionMethodRepository,
            methodOfPaymentRepository);
  }

  // ----- helpers -----------------------------------------------------------

  /** Creates a seedlot with vegetationCode "PLI" so species checks are meaningful. */
  private Seedlot validSeedlot() {
    Seedlot s = new Seedlot("63000");
    s.setVegetationCode("PLI");
    return s;
  }

  /**
   * Stubs the mocks so that orchard {@code orchardId} exists, has vegCode {@code vegCode}, is
   * active (SPU present), and both gametic codes ("F3", "M3") are valid. Uses lenient() to avoid
   * UnnecessaryStubbingException when individual tests only exercise a subset.
   */
  private void stubValidOrchard(String orchardId, String vegCode) {
    OrchardDto dto =
        new OrchardDto(orchardId, "Test Orchard", vegCode, 'S', "Seed Lot", "PRD",
            null, null, null, null, null, null);
    lenient().when(oracleApiProvider.findOrchardById(orchardId)).thenReturn(Optional.of(dto));
    lenient()
        .when(orchardService.findSpuIdByOrchard(orchardId))
        .thenReturn(
            Optional.of(new ActiveOrchardSpuEntity(orchardId, 7, true, false, false)));
    lenient().when(gameticMethodologyRepository.existsById("F3")).thenReturn(true);
    lenient().when(gameticMethodologyRepository.existsById("M3")).thenReturn(true);
  }

  /**
   * Lenient-stubs forestClientService so any fetchSingleClientLocation call succeeds.
   * Reused by collection step tests and must be called in any test that runs validateSeedlotForm
   * with a form that has a non-null collectionClientNumber/collectionLocnCode.
   */
  private void stubValidForestClient() {
    ForestClientLocationDto loc =
        new ForestClientLocationDto(
            "00012797", "00", "Main Office", "01382",
            "123 Forest Way", null, null,
            "VICTORIA", "BC", "V8W1A1", "CANADA",
            null, null, null, null, null,
            ForestClientExpiredEnum.N, ForestClientExpiredEnum.N,
            null, null);
    lenient()
        .when(forestClientService.fetchSingleClientLocation(anyString(), anyString()))
        .thenReturn(loc);
  }

  /**
   * Lenient-stubs coneCollectionMethodRepository so any existsById call returns true.
   * Reused by collection step tests.
   */
  private void stubValidConeMethods() {
    lenient()
        .when(coneCollectionMethodRepository.existsById(anyInt()))
        .thenReturn(true);
  }

  /**
   * Lenient-stubs methodOfPaymentRepository so any existsById call returns true.
   * Must be called in any test that runs validateSeedlotForm with a form that has owners.
   */
  private void stubValidMethodOfPayment() {
    lenient()
        .when(methodOfPaymentRepository.existsById(anyString()))
        .thenReturn(true);
  }

  // ----- smoke test --------------------------------------------------------

  @Test
  @DisplayName("Smoke test: valid form with fully-stubbed mocks passes validation")
  void validateSeedlotForm_smoke_shouldPassWithNoErrors() {
    // Stub both orchards (405 primary, 406 secondary) from TestSeedlotForms.valid()
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot(); // vegetationCode = "PLI"
    Assertions.assertDoesNotThrow(
        () -> service.validateSeedlotForm(seedlot, TestSeedlotForms.valid()));
  }

  // ----- O1: orchard does not exist ----------------------------------------

  @Test
  @DisplayName("O1: non-existent orchard is rejected")
  void orchard_doesNotExist_isRejected() {
    lenient().when(oracleApiProvider.findOrchardById("999")).thenReturn(Optional.empty());
    lenient().when(gameticMethodologyRepository.existsById("F3")).thenReturn(true);
    lenient().when(gameticMethodologyRepository.existsById("M3")).thenReturn(true);
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot();
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () -> service.validateSeedlotForm(seedlot, TestSeedlotForms.withOrchardPrimary("999")));
    Assertions.assertFalse(ex.getErrors().isEmpty(), "Expected at least one validation error");
    boolean hasOrchardError =
        ex.getErrors().stream()
            .anyMatch(e -> e.fieldId().equals("seedlotFormOrchardDto.primaryOrchardId"));
    Assertions.assertTrue(hasOrchardError, "Expected error on primaryOrchardId field");
  }

  // ----- O2: species mismatch (HEADLINE) ------------------------------------

  @Test
  @DisplayName("O2: orchard species mismatch is rejected")
  void orchard_speciesMismatch_isRejected() {
    // Seedlot is PLI; orchard 405 has vegCode FDC -> mismatch
    stubValidOrchard("405", "FDC");
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot(); // vegetationCode = "PLI"
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot, TestSeedlotForms.withOrchardPrimary("405")));
    boolean hasOrchardError =
        ex.getErrors().stream()
            .anyMatch(e -> e.fieldId().equals("seedlotFormOrchardDto.primaryOrchardId"));
    Assertions.assertTrue(
        hasOrchardError, "Expected error on primaryOrchardId field for species mismatch");
  }

  // ----- O3: orchard not active --------------------------------------------

  @Test
  @DisplayName("O3: inactive orchard is rejected")
  void orchard_notActive_isRejected() {
    // Orchard exists, vegCode matches seedlot ("PLI"), but no active SPU
    OrchardDto dto =
        new OrchardDto("405", "Test Orchard", "PLI", 'S', "Seed Lot", "PRD",
            null, null, null, null, null, null);
    lenient().when(oracleApiProvider.findOrchardById("405")).thenReturn(Optional.of(dto));
    lenient().when(orchardService.findSpuIdByOrchard("405")).thenReturn(Optional.empty());
    lenient().when(gameticMethodologyRepository.existsById("F3")).thenReturn(true);
    lenient().when(gameticMethodologyRepository.existsById("M3")).thenReturn(true);
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot();
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot, TestSeedlotForms.withOrchardPrimary("405")));
    boolean hasNotActiveError =
        ex.getErrors().stream()
            .anyMatch(
                e ->
                    e.fieldId().equals("seedlotFormOrchardDto.primaryOrchardId")
                        && e.message().contains("is not active"));
    Assertions.assertTrue(hasNotActiveError, "Expected 'is not active' error on primaryOrchardId");
  }

  // ----- O2: species mismatch message content --------------------------------

  @Test
  @DisplayName("O2 (strengthened): species-mismatch error message contains the orchard species code")
  void orchard_speciesMismatch_errorMessageContainsOrchardSpecies() {
    // Seedlot is PLI; orchard 405 has vegCode FDC -> message should mention "FDC"
    stubValidOrchard("405", "FDC");
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot(); // vegetationCode = "PLI"
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot, TestSeedlotForms.withOrchardPrimary("405")));
    boolean hasMessageWithSpecies =
        ex.getErrors().stream()
            .anyMatch(
                e ->
                    e.fieldId().equals("seedlotFormOrchardDto.primaryOrchardId")
                        && e.message().contains("FDC"));
    Assertions.assertTrue(
        hasMessageWithSpecies,
        "Expected species-mismatch error message to contain the orchard species 'FDC'");
  }

  // ----- O4: invalid secondary orchard -------------------------------------

  @Test
  @DisplayName("O4: non-existent secondary orchard is rejected")
  void orchard_invalidSecondary_isRejected() {
    // Primary 405 is valid, active, species-matching; secondary 406 does not exist
    stubValidOrchard("405", "PLI");
    lenient().when(oracleApiProvider.findOrchardById("406")).thenReturn(Optional.empty());
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot(); // vegetationCode = "PLI"
    // TestSeedlotForms.valid() has primary "405" and secondary "406"
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () -> service.validateSeedlotForm(seedlot, TestSeedlotForms.valid()));
    boolean hasSecondaryError =
        ex.getErrors().stream()
            .anyMatch(e -> e.fieldId().equals("seedlotFormOrchardDto.secondaryOrchardId"));
    Assertions.assertTrue(hasSecondaryError, "Expected error on secondaryOrchardId field");
  }

  // ----- O5: invalid gametic code ------------------------------------------

  @Test
  @DisplayName("O5: invalid female gametic method code is rejected")
  void orchard_invalidGameticCode_isRejected() {
    // Orchard valid + active + matching species, but femaleGameticMthdCode "F3" unknown
    stubValidOrchard("405", "PLI");
    lenient().when(gameticMethodologyRepository.existsById("F3")).thenReturn(false);
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot();
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot, TestSeedlotForms.withOrchardPrimary("405")));
    boolean hasGameticError =
        ex.getErrors().stream()
            .anyMatch(e -> e.fieldId().equals("seedlotFormOrchardDto.femaleGameticMthdCode"));
    Assertions.assertTrue(
        hasGameticError, "Expected error on femaleGameticMthdCode field");
  }

  @Test
  @DisplayName("O5: invalid male gametic method code is rejected")
  void orchard_invalidMaleGameticCode_isRejected() {
    // Orchard valid + active + matching species; female "F3" valid but male "M3" unknown
    stubValidOrchard("405", "PLI");
    lenient().when(gameticMethodologyRepository.existsById("F3")).thenReturn(true);
    lenient().when(gameticMethodologyRepository.existsById("M3")).thenReturn(false);
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot();
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot, TestSeedlotForms.withOrchardPrimary("405")));
    boolean hasMaleGameticError =
        ex.getErrors().stream()
            .anyMatch(e -> e.fieldId().equals("seedlotFormOrchardDto.maleGameticMthdCode"));
    boolean hasNoFemaleError =
        ex.getErrors().stream()
            .noneMatch(e -> e.fieldId().equals("seedlotFormOrchardDto.femaleGameticMthdCode"));
    Assertions.assertTrue(hasMaleGameticError, "Expected error on maleGameticMthdCode field");
    Assertions.assertTrue(hasNoFemaleError, "Expected no error on femaleGameticMthdCode field");
  }

  // ----- O7: pollen contamination percentage --------------------------------

  @Test
  @DisplayName("O7: pollen contamination percentage out of range is rejected")
  void orchard_pollenContaminationPctOutOfRange_isRejected() {
    // Orchard valid + active + matching species + valid gametic codes; pct=150 is invalid
    stubValidOrchard("405", "PLI");
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot();
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot, TestSeedlotForms.withPollenContamination("405", true, 150)));
    boolean hasPollenPctError =
        ex.getErrors().stream()
            .anyMatch(e -> e.fieldId().equals("seedlotFormOrchardDto.pollenContaminationPct"));
    Assertions.assertTrue(hasPollenPctError, "Expected error on pollenContaminationPct field");
  }

  @Test
  @DisplayName("O7: pollen contamination percentage null when ind=true is rejected")
  void orchard_pollenContaminationPctNull_isRejected() {
    // Orchard valid + active + matching species + valid gametic codes; pct=null when ind=true
    stubValidOrchard("405", "PLI");
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot();
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot, TestSeedlotForms.withPollenContamination("405", true, null)));
    boolean hasPollenPctError =
        ex.getErrors().stream()
            .anyMatch(e -> e.fieldId().equals("seedlotFormOrchardDto.pollenContaminationPct"));
    Assertions.assertTrue(
        hasPollenPctError, "Expected error on pollenContaminationPct when null with ind=true");
  }

  // ----- happy path --------------------------------------------------------

  @Test
  @DisplayName("Happy path: valid orchard, matching species, active, valid gametic codes passes")
  void orchard_validOrchard_passes() {
    stubValidOrchard("405", "PLI");
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot();
    Assertions.assertDoesNotThrow(
        () ->
            service.validateSeedlotForm(
                seedlot, TestSeedlotForms.withOrchardPrimary("405")));
  }

  // ----- Collection step tests (C1-C4) ------------------------------------

  @Test
  @DisplayName("C1: client/location not found (404) is rejected")
  void collection_clientLocationNotFound_isRejected() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();
    // Override the specific collection client/location call to throw 404
    lenient()
        .when(forestClientService.fetchSingleClientLocation("00012797", "00"))
        .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "nf"));

    Seedlot seedlot = validSeedlot();
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () -> service.validateSeedlotForm(seedlot, TestSeedlotForms.valid()));
    boolean hasError =
        ex.getErrors().stream()
            .anyMatch(
                e -> e.fieldId().equals("seedlotFormCollectionDto.collectionClientNumber"));
    Assertions.assertTrue(hasError, "Expected error on collectionClientNumber field");
  }

  @Test
  @DisplayName("C3: collection end date before start date is rejected")
  void collection_endDateBeforeStart_isRejected() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI"); // secondary orchard in valid() base form
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot();
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot,
                    TestSeedlotForms.withCollectionDates(
                        LocalDate.of(2024, 5, 10), LocalDate.of(2024, 5, 1))));
    // Only the collection date error should be present (no spurious secondary-orchard error)
    Assertions.assertTrue(
        ex.getErrors().stream()
            .allMatch(e -> e.fieldId().startsWith("seedlotFormCollectionDto")),
        "Expected only collection-step errors");
    boolean hasError =
        ex.getErrors().stream()
            .anyMatch(
                e -> e.fieldId().equals("seedlotFormCollectionDto.collectionEndDate"));
    Assertions.assertTrue(hasError, "Expected error on collectionEndDate field");
  }

  @Test
  @DisplayName("C2: invalid cone collection method code is rejected")
  void collection_invalidConeMethodCode_isRejected() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI"); // secondary orchard in valid() base form
    stubValidForestClient();
    stubValidMethodOfPayment();
    // Override: code 99 is invalid; leave anyInt() stub from stubValidConeMethods but override 99
    lenient().when(coneCollectionMethodRepository.existsById(anyInt())).thenReturn(true);
    lenient().when(coneCollectionMethodRepository.existsById(99)).thenReturn(false);

    Seedlot seedlot = validSeedlot();
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot, TestSeedlotForms.withConeCollectionMethodCodes(List.of(99))));
    // Only the collection error should be present (no spurious secondary-orchard error)
    Assertions.assertTrue(
        ex.getErrors().stream()
            .allMatch(e -> e.fieldId().startsWith("seedlotFormCollectionDto")),
        "Expected only collection-step errors");
    boolean hasError =
        ex.getErrors().stream()
            .anyMatch(
                e -> e.fieldId().equals("seedlotFormCollectionDto.coneCollectionMethodCodes"));
    Assertions.assertTrue(hasError, "Expected error on coneCollectionMethodCodes field");
  }

  @Test
  @DisplayName("C4: non-positive collection quantity (noOfContainers) is rejected")
  void collection_nonPositiveVolume_isRejected() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI"); // secondary orchard in valid() base form
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot();

    // Zero should be rejected
    SeedlotSubmissionValidationException exZero =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot,
                    TestSeedlotForms.withCollectionContainers(BigDecimal.ZERO)));
    boolean hasZeroError =
        exZero.getErrors().stream()
            .anyMatch(
                e ->
                    e.fieldId().equals("seedlotFormCollectionDto.noOfContainers")
                        && e.message().equals("Value must be greater than zero."));
    Assertions.assertTrue(hasZeroError, "Expected noOfContainers error for zero");

    // Negative should also be rejected
    SeedlotSubmissionValidationException exNeg =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot,
                    TestSeedlotForms.withCollectionContainers(new BigDecimal("-1"))));
    boolean hasNegError =
        exNeg.getErrors().stream()
            .anyMatch(
                e ->
                    e.fieldId().equals("seedlotFormCollectionDto.noOfContainers")
                        && e.message().equals("Value must be greater than zero."));
    Assertions.assertTrue(hasNegError, "Expected noOfContainers error for negative value");
  }

  @Test
  @DisplayName("C1: upstream 5xx from forest client propagates as ResponseStatusException")
  void collection_upstream5xx_propagates() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");
    stubValidConeMethods();
    stubValidMethodOfPayment();
    lenient()
        .when(forestClientService.fetchSingleClientLocation(anyString(), anyString()))
        .thenThrow(
            new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR, "upstream error"));

    Seedlot seedlot = validSeedlot();
    Assertions.assertThrows(
        ResponseStatusException.class,
        () -> service.validateSeedlotForm(seedlot, TestSeedlotForms.valid()),
        "Expected 5xx ResponseStatusException to propagate unchanged");
  }

  @Test
  @DisplayName("C1: upstream 403 (non-404 4xx) from forest client propagates, not a validation error")
  void collection_clientLocationForbidden_propagates() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();
    // Override the specific collection client/location call to throw 403
    lenient()
        .when(forestClientService.fetchSingleClientLocation("00012797", "00"))
        .thenThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "forbidden"));

    Seedlot seedlot = validSeedlot();
    // A 403 indicates a programming/config error and must propagate, NOT become a
    // SeedlotSubmissionValidationException "does not exist" error.
    Assertions.assertThrows(
        ResponseStatusException.class,
        () -> service.validateSeedlotForm(seedlot, TestSeedlotForms.valid()),
        "Expected 403 ResponseStatusException to propagate unchanged");
  }

  @Test
  @DisplayName("C1-C4: happy path — valid collection form passes")
  void collection_validForm_passes() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot();
    Assertions.assertDoesNotThrow(
        () -> service.validateSeedlotForm(seedlot, TestSeedlotForms.valid()));
  }

  // ----- Ownership step tests (OW1-OW5) ------------------------------------

  @Test
  @DisplayName("OW3: owned percentages not summing to 100 is rejected")
  void owners_percentDoesNotSumTo100_isRejected() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    // Two owners: 60 + 30 = 90, not 100
    Seedlot seedlot = validSeedlot();
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot,
                    TestSeedlotForms.withOwners(
                        TestSeedlotForms.owner("00012797", "00", new BigDecimal("60")),
                        TestSeedlotForms.owner("00012798", "00", new BigDecimal("30")))));
    boolean hasError =
        ex.getErrors().stream()
            .anyMatch(e -> e.fieldId().equals("seedlotFormOwnershipDtoList"));
    Assertions.assertTrue(hasError, "Expected error on seedlotFormOwnershipDtoList for sum != 100");
  }

  @Test
  @DisplayName("OW4: reserved + surplus > owned is rejected")
  void owners_reservedPlusSurplusExceedsOwned_isRejected() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    // owned=100, rsrvd=80, srpls=30 -> 80+30=110 > 100
    Seedlot seedlot = validSeedlot();
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot,
                    TestSeedlotForms.withOwners(
                        TestSeedlotForms.ownerFull(
                            "00012797", "00",
                            new BigDecimal("100"),
                            new BigDecimal("80"),
                            new BigDecimal("30")))));
    boolean hasError =
        ex.getErrors().stream()
            .anyMatch(
                e -> e.fieldId().equals("seedlotFormOwnershipDtoList[0].originalPctRsrvd"));
    Assertions.assertTrue(
        hasError, "Expected error on originalPctRsrvd when reserved+surplus exceeds owned");
  }

  @Test
  @DisplayName("OW2: invalid method of payment code is rejected")
  void owners_invalidPaymentCode_isRejected() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");
    stubValidForestClient();
    stubValidConeMethods();
    // Override: "BAD_CODE" is invalid; any other code (via anyString) is valid
    lenient().when(methodOfPaymentRepository.existsById(anyString())).thenReturn(true);
    lenient().when(methodOfPaymentRepository.existsById("BAD_CODE")).thenReturn(false);

    // Build owner with a bad payment code directly using the record constructor
    SeedlotFormOwnershipDto ownerWithBadCode =
        new SeedlotFormOwnershipDto(
            "00012797",
            "00",
            new BigDecimal("100"),
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            "BAD_CODE",
            "ITC");

    Seedlot seedlot = validSeedlot();
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot, TestSeedlotForms.withOwners(ownerWithBadCode)));
    boolean hasError =
        ex.getErrors().stream()
            .anyMatch(
                e -> e.fieldId().equals("seedlotFormOwnershipDtoList[0].methodOfPaymentCode"));
    Assertions.assertTrue(hasError, "Expected error on methodOfPaymentCode for invalid code");
  }

  @Test
  @DisplayName("OW5: duplicate owner client+location pair is rejected")
  void owners_duplicatePair_isRejected() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    // Two owners with same client+locn (50+50=100 so OW3 passes), but duplicate pair
    Seedlot seedlot = validSeedlot();
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot,
                    TestSeedlotForms.withOwners(
                        TestSeedlotForms.owner("00012797", "00", new BigDecimal("50")),
                        TestSeedlotForms.owner("00012797", "00", new BigDecimal("50")))));
    boolean hasError =
        ex.getErrors().stream()
            .anyMatch(
                e ->
                    e.fieldId().equals("seedlotFormOwnershipDtoList[1].ownerClientNumber")
                        && e.message().contains("Duplicate owner"));
    Assertions.assertTrue(hasError, "Expected duplicate-pair error on ownerClientNumber");
  }

  @Test
  @DisplayName("OW1: owner client/location not found (404) is rejected")
  void owners_clientLocationNotFound_isRejected() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");
    // stubValidForestClient makes anyString/anyString succeed; override specific pair to 404
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();
    // Owner uses client "00099999" / locn "99" — override to throw 404
    lenient()
        .when(forestClientService.fetchSingleClientLocation("00099999", "99"))
        .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "not found"));

    Seedlot seedlot = validSeedlot();
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot,
                    TestSeedlotForms.withOwners(
                        TestSeedlotForms.owner("00099999", "99", new BigDecimal("100")))));
    boolean hasError =
        ex.getErrors().stream()
            .anyMatch(
                e -> e.fieldId().equals("seedlotFormOwnershipDtoList[0].ownerClientNumber"));
    Assertions.assertTrue(
        hasError, "Expected error on ownerClientNumber when client/location is not found");
  }

  @Test
  @DisplayName("OW1-OW5: happy path — valid single owner (100%) passes")
  void owners_validSingleOwner_passes() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot();
    Assertions.assertDoesNotThrow(
        () ->
            service.validateSeedlotForm(
                seedlot,
                TestSeedlotForms.withOwners(
                    TestSeedlotForms.owner("00012797", "00", new BigDecimal("100")))));
  }

  // ----- Interim step tests (I1-I3) ----------------------------------------

  @Test
  @DisplayName("I2: OTH facility without description (null) is rejected")
  void interim_otherFacilityWithoutDescription_isRejected() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot();
    // null description
    SeedlotSubmissionValidationException exNull =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot, TestSeedlotForms.withInterimFacility("OTH", null)));
    boolean hasNullError =
        exNull.getErrors().stream()
            .anyMatch(
                e ->
                    e.fieldId()
                        .equals("seedlotFormInterimDto.intermOtherFacilityDesc"));
    Assertions.assertTrue(hasNullError, "Expected error on intermOtherFacilityDesc when null");

    // empty-string description
    SeedlotSubmissionValidationException exEmpty =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot, TestSeedlotForms.withInterimFacility("OTH", "")));
    boolean hasEmptyError =
        exEmpty.getErrors().stream()
            .anyMatch(
                e ->
                    e.fieldId()
                        .equals("seedlotFormInterimDto.intermOtherFacilityDesc"));
    Assertions.assertTrue(hasEmptyError, "Expected error on intermOtherFacilityDesc when empty");

    // whitespace-only description
    SeedlotSubmissionValidationException exBlank =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot, TestSeedlotForms.withInterimFacility("OTH", "   ")));
    boolean hasBlankError =
        exBlank.getErrors().stream()
            .anyMatch(
                e ->
                    e.fieldId()
                        .equals("seedlotFormInterimDto.intermOtherFacilityDesc"));
    Assertions.assertTrue(
        hasBlankError, "Expected error on intermOtherFacilityDesc when whitespace-only");
  }

  @Test
  @DisplayName("I2: OTH facility with description passes")
  void interim_otherFacilityWithDescription_passes() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot();
    Assertions.assertDoesNotThrow(
        () ->
            service.validateSeedlotForm(
                seedlot, TestSeedlotForms.withInterimFacility("OTH", "Barn")));
  }

  @Test
  @DisplayName("I3: interim end date before start date is rejected")
  void interim_endDateBeforeStart_isRejected() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot();
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot,
                    TestSeedlotForms.withInterimDates(
                        LocalDate.of(2024, 6, 10), LocalDate.of(2024, 6, 1))));
    boolean hasError =
        ex.getErrors().stream()
            .anyMatch(
                e -> e.fieldId().equals("seedlotFormInterimDto.intermStrgEndDate"));
    Assertions.assertTrue(hasError, "Expected error on intermStrgEndDate when end is before start");
  }

  @Test
  @DisplayName("I1: interim client/location not found (404) is rejected")
  void interim_clientLocationNotFound_isRejected() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");
    // Make any client/locn pass by default, then override the specific interim pair to 404
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();
    // Use a distinct client/locn that won't collide with the collection "00012797"/"00" stub
    lenient()
        .when(forestClientService.fetchSingleClientLocation("00099998", "01"))
        .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "not found"));

    Seedlot seedlot = validSeedlot();
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot, TestSeedlotForms.withInterimClient("00099998", "01")));
    boolean hasError =
        ex.getErrors().stream()
            .anyMatch(
                e -> e.fieldId().equals("seedlotFormInterimDto.intermStrgClientNumber"));
    Assertions.assertTrue(
        hasError, "Expected error on intermStrgClientNumber when client/location not found");
  }

  @Test
  @DisplayName("I1-I3: happy path — valid interim step passes")
  void interim_validForm_passes() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot();
    Assertions.assertDoesNotThrow(
        () -> service.validateSeedlotForm(seedlot, TestSeedlotForms.valid()));
  }

  // ----- Extraction step tests (E1-E3) ----------------------------------------

  @Test
  @DisplayName("E2: storage client/location not found (404) is rejected")
  void extraction_storageClientNotFound_isRejected() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");
    // Make any client/locn pass by default, then override the specific storage pair to 404
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();
    // Use a distinct client/locn for storage that won't collide with collection/interim/owner pairs
    lenient()
        .when(forestClientService.fetchSingleClientLocation("00088887", "02"))
        .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "not found"));

    Seedlot seedlot = validSeedlot();
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot, TestSeedlotForms.withStorageClient("00088887", "02")));
    boolean hasError =
        ex.getErrors().stream()
            .anyMatch(
                e -> e.fieldId().equals("seedlotFormExtractionDto.storageClientNumber"));
    Assertions.assertTrue(
        hasError, "Expected error on seedlotFormExtractionDto.storageClientNumber");
  }

  @Test
  @DisplayName("E1: extractory client/location not found (404) is rejected")
  void extraction_extractoryClientNotFound_isRejected() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");
    // Make any client/locn pass by default, then override the specific extractory pair to 404
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();
    // Use a distinct client/locn for extractory that won't collide with other pairs
    lenient()
        .when(forestClientService.fetchSingleClientLocation("00088886", "03"))
        .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "not found"));

    Seedlot seedlot = validSeedlot();
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot, TestSeedlotForms.withExtractoryClient("00088886", "03")));
    boolean hasError =
        ex.getErrors().stream()
            .anyMatch(
                e -> e.fieldId().equals("seedlotFormExtractionDto.extractoryClientNumber"));
    Assertions.assertTrue(
        hasError, "Expected error on seedlotFormExtractionDto.extractoryClientNumber");
  }

  @Test
  @DisplayName("E3: extraction end date before start date is rejected")
  void extraction_endDateBeforeStart_isRejected() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot();
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot,
                    TestSeedlotForms.withExtractionDates(
                        LocalDate.of(2024, 11, 10), LocalDate.of(2024, 11, 1))));
    boolean hasError =
        ex.getErrors().stream()
            .anyMatch(
                e -> e.fieldId().equals("seedlotFormExtractionDto.extractionEndDate"));
    Assertions.assertTrue(
        hasError, "Expected error on seedlotFormExtractionDto.extractionEndDate");
  }

  @Test
  @DisplayName("E3: temporary storage end date before start date is rejected")
  void extraction_temporaryStorageEndBeforeStart_isRejected() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot();
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot,
                    TestSeedlotForms.withTemporaryStorageDates(
                        LocalDate.of(2024, 12, 10), LocalDate.of(2024, 12, 1))));
    boolean hasError =
        ex.getErrors().stream()
            .anyMatch(
                e -> e.fieldId().equals("seedlotFormExtractionDto.temporaryStrgEndDate"));
    Assertions.assertTrue(
        hasError, "Expected error on seedlotFormExtractionDto.temporaryStrgEndDate");
  }

  @Test
  @DisplayName("E1-E3: happy path — valid extraction step passes")
  void extraction_validForm_passes() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot();
    Assertions.assertDoesNotThrow(
        () -> service.validateSeedlotForm(seedlot, TestSeedlotForms.valid()));
  }

  // ----- Aggregate multi-step error test -------------------------------------

  @Test
  @DisplayName("Aggregate: errors from multiple steps are all collected and thrown together")
  void validate_collectsErrorsAcrossMultipleSteps() {
    // Primary orchard "405" has vegCode "FDC" while seedlot is "PLI" → species mismatch (O2)
    stubValidOrchard("405", "FDC");
    // Secondary orchard "406" is valid, active, and matching so it does not add noise
    stubValidOrchard("406", "PLI");
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    Seedlot seedlot = validSeedlot(); // vegetationCode = "PLI"

    // collection end (May 1) before start (May 10) → C3 date-order error
    SeedlotSubmissionValidationException ex =
        Assertions.assertThrows(
            SeedlotSubmissionValidationException.class,
            () ->
                service.validateSeedlotForm(
                    seedlot,
                    TestSeedlotForms.withOrchardAndCollectionDates(
                        "405",
                        LocalDate.of(2024, 5, 10),
                        LocalDate.of(2024, 5, 1))));

    Assertions.assertTrue(
        ex.getErrors().size() >= 2,
        "Expected at least 2 validation errors (one orchard, one collection), got: "
            + ex.getErrors().size());

    boolean hasOrchardError =
        ex.getErrors().stream()
            .anyMatch(e -> e.fieldId().equals("seedlotFormOrchardDto.primaryOrchardId"));
    Assertions.assertTrue(hasOrchardError, "Expected error on primaryOrchardId (species mismatch)");

    boolean hasCollectionDateError =
        ex.getErrors().stream()
            .anyMatch(e -> e.fieldId().equals("seedlotFormCollectionDto.collectionEndDate"));
    Assertions.assertTrue(
        hasCollectionDateError, "Expected error on collectionEndDate (end before start)");
  }

  @Test
  @DisplayName("OW4 (boundary): reserved + surplus exactly equal to owned passes")
  void owners_reservedPlusSurplusEqualsOwned_passes() {
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");
    stubValidForestClient();
    stubValidConeMethods();
    stubValidMethodOfPayment();

    // owned=100, rsrvd=60, srpls=40 -> 60+40=100 == owned (OW4 uses strictly-greater, so equal
    // passes); owned=100 also satisfies OW3
    Seedlot seedlot = validSeedlot();
    Assertions.assertDoesNotThrow(
        () ->
            service.validateSeedlotForm(
                seedlot,
                TestSeedlotForms.withOwners(
                    TestSeedlotForms.ownerFull(
                        "00012797", "00",
                        new BigDecimal("100"),
                        new BigDecimal("60"),
                        new BigDecimal("40")))));
  }
}
