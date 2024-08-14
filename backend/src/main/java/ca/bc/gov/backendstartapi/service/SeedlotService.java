package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.Constants;
import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRequestDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRespondDto;
import ca.bc.gov.backendstartapi.dto.OrchardDto;
import ca.bc.gov.backendstartapi.dto.OrchardParentTreeValsDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.PtCalculationResDto;
import ca.bc.gov.backendstartapi.dto.PtValsCalReqDto;
import ca.bc.gov.backendstartapi.dto.SeedPlanZoneDto;
import ca.bc.gov.backendstartapi.dto.SeedlotAclassFormDto;
import ca.bc.gov.backendstartapi.dto.SeedlotApplicationPatchDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateDto;
import ca.bc.gov.backendstartapi.dto.SeedlotDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormCollectionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormExtractionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormInterimDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOrchardDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOwnershipDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormSubmissionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotSaveInMemoryDto;
import ca.bc.gov.backendstartapi.dto.SeedlotStatusResponseDto;
import ca.bc.gov.backendstartapi.dto.oracle.AreaOfUseDto;
import ca.bc.gov.backendstartapi.dto.oracle.SpuDto;
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
import ca.bc.gov.backendstartapi.exception.OracleApiProviderException;
import ca.bc.gov.backendstartapi.exception.SeedlotConflictDataException;
import ca.bc.gov.backendstartapi.exception.SeedlotFormValidationException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotSourceNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotStatusNotFoundException;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSeedPlanZoneRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import ca.bc.gov.backendstartapi.security.UserInfo;
import ca.bc.gov.backendstartapi.util.ValueUtil;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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

  private final ParentTreeService parentTreeService;

  private final TscAdminService tscAdminService;

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
        seedlotStatusService.findById(Constants.CLASS_A_SEEDLOT_STATUS);
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

    if (!ValueUtil.hasValue(seedlotNumber)) {
      seedlotNumber = Constants.CLASS_A_SEEDLOT_NUM_MIN;
    }

    seedlotNumber += 1;

    SparLog.info("Next seedlot number for class-{} {}", seedlotClassCode, seedlotNumber);
    return String.valueOf(seedlotNumber);
  }

  /**
   * Retrieve a paginated list of seedlot for the user selected client.
   *
   * @param clientId the id of the client to fetch the seedlots for
   * @param pageNumber the page number for the paginated search
   * @param pageSize the size of the page
   * @return a list of the user's seedlots
   */
  public Optional<Page<Seedlot>> getSeedlotByClientId(
      String clientId, int pageNumber, int pageSize) {
    Optional<UserInfo> userInfo = loggedUserService.getLoggedUserInfo();

    loggedUserService.verifySeedlotAccessPrivilege(clientId);

    SparLog.info(
        "Retrieving paginated list of seedlots for the user: {} with client id: {}",
        userInfo.isPresent() ? userInfo.get().id() : null,
        clientId);

    if (pageSize == 0) {
      SparLog.info("No given value for the page size, using default 10.");
      pageSize = 10;
    }

    SparLog.info("Pagination settings: pageNumber {}, pageSize {}", pageNumber, pageSize);
    Pageable sortedPageable =
        PageRequest.of(
            pageNumber, pageSize, Sort.by(Direction.DESC, "AuditInformation_UpdateTimestamp"));

    Page<Seedlot> seedlotPage =
        seedlotRepository.findAllByApplicantClientNumber(clientId, sortedPageable);
    SparLog.info("{} results and {} pages", seedlotPage.getNumber(), seedlotPage.getTotalPages());
    return Optional.of(seedlotPage);
  }

  /**
   * Retrieve a single seedlot information.
   *
   * @param seedlotNumber the seedlot number of the seedlot to fetch the information
   * @return A {@link SeedlotDto}.
   * @throws SeedlotNotFoundException in case of errors.
   */
  public SeedlotDto getSingleSeedlotInfo(@NonNull String seedlotNumber) {

    SparLog.info("Retrieving information for Seedlot number {}", seedlotNumber);

    Seedlot seedlotEntity =
        seedlotRepository.findById(seedlotNumber).orElseThrow(SeedlotNotFoundException::new);

    SparLog.info("Seedlot number {} found", seedlotNumber);

    String clientId = seedlotEntity.getApplicantClientNumber();

    loggedUserService.verifySeedlotAccessPrivilege(clientId);

    SeedlotDto seedlotDto = new SeedlotDto();

    seedlotDto.setSeedlot(seedlotEntity);

    fillPrimarySpu(seedlotDto);

    SparLog.info("Finding associated seedlot SPZs for seedlot {}", seedlotNumber);

    List<SeedlotSeedPlanZoneEntity> spzList =
        seedlotSeedPlanZoneRepository.findAllBySeedlot_id(seedlotNumber);

    SparLog.info("Found {} SPZs for seedlot {}", spzList.size(), seedlotNumber);

    SeedPlanZoneDto primarySpz = null;

    List<SeedPlanZoneDto> additionalSpzList = new ArrayList<>();

    if (spzList.size() > 0) {
      List<SeedlotSeedPlanZoneEntity> primarySpzList =
          spzList.stream().filter(spz -> spz.getIsPrimary()).toList();

      if (primarySpzList.size() > 0) {
        SeedlotSeedPlanZoneEntity primarySpzEntity = primarySpzList.get(0);
        primarySpz =
            new SeedPlanZoneDto(
                primarySpzEntity.getSpzCode(),
                primarySpzEntity.getSpzDescription(),
                primarySpzEntity.getIsPrimary());
      }

      additionalSpzList =
          spzList.stream()
              .filter(spz -> !spz.getIsPrimary())
              .map(
                  spz ->
                      new SeedPlanZoneDto(
                          spz.getSpzCode(), spz.getSpzDescription(), spz.getIsPrimary()))
              .toList();
    }

    seedlotDto.setPrimarySpz(primarySpz);

    seedlotDto.setAdditionalSpzList(additionalSpzList);

    SparLog.info("Finding Seedlot genetic worth for seedlot number {}", seedlotNumber);
    List<SeedlotGeneticWorth> genWorthData =
        seedlotGeneticWorthService.getAllBySeedlotNumber(seedlotNumber);

    List<GeneticWorthTraitsDto> genWorthTraits = new ArrayList<>();
    genWorthData.forEach(
        (genWorth) -> {
          GeneticWorthTraitsDto dto =
              new GeneticWorthTraitsDto(
                  genWorth.getGeneticWorthCode(),
                  null,
                  genWorth.getGeneticQualityValue(),
                  genWorth.getTestedParentTreeContributionPercentage());
          genWorthTraits.add(dto);
        });
    seedlotDto.setCalculatedValues(genWorthTraits);
    SparLog.info(
        "Found {} Seedlot genetic worth stored for seedlot number {}",
        genWorthTraits.size(),
        seedlotNumber);

    return seedlotDto;
  }

  /**
   * Find spu data from oracle and set it in the dto.
   *
   * @param seedlotDto the dto to set data in.
   */
  private void fillPrimarySpu(SeedlotDto seedlotDto) {
    Seedlot seedlot = seedlotDto.getSeedlot();
    String seedlotNumber = seedlot.getId();

    SparLog.info("Finding primary SPU data for seedlot {}", seedlotNumber);

    Optional<SeedlotOrchard> optionalSeedlotOrchard =
        seedlotOrchardService.getPrimarySeedlotOrchard(seedlotNumber);

    // Do nothing if this seedlot does not have a primary orchard
    if (optionalSeedlotOrchard.isEmpty()) {
      SparLog.info("No seedlot primary orchard found for seedlot: {}", seedlotNumber);
      return;
    }

    String orchardId = optionalSeedlotOrchard.get().getOrchardId();

    SparLog.info("Seedlot {} has primary orchard {}", seedlotNumber, orchardId);

    // Find the active SPU id associated with this seedlot orchard
    Optional<ActiveOrchardSpuEntity> optActiveSpu = orchardService.findSpuIdByOrchard(orchardId);

    if (optActiveSpu.isEmpty()) {
      SparLog.info("No active spu found for orchard id: {}", orchardId);
      return;
    }

    Integer spuId = optActiveSpu.get().getSeedPlanningUnitId();

    Optional<SpuDto> optSpuDto = oracleApiProvider.getSpuById(spuId);

    if (optSpuDto.isEmpty()) {
      SparLog.info("Cannot find SpuDto from Oracle for spu ", spuId);
      return;
    }

    seedlotDto.setPrimarySpu(optSpuDto.get());
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
      if (curParentTreeId.equals(parentTreeId)) {
        ParentTreeGeneticQualityDto parentTreeGenQualDto =
            new ParentTreeGeneticQualityDto(
                parentTreeGenQual.getGeneticTypeCode(),
                parentTreeGenQual.getGeneticWorth().getGeneticWorthCode(),
                parentTreeGenQual.getGeneticQualityValue(),
                // We cannot know this for sure, see explanation down below.
                null,
                parentTreeGenQual.getQualityValueEstimated());
        parentTreeGenQualList.add(parentTreeGenQualDto);
      }
    }

    return parentTreeGenQualList;
  }

  /*
   * Explanation for isTested is unknown
   * What we know: untested_ind = True if estimated = True and pt.tested_ind = False
   *
   * - If untestedInd is true and estimatedInd is true:
   *     - testedInd is definitely false.
   * - If untestedInd is false and estimatedInd is true:
   *     - testedInd is definitely true.
   * - If estimatedInd is false:
   *     - The value of testedInd cannot be determined from untestedInd alone.
   */

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
                  sptSmpMixGenQual.getGeneticQualityValue(),
                  null,
                  null);
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
                  smpMixGenQual.getGeneticQualityValue(),
                  null,
                  null);
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
        seedlotCollectionMethodService.getAllSeedlotCollectionMethodsBySeedlot(seedlotInfo.getId());

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
        seedlotOwnerQuantityService.findAllBySeedlot(seedlotInfo.getId()).stream()
            .filter(
                owner ->
                    owner.getOriginalPercentageOwned() != null
                        && owner.getOriginalPercentageOwned().compareTo(BigDecimal.ZERO) > 0)
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
                extractionStep,
                List.of(),
                null,
                List.of(),
                null,
                null),
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
  public Seedlot patchApplicantInfo(
      @NonNull String seedlotNumber, SeedlotApplicationPatchDto patchDto) {
    SparLog.info("Patching seedlot entry for seedlot number {}", seedlotNumber);

    Seedlot seedlotInfo =
        seedlotRepository.findById(seedlotNumber).orElseThrow(SeedlotNotFoundException::new);

    if (!patchDto.revisionCount().equals(seedlotInfo.getRevisionCount())) {
      SparLog.info("Seedlot number {} updated by another user", seedlotNumber);
      throw new SeedlotConflictDataException(seedlotNumber);
    }

    SparLog.info("Seedlot number {} found", seedlotNumber);

    updateApplicantAndSeedlot(seedlotInfo, patchDto);

    Seedlot seedlotSaved = seedlotRepository.save(seedlotInfo);
    SparLog.info("Seedlot number {} successfully patched", seedlotNumber);
    return seedlotSaved;
  }

  private void updateApplicantAndSeedlot(Seedlot seedlot, SeedlotApplicationPatchDto patchDto) {
    seedlot.setApplicantEmailAddress(patchDto.applicantEmailAddress());

    SeedlotSourceEntity updatedSource =
        seedlotSourceRepository
            .findById(patchDto.seedlotSourceCode())
            .orElseThrow(SeedlotSourceNotFoundException::new);

    seedlot.setSeedlotSource(updatedSource);

    seedlot.setSourceInBc(patchDto.bcSourceInd());

    // The field intendedForCrownLand == to be registered indicator.
    seedlot.setIntendedForCrownLand(patchDto.toBeRegistrdInd());
  }

  /**
   * Save or edit the entire {@link Seedlot} form with all steps.
   *
   * @param seedlotNumber The Seedlot identification
   * @param form The {@link SeedlotFormSubmissionDto} containing all form fields
   * @param isTscAdmin determines whether this operation is initiated by a tsc admin
   * @param isFromRegularForm determines where the request originated from. If it's from the regular
   *     form, with 6 steps, it also could be sent by someone from the TSC Admin.
   * @param statusOnSuccess the status to set if the operation is successful
   * @return A {@link SeedlotStatusResponseDto} with the seedlot number and status
   */
  @Transactional
  public SeedlotStatusResponseDto updateSeedlotWithForm(
      String seedlotNumber,
      SeedlotFormSubmissionDto form,
      boolean isTscAdmin,
      boolean isFromRegularForm,
      String statusOnSuccess) {

    StringBuilder sb = new StringBuilder();
    sb.append("Received request ");
    if (isTscAdmin) {
      sb.append("by TSC Admin ");
    }
    if (isFromRegularForm) {
      sb.append("from regular form ");
    } else {
      sb.append("from review form ");
    }
    sb.append("to update seedlot {}");

    SparLog.info(sb.toString(), seedlotNumber);

    Optional<Seedlot> seedlotEntity = seedlotRepository.findById(seedlotNumber);
    Seedlot seedlot = seedlotEntity.orElseThrow(SeedlotNotFoundException::new);

    String currentSeedlotStatus = seedlot.getSeedlotStatus().getSeedlotStatusCode();

    /*
     * This determines whether delete actions can be performed
     * non-tsc users can perform delete actions when the seedlot is in pending or incomplete status
     * TSC admins can perform delete actions without regard of the seedlot's status
     */
    boolean canDelete =
        currentSeedlotStatus.equals("PND") || currentSeedlotStatus.equals("INC") || isTscAdmin;

    /*
     * Merging entities script:
     * 1. Finds all for that seedlot
     * 2. Iterate over the result list
     * 3. If isEdit = true, Remove all existing entries except the seedlot row in the seedlot table
     * 4. Add new ones
     */

    // Object to hold data in memory, avoid querying same data
    final SeedlotSaveInMemoryDto inMemoryDto = new SeedlotSaveInMemoryDto();

    // Step 1 (Collection methods)
    // Update the Seedlot instance and tables [seedlot_collection_method]
    seedlotCollectionMethodService.saveSeedlotFormStep1(
        seedlot, form.seedlotFormCollectionDto(), canDelete);

    // step 2 (Seedlot Owners)
    // Update tables [seedlot_owner_quantity]
    seedlotOwnerQuantityService.saveSeedlotFormStep2(
        seedlot, form.seedlotFormOwnershipDtoList(), canDelete);

    // Step 3 (Interim)
    // Update the Seedlot instance only
    saveSeedlotFormStep3(seedlot, form.seedlotFormInterimDto());

    // Step 4 (Seedlot Orchards)
    // Update the Seedlot instance and tables [seedlot_orchard]
    seedlotOrchardService.saveSeedlotFormStep4(seedlot, form.seedlotFormOrchardDto(), canDelete);

    // Step 5 (Parent Tree, SMP Mix, Area of Use, Parent Tree Contribution)
    // Update the Seedlot instance and tables [
    //   seedlot_parent_tree_gen_qlty
    //   smp_mix_gen_qlty
    //   seedlot_parent_tree
    //   seedlot_parent_tree_smp_mix
    //   smp_mix
    //   seedlot_genetic_worth
    // ]
    saveSeedlotFormStep5(
        seedlot,
        form.seedlotFormParentTreeDtoList(),
        form.seedlotFormParentTreeSmpDtoList(),
        canDelete);

    // Step 6 (Extraction)
    // Update the Seedlot instance only
    saveSeedlotFormStep6(seedlot, form.seedlotFormExtractionDto());

    // Update the Seedlot instance only
    // Fetch data from Oracle to get the primary Seed Plan Unit id
    setBecValues(seedlot, form.seedlotFormOrchardDto().primaryOrchardId(), inMemoryDto);

    if (isFromRegularForm) {
      // Update the Seedlot instance and table seedlot_genetic_worth
      // Calculate Ne value (effective population size)
      // Calculate Mean GeoSpatial (for SMP Mix, mean latitude, mean longitude, mean elevation)
      // Calculate Seedlot GeoSpatial (for Seedlot, mean latitude, mean longitude, mean elevation)
      // Calculate Genetic Worth
      // Update Seedlot Ne, collection elevation, and collection lat long
      // Saves the Seedlot calculated Genetic Worth
      setParentTreeContribution(
          seedlot, form.seedlotFormParentTreeDtoList(), form.seedlotFormParentTreeSmpDtoList());

      // If there is no area of use data already set:
      // Update elevation min max, latitude min max, longitude min max, and SPZ
      // Set values in the Seedlot instance and update tables [seedlot_seed_plan_zone]
      // Fetch data from Oracle to get the active Seed Plan Unit id
      if (!hasAreaOfUseData(seedlot)) {
        SparLog.info("Area of Use data has NOT been set previously, setting area of use data");
        setAreaOfUse(seedlot, form.seedlotFormOrchardDto().primaryOrchardId(), inMemoryDto);
      }
    } else {
      updateApplicantAndSeedlot(seedlot, form.applicantAndSeedlotInfo());
      // Override Seedlot elevation min max, latitude min max, and longitude min max (area of use)
      // Set values in the Seedlot instance only
      tscAdminService.overrideElevLatLongMinMax(seedlot, form.seedlotReviewElevationLatLong());

      // Override table [seedlot_seed_plan_zone] with values by the TSC (not fetching from Oracle)
      tscAdminService.overrideAreaOfUse(seedlot, form.seedlotReviewSeedPlanZones());

      // Override Seedlot Ne, collection elevation, and collection lat long
      // Set values in the Seedlot instance only
      tscAdminService.overrideSeedlotCollElevLatLong(seedlot, form.seedlotReviewGeoInformation());

      // Override Seedlot Genetic Worth values
      seedlotGeneticWorthService.overrideSeedlotGenWorth(seedlot, form.seedlotReviewGeneticWorth());
    }

    // Only set declaration info for pending seedlots
    // Update the Seedlot instance only
    if (currentSeedlotStatus.equals("PND")) {
      setSeedlotDeclaredInfo(seedlot);
    }

    // Update the Seedlot instance only
    setSeedlotStatus(seedlot, statusOnSuccess);

    SparLog.info("Saving the Seedlot Entity for seedlot number {}", seedlotNumber);
    seedlotRepository.save(seedlot);

    SparLog.info("Seedlot entity and related tables successfully saved.");
    return new SeedlotStatusResponseDto(
        seedlotNumber, seedlot.getSeedlotStatus().getSeedlotStatusCode());
  }

  private void setBecValues(
      Seedlot seedlot, String primaryOrchardId, SeedlotSaveInMemoryDto inMemoryDto) {
    SparLog.info("Begin to set BEC values");

    OrchardDto orchardDto =
        oracleApiProvider
            .findOrchardById(primaryOrchardId)
            .orElseThrow(OracleApiProviderException::new);

    ActiveOrchardSpuEntity primarySeedPlanUnit =
        orchardService
            .findSpuIdByOrchard(primaryOrchardId)
            .orElseThrow(NoSpuForOrchardException::new);

    Integer primarySpuId = primarySeedPlanUnit.getSeedPlanningUnitId();
    inMemoryDto.setPrimarySpuId(primarySpuId);

    // Not sure why it's called Bgc in seedlot instead of Bec in orchard
    seedlot.setBgcZoneCode(orchardDto.getBecZoneCode());
    seedlot.setBgcZoneDescription(orchardDto.getBecZoneDescription());
    seedlot.setBgcSubzoneCode(orchardDto.getBecSubzoneCode());
    seedlot.setVariant(orchardDto.getVariant());
    seedlot.setBecVersionId(orchardDto.getBecVersionId());
    seedlot.setSeedPlanUnitId(primarySpuId);

    SparLog.info("BEC values set");
  }

  private void setParentTreeContribution(
      Seedlot seedlot,
      List<SeedlotFormParentTreeSmpDto> orchardPtDtoList,
      List<SeedlotFormParentTreeSmpDto> smpPtDtoList) {

    SparLog.info("Begin to set parent trees contribution");
    List<OrchardParentTreeValsDto> orchardPtVals = convertToPtVals(orchardPtDtoList);
    List<GeospatialRequestDto> smpMixIdAndProps = convertToGeoRes(smpPtDtoList);

    PtValsCalReqDto ptValsCalReqDto = new PtValsCalReqDto(orchardPtVals, smpMixIdAndProps, 0);

    PtCalculationResDto ptCalculationResDto = parentTreeService.calculatePtVals(ptValsCalReqDto);

    GeospatialRespondDto collectionGeoData =
        ptCalculationResDto.calculatedPtVals().getGeospatialData();

    // Ne value
    if (!ValueUtil.isValueEqual(
        ptCalculationResDto.calculatedPtVals().getNeValue(),
        seedlot.getEffectivePopulationSize())) {
      seedlot.setEffectivePopulationSize(ptCalculationResDto.calculatedPtVals().getNeValue());
    }

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
    SparLog.info("Parent trees contribution set");

    SparLog.info("Saving Seedlot genetic worth calculated values");
    seedlotGeneticWorthService.saveSeedlotGenWorth(seedlot, ptCalculationResDto.geneticTraits());
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
                      genQual.geneticWorthCode(), genQual.geneticQualityValue(), null, null);
              genTraitList.add(toAdd);
            });

    return genTraitList;
  }

  private boolean hasAreaOfUseData(Seedlot seedlot) {
    return seedlot.getElevationMax() != null
        || seedlot.getElevationMin() != null
        || seedlot.getLatitudeDegMax() != null
        || seedlot.getLatitudeDegMin() != null
        || seedlot.getLatitudeMinMax() != null
        || seedlot.getLatitudeMinMin() != null
        || seedlot.getLatitudeSecMax() != null
        || seedlot.getLatitudeSecMin() != null
        || seedlot.getLongitudeDegMax() != null
        || seedlot.getLongitudeDegMin() != null
        || seedlot.getLongitudeMinMax() != null
        || seedlot.getLongitudeMinMin() != null
        || seedlot.getLongitudeSecMax() != null
        || seedlot.getLongitudeSecMin() != null
        || seedlot.getAreaOfUseComment() != null;
  }

  /**
   * Reference Legacy Procedure: get_tested_area_of_use_geog from database/ddl/pkg/SPR_SEEDLOT.PKS
   *
   * @param seedlot the seedlot object to set data to
   * @param primaryOrchardId the primary orchard Id to find the spu for
   */
  private void setAreaOfUse(
      Seedlot seedlot, String primaryOrchardId, SeedlotSaveInMemoryDto inMemoryDto) {
    SparLog.info("Begin to set Area of Use values");

    Integer activeSpuId = inMemoryDto.getPrimarySpuId();
    if (!ValueUtil.hasValue(activeSpuId)) {
      ActiveOrchardSpuEntity activeSpuEntity =
          orchardService
              .findSpuIdByOrchardWithActive(primaryOrchardId, true)
              .orElseThrow(NoSpuForOrchardException::new);
      activeSpuId = activeSpuEntity.getSeedPlanningUnitId();
    }

    AreaOfUseDto areaOfUseDto =
        oracleApiProvider
            .getAreaOfUseData(activeSpuId)
            .orElseThrow(OracleApiProviderException::new);

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
    AuditInformation currentUser = new AuditInformation(loggedUserService.getLoggedUserId());
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
              sspzToSave.setAuditInformation(currentUser);
              spzSaveList.add(sspzToSave);
            });
    seedlotSeedPlanZoneRepository.saveAll(spzSaveList);

    SparLog.info("Area of Use values set");
  }

  private void setSeedlotStatus(Seedlot seedlot, String newStatus) {
    Optional<SeedlotStatusEntity> sseOptional =
        seedlotStatusService.getValidSeedlotStatus(newStatus);
    if (sseOptional.isEmpty()) {
      throw new SeedlotStatusNotFoundException();
    }
    seedlot.setSeedlotStatus(sseOptional.get());
  }

  private void setSeedlotDeclaredInfo(Seedlot seedlot) {
    String userId = loggedUserService.getLoggedUserId();
    DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    seedlot.setDeclarationOfTrueInformationUserId(userId);
    seedlot.setDeclarationOfTrueInformationTimestamp(LocalDateTime.now(Clock.systemUTC()));

    SparLog.info(
        "Declaration data set, for seedlot {} for user {} at {}",
        seedlot.getId(),
        seedlot.getDeclarationOfTrueInformationUserId(),
        dtf.format(seedlot.getDeclarationOfTrueInformationTimestamp()));
  }

  private void saveSeedlotFormStep3(Seedlot seedlot, SeedlotFormInterimDto formStep3) {
    SparLog.info(
        "Saving Seedlot Form Step 3-Interim Storage for seedlot number {}", seedlot.getId());

    seedlot.setInterimStorageClientNumber(formStep3.intermStrgClientNumber());
    seedlot.setInterimStorageLocationCode(formStep3.intermStrgLocnCode());
    if (!ValueUtil.isValueEqual(
        seedlot.getInterimStorageStartDate(), formStep3.intermStrgStDate())) {
      seedlot.setInterimStorageStartDate(formStep3.intermStrgStDate());
    }
    if (!ValueUtil.isValueEqual(
        seedlot.getInterimStorageEndDate(), formStep3.intermStrgEndDate())) {
      seedlot.setInterimStorageEndDate(formStep3.intermStrgEndDate());
    }
    seedlot.setInterimStorageFacilityCode(formStep3.intermFacilityCode());
    // If the facility type is Other, then a description is required.
    SparLog.info("{} FACILITY TYPE CODE", formStep3.intermFacilityCode());
    SparLog.info("FACILITY TYPE Desc", formStep3.intermOtherFacilityDesc());
    if ("OTH".equals(formStep3.intermFacilityCode())) {
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
    if (!ValueUtil.isValueEqual(seedlot.getExtractionStartDate(), formStep6.extractionStDate())) {
      seedlot.setExtractionStartDate(formStep6.extractionStDate());
    }
    if (!ValueUtil.isValueEqual(seedlot.getExtractionEndDate(), formStep6.extractionEndDate())) {
      seedlot.setExtractionEndDate(formStep6.extractionEndDate());
    }

    seedlot.setStorageClientNumber(formStep6.storageClientNumber());
    seedlot.setStorageLocationCode(formStep6.storageLocnCode());
    if (!ValueUtil.isValueEqual(
        seedlot.getTemporaryStorageStartDate(), formStep6.temporaryStrgStartDate())) {
      seedlot.setTemporaryStorageStartDate(formStep6.temporaryStrgStartDate());
    }
    if (!ValueUtil.isValueEqual(
        seedlot.getTemporaryStorageEndDate(), formStep6.temporaryStrgEndDate())) {
      seedlot.setTemporaryStorageEndDate(formStep6.temporaryStrgEndDate());
    }
  }
}
