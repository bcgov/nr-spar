package ca.bc.gov.backendstartapi.service;

import static org.mockito.Mockito.lenient;

import ca.bc.gov.backendstartapi.dto.OrchardDto;
import ca.bc.gov.backendstartapi.entity.ActiveOrchardSpuEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.SeedlotSubmissionValidationException;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.repository.ConeCollectionMethodRepository;
import ca.bc.gov.backendstartapi.repository.GameticMethodologyRepository;
import ca.bc.gov.backendstartapi.repository.MethodOfPaymentRepository;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

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
    // pollen contamination method code from TestSeedlotForms.valid() is "true" — treat as valid
    lenient().when(gameticMethodologyRepository.existsById("true")).thenReturn(true);
  }

  // ----- smoke test --------------------------------------------------------

  @Test
  @DisplayName("Smoke test: valid form with fully-stubbed mocks passes validation")
  void validateSeedlotForm_smoke_shouldPassWithNoErrors() {
    // Stub both orchards (405 primary, 406 secondary) from TestSeedlotForms.valid()
    stubValidOrchard("405", "PLI");
    stubValidOrchard("406", "PLI");

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
    lenient().when(gameticMethodologyRepository.existsById("true")).thenReturn(true);

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
    lenient().when(gameticMethodologyRepository.existsById("true")).thenReturn(true);

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

  // ----- O5: invalid gametic code ------------------------------------------

  @Test
  @DisplayName("O5: invalid female gametic method code is rejected")
  void orchard_invalidGameticCode_isRejected() {
    // Orchard valid + active + matching species, but femaleGameticMthdCode "F3" unknown
    stubValidOrchard("405", "PLI");
    lenient().when(gameticMethodologyRepository.existsById("F3")).thenReturn(false);

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

  // ----- happy path --------------------------------------------------------

  @Test
  @DisplayName("Happy path: valid orchard, matching species, active, valid gametic codes passes")
  void orchard_validOrchard_passes() {
    stubValidOrchard("405", "PLI");

    Seedlot seedlot = validSeedlot();
    Assertions.assertDoesNotThrow(
        () ->
            service.validateSeedlotForm(
                seedlot, TestSeedlotForms.withOrchardPrimary("405")));
  }
}
