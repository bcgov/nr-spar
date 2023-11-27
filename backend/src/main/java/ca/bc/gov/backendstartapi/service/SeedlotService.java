package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.Constants;
import ca.bc.gov.backendstartapi.dto.SeedlotApplicationPatchDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateResponseDto;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotSourceEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.InvalidSeedlotRequestException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotSourceNotFoundException;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotStatusRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import jakarta.transaction.Transactional;
import java.util.Objects;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;

/** This class contains methods for handling Seedlots in the database. */
@RequiredArgsConstructor
@Service
@Slf4j
public class SeedlotService {

  private final SeedlotRepository seedlotRepository;

  private final SeedlotSourceRepository seedlotSourceRepository;

  private final SeedlotStatusRepository seedlotStatusRepository;

  private final GeneticClassRepository geneticClassRepository;

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

    Seedlot seedlot = new Seedlot(nextSeedlotNumber(createDto.geneticClassCode()));

    Optional<SeedlotStatusEntity> seedLotStatusEntity =
        seedlotStatusRepository.findById(Constants.CLASS_A_SEEDLOT_STATUS);
    seedlot.setSeedlotStatus(seedLotStatusEntity.orElseThrow(InvalidSeedlotRequestException::new));

    seedlot.setApplicantClientNumber(createDto.applicantClientNumber());
    seedlot.setApplicantLocationCode(createDto.applicantLocationCode());
    seedlot.setApplicantEmailAddress(createDto.applicantEmailAddress());
    seedlot.setVegetationCode(createDto.vegetationCode());

    Optional<GeneticClassEntity> classEntity =
        geneticClassRepository.findById(createDto.geneticClassCode().toString());
    seedlot.setGeneticClass(classEntity.orElseThrow(InvalidSeedlotRequestException::new));

    Optional<SeedlotSourceEntity> seedlotSourceEntity =
        seedlotSourceRepository.findById(createDto.seedlotSourceCode());
    seedlot.setSeedlotSource(seedlotSourceEntity.orElseThrow(InvalidSeedlotRequestException::new));

    seedlot.setIntendedForCrownLand(createDto.toBeRegistrdInd());
    seedlot.setSourceInBc(createDto.bcSourceInd());
    seedlot.setAuditInformation(new AuditInformation(loggedUserService.getLoggedUserId()));

    log.debug("Seedlot to insert: {}", seedlot);

    seedlotRepository.save(seedlot);
    seedlotRepository.flush();

    log.info("New seedlot saved with success!");

    return new SeedlotCreateResponseDto(
        seedlot.getId(), seedlot.getSeedlotStatus().getSeedlotStatusCode());
  }

  /**
   * Retrieved the next Seedlot number according to genetic class.
   *
   * @return A String containing the next number.
   * @throws InvalidSeedlotRequestException in case of errors.
   */
  private String nextSeedlotNumber(Character seedlotClassCode) {
    log.info("Retrieving the next class {} Seedlot number", seedlotClassCode);

    if (seedlotClassCode.equals('B')) {
      log.error("Class B Seedlots not implemented yet!");
      throw new InvalidSeedlotRequestException();
    }

    Integer seedlotNumber =
        seedlotRepository.findNextSeedlotNumber(
            Constants.CLASS_A_SEEDLOT_NUM_MIN, Constants.CLASS_A_SEEDLOT_NUM_MAX);

    if (Objects.isNull(seedlotNumber)) {
      seedlotNumber = Constants.CLASS_A_SEEDLOT_NUM_MIN;
    }

    seedlotNumber += 1;

    log.debug("Next class {} seedlot number: {}", seedlotNumber);
    return String.valueOf(seedlotNumber);
  }

  /**
   * Retrieve a paginated list of seedlot for a given user.
   *
   * @param userId the id of the user to fetch the seedlots for
   * @param pageNumber the page number for the paginated search
   * @param pageSize the size of the page
   * @return a list of the user's seedlots
   */
  public Optional<Page<Seedlot>> getUserSeedlots(String userId, int pageNumber, int pageSize) {
    if (pageSize == 0) {
      pageSize = 10;
    }

    Pageable sortedPageable =
        PageRequest.of(
            pageNumber, pageSize, Sort.by(Direction.DESC, "AuditInformation_UpdateTimestamp"));
    return Optional.of(
        seedlotRepository.findAllByAuditInformation_EntryUserId(userId, sortedPageable));
  }

  /**
   * Retrieve a single seedlot information.
   *
   * @param seedlotNumber the seedlot number of the seedlot to fetch the information
   * @return A Seedlot entity.
   * @throws SeedlotNotFoundException in case of errors.
   */
  public Seedlot getSingleSeedlotInfo(String seedlotNumber) {
    log.info("Retrieving information for Seedlot number {}", seedlotNumber);

    Seedlot seedlotInfo =
        seedlotRepository
            .findById(seedlotNumber)
            .orElseThrow(
                () -> {
                  log.error("Nothing found for seedlot number: {}", seedlotNumber);
                  return new SeedlotNotFoundException();
                });

    return seedlotInfo;
  }

  /**
   * Update an entry in the Seedlot table.
   *
   * @param seedlotNumber the seedlot number of the seedlot to fetch the information
   * @return A Seedlot entity.
   * @throws SeedlotNotFoundException in case of seedlot not found error.
   * @throws SeedlotSourceNotFoundException in case of seedlot source not found error.
   */
  public Seedlot patchApplicantionInfo(String seedlotNumber, SeedlotApplicationPatchDto patchDto) {
    log.info("Patching seedlot entry for seedlot number {}", seedlotNumber);

    Seedlot seedlotInfo =
        seedlotRepository
            .findById(seedlotNumber)
            .orElseThrow(
                () -> {
                  log.error("Nothing found for seedlot number: {}", seedlotNumber);
                  return new SeedlotNotFoundException();
                });

    seedlotInfo.setApplicantEmailAddress(patchDto.applicantEmailAddress());

    SeedlotSourceEntity updatedSource =
        seedlotSourceRepository
            .findById(patchDto.seedlotSourceCode())
            .orElseThrow(
                () -> {
                  log.error(
                      "Seedlot source not found while patching in patchApplicantionInfo for seedlot"
                          + " number: {}",
                      seedlotNumber);
                  return new SeedlotSourceNotFoundException();
                });

    seedlotInfo.setSeedlotSource(updatedSource);

    seedlotInfo.setSourceInBc(patchDto.bcSourceInd());

    // The field intendedForCrownLand == to be registered indicator.
    seedlotInfo.setIntendedForCrownLand(patchDto.toBeRegistrdInd());

    return seedlotRepository.save(seedlotInfo);
  }
}
