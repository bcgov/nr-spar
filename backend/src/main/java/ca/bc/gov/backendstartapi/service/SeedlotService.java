package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.Constants;
import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SeedlotApplicationPatchDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateResponseDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormExtractionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormInterimDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormSubmissionDto;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotSourceEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.InvalidSeedlotRequestException;
import ca.bc.gov.backendstartapi.exception.SeedlotFormValidationException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotSourceNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotStatusNotFoundException;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotStatusRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;

/** This class contains methods for handling Seedlots in the database. */
@RequiredArgsConstructor
@Service
public class SeedlotService {

  private final SeedlotRepository seedlotRepository;

  private final SeedlotSourceRepository seedlotSourceRepository;

  private final SeedlotStatusRepository seedlotStatusRepository;

  private final GeneticClassRepository geneticClassRepository;

  private final LoggedUserService loggedUserService;

  private final SeedlotCollectionMethodService seedlotCollectionMethodService;

  private final SeedlotOwnerQuantityService seedlotOwnerQuantityService;

  private final SeedlotOrchardService seedlotOrchardService;

  private final SeedlotParentTreeService seedlotParentTreeService;

  private final SeedlotParentTreeGeneticQualityService seedlotParentTreeGeneticQualityService;

  private final SeedlotGeneticWorthService seedlotGeneticWorthService;

  private final SmpMixService smpMixService;

  private final SmpMixGeneticQualityService smpMixGeneticQualityService;

  private final SeedlotParentTreeSmpMixService seedlotParentTreeSmpMixService;

  private final SeedlotStatusService seedlotStatusService;

