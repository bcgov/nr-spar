package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.SaveSeedlotFormDto;
import ca.bc.gov.backendstartapi.entity.SaveSeedlotProgressEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.repository.SaveSeedlotProgressRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import ca.bc.gov.backendstartapi.security.UserInfo;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(SpringExtension.class)
class SaveSeedlotFormServiceTest {

  @Mock SaveSeedlotProgressRepository saveSeedlotProgressRepository;
  @Mock SeedlotRepository seedlotRepository;
  @Mock LoggedUserService loggedUserService;
  @Mock SeedlotStatusService seedlotStatusService;

  private SaveSeedlotFormService saveSeedlotFormService;

  private static final String SEEDLOT_NUMBER_A = "678123";
  private static final String SEEDLOT_NUMBER_B = "531234";

  private final Seedlot testSeedlotA = new Seedlot(SEEDLOT_NUMBER_A);
  private final Seedlot testSeedlotB = new Seedlot(SEEDLOT_NUMBER_B);
  private final SeedlotStatusEntity pndStatus = new SeedlotStatusEntity("PND", null, null);

  @BeforeEach
  void setup() {
    saveSeedlotFormService =
        new SaveSeedlotFormService(
            saveSeedlotProgressRepository,
            seedlotRepository,
            loggedUserService,
            seedlotStatusService);

    when(loggedUserService.getLoggedUserInfo()).thenReturn(Optional.of(UserInfo.createDevUser()));
    when(seedlotStatusService.findById(any())).thenReturn(Optional.of(pndStatus));
    testSeedlotA.setApplicantClientNumber(UserInfo.getDevClientNumber());
    testSeedlotB.setApplicantClientNumber(UserInfo.getDevClientNumber());
  }

  // ─── save ────────────────────────────────────────────────────────────────────

