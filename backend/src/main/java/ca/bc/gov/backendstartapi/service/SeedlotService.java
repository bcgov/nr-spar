package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.Constants;
import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRequestDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRespondDto;
import ca.bc.gov.backendstartapi.dto.OrchardParentTreeValsDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.PtCalculationResDto;
import ca.bc.gov.backendstartapi.dto.PtValsCalReqDto;
import ca.bc.gov.backendstartapi.dto.SeedlotAclassFormDto;
import ca.bc.gov.backendstartapi.dto.SeedlotApplicationPatchDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormCollectionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormExtractionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormInterimDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOrchardDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOwnershipDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormSubmissionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotStatusResponseDto;
import ca.bc.gov.backendstartapi.dto.oracle.AreaOfUseDto;
import ca.bc.gov.backendstartapi.entity.ActiveOrchardSpuEntity;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotGeneticWorth;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeGeneticQuality;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeSmpMix;
import ca.bc.gov.backendstartapi.entity.SeedlotSeedPlanZoneEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotSourceEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.SmpMix;
import ca.bc.gov.backendstartapi.entity.SmpMixGeneticQuality;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeId;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOrchard;
import ca.bc.gov.backendstartapi.exception.GeneticClassNotFoundException;
import ca.bc.gov.backendstartapi.exception.InvalidSeedlotRequestException;
import ca.bc.gov.backendstartapi.exception.NoSpuForOrchardException;
import ca.bc.gov.backendstartapi.exception.SeedlotFormValidationException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotSourceNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotStatusNotFoundException;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotCollectionMethodRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotOwnerQuantityRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSeedPlanZoneRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotStatusRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
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

  private final SeedlotCollectionMethodRepository seedlotCollectionMethodRepository;

  private final SeedlotOwnerQuantityService seedlotOwnerQuantityService;

  private final SeedlotOwnerQuantityRepository seedlotOwnerQuantityRepository;

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

  private final ParentTreeService parentTreeService;

  @Qualifier("oracleApi")
  private final Provider oracleApiProvider;

  /**
   * Creates a Seedlot in the database.
   *
   * @param createDto A {@link SeedlotCreateDto} with required fields to create a seedlot.
   * @return A {@link SeedlotStatusResponseDto} containing the number and the status of the created
   *     seedlot.
   */
  @Transactional
  public SeedlotStatusResponseDto createSeedlot(SeedlotCreateDto createDto) {
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

    return new SeedlotStatusResponseDto(
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
   * Auxiliar function to get the genetic quality for each seedlot's parent tree.
   *
   * @param parentTreeId the parent tree id to get the genetic quality
   * @param seedlotNumber the seedlot that the current parent tree is
   * @return a list of {@link ParentTreeGeneticQualityDto}
   */
  private List<ParentTreeGeneticQualityDto> getParentTreeGenQual(
      Integer parentTreeId, String seedlotNumber) {
    List<SeedlotParentTreeGeneticQuality> genQualityData =
        seedlotParentTreeGeneticQualityService.getAllBySeedlotNumber(seedlotNumber);

    List<ParentTreeGeneticQualityDto> parentTreeGenQualList = new ArrayList<>();

    for (SeedlotParentTreeGeneticQuality parentTreeGenQual : genQualityData) {
      Integer curParentTreeId = parentTreeGenQual.getId().getSeedlotParentTree().getParentTreeId();
      if (curParentTreeId == parentTreeId) {
        ParentTreeGeneticQualityDto parentTreeGenQualDto =
            new ParentTreeGeneticQualityDto(
                parentTreeGenQual.getGeneticTypeCode(),
                parentTreeGenQual.getGeneticWorth().getGeneticWorthCode(),
                parentTreeGenQual.getGeneticQualityValue());
        parentTreeGenQualList.add(parentTreeGenQualDto);
      }
    }

    return parentTreeGenQualList;
  }

  /**
   * Auxiliar function to get the genetic quality for each seedlot's SMP Mix parent tree.
   *
   * @param mixTabInfo the Smp mix parent tree information
   * @param seedlotNumber the seedlot that the current parent tree is
   * @param sptMap a map of each parent tree in the orchard, to check if any smp mix parent tree is
   *     in the orchard or not
   * @return a list of {@link ParentTreeGeneticQualityDto}
   */
  private List<ParentTreeGeneticQualityDto> getSmpMixParentTreeGenQual(
      SmpMix mixTabInfo, String seedlotNumber, Map<SeedlotParentTreeId, SeedlotParentTree> sptMap) {
    List<SmpMixGeneticQuality> smpMixGenQualData =
        smpMixGeneticQualityService.getAllBySeedlotNumber(seedlotNumber);

    List<SeedlotParentTreeSmpMix> parentTreeSmpMixData =
        seedlotParentTreeSmpMixService.getAllBySeedlotNumber(seedlotNumber);

    List<ParentTreeGeneticQualityDto> smpMixGenQualList = new ArrayList<>();

    // If the current parent tree is in the orchard and also on the SMP Mix,
    // then, the genetic quality data comes from SeedlotParentTreeSmpMix list,
    // else, the gen quality data comes from SmpMixGeneticQuality
    if (sptMap.containsKey(mixTabInfo.getSeedlotParentTreeId())) {
      for (SeedlotParentTreeSmpMix sptSmpMixGenQual : parentTreeSmpMixData) {
        Integer parentTreeId = sptSmpMixGenQual.getId().getSeedlotParentTree().getParentTreeId();
        if (parentTreeId == mixTabInfo.getParentTreeId()) {
          ParentTreeGeneticQualityDto parentTreeGenQualDto =
              new ParentTreeGeneticQualityDto(
                  sptSmpMixGenQual.getGeneticTypeCode(),
                  sptSmpMixGenQual.getGeneticWorth().getGeneticWorthCode(),
                  sptSmpMixGenQual.getGeneticQualityValue());
          smpMixGenQualList.add(parentTreeGenQualDto);
        }
      }
    } else {
      for (SmpMixGeneticQuality smpMixGenQual : smpMixGenQualData) {
        Integer parentTreeId = smpMixGenQual.getId().getSmpMix().getParentTreeId();
        if (parentTreeId.equals(mixTabInfo.getParentTreeId())) {
          ParentTreeGeneticQualityDto parentTreeGenQualDto =
              new ParentTreeGeneticQualityDto(
                  smpMixGenQual.getGeneticTypeCode(),
                  smpMixGenQual.getGeneticWorth().getGeneticWorthCode(),
                  smpMixGenQual.getGeneticQualityValue());
          smpMixGenQualList.add(parentTreeGenQualDto);
        }
      }
    }

    return smpMixGenQualList;
  }

  /**
   * Retrieve a single seedlot information, with all parent tree data and calculation results.
   *
   * @param seedlotNumber the seedlot number of the seedlot to fetch the information
   * @return A {@link SeedlotAclassFormDto} containing the number and the status of the created
   *     seedlot.
   * @throws SeedlotNotFoundException in case of errors.
   */
  public SeedlotAclassFormDto getAclassSeedlotFormInfo(@NonNull String seedlotNumber) {
    SparLog.info("Retrieving complete information for A-class Seedlot number {}", seedlotNumber);

    List<SeedlotParentTree> parentTreeData =
        seedlotParentTreeService.getAllSeedlotParentTree(seedlotNumber);

    List<SmpMix> smpMixsData = smpMixService.getAllBySeedlotNumber(seedlotNumber);

    List<SeedlotGeneticWorth> genWorthData =
        seedlotGeneticWorthService.getAllBySeedlotNumber(seedlotNumber);

    List<SeedlotFormParentTreeSmpDto> parentTreesInfo = new ArrayList<>();

    // Iterate thru the seedlot parent tree list and get these
    // seedlot data
    for (SeedlotParentTree parentTree : parentTreeData) {
      SeedlotFormParentTreeSmpDto curParentTree =
          new SeedlotFormParentTreeSmpDto(
              seedlotNumber,
              parentTree.getParentTreeId(),
              parentTree.getParentTreeNumber(),
              parentTree.getConeCount(),
              parentTree.getPollenCount(),
              parentTree.getSmpSuccessPercentage(),
              parentTree.getNonOrchardPollenContaminationCount(),
              null,
              null,
              getParentTreeGenQual(parentTree.getParentTreeId(), seedlotNumber));

      parentTreesInfo.add(curParentTree);
    }

    List<SeedlotFormParentTreeSmpDto> smpMixParentTreesInfo = new ArrayList<>();

    if (smpMixsData.size() > 0) {
      // This map is used to see if any SMPMix parent tree
      // are in the current orchard
      Map<SeedlotParentTreeId, SeedlotParentTree> sptMap =
          parentTreeData.stream()
              .collect(Collectors.toMap(SeedlotParentTree::getId, Function.identity()));

      for (SmpMix mixTabInfo : smpMixsData) {
        SeedlotFormParentTreeSmpDto curSmpMix =
            new SeedlotFormParentTreeSmpDto(
                seedlotNumber,
                mixTabInfo.getParentTreeId(),
                mixTabInfo.getParentTreeNumber(),
                null,
                null,
                null,
                null,
                mixTabInfo.getAmountOfMaterial(),
                mixTabInfo.getProportion(),
                getSmpMixParentTreeGenQual(mixTabInfo, seedlotNumber, sptMap));
        smpMixParentTreesInfo.add(curSmpMix);
      }
    }

    List<GeneticWorthTraitsDto> calculatedGenWorth = new ArrayList<>();

    for (SeedlotGeneticWorth genWorth : genWorthData) {
      GeneticWorthTraitsDto curGenWorth =
          new GeneticWorthTraitsDto(
              genWorth.getGeneticWorthCode(),
              null,
              genWorth.getGeneticQualityValue(),
              genWorth.getTestedParentTreeContributionPercentage());
      calculatedGenWorth.add(curGenWorth);
    }

    // Get seedlot data
    Seedlot seedlotInfo =
        seedlotRepository.findById(seedlotNumber).orElseThrow(SeedlotNotFoundException::new);

    List<Integer> seedlotCollectionList =
        seedlotCollectionMethodRepository.findAllBySeedlot_id(seedlotInfo.getId()).stream()
            .map(col -> col.getConeCollectionMethod().getConeCollectionMethodCode())
            .collect(Collectors.toList());

    // Divide the seedlot data to each respective step
    SeedlotFormCollectionDto collectionStep =
        new SeedlotFormCollectionDto(
            seedlotInfo.getCollectionClientNumber(),
            seedlotInfo.getCollectionLocationCode(),
            seedlotInfo.getCollectionStartDate(),
            seedlotInfo.getCollectionEndDate(),
            seedlotInfo.getNumberOfContainers(),
            seedlotInfo.getContainerVolume(),
            seedlotInfo.getTotalConeVolume(),
            seedlotInfo.getComment(),
            seedlotCollectionList);

    List<SeedlotFormOwnershipDto> ownershipStep =
        seedlotOwnerQuantityRepository.findAllBySeedlot_id(seedlotInfo.getId()).stream()
            .map(
                owner ->
                    new SeedlotFormOwnershipDto(
                        owner.getOwnerClientNumber(),
                        owner.getOwnerLocationCode(),
                        owner.getOriginalPercentageOwned(),
                        owner.getOriginalPercentageReserved(),
                        owner.getOriginalPercentageSurplus(),
                        owner.getMethodOfPayment().getMethodOfPaymentCode(),
                        owner.getFundingSourceCode()))
            .collect(Collectors.toList());

    SeedlotFormInterimDto interimStep =
        new SeedlotFormInterimDto(
            seedlotInfo.getInterimStorageClientNumber(),
            seedlotInfo.getInterimStorageLocationCode(),
            seedlotInfo.getInterimStorageStartDate(),
            seedlotInfo.getInterimStorageEndDate(),
            seedlotInfo.getInterimStorageOtherFacilityDesc(),
            seedlotInfo.getInterimStorageFacilityCode());

    List<SeedlotOrchard> seedlotOrchards =
        seedlotOrchardService.getAllSeedlotOrchardBySeedlotNumber(seedlotInfo.getId());

    List<SeedlotOrchard> filteredPrimaryOrchard =
        seedlotOrchards.stream().filter(so -> so.getIsPrimary()).toList();

    String primaryOrchardId =
        filteredPrimaryOrchard.isEmpty()
            ? filteredPrimaryOrchard.get(0).getOrchardId()
            : seedlotOrchards.get(0).getOrchardId();

    Optional<String> secondaryOrchardId =
        seedlotOrchards.size() > 1
            ? Optional.of(seedlotOrchards.get(1).getOrchardId())
            : Optional.empty();

    SeedlotFormOrchardDto orchardStep =
        new SeedlotFormOrchardDto(
            primaryOrchardId,
            secondaryOrchardId.orElse(null),
            seedlotInfo.getFemaleGameticContributionMethod(),
            seedlotInfo.getMaleGameticContributionMethod(),
            seedlotInfo.getProducedThroughControlledCross(),
            seedlotInfo.getProducedWithBiotechnologicalProcesses(),
            seedlotInfo.getPollenContaminationPresentInOrchard(),
            seedlotInfo.getPollenContaminationPercentage(),
            seedlotInfo.getPollenContaminantBreedingValue(),
            seedlotInfo.getPollenContaminationMethodCode());

    SeedlotFormExtractionDto extractionStep =
        new SeedlotFormExtractionDto(
            seedlotInfo.getExtractionClientNumber(),
            seedlotInfo.getExtractionLocationCode(),
            seedlotInfo.getExtractionStartDate(),
            seedlotInfo.getExtractionEndDate(),
            seedlotInfo.getStorageClientNumber(),
            seedlotInfo.getStorageLocationCode(),
            seedlotInfo.getTemporaryStorageStartDate(),
            seedlotInfo.getTemporaryStorageEndDate());

    SeedlotAclassFormDto seedlotAclassFullInfo =
        new SeedlotAclassFormDto(
            new SeedlotFormSubmissionDto(
                collectionStep,
                ownershipStep,
                interimStep,
                orchardStep,
                parentTreesInfo,
                smpMixParentTreesInfo,
                extractionStep),
            calculatedGenWorth);

    SparLog.info("Seedlot registration info found for seedlot {}", seedlotNumber);
    return seedlotAclassFullInfo;
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
   * Save or edit the entire {@link Seedlot} form with all steps.
   *
   * @param seedlotNumber The Seedlot identification
   * @param form The {@link SeedlotFormSubmissionDto} containing all form fields
   * @param isTscAdmin determines whether this operation is initiated by a tsc admin
   * @param statusOnSuccess the status to set if the operation is successful
   * @return A {@link SeedlotStatusResponseDto} with the seedlot number and status
   */
  @Transactional
  public SeedlotStatusResponseDto updateSeedlotWithForm(
      String seedlotNumber,
      SeedlotFormSubmissionDto form,
      boolean isTscAdmin,
      String statusOnSuccess) {

    if (isTscAdmin) {
      SparLog.info("Received request by TSC admin to update seedlot {}", seedlotNumber);
    } else {
      SparLog.info("Received request to update seedlot {}", seedlotNumber);
    }

    Optional<Seedlot> seedlotEntity = seedlotRepository.findById(seedlotNumber);
    Seedlot seedlot = seedlotEntity.orElseThrow(SeedlotNotFoundException::new);

    String currentSeedlotStauts = seedlot.getSeedlotStatus().getSeedlotStatusCode();

    /*
     * This determines whether delete actions can be performed
     * non-tsc users can perform delete actions when the seedlot is in pending or incomplete status
     * TSC admins can perform delete actions without regard of the seedlot's status
     */
    boolean canDelete =
        currentSeedlotStauts.equals("PND") || currentSeedlotStauts.equals("INC") || isTscAdmin;

    /*
     * Merging entities script:
     * 1. Finds all for that seedlot
     * 2. Iterate over the result list
     * 3. If isEdit = true, Remove all existing entries except the seedlot row in the seedlot table
     * 4. Add new ones
     */

    // Collection step 1
    seedlotCollectionMethodService.saveSeedlotFormStep1(
        seedlot, form.seedlotFormCollectionDto(), canDelete);
    // Owner step 2
    seedlotOwnerQuantityService.saveSeedlotFormStep2(
        seedlot, form.seedlotFormOwnershipDtoList(), canDelete);
    // Interim Step 3
    saveSeedlotFormStep3(seedlot, form.seedlotFormInterimDto());
    // Orchard Step 4
    seedlotOrchardService.saveSeedlotFormStep4(seedlot, form.seedlotFormOrchardDto(), canDelete);
    // Parent Tree Step 5
    saveSeedlotFormStep5(
        seedlot,
        form.seedlotFormParentTreeDtoList(),
        form.seedlotFormParentTreeSmpDtoList(),
        canDelete);
    // Extraction Step 6
    saveSeedlotFormStep6(seedlot, form.seedlotFormExtractionDto());

    setParentTreeContribution(
        seedlot, form.seedlotFormParentTreeDtoList(), form.seedlotFormParentTreeSmpDtoList());

    setAreaOfUse(seedlot, form.seedlotFormOrchardDto().primaryOrchardId());

    setSeedlotStatus(seedlot, statusOnSuccess);

    SparLog.info("Saving the Seedlot Entity for seedlot number {}", seedlotNumber);
    seedlotRepository.save(seedlot);

    SparLog.info("Seedlot entity and related tables successfully saved.");
    return new SeedlotStatusResponseDto(
        seedlotNumber, seedlot.getSeedlotStatus().getSeedlotStatusCode());
  }

  private void setParentTreeContribution(
      Seedlot seedlot,
      List<SeedlotFormParentTreeSmpDto> orchardPtDtoList,
      List<SeedlotFormParentTreeSmpDto> smpPtDtoList) {

    List<OrchardParentTreeValsDto> orchardPtVals = convertToPtVals(orchardPtDtoList);
    List<GeospatialRequestDto> smpMixIdAndProps = convertToGeoRes(smpPtDtoList);

    PtValsCalReqDto ptValsCalReqDto = new PtValsCalReqDto(orchardPtVals, smpMixIdAndProps);

    PtCalculationResDto ptCalculationResDto = parentTreeService.calculatePtVals(ptValsCalReqDto);

    GeospatialRespondDto collectionGeoData =
        ptCalculationResDto.calculatedPtVals().getGeospatialData();

    // Elevation
    seedlot.setCollectionElevation(collectionGeoData.getMeanElevation());

    // Latitude DMS
    seedlot.setCollectionLatitudeDeg(collectionGeoData.getMeanLatitudeDegree());
    seedlot.setCollectionLatitudeMin(collectionGeoData.getMeanLatitudeMinute());
    seedlot.setCollectionLatitudeSec(collectionGeoData.getMeanLatitudeSecond());

    // Longitude DMS
    seedlot.setCollectionLongitudeDeg(collectionGeoData.getMeanLongitudeDegree());
    seedlot.setCollectionLongitudeMin(collectionGeoData.getMeanLongitudeMinute());
    seedlot.setCollectionLongitudeSec(collectionGeoData.getMeanLongitudeSecond());
  }

  private List<OrchardParentTreeValsDto> convertToPtVals(
      List<SeedlotFormParentTreeSmpDto> orchardPtDtoList) {
    List<OrchardParentTreeValsDto> converted = new ArrayList<>();

    orchardPtDtoList.stream()
        .forEach(
            orchardPtDto -> {
              OrchardParentTreeValsDto toAdd =
                  new OrchardParentTreeValsDto(
                      orchardPtDto.parentTreeId().toString(),
                      orchardPtDto.parentTreeNumber(),
                      orchardPtDto.coneCount(),
                      orchardPtDto.pollenCount(),
                      orchardPtDto.smpSuccessPct(),
                      getGeneticTraitList(orchardPtDto.parentTreeGeneticQualities()));
              converted.add(toAdd);
            });

    return converted;
  }

  private List<GeospatialRequestDto> convertToGeoRes(
      List<SeedlotFormParentTreeSmpDto> smpPtDtoList) {
    List<GeospatialRequestDto> geoList = new ArrayList<>();

    smpPtDtoList.stream()
        .forEach(
            smpDto -> {
              GeospatialRequestDto toAdd =
                  new GeospatialRequestDto(
                      Long.valueOf(smpDto.parentTreeId()), smpDto.proportion());
              geoList.add(toAdd);
            });

    return geoList;
  }

  private List<GeneticWorthTraitsDto> getGeneticTraitList(
      List<ParentTreeGeneticQualityDto> genQualList) {
    List<GeneticWorthTraitsDto> genTraitList = new ArrayList<>();

    genQualList.stream()
        .forEach(
            genQual -> {
              GeneticWorthTraitsDto toAdd =
                  new GeneticWorthTraitsDto(
                      genQual.geneticTypeCode(), genQual.geneticQualityValue(), null, null);
              genTraitList.add(toAdd);
            });

    return genTraitList;
  }

  /**
   * Reference Legacy Procedure: get_tested_area_of_use_geog from database/ddl/pkg/SPR_SEEDLOT.PKS
   *
   * @param seedlot the seedlot object to set data to
   * @param primaryOrchardId the primary orchard Id to find the spu for
   */
  private void setAreaOfUse(Seedlot seedlot, String primaryOrchardId) {
    ActiveOrchardSpuEntity activeSpuEntity =
        orchardService
            .findSpuIdByOrchardWithActive(primaryOrchardId, true)
            .orElseThrow(NoSpuForOrchardException::new);
    Integer activeSpuId = activeSpuEntity.getSeedPlanningUnitId();
    AreaOfUseDto areaOfUseDto = oracleApiProvider.getAreaOfUseData(activeSpuId);

    // Elevation
    seedlot.setElevationMax(areaOfUseDto.getAreaOfUseSpuGeoDto().getElevationMax());
    seedlot.setElevationMin(areaOfUseDto.getAreaOfUseSpuGeoDto().getElevationMin());

    // Latitude Degree, use collection mean if value is null
    Integer testedLatDegMax = areaOfUseDto.getAreaOfUseSpuGeoDto().getLatitudeDegreesMax();
    Integer collectionLatDegMean = seedlot.getCollectionLatitudeDeg();
    if (testedLatDegMax == null) {
      seedlot.setLatitudeDegMax(collectionLatDegMean);
    } else {
      seedlot.setLatitudeDegMax(testedLatDegMax);
    }

    Integer testedLatDegMin = areaOfUseDto.getAreaOfUseSpuGeoDto().getLatitudeDegreesMin();
    if (testedLatDegMin == null) {
      seedlot.setLatitudeDegMin(collectionLatDegMean);
    } else {
      seedlot.setLatitudeDegMin(testedLatDegMin);
    }

    // Latitude Minute, use collection mean if value is null
    Integer testedLatMinutesMax = areaOfUseDto.getAreaOfUseSpuGeoDto().getLatitudeMinutesMax();
    Integer collectionLatMinMean = seedlot.getCollectionLatitudeMin();
    if (testedLatMinutesMax == null) {
      seedlot.setLatitudeMinMax(collectionLatMinMean);
    } else {
      seedlot.setLatitudeMinMax(testedLatMinutesMax);
    }

    Integer testedLatMinutesMin = areaOfUseDto.getAreaOfUseSpuGeoDto().getLatitudeMinutesMin();
    if (testedLatMinutesMin == null) {
      seedlot.setLatitudeMinMin(collectionLatMinMean);
    } else {
      seedlot.setLatitudeMinMin(testedLatMinutesMin);
    }

    // Latitude second = 0, legacy spar does not provide a min max for seconds, collection
    // lat/long second is not calculated and is defaulted to 0 since it's not accurate to use.
    seedlot.setLatitudeSecMax(0);
    seedlot.setLatitudeSecMin(0);

    // Longitude data is not provided in A-Class tested parent tree area of use, default to
    // collection data
    seedlot.setLongitudeDegMax(seedlot.getCollectionLongitudeDeg());
    seedlot.setLongitudeDegMin(seedlot.getCollectionLongitudeDeg());

    seedlot.setLongitudeMinMax(seedlot.getCollectionLongitudeMin());
    seedlot.setLongitudeMinMin(seedlot.getCollectionLongitudeMin());
    // Seconds default to 0
    seedlot.setLongitudeSecMax(0);
    seedlot.setLongitudeSecMin(0);

    // Set SPZs
    List<SeedlotSeedPlanZoneEntity> spzSaveList = new ArrayList<>();
    GeneticClassEntity genAclass =
        geneticClassRepository.findById("A").orElseThrow(GeneticClassNotFoundException::new);
    areaOfUseDto.getSpzList().stream()
        .forEach(
            spzDto -> {
              SeedlotSeedPlanZoneEntity sspzToSave =
                  new SeedlotSeedPlanZoneEntity(
                      seedlot,
                      spzDto.getCode(),
                      genAclass,
                      spzDto.getIsPrimary(),
                      spzDto.getDescription());
              sspzToSave.setAuditInformation(
                  new AuditInformation(loggedUserService.getLoggedUserId()));
              spzSaveList.add(sspzToSave);
            });
    seedlotSeedPlanZoneRepository.saveAll(spzSaveList);
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
      List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeSmpDtoList,
      boolean canDelete) {
    SparLog.info(
        "Saving Seedlot Form Step-5 Parent Tree SMP Mix for seedlot number {}", seedlot.getId());

    seedlotParentTreeService.saveSeedlotFormStep5(seedlot, seedlotFormParentTreeDtoList, canDelete);
    seedlotParentTreeGeneticQualityService.saveSeedlotFormStep5(
        seedlot, seedlotFormParentTreeDtoList);
    seedlotGeneticWorthService.saveSeedlotFormStep5(
        seedlot, seedlotFormParentTreeDtoList, canDelete);

    // SMP Mix information is optional, so the array may be empty,
    // in this case there is no need to save the list
    if (!seedlotFormParentTreeSmpDtoList.isEmpty()) {
      smpMixService.saveSeedlotFormStep5(seedlot, seedlotFormParentTreeSmpDtoList);
      smpMixGeneticQualityService.saveSeedlotFormStep5(seedlot, seedlotFormParentTreeSmpDtoList);
      seedlotParentTreeSmpMixService.saveSeedlotFormStep5(
          seedlot, seedlotFormParentTreeSmpDtoList, canDelete);
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
