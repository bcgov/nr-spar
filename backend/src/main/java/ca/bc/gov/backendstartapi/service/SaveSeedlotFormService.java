package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.SaveAClassSeedlotFormDto;
import ca.bc.gov.backendstartapi.entity.SeedlotAClassSaveEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.repository.SeedlotAClassSaveRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/** This class contains methods to handle seedlot registration form saving requests. */
@Service
@Slf4j
@RequiredArgsConstructor
public class SaveSeedlotFormService {

  private final SeedlotAClassSaveRepository seedlotAClassSaveRepository;
  private final SeedlotRepository seedlotRepository;
  private final LoggedUserService loggedUserService;

  public void saveAClassForm(String seedlotNumber, SaveAClassSeedlotFormDto data) {

    log.info("SaveAClassSeedlotFormDto: {}", data.allStepData().toJSONString());

    Seedlot relatedSeedlot = seedlotRepository.findById(seedlotNumber).orElseThrow();

    SeedlotAClassSaveEntity entityToSave =
        new SeedlotAClassSaveEntity(
            relatedSeedlot,
            data.allStepData(),
            data.progressStatus(),
            loggedUserService.createAuditCurrentUser(),
            0);

    seedlotAClassSaveRepository.saveAndFlush  (entityToSave);

    return;
  }
}
