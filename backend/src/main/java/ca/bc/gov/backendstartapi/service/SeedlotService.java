package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.SeedlotCreateDto;
import ca.bc.gov.backendstartapi.entity.SeedlotSourceEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Slf4j
public class SeedlotService {

  private final SeedlotRepository seedlotRepository;

  private final SeedlotSourceRepository seedlotSourceRepository;

  public Seedlot createSeedlot(SeedlotCreateDto createDto) {
    log.info("Create Seedlot started.");

    validateNewSeelot(createDto);

    Seedlot seedlot = new Seedlot(nextSeedlotNumber());
    seedlot.setApplicantClientNumber(createDto.applicantClientNumber());
    seedlot.setApplicantLocationCode(createDto.applicantLocationCode());
    seedlot.setApplicantEmailAddress(createDto.applicantEmailAddress());
    seedlot.setVegetationCode(createDto.vegetationCode());

    Optional<SeedlotSourceEntity> seedlotSourceEntity =
        seedlotSourceRepository.findById(createDto.seedlotSourceCode());
    seedlot.setSeedlotSource(seedlotSourceEntity.get());

    seedlot.setIntendedForCrownLand(createDto.toBeRegistrdInd());
    seedlot.setSourceInBc(createDto.bcSourceInd());

    return seedlotRepository.save(seedlot);
  }

  private void validateNewSeelot(SeedlotCreateDto createDto) {
    log.info("Validating new Seedlot");
  }

  private String nextSeedlotNumber() {
    log.info("Retrieving the next Seedlot number");
    String seedlotNumber = "01";

    log.debug("Next seedlot number: {}", seedlotNumber);
    return seedlotNumber;
  }
}
