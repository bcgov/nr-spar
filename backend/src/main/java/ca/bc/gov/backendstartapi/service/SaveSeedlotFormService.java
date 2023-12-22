package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.SaveAClassSeedlotFormDto;
import ca.bc.gov.backendstartapi.entity.SaveAClassSeedlotEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.repository.SaveAClassSeedlotFormRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
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
}
