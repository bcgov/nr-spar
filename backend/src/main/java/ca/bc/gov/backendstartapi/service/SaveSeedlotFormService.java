package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.Constants;
import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.RevisionCountDto;
import ca.bc.gov.backendstartapi.dto.SaveSeedlotFormDto;
import ca.bc.gov.backendstartapi.entity.SaveSeedlotProgressEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.JsonParsingException;
import ca.bc.gov.backendstartapi.exception.RevisionCountMismatchException;
import ca.bc.gov.backendstartapi.exception.SeedlotFormProgressNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotStatusNotFoundException;
import ca.bc.gov.backendstartapi.repository.SaveSeedlotProgressRepository;
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

/** Handles seedlot registration wizard draft save/load for all seedlot classes. */
@Service
@RequiredArgsConstructor
@SuppressWarnings("unchecked")
public class SaveSeedlotFormService {

  private final SaveSeedlotProgressRepository saveSeedlotProgressRepository;
  private final SeedlotRepository seedlotRepository;
  private final LoggedUserService loggedUserService;
  private final SeedlotStatusService seedlotStatusService;

  /**
   * Persists wizard draft progress for a seedlot (A-class or B-class).
   *
   * @param seedlotNumber the seedlot number
   * @param data          the draft payload from the front-end
   * @return the new optimistic-lock revision count
   */
  public RevisionCountDto saveForm(@NonNull String seedlotNumber, SaveSeedlotFormDto data) {
    SparLog.info("Saving seedlot progress for seedlot number: {}", seedlotNumber);

    var relatedSeedlot =
        seedlotRepository.findById(seedlotNumber).orElseThrow(SeedlotNotFoundException::new);

    loggedUserService.verifySeedlotAccessPrivilege(relatedSeedlot.getApplicantClientNumber());

    Map<String, Object> parsedAllStepData =
        new Gson().fromJson(data.allStepData().toString(), Map.class);
    Map<String, Object> parsedProgressStatus =
        new Gson().fromJson(data.progressStatus().toString(), Map.class);

    Optional<SaveSeedlotProgressEntity> existing =
        saveSeedlotProgressRepository.findById(seedlotNumber);

    SaveSeedlotProgressEntity entityToSave;
    if (existing.isEmpty()) {
      SparLog.info("First save for seedlot {}", seedlotNumber);
      entityToSave =
          new SaveSeedlotProgressEntity(
              relatedSeedlot,
              parsedAllStepData,
              parsedProgressStatus,
              loggedUserService.createAuditCurrentUser());

      if (relatedSeedlot
          .getSeedlotStatus()
          .getSeedlotStatusCode()
          .equals(Constants.INCOMPLETE_SEEDLOT_STATUS)) {
        SparLog.info("Updating seedlot {} status from INC to PND", seedlotNumber);
        Optional<SeedlotStatusEntity> pndStatus =
            seedlotStatusService.findById(Constants.PENDING_SEEDLOT_STATUS);
        relatedSeedlot.setSeedlotStatus(pndStatus.orElseThrow(SeedlotStatusNotFoundException::new));
      }
    } else {
      if (relatedSeedlot
          .getSeedlotStatus()
          .getSeedlotStatusCode()
          .equals(Constants.PENDING_SEEDLOT_STATUS)) {

        Integer prevRevCount = data.revisionCount();
        Integer currRevCount = existing.get().getRevisionCount();

        if (prevRevCount != null && !prevRevCount.equals(currRevCount)) {
          SparLog.info(
              "Save failed — revision count mismatch: prev={}, curr={}",
              prevRevCount, currRevCount);
          throw new RevisionCountMismatchException();
        }
      }

      SparLog.info("Updating existing draft for seedlot {}", seedlotNumber);
      entityToSave = existing.get();
      entityToSave.setAllStepData(parsedAllStepData);
      entityToSave.setProgressStatus(parsedProgressStatus);
    }

    relatedSeedlot.setAuditInformation(loggedUserService.createAuditCurrentUser());
    seedlotRepository.save(relatedSeedlot);

    SaveSeedlotProgressEntity saved = saveSeedlotProgressRepository.save(entityToSave);
    SparLog.info("Seedlot progress saved for seedlot {}", seedlotNumber);
    return new RevisionCountDto(saved.getRevisionCount());
  }

