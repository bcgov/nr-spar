package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.Constants;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateResponseDto;
import ca.bc.gov.backendstartapi.entity.SeedlotSourceEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotStatusRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import jakarta.transaction.Transactional;
import java.util.Objects;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/** This class contains methods for handling Seedlots in the database. */
@RequiredArgsConstructor
@Service
@Slf4j
public class SeedlotService {

  private final SeedlotRepository seedlotRepository;

  private final SeedlotSourceRepository seedlotSourceRepository;

  private final SeedlotStatusRepository seedlotStatusRepository;

  private final LoggedUserService loggedUserService;

  /**
   * Creates a Seedlot in the database.
   *
   * @param createDto A {@link SeedlotCreateDto} with required fields to create a seedlot.
   * @return A {@link SeedlotCreateResponseDto} containing the number and the status of the created
   *     seedlot.
   */
  @Transactional
  public SeedlotCreateResponseDto createSeedlot(SeedlotCreateDto createDto) {
    log.info("Create Seedlot started.");

    // !? validateNewSeelot(createDto);

    Seedlot seedlot = new Seedlot(nextSeedlotNumber());

    Optional<SeedlotStatusEntity> seedLotStatusEntity =
        seedlotStatusRepository.findById(Constants.CLASS_A_SEEDLOT_STATUS);
    seedlot.setSeedlotStatus(seedLotStatusEntity.orElseThrow(null));

    seedlot.setApplicantClientNumber(createDto.applicantClientNumber());
    seedlot.setApplicantLocationCode(createDto.applicantLocationCode());
    seedlot.setApplicantEmailAddress(createDto.applicantEmailAddress());
    seedlot.setVegetationCode(createDto.vegetationCode());

    Optional<SeedlotSourceEntity> seedlotSourceEntity =
        seedlotSourceRepository.findById(createDto.seedlotSourceCode());
    seedlot.setSeedlotSource(seedlotSourceEntity.get());

    seedlot.setIntendedForCrownLand(createDto.toBeRegistrdInd());
    seedlot.setSourceInBc(createDto.bcSourceInd());
    seedlot.setAuditInformation(new AuditInformation(loggedUserService.getLoggedUserIdirOrBceId()));

    log.debug("Seedlot to insert: {}", seedlot);

    seedlotRepository.save(seedlot);
    seedlotRepository.flush();

    log.info("New seedlot saved with success!");

    return new SeedlotCreateResponseDto(
        seedlot.getId(), seedlot.getSeedlotStatus().getSeedlotStatusCode());
  }

  private String nextSeedlotNumber() {
    log.info("Retrieving the next Seedlot number");
    Integer seedlotNumber =
        seedlotRepository.findNextSeedlotNumber(
            Constants.CLASS_A_SEEDLOT_NUM_MIN, Constants.CLASS_A_SEEDLOT_NUM_MAX);

    if (Objects.isNull(seedlotNumber)) {
      seedlotNumber = Constants.CLASS_A_SEEDLOT_NUM_MIN;
    }

    seedlotNumber += 1;

    log.debug("Next seedlot number: {}", seedlotNumber);
    return String.valueOf(seedlotNumber);
  }
}
