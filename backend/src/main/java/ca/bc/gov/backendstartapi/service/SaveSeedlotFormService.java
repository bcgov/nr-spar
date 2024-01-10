package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SaveSeedlotFormDtoClassA;
import ca.bc.gov.backendstartapi.entity.SaveSeedlotProgressEntityClassA;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.JsonParsingException;
import ca.bc.gov.backendstartapi.exception.SeedlotFormProgressNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.repository.SaveSeedlotProgressRepositoryClassA;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jose.shaded.gson.Gson;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** This class contains methods to handle seedlot registration form saving requests. */
@Service
@RequiredArgsConstructor
@SuppressWarnings("unchecked")
public class SaveSeedlotFormService {

  private final SaveSeedlotProgressRepositoryClassA saveSeedlotProgressRepositoryClassA;
  private final SeedlotRepository seedlotRepository;
  private final LoggedUserService loggedUserService;

  /** Saves the {@link SaveSeedlotFormDtoClassA} to table. */
  public void saveFormClassA(String seedlotNumber, SaveSeedlotFormDtoClassA data) {
    SparLog.info("Saving A-Class seedlot progress for seedlot number: {} ...", seedlotNumber);

    Seedlot relatedSeedlot =
        seedlotRepository.findById(seedlotNumber).orElseThrow(SeedlotNotFoundException::new);

    Optional<SaveSeedlotProgressEntityClassA> optionalEntityToSave =
        saveSeedlotProgressRepositoryClassA.findById(seedlotNumber);

    Map<String, Object> parsedAllStepData =
        new Gson().fromJson(data.allStepData().toString(), Map.class);
    Map<String, Object> parsedProgressStatus =
        new Gson().fromJson(data.progressStatus().toString(), Map.class);

    SaveSeedlotProgressEntityClassA entityToSave;
    // If an entity exist then update the values, otherwise make a new entity.
    if (optionalEntityToSave.isEmpty()) {
      entityToSave =
          new SaveSeedlotProgressEntityClassA(
              relatedSeedlot,
              parsedAllStepData,
              parsedProgressStatus,
              loggedUserService.createAuditCurrentUser());
    } else {
      SparLog.info(
          "A-class seedlot progress for seedlot number {} exists, replacing with new values ...",
          seedlotNumber);
      entityToSave = optionalEntityToSave.get();
      entityToSave.setAllStepData(parsedAllStepData);
      entityToSave.setProgressStatus(parsedProgressStatus);
    }

    saveSeedlotProgressRepositoryClassA.save(entityToSave);
    return;
  }

  /**
   * Retreives a {@link SaveSeedlotProgressEntityClassA} then convert it to {@link
   * SaveSeedlotFormDtoClassA} upon return.
   */
  public SaveSeedlotFormDtoClassA getFormClassA(String seedlotNumber) {
    SparLog.info("Retrieving A-class seedlot progress for seedlot number: {} ...", seedlotNumber);
    ObjectMapper mapper = new ObjectMapper();
    return saveSeedlotProgressRepositoryClassA
        .findById(seedlotNumber)
        .map(
            savedEntity ->
                new SaveSeedlotFormDtoClassA(
                    mapper.convertValue(savedEntity.getAllStepData(), JsonNode.class),
                    mapper.convertValue(savedEntity.getProgressStatus(), JsonNode.class)))
        .orElseThrow(SeedlotFormProgressNotFoundException::new);
  }

  /** Retrieves the progress_status column then return it as a json object. */
  public JsonNode getFormStatusClassA(String seedlotNumber) {
    SparLog.info(
        "Retrieving A-class seedlot progress status for seedlot number: {} ...", seedlotNumber);
    ObjectMapper mapper = new ObjectMapper();

    Object progressStatus =
        saveSeedlotProgressRepositoryClassA
            .getStatusById(seedlotNumber)
            .orElseThrow(SeedlotFormProgressNotFoundException::new);

    // This needs to be converted again with readTree, otherwise it'll return a string value even
    // without doing the asText().
    String statusString = mapper.convertValue(progressStatus, JsonNode.class).asText();

    try {
      return mapper.readTree(statusString);
    } catch (JsonProcessingException e) {
      throw new JsonParsingException();
    }
  }
}