  @Test
  @DisplayName("Save progress with missing seedlot should fail.")
  void saveForm_seedlotMissing_shouldFail() throws Exception {
    when(seedlotRepository.findById(any())).thenReturn(Optional.empty());

    SaveSeedlotFormDto dto =
        new SaveSeedlotFormDto(
            new ObjectMapper().readTree("{ \"f1\" : \"v1\" }"),
            new ObjectMapper().readTree("{ \"f2\" : \"v2\" }"),
            1);

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> saveSeedlotFormService.saveForm(SEEDLOT_NUMBER_A, dto));

    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
  }

  @Test
  @DisplayName("Save A-class progress should succeed.")
  void saveForm_aClass_shouldSucceed() throws Exception {
    testSeedlotA.setSeedlotStatus(pndStatus);
    when(seedlotRepository.findById(SEEDLOT_NUMBER_A)).thenReturn(Optional.of(testSeedlotA));
    when(saveSeedlotProgressRepository.save(any()))
        .thenReturn(new SaveSeedlotProgressEntity(testSeedlotA, null, null, null));

    SaveSeedlotFormDto dto =
        new SaveSeedlotFormDto(
            new ObjectMapper().readTree("{ \"f1\" : \"v1\" }"),
            new ObjectMapper().readTree("{ \"f2\" : \"v2\" }"),
            1);

    assertDoesNotThrow(() -> saveSeedlotFormService.saveForm(SEEDLOT_NUMBER_A, dto));
  }

  @Test
  @DisplayName("Save B-class progress should succeed.")
  void saveForm_bClass_shouldSucceed() throws Exception {
    testSeedlotB.setSeedlotStatus(pndStatus);
    when(seedlotRepository.findById(SEEDLOT_NUMBER_B)).thenReturn(Optional.of(testSeedlotB));
    when(saveSeedlotProgressRepository.save(any()))
        .thenReturn(new SaveSeedlotProgressEntity(testSeedlotB, null, null, null));

    SaveSeedlotFormDto dto =
        new SaveSeedlotFormDto(
            new ObjectMapper().readTree("{ \"f1\" : \"v1\" }"),
            new ObjectMapper().readTree("{ \"f2\" : \"v2\" }"),
            1);

    assertDoesNotThrow(() -> saveSeedlotFormService.saveForm(SEEDLOT_NUMBER_B, dto));
  }

  // ─── getForm ─────────────────────────────────────────────────────────────────

  @Test
  @DisplayName("Get progress with non-existing seedlot number should fail.")
  void getForm_noSeedlotNumber_shouldFail() {
    when(saveSeedlotProgressRepository.findById(any())).thenReturn(Optional.empty());

    assertThrows(
        ResponseStatusException.class,
        () -> saveSeedlotFormService.getForm(SEEDLOT_NUMBER_A));
  }

  @Test
  @DisplayName("Get progress should succeed.")
  void getForm_shouldSucceed() {
    when(saveSeedlotProgressRepository.findById(any()))
        .thenReturn(Optional.of(new SaveSeedlotProgressEntity(testSeedlotA, null, null, null)));

    SaveSeedlotFormDto retrieved = saveSeedlotFormService.getForm(SEEDLOT_NUMBER_A);
    assertEquals("null", retrieved.allStepData().toString());
  }

  // ─── getFormStatus ───────────────────────────────────────────────────────────

  @Test
  @DisplayName("Get progress status with non-existing seedlot should fail.")
  void getFormStatus_noSeedlotNumber_shouldFail() {
    when(seedlotRepository.findById(any())).thenReturn(Optional.of(testSeedlotA));
    when(saveSeedlotProgressRepository.getStatusById(any())).thenReturn(Optional.empty());

    assertThrows(
        ResponseStatusException.class,
        () -> saveSeedlotFormService.getFormStatus(SEEDLOT_NUMBER_A));
  }

  @Test
  @DisplayName("Get progress status should succeed.")
  void getFormStatus_shouldSucceed() {
    when(seedlotRepository.findById(any())).thenReturn(Optional.of(testSeedlotA));
    when(saveSeedlotProgressRepository.getStatusById(any()))
        .thenReturn(Optional.of("{ \"f2\" : \"v2\" }"));

    JsonNode result = saveSeedlotFormService.getFormStatus(SEEDLOT_NUMBER_A);
    assertEquals("v2", result.get("f2").asText());
  }

  @Test
  @DisplayName("Delete progress should remove an existing draft.")
  void deleteForm_shouldSucceed() {
    SaveSeedlotProgressEntity entity =
        new SaveSeedlotProgressEntity(
            testSeedlotB, Map.of(), Map.of(), new AuditInformation("user"));
    when(saveSeedlotProgressRepository.findById(SEEDLOT_NUMBER_B)).thenReturn(Optional.of(entity));

    saveSeedlotFormService.deleteForm(SEEDLOT_NUMBER_B);

    verify(saveSeedlotProgressRepository).delete(entity);
  }

  @Test
  @DisplayName("Delete progress is a no-op when no draft exists.")
  void deleteForm_noDraft_shouldNoOp() {
    when(saveSeedlotProgressRepository.findById(SEEDLOT_NUMBER_B)).thenReturn(Optional.empty());

    saveSeedlotFormService.deleteForm(SEEDLOT_NUMBER_B);

    verify(saveSeedlotProgressRepository, never()).delete(any());
  }

  @Test
  @DisplayName("Recreate empty B-class draft should replace any existing draft.")
  void recreateEmptyBclassDraft_shouldSucceed() {
    SaveSeedlotProgressEntity existing =
        new SaveSeedlotProgressEntity(
            testSeedlotB, Map.of("old", true), Map.of(), new AuditInformation("user"));
    when(saveSeedlotProgressRepository.findById(SEEDLOT_NUMBER_B))
        .thenReturn(Optional.of(existing));
    when(saveSeedlotProgressRepository.save(any())).thenReturn(existing);
    when(loggedUserService.createAuditCurrentUser()).thenReturn(new AuditInformation("user"));

    saveSeedlotFormService.recreateEmptyBclassDraft(testSeedlotB);

    verify(saveSeedlotProgressRepository).delete(existing);
    verify(saveSeedlotProgressRepository).save(any());
  }
}
