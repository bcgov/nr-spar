package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.SaveAClassSeedlotFormDto;
import ca.bc.gov.backendstartapi.entity.SaveAClassSeedlotEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.JsonParsingException;
import ca.bc.gov.backendstartapi.exception.SeedlotFormProgressNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.repository.SaveAClassSeedlotFormRepository;
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

  private final SaveAClassSeedlotFormRepository saveAClassSeedlotFormRepository;
  private final SeedlotRepository seedlotRepository;
  private final LoggedUserService loggedUserService;

  public void saveAClassForm(String seedlotNumber, SaveAClassSeedlotFormDto data) {

    Seedlot relatedSeedlot =
        seedlotRepository.findById(seedlotNumber).orElseThrow(SeedlotNotFoundException::new);

    Optional<SaveAClassSeedlotEntity> optionalEntityToSave =
        saveAClassSeedlotFormRepository.findById(seedlotNumber);

    Map<String, Object> parsedAllStepData =
        new Gson().fromJson(data.allStepData().toString(), Map.class);
    Map<String, Object> parsedProgressStatus =
        new Gson().fromJson(data.progressStatus().toString(), Map.class);

    SaveAClassSeedlotEntity entityToSave;
    // If an entity exist then update the values, otherwise make a new entity.
    if (optionalEntityToSave.isEmpty()) {
      entityToSave =
          new SaveAClassSeedlotEntity(
              relatedSeedlot,
              parsedAllStepData,
              parsedProgressStatus,
              loggedUserService.createAuditCurrentUser());
    } else {
      entityToSave = optionalEntityToSave.get();
      entityToSave.setAllStepData(parsedAllStepData);
      entityToSave.setProgressStatus(parsedProgressStatus);
    }

    saveAClassSeedlotFormRepository.save(entityToSave);
    return;
  }

  public SaveAClassSeedlotFormDto getAClassForm(String seedlotNumber) {
    ObjectMapper mapper = new ObjectMapper();
    return saveAClassSeedlotFormRepository
        .findById(seedlotNumber)
        .map(
            savedEntity ->
                new SaveAClassSeedlotFormDto(
                    mapper.convertValue(savedEntity.getAllStepData(), JsonNode.class),
                    mapper.convertValue(savedEntity.getProgressStatus(), JsonNode.class)))
        .orElseThrow(SeedlotFormProgressNotFoundException::new);
  }

  public JsonNode getAClassFormStatus(String seedlotNumber) {
    ObjectMapper mapper = new ObjectMapper();

    Object progressStatus =
        saveAClassSeedlotFormRepository
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