  /**
   * Retrieves wizard draft progress for a seedlot (A-class or B-class).
   *
   * @param seedlotNumber the seedlot number
   * @return the full draft DTO
   */
  public SaveSeedlotFormDto getForm(@NonNull String seedlotNumber) {
    SparLog.info("Retrieving seedlot progress for seedlot {}", seedlotNumber);

    ObjectMapper mapper = new ObjectMapper();
    Optional<SaveSeedlotProgressEntity> form =
        saveSeedlotProgressRepository.findById(seedlotNumber);

    if (form.isPresent()) {
      loggedUserService.verifySeedlotAccessPrivilege(
          form.get().getSeedlot().getApplicantClientNumber());
    }

    return form.map(
            e ->
                new SaveSeedlotFormDto(
                    mapper.convertValue(e.getAllStepData(), JsonNode.class),
                    mapper.convertValue(e.getProgressStatus(), JsonNode.class),
                    e.getRevisionCount()))
        .orElseThrow(SeedlotFormProgressNotFoundException::new);
  }

  /**
   * Retrieves only the {@code progress_status} column for a seedlot draft.
   *
   * @param seedlotNumber the seedlot number
   * @return the parsed progress-status JSON node
   */
  public JsonNode getFormStatus(String seedlotNumber) {
    SparLog.info("Retrieving seedlot progress status for seedlot {}", seedlotNumber);

    var relatedSeedlot =
        seedlotRepository.findById(seedlotNumber).orElseThrow(SeedlotNotFoundException::new);

    loggedUserService.verifySeedlotAccessPrivilege(relatedSeedlot.getApplicantClientNumber());

    ObjectMapper mapper = new ObjectMapper();
    Object progressStatus =
        saveSeedlotProgressRepository
            .getStatusById(seedlotNumber)
            .orElseThrow(SeedlotFormProgressNotFoundException::new);

    String statusString = mapper.convertValue(progressStatus, JsonNode.class).asText();

    try {
      JsonNode json = mapper.readTree(statusString);
      SparLog.info("Progress status successfully parsed for seedlot {}", seedlotNumber);
      return json;
    } catch (JsonProcessingException e) {
      throw new JsonParsingException();
    }
  }

  /**
   * Removes the wizard draft row for a seedlot, if one exists.
   *
   * @param seedlotNumber the seedlot number
   */
  public void deleteForm(@NonNull String seedlotNumber) {
    SparLog.info("Deleting seedlot registration draft for seedlot {}", seedlotNumber);

    saveSeedlotProgressRepository
        .findById(seedlotNumber)
        .ifPresent(
            entity -> {
              loggedUserService.verifySeedlotAccessPrivilege(
                  entity.getSeedlot().getApplicantClientNumber());
              saveSeedlotProgressRepository.delete(entity);
              SparLog.info("Seedlot registration draft deleted for seedlot {}", seedlotNumber);
            });
  }

  /**
   * Creates a fresh empty B-class wizard draft so the frontend can hydrate from normalized tables
   * via {@code GET .../b-class-full-form}.
   *
   * @param seedlot the seedlot to attach the draft to
   */
  public void recreateEmptyBClassDraft(@NonNull Seedlot seedlot) {
    SparLog.info("Recreating empty B-class draft for seedlot {}", seedlot.getId());

    saveSeedlotProgressRepository.findById(seedlot.getId()).ifPresent(saveSeedlotProgressRepository::delete);

    Map<String, Object> stepStatus =
        Map.of("isComplete", false, "isCurrent", false, "isInvalid", false);
    Map<String, Object> progressStatus =
        Map.of(
            "collection", stepStatus,
            "ownership", stepStatus,
            "interim", stepStatus,
            "extraction", stepStatus);

    SaveSeedlotProgressEntity draft =
        new SaveSeedlotProgressEntity(
            seedlot,
            Map.of(),
            progressStatus,
            loggedUserService.createAuditCurrentUser());

    saveSeedlotProgressRepository.save(draft);
    SparLog.info("Empty B-class draft created for seedlot {}", seedlot.getId());
  }
}
