package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.Constants;
import ca.bc.gov.backendstartapi.dao.GeneticWorthEntityDao;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.SeedlotApplicationPatchDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateResponseDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormCollectionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormExtractionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormInterimDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOrchardDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormSubmissionDto;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotGeneticWorth;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeGeneticQuality;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeSmpMix;
import ca.bc.gov.backendstartapi.entity.SeedlotSourceEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.SmpMix;
import ca.bc.gov.backendstartapi.entity.SmpMixGeneticQuality;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeGeneticQualityId;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeId;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeSmpMixId;
import ca.bc.gov.backendstartapi.entity.idclass.SmpMixGeneticQualityId;
import ca.bc.gov.backendstartapi.entity.idclass.SmpMixId;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.InvalidSeedlotRequestException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotSourceNotFoundException;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotGeneticWorthRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeGeneticQualityRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeSmpMixRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotStatusRepository;
import ca.bc.gov.backendstartapi.repository.SmpMixGeneticQualityRepository;
import ca.bc.gov.backendstartapi.repository.SmpMixRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
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

  private final SeedlotCollectionMethodService seedlotCollectionMethodService;

  private final SeedlotOwnerQuantityService seedlotOwnerQuantityService;

  private final SeedlotOrchardService seedlotOrchardService;

  private final SeedlotParentTreeRepository seedlotParentTreeRepository;

  private final SeedlotParentTreeGeneticQualityRepository seedlotParentTreeGeneticQualityRepository;

  private final SeedlotGeneticWorthRepository seedlotGeneticWorthRepository;

  private final SmpMixRepository smpMixRepository;

  private final SmpMixGeneticQualityRepository smpMixGeneticQualityRepository;

  private final SeedlotParentTreeSmpMixRepository seedlotParentTreeSmpMixRepository;

  private final GeneticWorthEntityDao geneticWorthEntityDao;

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

  @Transactional
  public SeedlotCreateResponseDto submitSeedlotForm(
      String seedlotNumber, SeedlotFormSubmissionDto form) {
    log.info("Seedlot number {} submitted for saving!", seedlotNumber);
    Optional<Seedlot> seedlotEntity = seedlotRepository.findById(seedlotNumber);
    Seedlot seedlot = seedlotEntity.orElseThrow(SeedlotNotFoundException::new);

    /*
     * Merging entities script:
     * 1. Finds all for that seedlot
     * 2. Iterate over the result list
     * 3. Keep existing entities
     * 4. Remove the ones not present in the request body
     * 5. Add new ones
     */

    saveSeedlotFormStep1(seedlotEntity.get(), form.getSeedlotFormCollectionDto());
    seedlotOwnerQuantityService.saveSeedlotFormStep2(
        seedlotNumber, form.getSeedlotFormOwnershipDtoList());
    saveSeedlotFormStep3(seedlotEntity.get(), form.getSeedlotFormInterimDto());
    saveSeedlotFormStep4(seedlotEntity.get(), form.getSeedlotFormOrchardDto());
    saveSeedlotFormStep5(seedlotEntity.get(), form.getSeedlotFormParentTreeSmpDtoList());
    saveSeedlotFormStep6(seedlotEntity.get(), form.getSeedlotFormExtractionDto());

    log.info("Saving Seedlot Entity for Seedlot number {}", seedlotNumber);
    seedlotRepository.save(seedlot);

    return null;
  }

  private void saveSeedlotFormStep1(Seedlot seedlot, SeedlotFormCollectionDto formStep1) {
    log.info("Saving Seedlot form step 1 for seedlot number {}", seedlot.getId());

    seedlot.setCollectionClientNumber(formStep1.collectionClientNumber());
    seedlot.setCollectionLocationCode(formStep1.collectionLocnCode());
    seedlot.setCollectionStartDate(formStep1.collectionStartDate());
    seedlot.setCollectionEndDate(formStep1.collectionEndDate());
    seedlot.setNumberOfContainers(formStep1.noOfContainers());
    seedlot.setContainerVolume(formStep1.volPerContainer());
    seedlot.setTotalConeVolume(formStep1.clctnVolume());
    seedlot.setComment(formStep1.seedlotComment());

    seedlotCollectionMethodService.saveSeedlotFormStep1(seedlot.getId(), formStep1);
  }

  private void saveSeedlotFormStep3(Seedlot seedlot, SeedlotFormInterimDto formStep3) {
    log.info("Saving Seedlot form step 3 for seedlot number {}", seedlot.getId());

    seedlot.setInterimStorageClientNumber(formStep3.intermStrgClientNumber());
    seedlot.setInterimStorageLocationCode(formStep3.intermStrgLocnCode());
    seedlot.setInterimStorageStartDate(formStep3.intermStrgStDate());
    seedlot.setInterimStorageEndDate(formStep3.intermStrgEndDate());
    // intermStrgLocn - will be added when PR 685 get merged
    seedlot.setInterimStorageFacilityCode(formStep3.intermFacilityCode());
  }

  private void saveSeedlotFormStep4(Seedlot seedlot, SeedlotFormOrchardDto formStep4) {
    log.info("Saving Seedlot form step 4 for seedlot number {}", seedlot.getId());

    seedlotOrchardService.saveSeedlotOrchards(seedlot.getId(), formStep4);

    seedlot.setFemaleGameticContributionMethod(formStep4.femaleGameticMthdCode());
    seedlot.setMaleGameticContributionMethod(formStep4.maleGameticMthdCode());
    seedlot.setProducedThroughControlledCross(formStep4.controlledCrossInd());
    seedlot.setProducedWithBiotechnologicalProcesses(formStep4.biotechProcessesInd());
    seedlot.setPollenContaminationPresentInOrchard(formStep4.pollenContaminationInd());
    seedlot.setPollenContaminationPercentage(formStep4.pollenContaminationPct());
    seedlot.setPollenContaminantBreedingValue(formStep4.contaminantPollenBv());
    seedlot.setPollenContaminationMethodCode(formStep4.pollenContaminationMthdCode());
  }

  // Form Step 5 - keep going from here
  private void saveSeedlotFormStep5(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {
    log.info("Saving Seedlot form step 5 for seedlot {}", seedlot.getId());

    saveSeedlotParentTree(seedlot, seedlotFormParentTreeDtoList);
    saveSeedlotPtGenQlty(seedlot, seedlotFormParentTreeDtoList);
    saveSeedlotGenWorth(seedlot, seedlotFormParentTreeDtoList);
    saveSmpMix(seedlot, seedlotFormParentTreeDtoList);
    saveSmpMixGenQlty(seedlot, seedlotFormParentTreeDtoList);
    saveSeedlotPtSmpMix(seedlot, seedlotFormParentTreeDtoList);
  }

  // Form Step 5 SeedlotParent related
  private void saveSeedlotParentTree(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {
    List<SeedlotParentTree> seedlotParentTreeList =
        seedlotParentTreeRepository.findAllBySeedlot_id(seedlot.getId());

    if (!seedlotParentTreeList.isEmpty()) {
      Map<Integer, SeedlotParentTree> seedlotPtMap =
          seedlotParentTreeList.stream()
              .collect(Collectors.toMap(SeedlotParentTree::getParentTreeId, Function.identity()));
      List<Integer> existingSeedlotPtIdList =
          seedlotParentTreeList.stream().map(e -> e.getParentTreeId()).collect(Collectors.toList());

      List<SeedlotFormParentTreeSmpDto> seedlotPtListToInsert = List.of();

      for (SeedlotFormParentTreeSmpDto formParentTree : seedlotFormParentTreeDtoList) {
        if (existingSeedlotPtIdList.contains(formParentTree.parentTreeId())) {
          // remove form the list, the one that last will be removed
          existingSeedlotPtIdList.remove(formParentTree.parentTreeId());
        } else {
          seedlotPtListToInsert.add(formParentTree);
        }
      }

      // Remove possible leftovers
      log.info("{} seedlot parent trees to remove.", existingSeedlotPtIdList.size());
      for (Integer parentTreeId : existingSeedlotPtIdList) {
        seedlotParentTreeRepository.delete(seedlotPtMap.get(parentTreeId));
      }

      // Insert new ones
      addSeedlotParentTree(seedlot, seedlotPtListToInsert);

      return;
    }

    log.info("No previous seedlot parent trees for seedlot {}", seedlot.getId());

    addSeedlotParentTree(seedlot, seedlotFormParentTreeDtoList);
  }

  // Form Step 5 Seedlot Parent Tree related
  private void addSeedlotParentTree(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotPtDtoList) {
    List<SeedlotParentTree> seedlotPtListToInsert = List.of();

    for (SeedlotFormParentTreeSmpDto seedlotPtDto : seedlotPtDtoList) {
      SeedlotParentTree seedlotParentTree =
          new SeedlotParentTree(
              seedlot,
              seedlotPtDto.parentTreeId(),
              seedlotPtDto.coneCount(),
              seedlotPtDto.pollenPount(),
              loggedUserService.createAuditCurrentUser());
      seedlotParentTree.setSmpSuccessPercentage(seedlotPtDto.smpSuccessPct());
      seedlotParentTree.setNonOrchardPollenContaminationCount(
          seedlotPtDto.nonOrchardPollenContamPct());
      seedlotPtListToInsert.add(seedlotParentTree);
    }

    seedlotParentTreeRepository.saveAll(seedlotPtListToInsert);
  }

  // Form Step 5 Seedlot Parent Tree Genetic Quality related
  private void saveSeedlotPtGenQlty(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {
    List<SeedlotParentTreeGeneticQuality> seedlotPtGenQltyList =
        seedlotParentTreeGeneticQualityRepository.findAllBySeedlotParentTree_Seedlot_id(
            seedlot.getId());

    if (!seedlotPtGenQltyList.isEmpty()) {
      List<SeedlotParentTreeGeneticQualityId> existingSeedlotPtGenQltyIdList =
          seedlotPtGenQltyList.stream().map(x -> x.getId()).collect(Collectors.toList());

      List<SeedlotFormParentTreeSmpDto> seedlotPtGenQltyToInsert = List.of();

      for (SeedlotFormParentTreeSmpDto seedlotPtFormDto : seedlotFormParentTreeDtoList) {
        for (ParentTreeGeneticQualityDto seedlotGenQltyDto :
            seedlotPtFormDto.parentTreeGeneticQualities()) {
          SeedlotParentTreeId seedlotParentTreeId =
              new SeedlotParentTreeId(seedlot.getId(), seedlotPtFormDto.parentTreeId());

          SeedlotParentTreeGeneticQualityId seedlotPtGenQltyId =
              new SeedlotParentTreeGeneticQualityId(
                  seedlotParentTreeId,
                  seedlotGenQltyDto.geneticTypeCode(),
                  seedlotGenQltyDto.geneticWorthCode());

          if (existingSeedlotPtGenQltyIdList.contains(seedlotPtGenQltyId)) {
            // remove form the list, the one that last will be removed
            existingSeedlotPtGenQltyIdList.remove(seedlotPtGenQltyId);
          } else {
            seedlotPtGenQltyToInsert.add(seedlotPtFormDto);
          }
        }
      }

      // Remove possible leftovers
      log.info(
          "{} seedlot parent trees genetic quality to remove.",
          existingSeedlotPtGenQltyIdList.size());
      for (SeedlotParentTreeGeneticQualityId seedlotPtGenQlty : existingSeedlotPtGenQltyIdList) {
        seedlotParentTreeGeneticQualityRepository.deleteById(seedlotPtGenQlty);
      }

      // Insert new ones
      addSeedlotParentTreeGenQlty(seedlot, seedlotPtGenQltyToInsert);

      return;
    }

    log.info("No previous seedlot parent trees genetic quality for seedlot {}", seedlot.getId());

    addSeedlotParentTreeGenQlty(seedlot, seedlotFormParentTreeDtoList);
  }

  // Form Step 5 Seedlot Parent Tree Genetic Quality related
  private void addSeedlotParentTreeGenQlty(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotPtGenQltyToInsert) {
    List<SeedlotParentTree> sTrees = List.of();

    for (SeedlotFormParentTreeSmpDto seedlotPtFormDto : seedlotPtGenQltyToInsert) {
      SeedlotParentTree sParentTree =
          new SeedlotParentTree(
              seedlot,
              seedlotPtFormDto.parentTreeId(),
              seedlotPtFormDto.coneCount(),
              seedlotPtFormDto.pollenPount(),
              loggedUserService.createAuditCurrentUser());
      sTrees.add(sParentTree);
    }

    List<SeedlotParentTree> sTreesSaved = seedlotParentTreeRepository.saveAll(sTrees);

    Map<SeedlotParentTreeId, SeedlotParentTree> sTreeMap =
        sTreesSaved.stream()
            .collect(Collectors.toMap(SeedlotParentTree::getId, Function.identity()));

    List<SeedlotParentTreeGeneticQuality> seedlotPtToInsert = List.of();
    for (SeedlotFormParentTreeSmpDto seedlotPtFormDto : seedlotPtGenQltyToInsert) {
      SeedlotParentTreeId sTreeId =
          new SeedlotParentTreeId(seedlot.getId(), seedlotPtFormDto.parentTreeId());
      SeedlotParentTree sTree = sTreeMap.get(sTreeId);
      if (Objects.isNull(sTree)) {
        // throw error = trying to fetch seedlot parent tree not stored
      }

      for (ParentTreeGeneticQualityDto seedlotGenQltyDto :
          seedlotPtFormDto.parentTreeGeneticQualities()) {

        GeneticWorthEntity genWorthEnt =
            geneticWorthEntityDao
                .getGeneticWorthEntity(seedlotGenQltyDto.geneticWorthCode())
                .orElseThrow();

        SeedlotParentTreeGeneticQuality sQuality =
            new SeedlotParentTreeGeneticQuality(
                sTree,
                seedlotGenQltyDto.geneticTypeCode(),
                genWorthEnt,
                seedlotGenQltyDto.geneticQualityValue(),
                loggedUserService.createAuditCurrentUser());

        sQuality.setQualityValueEstimated(Boolean.FALSE);
        sQuality.setParentTreeUntested(Boolean.FALSE);

        seedlotPtToInsert.add(sQuality);
      }
    }

    seedlotParentTreeGeneticQualityRepository.saveAll(seedlotPtToInsert);
  }

  // Form Step 5 Seedlot Genetic Worth related
  private void saveSeedlotGenWorth(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {

    List<SeedlotGeneticWorth> sGeneticWorths =
        seedlotGeneticWorthRepository.findAllBySeedlot_id(seedlot.getId());

    List<ParentTreeGeneticQualityDto> genWorthCodeToInsert = List.of();

    if (!sGeneticWorths.isEmpty()) {
      List<String> existingSeedlotGenWorthCodes = List.of();
      for (SeedlotGeneticWorth seedlotGenWorthDto : sGeneticWorths) {
        existingSeedlotGenWorthCodes.add(seedlotGenWorthDto.getGeneticWorthCode());
      }

      for (SeedlotFormParentTreeSmpDto seedlotPtFormDto : seedlotFormParentTreeDtoList) {
        for (ParentTreeGeneticQualityDto seedlotGenQltyDto :
            seedlotPtFormDto.parentTreeGeneticQualities()) {
          if (existingSeedlotGenWorthCodes.contains(seedlotGenQltyDto.geneticWorthCode())) {
            existingSeedlotGenWorthCodes.remove(seedlotGenQltyDto.geneticWorthCode());
          } else {
            genWorthCodeToInsert.add(seedlotGenQltyDto);
          }
        }
      }

      Map<String, SeedlotGeneticWorth> sGenWorthMap =
          sGeneticWorths.stream()
              .collect(
                  Collectors.toMap(SeedlotGeneticWorth::getGeneticWorthCode, Function.identity()));

      // Remove possible leftovers
      log.info("{} seedlot genetic worth code(s) to remove.", existingSeedlotGenWorthCodes.size());
      for (String genWorthCode : existingSeedlotGenWorthCodes) {
        seedlotGeneticWorthRepository.delete(sGenWorthMap.get(genWorthCode));
      }

      // Insert new ones
      addSeedlotGeneticWorth(seedlot, genWorthCodeToInsert);

      return;
    }

    log.info("No previous seedlot genetic worths for seedlot {}", seedlot.getId());

    for (SeedlotFormParentTreeSmpDto seedlotPtFormDto : seedlotFormParentTreeDtoList) {
      genWorthCodeToInsert.addAll(seedlotPtFormDto.parentTreeGeneticQualities());
    }
    addSeedlotGeneticWorth(seedlot, genWorthCodeToInsert);
  }

  // Form Step 5 Seedlot Genetic Worth related
  private void addSeedlotGeneticWorth(
      Seedlot seedlot, List<ParentTreeGeneticQualityDto> genWorthCodeToInsert) {
    // seedlot_genetic_worth table
    List<SeedlotGeneticWorth> seedlotGeneticWorths = List.of();
    for (ParentTreeGeneticQualityDto pDto : genWorthCodeToInsert) {

      GeneticWorthEntity gEntity =
          geneticWorthEntityDao.getGeneticWorthEntity(pDto.geneticWorthCode()).orElseThrow();
      SeedlotGeneticWorth sGeneticWorth =
          new SeedlotGeneticWorth(seedlot, gEntity, loggedUserService.createAuditCurrentUser());
      sGeneticWorth.setGeneticQualityValue(pDto.geneticQualityValue());

      seedlotGeneticWorths.add(sGeneticWorth);
    }

    seedlotGeneticWorthRepository.saveAll(seedlotGeneticWorths);
  }

  // Form Step 5 SMP Mix
  private void saveSmpMix(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {
    List<SmpMix> smpMixs = smpMixRepository.findAllBySeedlot_id(seedlot.getId());

    if (!smpMixs.isEmpty()) {
      List<Integer> existingParentTreeIds =
          smpMixs.stream().map(SmpMix::getParentTreeId).collect(Collectors.toList());

      List<SeedlotFormParentTreeSmpDto> parentTreeIdsToInsert = List.of();

      for (SeedlotFormParentTreeSmpDto formDto : seedlotFormParentTreeDtoList) {
        if (existingParentTreeIds.contains(formDto.parentTreeId())) {
          existingParentTreeIds.remove(formDto.parentTreeId());
        } else {
          parentTreeIdsToInsert.add(formDto);
        }
      }

      // Remove possible leftovers
      log.info("{} SMP Mix records to remove.", existingParentTreeIds.size());
      List<SmpMixId> smpMixIdsToRemove = List.of();
      for (Integer parentTreeId : existingParentTreeIds) {
        SmpMixId smpMixId = new SmpMixId(seedlot.getId(), parentTreeId);
        smpMixIdsToRemove.add(smpMixId);
      }

      if (!smpMixIdsToRemove.isEmpty()) {
        smpMixRepository.deleteAllById(smpMixIdsToRemove);
      }

      // Insert new ones
      addSmpMix(seedlot, parentTreeIdsToInsert);

      return;
    }

    // add new
    log.info("No previous SMP Mix records for seedlot {}", seedlot.getId());

    addSmpMix(seedlot, seedlotFormParentTreeDtoList);
  }

  // Form Step 5 SMP Mix related
  private void addSmpMix(Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> formDtos) {
    List<SmpMix> smpMixs = List.of();

    for (SeedlotFormParentTreeSmpDto formDto : formDtos) {
      SmpMix smpMix =
          new SmpMix(
              seedlot,
              formDto.parentTreeId(),
              formDto.amountOfMaterial(),
              formDto.proportion(),
              loggedUserService.createAuditCurrentUser(),
              0);

      smpMixs.add(smpMix);
    }

    smpMixRepository.saveAll(smpMixs);
  }

  // Form Step 5 SMP Mix Genetic Quality
  private void saveSmpMixGenQlty(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {
    List<SmpMixGeneticQuality> smpMixGenQltyList =
        smpMixGeneticQualityRepository.findAllBySmpMix_Seedlot_id(seedlot.getId());

    if (!smpMixGenQltyList.isEmpty()) {
      List<SmpMixGeneticQualityId> existingSmpMixGenQltyIdList =
          smpMixGenQltyList.stream().map(x -> x.getId()).collect(Collectors.toList());

      List<SeedlotFormParentTreeSmpDto> smpMixGenQltyToInsert = List.of();

      for (SeedlotFormParentTreeSmpDto seedlotPtFormDto : seedlotFormParentTreeDtoList) {
        for (ParentTreeGeneticQualityDto seedlotGenQltyDto :
            seedlotPtFormDto.parentTreeGeneticQualities()) {
          SmpMixId mixId = new SmpMixId(seedlot.getId(), seedlotPtFormDto.parentTreeId());
          SmpMixGeneticQualityId smpMixGenId =
              new SmpMixGeneticQualityId(
                  mixId, seedlotGenQltyDto.geneticTypeCode(), seedlotGenQltyDto.geneticWorthCode());

          if (existingSmpMixGenQltyIdList.contains(smpMixGenId)) {
            // remove form the list, the one that last will be removed
            existingSmpMixGenQltyIdList.remove(smpMixGenId);
          } else {
            smpMixGenQltyToInsert.add(seedlotPtFormDto);
          }
        }
      }

      // Remove possible leftovers
      log.info("{} smp mix genetic quality to remove.", existingSmpMixGenQltyIdList.size());
      for (SmpMixGeneticQualityId smpMixGenId : existingSmpMixGenQltyIdList) {
        smpMixGeneticQualityRepository.deleteById(smpMixGenId);
      }

      // Insert new ones
      addSmpMixGenQlty(seedlot, smpMixGenQltyToInsert);

      return;
    }

    log.info("No previous SMP Mix genetic quality for seedlot {}", seedlot.getId());

    addSmpMixGenQlty(seedlot, seedlotFormParentTreeDtoList);
  }

  // Form Step 5 SMP Mix Genetic Quality related
  private void addSmpMixGenQlty(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {
    Map<Integer, SmpMix> smMap =
        smpMixRepository.findAllBySeedlot_id(seedlot.getId()).stream()
            .collect(Collectors.toMap(SmpMix::getParentTreeId, Function.identity()));

    List<SmpMixGeneticQuality> smpMixGenQltys = List.of();
    for (SeedlotFormParentTreeSmpDto seedlotPtFormDto : seedlotFormParentTreeDtoList) {
      for (ParentTreeGeneticQualityDto seedlotGenQltyDto :
          seedlotPtFormDto.parentTreeGeneticQualities()) {
        SmpMix smpMix = smMap.get(seedlotPtFormDto.parentTreeId());
        if (Objects.isNull(smpMix)) {
          // throw error smp mix not found!
        }

        GeneticWorthEntity gEntity =
            geneticWorthEntityDao
                .getGeneticWorthEntity(seedlotGenQltyDto.geneticWorthCode())
                .orElseThrow();

        SmpMixGeneticQuality smpMixGeneticQuality =
            new SmpMixGeneticQuality(
                smpMix,
                seedlotGenQltyDto.geneticTypeCode(),
                gEntity,
                seedlotGenQltyDto.geneticQualityValue(),
                Boolean.FALSE,
                loggedUserService.createAuditCurrentUser(),
                0);

        smpMixGenQltys.add(smpMixGeneticQuality);
      }
    }

    smpMixGeneticQualityRepository.saveAll(smpMixGenQltys);
  }

  // Form Step 5 Seedlot Parent Tree SMP Fix
  private void saveSeedlotPtSmpMix(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {
    List<SeedlotParentTreeSmpMix> sptsmList =
        seedlotParentTreeSmpMixRepository.findAllBySeedlotParentTree_Seedlot_id(seedlot.getId());

    if (!sptsmList.isEmpty()) {
      List<SeedlotParentTreeSmpMixId> sptsmExistingList =
          sptsmList.stream().map(x -> x.getId()).collect(Collectors.toList());

      List<SeedlotFormParentTreeSmpDto> sptsmToInsertList = List.of();

      for (SeedlotFormParentTreeSmpDto seedlotPtFormDto : seedlotFormParentTreeDtoList) {
        for (ParentTreeGeneticQualityDto seedlotGenQltyDto :
            seedlotPtFormDto.parentTreeGeneticQualities()) {
          SeedlotParentTreeId sptId =
              new SeedlotParentTreeId(seedlot.getId(), seedlotPtFormDto.parentTreeId());
          SeedlotParentTreeSmpMixId sptsmId =
              new SeedlotParentTreeSmpMixId(
                  sptId, seedlotGenQltyDto.geneticTypeCode(), seedlotGenQltyDto.geneticWorthCode());

          if (sptsmExistingList.contains(sptsmId)) {
            // remove form the list, the one that last will be removed
            sptsmExistingList.remove(sptsmId);
          } else {
            sptsmToInsertList.add(seedlotPtFormDto);
          }
        }
      }

      // Remove possible leftovers
      log.info("{} seedlot parent tree SMP Mix records to remove.", sptsmExistingList.size());
      for (SeedlotParentTreeSmpMixId sptsmId : sptsmExistingList) {
        seedlotParentTreeSmpMixRepository.deleteById(sptsmId);
      }

      // Insert new ones
      addSeedlotPtSmpMix(seedlot, sptsmToInsertList);

      return;
    }

    log.info("No previous Parent Tree SMP Mix genetic quality for seedlot {}", seedlot.getId());

    addSeedlotPtSmpMix(seedlot, seedlotFormParentTreeDtoList);
  }

  // Form Step 5 Seedlot Parent Tree SMP Fix related
  private void addSeedlotPtSmpMix(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {
    Map<Integer, SeedlotParentTree> sptMap =
        seedlotParentTreeRepository.findAllBySeedlot_id(seedlot.getId()).stream()
            .collect(Collectors.toMap(SeedlotParentTree::getParentTreeId, Function.identity()));

    List<SeedlotParentTreeSmpMix> sptsmToInsertList = List.of();
    for (SeedlotFormParentTreeSmpDto seedlotPtFormDto : seedlotFormParentTreeDtoList) {
      for (ParentTreeGeneticQualityDto seedlotGenQltyDto :
          seedlotPtFormDto.parentTreeGeneticQualities()) {
        SeedlotParentTree sptEntity = sptMap.get(seedlotPtFormDto.parentTreeId());
        if (Objects.isNull(sptEntity)) {
          // throw error
        }

        GeneticWorthEntity gEntity =
            geneticWorthEntityDao
                .getGeneticWorthEntity(seedlotGenQltyDto.geneticWorthCode())
                .orElseThrow();

        SeedlotParentTreeSmpMix sptsmEntity =
            new SeedlotParentTreeSmpMix(
                sptEntity,
                seedlotGenQltyDto.geneticTypeCode(),
                gEntity,
                seedlotGenQltyDto.geneticQualityValue(),
                loggedUserService.createAuditCurrentUser());

        sptsmToInsertList.add(sptsmEntity);
      }
    }

    seedlotParentTreeSmpMixRepository.saveAll(sptsmToInsertList);
  }

  // Form Step 6 - OK
  private void saveSeedlotFormStep6(Seedlot seedlot, SeedlotFormExtractionDto formStep6) {
    log.info("Saving Seedlot form step 6 for seedlot {}", seedlot.getId());

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
