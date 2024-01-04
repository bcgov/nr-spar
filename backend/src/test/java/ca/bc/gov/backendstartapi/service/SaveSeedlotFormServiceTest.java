package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.SaveAClassSeedlotFormDto;
import ca.bc.gov.backendstartapi.entity.SaveAClassSeedlotEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.repository.SaveAClassSeedlotFormRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

  @Mock SaveAClassSeedlotFormRepository saveAClassSeedlotFormRepository;
  @Mock SeedlotRepository seedlotRepository;
  @Mock LoggedUserService loggedUserService;

  private SaveSeedlotFormService saveSeedlotFormService;

  private static final String SEEDLOT_NUMBER = "678123";

  @BeforeEach
  void setup() {
    saveSeedlotFormService =
        new SaveSeedlotFormService(
            saveAClassSeedlotFormRepository, seedlotRepository, loggedUserService);
  }

  @Test
  @DisplayName("Save seedlot progress with missing seedlot should fail.")
  void saveSeedlotProgress_seedlotMissing_shouldFail() throws Exception {
    when(seedlotRepository.findById(any())).thenReturn(Optional.empty());

    JsonNode allStepData = new ObjectMapper().readTree("{ \"f1\" : \"v1\" } ");

    JsonNode progressStatus = new ObjectMapper().readTree("{ \"f2\" : \"v2\" } ");

    SaveAClassSeedlotFormDto saveDto = new SaveAClassSeedlotFormDto(allStepData, progressStatus);

    ResponseStatusException expectedException =
        assertThrows(
            ResponseStatusException.class,
            () -> saveSeedlotFormService.saveAClassForm(SEEDLOT_NUMBER, saveDto));

    assertEquals(HttpStatus.NOT_FOUND, expectedException.getStatusCode());
  }

  @Test
  @DisplayName("Save seedlot progress with missing seedlot should succeed.")
  void saveSeedlotProgress_shouldSucceed() throws Exception {
    Seedlot testSeedlot = new Seedlot(SEEDLOT_NUMBER);

    when(seedlotRepository.findById(any())).thenReturn(Optional.of(testSeedlot));

    when(saveAClassSeedlotFormRepository.save(any()))
        .thenReturn(new SaveAClassSeedlotEntity(testSeedlot, null, null, null));

    JsonNode allStepData = new ObjectMapper().readTree("{ \"f1\" : \"v1\" } ");

    JsonNode progressStatus = new ObjectMapper().readTree("{ \"f2\" : \"v2\" } ");

    SaveAClassSeedlotFormDto saveDto = new SaveAClassSeedlotFormDto(allStepData, progressStatus);

    // Testing a void function, if there is no error then it means success.
    assertDoesNotThrow(() -> saveSeedlotFormService.saveAClassForm(SEEDLOT_NUMBER, saveDto));
  }

  @Test
  @DisplayName("Get seedlot progress with non-existing seedlot number should fail.")
  void getSeedlotProgress_noSeedlotNumber_shouldFail() throws Exception {
    when(saveAClassSeedlotFormRepository.findById(any())).thenReturn(Optional.empty());

    ResponseStatusException expectedException =
        assertThrows(
            ResponseStatusException.class,
            () -> saveSeedlotFormService.getAClassForm(SEEDLOT_NUMBER));

    assertEquals(HttpStatus.NOT_FOUND, expectedException.getStatusCode());
  }

  @Test
  @DisplayName("Get seedlot progress should succeed.")
  void getSeedlotProgress_shouldSucceed() throws Exception {
    Seedlot testSeedlot = new Seedlot(SEEDLOT_NUMBER);

    when(seedlotRepository.findById(any())).thenReturn(Optional.of(testSeedlot));

    when(saveAClassSeedlotFormRepository.findById(any()))
        .thenReturn(Optional.of(new SaveAClassSeedlotEntity(testSeedlot, null, null, null)));

    SaveAClassSeedlotFormDto retrievedDto = saveSeedlotFormService.getAClassForm(SEEDLOT_NUMBER);

    assertEquals("null", retrievedDto.allStepData().toString());
  }

  @Test
  @DisplayName("Get seedlot progress status with non-existing seedlot number should fail.")
  void getSeedlotProgressStatus_noSeedlotNumber_shouldFail() throws Exception {
    when(saveAClassSeedlotFormRepository.findById(any())).thenReturn(Optional.empty());

    ResponseStatusException expectedException =
        assertThrows(
            ResponseStatusException.class,
            () -> saveSeedlotFormService.getAClassFormStatus(SEEDLOT_NUMBER));

    assertEquals(HttpStatus.NOT_FOUND, expectedException.getStatusCode());
  }

  @Test
  @DisplayName("Get seedlot progress status should succeed.")
  void getSeedlotProgressStatus_shouldSucceed() throws Exception {
    Seedlot testSeedlot = new Seedlot(SEEDLOT_NUMBER);

    when(seedlotRepository.findById(any())).thenReturn(Optional.of(testSeedlot));

    String progressStatus = "{ \"f2\" : \"v2\" } ";

    when(saveAClassSeedlotFormRepository.getStatusById(any()))
        .thenReturn(Optional.of(progressStatus));

    JsonNode retrievedDto = saveSeedlotFormService.getAClassFormStatus(SEEDLOT_NUMBER);

    assertEquals("v2", retrievedDto.get("f2").asText());
  }
}
