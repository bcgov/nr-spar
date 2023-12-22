package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.SaveAClassSeedlotFormDto;
import ca.bc.gov.backendstartapi.entity.SeedlotAClassSaveEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.repository.SaveAClassSeedlotFormRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import com.nimbusds.jose.shaded.gson.Gson;
import java.util.Map;
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

    Seedlot relatedSeedlot = seedlotRepository.findById(seedlotNumber).orElseThrow();

    SeedlotAClassSaveEntity entityToSave =
        new SeedlotAClassSaveEntity(
            relatedSeedlot,
            new Gson().fromJson(data.allStepData().toString(), Map.class),
            new Gson().fromJson(data.progressStatus().toString(), Map.class),
            loggedUserService.createAuditCurrentUser());

    saveAClassSeedlotFormRepository.save(entityToSave);
    return;
  }
}