  /**
   * Creates a Seedlot in the database.
   *
   * @param createDto A {@link SeedlotCreateDto} with required fields to create a seedlot.
   * @return A {@link SeedlotCreateResponseDto} containing the number and the status of the created
   *     seedlot.
   */
  @Transactional
  public SeedlotCreateResponseDto createSeedlot(SeedlotCreateDto createDto) {
    SparLog.info("Create Seedlot started.");

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

    SparLog.debug("Seedlot to insert: {}", seedlot);

    seedlotRepository.save(seedlot);

    SparLog.info("New seedlot saved with success!");

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
    SparLog.info("Retrieving the next class {} Seedlot number", seedlotClassCode);

    if (seedlotClassCode.equals('B')) {
      SparLog.error("Class B Seedlots not implemented yet!");
      throw new InvalidSeedlotRequestException();
    }

    Integer seedlotNumber =
        seedlotRepository.findNextSeedlotNumber(
            Constants.CLASS_A_SEEDLOT_NUM_MIN, Constants.CLASS_A_SEEDLOT_NUM_MAX);

    if (Objects.isNull(seedlotNumber)) {
      seedlotNumber = Constants.CLASS_A_SEEDLOT_NUM_MIN;
    }

    seedlotNumber += 1;

    SparLog.debug("Next class {} seedlot number: {}", seedlotNumber);
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
    SparLog.info("Retrieving information for Seedlot number {}", seedlotNumber);

    Seedlot seedlotInfo =
        seedlotRepository
            .findById(seedlotNumber)
            .orElseThrow(
                () -> {
                  SparLog.error("Nothing found for seedlot number: {}", seedlotNumber);
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
    SparLog.info("Patching seedlot entry for seedlot number {}", seedlotNumber);

    Seedlot seedlotInfo =
        seedlotRepository
            .findById(seedlotNumber)
            .orElseThrow(
                () -> {
                  SparLog.error("Nothing found for seedlot number: {}", seedlotNumber);
                  return new SeedlotNotFoundException();
                });

    seedlotInfo.setApplicantEmailAddress(patchDto.applicantEmailAddress());

    SeedlotSourceEntity updatedSource =
        seedlotSourceRepository
            .findById(patchDto.seedlotSourceCode())
            .orElseThrow(
                () -> {
                  SparLog.error(
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

  /**
   * Saved the entire {@link Seedlot} form with all steps.
   *
   * @param seedlotNumber The Seedlot identification
   * @param form The {@link SeedlotFormSubmissionDto} containing all form fields
   * @return A {@link SeedlotCreateResponseDto} with the seedlot number and status
   */
  @Transactional
  public SeedlotCreateResponseDto submitSeedlotForm(
      String seedlotNumber, SeedlotFormSubmissionDto form) {
    SparLog.info("Seedlot number {} submitted for saving!", seedlotNumber);
    Optional<Seedlot> seedlotEntity = seedlotRepository.findById(seedlotNumber);
    Seedlot seedlot = seedlotEntity.orElseThrow(SeedlotNotFoundException::new);

    /*
     * Merging entities script:
     * 1. Finds all for that seedlot
     * 2. Iterate over the result list
     * 3. Remove all existing entries except the seedlot row in the seedlot table
     * 5. Add new ones
     */

    // Collection step 1
    seedlotCollectionMethodService.saveSeedlotFormStep1(seedlot, form.seedlotFormCollectionDto());
    // Owner step 2
    seedlotOwnerQuantityService.saveSeedlotFormStep2(seedlot, form.seedlotFormOwnershipDtoList());
    // Interim Step 3
    saveSeedlotFormStep3(seedlot, form.seedlotFormInterimDto());
    // Orchard Step 4
    seedlotOrchardService.saveSeedlotFormStep4(seedlot, form.seedlotFormOrchardDto());
    // Parent Tree Step 5
    saveSeedlotFormStep5(seedlot, form.seedlotFormParentTreeSmpDtoList());
    // Extraction Step 6
    saveSeedlotFormStep6(seedlot, form.seedlotFormExtractionDto());

    String submittedStatus = "SUB";
    setSeedlotStatus(seedlot, submittedStatus);

    SparLog.info("Saving the Seedlot Entity for seedlot number {}", seedlotNumber);
    seedlotRepository.save(seedlot);

    return new SeedlotCreateResponseDto(
        seedlotNumber, seedlot.getSeedlotStatus().getSeedlotStatusCode());
  }

  private void setSeedlotStatus(Seedlot seedlot, String newStatus) {
    Optional<SeedlotStatusEntity> sseOptional =
        seedlotStatusService.getValidSeedlotStatus(newStatus);
    if (sseOptional.isEmpty()) {
      throw new SeedlotStatusNotFoundException();
    }
    seedlot.setSeedlotStatus(sseOptional.get());
  }

  private void saveSeedlotFormStep3(Seedlot seedlot, SeedlotFormInterimDto formStep3) {
    SparLog.info(
        "Saving Seedlot Form Step 3-Interim Storage for seedlot number {}", seedlot.getId());

    seedlot.setInterimStorageClientNumber(formStep3.intermStrgClientNumber());
    seedlot.setInterimStorageLocationCode(formStep3.intermStrgLocnCode());
    seedlot.setInterimStorageStartDate(formStep3.intermStrgStDate());
    seedlot.setInterimStorageEndDate(formStep3.intermStrgEndDate());
    seedlot.setInterimStorageFacilityCode(formStep3.intermFacilityCode());
    // If the facility type is Other, then a description is required.
    SparLog.info("{} FACILITY TYPE CODE", formStep3.intermFacilityCode());
    SparLog.info("FACILITY TYPE Desc", formStep3.intermOtherFacilityDesc());
    if (formStep3.intermFacilityCode().equals("OTH")) {
      SparLog.info("equal to OTH");
      if (formStep3.intermOtherFacilityDesc() == null
          || formStep3.intermOtherFacilityDesc().isEmpty()) {
        throw new SeedlotFormValidationException(
            "Invalid interim step data: Storage facility type description is needed for facility"
                + " type 'Other'. ");
      }
      seedlot.setInterimStorageOtherFacilityDesc(formStep3.intermOtherFacilityDesc());
    }
  }

  private void saveSeedlotFormStep5(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {
    SparLog.info(
        "Saving Seedlot Form Step 5-Parent Tree SMP Mix for seedlot number {}", seedlot.getId());

    seedlotParentTreeService.saveSeedlotFormStep5(seedlot, seedlotFormParentTreeDtoList);
    seedlotParentTreeGeneticQualityService.saveSeedlotFormStep5(
        seedlot, seedlotFormParentTreeDtoList);
    seedlotGeneticWorthService.saveSeedlotFormStep5(seedlot, seedlotFormParentTreeDtoList);

    smpMixService.saveSeedlotFormStep5(seedlot, seedlotFormParentTreeDtoList);
    smpMixGeneticQualityService.saveSeedlotFormStep5(seedlot, seedlotFormParentTreeDtoList);
    seedlotParentTreeSmpMixService.saveSeedlotFormStep5(seedlot, seedlotFormParentTreeDtoList);
  }

  private void saveSeedlotFormStep6(Seedlot seedlot, SeedlotFormExtractionDto formStep6) {
    SparLog.info(
        "Saving Seedlot Form Step 6-Extraction Storage for seedlot number {}", seedlot.getId());

    seedlot.setExtractionClientNumber(formStep6.extractoryClientNumber());
    seedlot.setExtractionLocationCode(formStep6.extractoryLocnCode());
    seedlot.setExtractionStartDate(formStep6.extractionStDate());
    seedlot.setExtractionEndDate(formStep6.extractionEndDate());

    seedlot.setStorageClientNumber(formStep6.storageClientNumber());
    seedlot.setStorageLocationCode(formStep6.storageLocnCode());
    seedlot.setTemporaryStorageStartDate(formStep6.temporaryStrgStartDate());
    seedlot.setTemporaryStorageEndDate(formStep6.temporaryStrgEndDate());
  }
}
