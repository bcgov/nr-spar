package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.Constants;
import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SeedPlanZoneDto;
import ca.bc.gov.backendstartapi.dto.SeedlotApplicationPatchDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateResponseDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormExtractionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormInterimDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormSubmissionDto;
import ca.bc.gov.backendstartapi.entity.ActiveOrchardSpuEntity;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotSeedPlanZoneEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotSourceEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOrchard;
import ca.bc.gov.backendstartapi.entity.seedlot.idclass.SeedlotSeedPlanZoneId;
import ca.bc.gov.backendstartapi.exception.InvalidSeedlotRequestException;
import ca.bc.gov.backendstartapi.exception.SeedlotFormValidationException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotOrchardNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotSourceNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotStatusNotFoundException;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSeedPlanZoneRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotStatusRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.lang.NonNull;
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

  private final OrchardService orchardService;

  private final SeedlotSeedPlanZoneRepository seedlotSeedPlanZoneRepository;

  @Qualifier("oracleApi")
  private final Provider oracleApiProvider;

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
    SparLog.info("Retrieving next seedlot number for class-{}", seedlotClassCode);

    if (seedlotClassCode.equals('B')) {
      SparLog.error("Class-b seedlots not implemented yet!");
      throw new InvalidSeedlotRequestException();
    }

    Integer seedlotNumber =
        seedlotRepository.findNextSeedlotNumber(
            Constants.CLASS_A_SEEDLOT_NUM_MIN, Constants.CLASS_A_SEEDLOT_NUM_MAX);

    if (Objects.isNull(seedlotNumber)) {
      seedlotNumber = Constants.CLASS_A_SEEDLOT_NUM_MIN;
    }

    seedlotNumber += 1;

    SparLog.info("Next seedlot number for class-{} {}", seedlotClassCode, seedlotNumber);
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
    SparLog.info("Retrieving paginated list of seedlots for the user {}", userId);
    if (pageSize == 0) {
      SparLog.info("No given value for the page size, using default 10.");
      pageSize = 10;
    }

    SparLog.info("Pagination settings: pageNumber {}, pageSize {}", pageNumber, pageSize);
    Pageable sortedPageable =
        PageRequest.of(
            pageNumber, pageSize, Sort.by(Direction.DESC, "AuditInformation_UpdateTimestamp"));

    Page<Seedlot> seedlotPage =
        seedlotRepository.findAllByAuditInformation_EntryUserId(userId, sortedPageable);
    SparLog.info("{} results and {} pages", seedlotPage.getNumber(), seedlotPage.getTotalPages());
    return Optional.of(seedlotPage);
  }

  /**
   * Retrieve a single seedlot information.
   *
   * @param seedlotNumber the seedlot number of the seedlot to fetch the information
   * @return A Seedlot entity.
   * @throws SeedlotNotFoundException in case of errors.
   */
  public Seedlot getSingleSeedlotInfo(@NonNull String seedlotNumber) {
    SparLog.info("Retrieving information for Seedlot number {}", seedlotNumber);

    Seedlot seedlotInfo =
        seedlotRepository.findById(seedlotNumber).orElseThrow(SeedlotNotFoundException::new);

    SparLog.info("Seedlot number {} found", seedlotNumber);
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
  public Seedlot patchApplicantionInfo(
      @NonNull String seedlotNumber, SeedlotApplicationPatchDto patchDto) {
    SparLog.info("Patching seedlot entry for seedlot number {}", seedlotNumber);

    Seedlot seedlotInfo =
        seedlotRepository.findById(seedlotNumber).orElseThrow(SeedlotNotFoundException::new);

    SparLog.info("Seedlot number {} found", seedlotNumber);

    seedlotInfo.setApplicantEmailAddress(patchDto.applicantEmailAddress());

    SeedlotSourceEntity updatedSource =
        seedlotSourceRepository
            .findById(patchDto.seedlotSourceCode())
            .orElseThrow(SeedlotSourceNotFoundException::new);

    seedlotInfo.setSeedlotSource(updatedSource);

    seedlotInfo.setSourceInBc(patchDto.bcSourceInd());

    // The field intendedForCrownLand == to be registered indicator.
    seedlotInfo.setIntendedForCrownLand(patchDto.toBeRegistrdInd());

    Seedlot seedlotSaved = seedlotRepository.save(seedlotInfo);
    SparLog.info("Seedlot number {} successfully patched", seedlotNumber);
    return seedlotSaved;
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
    saveSeedlotFormStep5(
        seedlot, form.seedlotFormParentTreeDtoList(), form.seedlotFormParentTreeSmpDtoList());
    // Extraction Step 6
    saveSeedlotFormStep6(seedlot, form.seedlotFormExtractionDto());

    String submittedStatus = "SUB";
    setSeedlotStatus(seedlot, submittedStatus);

    setSeedlotSpzInformation(seedlot);

    SparLog.info("Saving the Seedlot Entity for seedlot number {}", seedlotNumber);
    seedlotRepository.save(seedlot);

    SparLog.info("Seedlot entity and related tables successfully saved.");
    return new SeedlotCreateResponseDto(
        seedlotNumber, seedlot.getSeedlotStatus().getSeedlotStatusCode());
  }

  /**
   * Get all the seed plan zone information given a seedlot number.
   *
   * @param seedlotNumber the Seedlot id
   * @return A list of {@link SeedPlanZoneDto} containing all records.
   * @throws SeedlotNotFoundException if seedlot was not found.
   * @throws SeedlotOrchardNotFoundException if no orchard found for the seedlot.
   */
  public List<SeedPlanZoneDto> getSeedPlanZoneData(String seedlotNumber) {
    SparLog.info("Getting Seed Plan Zone data for seedlot number {}", seedlotNumber);

    SparLog.info("Fetching seedlot entity");
    Optional<Seedlot> seedlotOp = seedlotRepository.findById(seedlotNumber);
    if (seedlotOp.isEmpty()) {
      throw new SeedlotNotFoundException();
    }

    SparLog.info("Fetching seedlot seed plan zone entity");
    List<SeedlotSeedPlanZoneEntity> sspzList =
        seedlotSeedPlanZoneRepository.findAllBySeedlot_id(seedlotNumber);

    SparLog.info("Fetching seedlot orchard entity");
    List<String> orchardIdList =
        seedlotOrchardService.getAllSeedlotOrchardBySeedlotNumber(seedlotNumber).stream()
            .map(SeedlotOrchard::getOrchard)
            .toList();

    if (orchardIdList.isEmpty()) {
      SparLog.warn("No orchard record found for the seedlot");
      throw new SeedlotOrchardNotFoundException();
    }

    List<SeedPlanZoneDto> spzDtoList = new ArrayList<>();

    for (String orchardId : orchardIdList) {
      SparLog.info("Fetching active orchard seed plannining unit entity");

      Optional<ActiveOrchardSpuEntity> spuOp =
          orchardService.findSpuIdByOrchardWithActive(orchardId, true);
      if (spuOp.isEmpty()) {
        SparLog.warn("No ActiveOrchardSpuEntity record found for orchard id {}", orchardId);
        continue;
      }

      Optional<SeedlotSeedPlanZoneEntity> sspzOp = sspzList.stream().findFirst();

      if (sspzOp.isPresent()) {
        SparLog.info("Creating Seed Plan Zone dto response");
        spzDtoList.add(
            new SeedPlanZoneDto(
                spuOp.get().getSeedPlanningUnitId(),
                sspzOp.get().getSeedPlanZoneId(),
                sspzOp.get().getGeneticClass().getGeneticClassCode().charAt(0),
                sspzOp.get().getSeedPlanZoneCode(),
                seedlotOp.get().getVegetationCode(),
                seedlotOp.get().getElevationMin(),
                seedlotOp.get().getElevationMax()));
      } else {
        SparLog.warn("No Seed plan Zone found for spu id {}", spuOp.get().getSeedPlanningUnitId());
      }
    }

    if (spzDtoList.isEmpty()) {
      SparLog.warn("ActiveOrchardSpuEntity record not found for any seedlot orchard");
      throw new SeedlotOrchardNotFoundException();
    }

    return spzDtoList;
  }

  private void setSeedlotSpzInformation(Seedlot seedlot) {
    if (!seedlot.getSeedlotSource().getSeedlotSourceCode().equals("TPT")) {
      SparLog.warn(
          "Skipping SPZ information for seedlot {}, due the seedlot source code not being tested!",
          seedlot.getId());
      return;
    }

    List<SeedlotOrchard> seedlotOrchards =
        seedlotOrchardService.getAllSeedlotOrchardBySeedlotNumber(seedlot.getId());

    List<Integer> spuIds = new ArrayList<>();
    Map<String, Integer> orchardIdSpuIdMap = new HashMap<>();

    for (SeedlotOrchard orchard : seedlotOrchards) {
      Optional<ActiveOrchardSpuEntity> spuEntity =
          orchardService.findSpuIdByOrchardWithActive(orchard.getOrchard(), true);
      if (spuEntity.isPresent()) {
        Integer spuId = spuEntity.get().getSeedPlanningUnitId();

        SparLog.info("Adding SPU id to fetch from Oracle {}", spuId);
        spuIds.add(spuId);
        orchardIdSpuIdMap.put(orchard.getOrchard(), spuId);
      } else {
        SparLog.info("No SPU id found for orchard");
      }
    }

    List<SeedPlanZoneDto> seedPlanZoneResp = oracleApiProvider.getSpzInformationBySpuIds(spuIds);

    for (SeedPlanZoneDto spz : seedPlanZoneResp) {
      SeedlotSeedPlanZoneId spzId =
          new SeedlotSeedPlanZoneId(seedlot.getId(), spz.getSeedPlanZoneCode());
      Optional<SeedlotSeedPlanZoneEntity> spzEntityOp =
          seedlotSeedPlanZoneRepository.findById(spzId);

      if (spzEntityOp.isPresent()) {
        seedlotSeedPlanZoneRepository.deleteById(spzId);
        seedlotSeedPlanZoneRepository.flush();
      }

      Optional<GeneticClassEntity> classEntity =
          geneticClassRepository.findById(spz.getGeneticClassCode().toString());

      SeedlotSeedPlanZoneEntity spzEntity =
          new SeedlotSeedPlanZoneEntity(
              seedlot,
              spz.getSeedPlanZoneCode(),
              spz.getSeedPlanZoneId(),
              classEntity.orElseThrow(InvalidSeedlotRequestException::new));
      spzEntity.setAuditInformation(new AuditInformation(loggedUserService.getLoggedUserId()));

      seedlotSeedPlanZoneRepository.saveAndFlush(spzEntity);

      seedlot.setElevationMin(spz.getElevationMin());
      seedlot.setElevationMax(spz.getElevationMax());
    }
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
      Seedlot seedlot,
      List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList,
      List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeSmpDtoList) {
    SparLog.info(
        "Saving Seedlot Form Step 5-Parent Tree SMP Mix for seedlot number {}", seedlot.getId());

    seedlotParentTreeService.saveSeedlotFormStep5(seedlot, seedlotFormParentTreeDtoList);
    seedlotParentTreeGeneticQualityService.saveSeedlotFormStep5(
        seedlot, seedlotFormParentTreeDtoList);
    seedlotGeneticWorthService.saveSeedlotFormStep5(seedlot, seedlotFormParentTreeDtoList);

    // SMP Mix information is optional, so the array may be empty,
    // in this case there is no need to save the list
    if (!seedlotFormParentTreeSmpDtoList.isEmpty()) {
      smpMixService.saveSeedlotFormStep5(seedlot, seedlotFormParentTreeSmpDtoList);
      smpMixGeneticQualityService.saveSeedlotFormStep5(seedlot, seedlotFormParentTreeSmpDtoList);
      seedlotParentTreeSmpMixService.saveSeedlotFormStep5(seedlot, seedlotFormParentTreeSmpDtoList);
    } else {
      SparLog.info("No SmpMix data for seedlot number {}", seedlot.getId());
    }
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
