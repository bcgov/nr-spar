package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.Constants;
import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.RevisionCountDto;
import ca.bc.gov.backendstartapi.dto.SaveSeedlotFormDtoClassA;
import ca.bc.gov.backendstartapi.entity.SaveSeedlotProgressEntityClassA;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.JsonParsingException;
import ca.bc.gov.backendstartapi.exception.RevisionCountMismatchException;
import ca.bc.gov.backendstartapi.exception.SeedlotFormProgressNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotStatusNotFoundException;
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
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

/** This class contains methods to handle seedlot registration form saving requests. */
@Service
@RequiredArgsConstructor
@SuppressWarnings("unchecked")
public class SaveSeedlotFormService {

  private final SaveSeedlotProgressRepositoryClassA saveSeedlotProgressRepositoryClassA;
  private final SeedlotRepository seedlotRepository;
  private final LoggedUserService loggedUserService;
  private final SeedlotStatusService seedlotStatusService;

  /** Saves the {@link SaveSeedlotFormDtoClassA} to table. */
  public RevisionCountDto saveFormClassA(
      @NonNull String seedlotNumber, SaveSeedlotFormDtoClassA data) {
    SparLog.info("Saving A-Class seedlot progress for seedlot number: {}", seedlotNumber);

    Seedlot relatedSeedlot =
        seedlotRepository.findById(seedlotNumber).orElseThrow(SeedlotNotFoundException::new);

    String seedlotApplicantClientNumber = relatedSeedlot.getApplicantClientNumber();

    loggedUserService.verifySeedlotAccessPrivilege(seedlotApplicantClientNumber);

    Optional<SaveSeedlotProgressEntityClassA> optionalEntityToSave =
        saveSeedlotProgressRepositoryClassA.findById(seedlotNumber);

    Map<String, Object> parsedAllStepData =
        new Gson().fromJson(data.allStepData().toString(), Map.class);
    Map<String, Object> parsedProgressStatus =
        new Gson().fromJson(data.progressStatus().toString(), Map.class);

    SaveSeedlotProgressEntityClassA entityToSave;
    // If an entity exist then update the values, otherwise make a new entity.
    // The SUB status check is to create a draft for historical Oracle seedlots.
    if (optionalEntityToSave.isEmpty()) {
      SparLog.info(
          "First time saving A-class seedlot progress for seedlot number {}", seedlotNumber);
      entityToSave =
          new SaveSeedlotProgressEntityClassA(
              relatedSeedlot,
              parsedAllStepData,
              parsedProgressStatus,
              loggedUserService.createAuditCurrentUser());

      // Update the seedlot status to pending from incomplete.
      if (relatedSeedlot
          .getSeedlotStatus()
          .getSeedlotStatusCode()
          .equals(Constants.INCOMPLETE_SEEDLOT_STATUS)) {
        SparLog.info("Updating seedlot {} status from INC to PND", seedlotNumber);

        Optional<SeedlotStatusEntity> seedLotStatusEntity =
            seedlotStatusService.findById(Constants.PENDING_SEEDLOT_STATUS);

        relatedSeedlot.setSeedlotStatus(
            seedLotStatusEntity.orElseThrow(SeedlotStatusNotFoundException::new));
      }
    } else {

      // Revision Count verification only for pending seedlots
      if (relatedSeedlot
          .getSeedlotStatus()
          .getSeedlotStatusCode()
          .equals(Constants.PENDING_SEEDLOT_STATUS)) {

        Integer prevRevCount = data.revisionCount();
        Integer currRevCount = optionalEntityToSave.get().getRevisionCount();

        if (prevRevCount != null && !prevRevCount.equals(currRevCount)) {
          // Conflict detected
          SparLog.info(
              "Save progress failed due to revision count mismatch, prev revision count: {}, curr"
                  + " revision count: {}",
              prevRevCount,
              currRevCount);
          throw new RevisionCountMismatchException();
        }
      }

      SparLog.info(
          "A-class seedlot progress for seedlot number {} exists, replacing with new values",
          seedlotNumber);
      entityToSave = optionalEntityToSave.get();
      entityToSave.setAllStepData(parsedAllStepData);
      entityToSave.setProgressStatus(parsedProgressStatus);
    }

    relatedSeedlot.setAuditInformation(loggedUserService.createAuditCurrentUser());

    seedlotRepository.save(relatedSeedlot);

    SaveSeedlotProgressEntityClassA saved = saveSeedlotProgressRepositoryClassA.save(entityToSave);

    SparLog.info("A-class seedlot progress for seedlot number {} saved!", seedlotNumber);

    RevisionCountDto revCountDto = new RevisionCountDto(saved.getRevisionCount());

    return revCountDto;
  }

  /**
   * Retrieves a {@link SaveSeedlotProgressEntityClassA} then convert it to {@link
   * SaveSeedlotFormDtoClassA} upon return.
   */
  public SaveSeedlotFormDtoClassA getFormClassA(@NonNull String seedlotNumber) {
    SparLog.info("Retrieving A-class seedlot progress for seedlot number {}", seedlotNumber);

    ObjectMapper mapper = new ObjectMapper();

    Optional<SaveSeedlotProgressEntityClassA> form =
        saveSeedlotProgressRepositoryClassA.findById(seedlotNumber);

    if (form.isPresent()) {
      SparLog.info("A-class seedlot progress found for seedlot number {}", seedlotNumber);

      String seedlotApplicantClientNumber = form.get().getSeedlot().getApplicantClientNumber();
      loggedUserService.verifySeedlotAccessPrivilege(seedlotApplicantClientNumber);
    }

    return form.map(
            savedEntity ->
                new SaveSeedlotFormDtoClassA(
                    mapper.convertValue(savedEntity.getAllStepData(), JsonNode.class),
                    mapper.convertValue(savedEntity.getProgressStatus(), JsonNode.class),
                    form.get().getRevisionCount()))
        .orElseThrow(SeedlotFormProgressNotFoundException::new);
  }

  /** Retrieves the progress_status column then return it as a json object. */
  public JsonNode getFormStatusClassA(String seedlotNumber) {
    SparLog.info("Retrieving A-class seedlot progress status for seedlot number {}", seedlotNumber);

    Seedlot relatedSeedlot =
        seedlotRepository.findById(seedlotNumber).orElseThrow(SeedlotNotFoundException::new);

    String seedlotApplicantClientNumber = relatedSeedlot.getApplicantClientNumber();
    loggedUserService.verifySeedlotAccessPrivilege(seedlotApplicantClientNumber);

    ObjectMapper mapper = new ObjectMapper();

    Optional<Object> form = saveSeedlotProgressRepositoryClassA.getStatusById(seedlotNumber);

    if (form.isPresent()) {
      SparLog.info("A-class seedlot progress status found for seedlot number {}", seedlotNumber);
    }

    Object progressStatus = form.orElseThrow(SeedlotFormProgressNotFoundException::new);

    // This needs to be converted again with readTree, otherwise it'll return a string value even
    // without doing the asText().
    String statusString = mapper.convertValue(progressStatus, JsonNode.class).asText();

    try {
      JsonNode json = mapper.readTree(statusString);
      SparLog.info("A-class seedlot progress status successfully converted to json");
      return json;
    } catch (JsonProcessingException e) {
      throw new JsonParsingException();
    }
  }
}
