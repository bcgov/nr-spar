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
import ca.bc.gov.backendstartapi.dto.SeedlotFormOwnershipDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormSubmissionDto;
import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.entity.MethodOfPaymentEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotGeneticWorth;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeGeneticQuality;
import ca.bc.gov.backendstartapi.entity.SeedlotSourceEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeGeneticQualityId;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeId;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionMethod;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOrchard;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOwnerQuantity;
import ca.bc.gov.backendstartapi.entity.seedlot.idclass.SeedlotOwnerQuantityId;
import ca.bc.gov.backendstartapi.exception.InvalidSeedlotRequestException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotSourceNotFoundException;
import ca.bc.gov.backendstartapi.repository.ConeCollectionMethodRepository;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.MethodOfPaymentRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotCollectionMethodRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotGeneticWorthRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotOrchardRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotOwnerQuantityRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeGeneticQualityRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotStatusRepository;
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

  private final SeedlotCollectionMethodRepository seedlotCollectionMethodRepository;

  private final ConeCollectionMethodRepository coneCollectionMethodRepository;

  private final SeedlotOwnerQuantityRepository seedlotOwnerQuantityRepository;

  private final MethodOfPaymentRepository methodOfPaymentRepository;

  private final SeedlotOrchardRepository seedlotOrchardRepository;

  private final SeedlotParentTreeRepository seedlotParentTreeRepository;

  private final SeedlotParentTreeGeneticQualityRepository seedlotParentTreeGeneticQualityRepository;

  private final SeedlotGeneticWorthRepository seedlotGeneticWorthRepository;

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
    Optional<Seedlot> seedlotEntity = seedlotRepository.findById(seedlotNumber);
    if (seedlotEntity.isEmpty()) {
      // throw seedlot not found - 404
    }

    Seedlot seedlot = seedlotEntity.get();

    /*
     * Merging entities script:
     * 1. Finds all for that seedlot
     * 2. Iterate over the result list
     * 3. Keep existing entities
     * 4. Remove the ones not present in the request body
     * 5. Add new ones
     */

    saveSeedlotFormStep1(seedlotEntity.get(), form.getSeedlotFormCollectionDto());
    saveSeedlotFormStep2(seedlotEntity.get(), form.getSeedlotFormOwnershipDtoList());
    saveSeedlotFormStep3(seedlotEntity.get(), form.getSeedlotFormInterimDto());
    saveSeedlotFormStep4(seedlotEntity.get(), form.getSeedlotFormOrchardDto());
    saveSeedlotFormStep5(seedlotEntity.get(), form.getSeedlotFormParentTreeSmpDtoList());
    saveSeedlotFormStep6(seedlotEntity.get(), form.getSeedlotFormExtractionDto());

    log.info("Saving seedlot entity for seedlot number {}", seedlotNumber);
    seedlotRepository.save(seedlot);

    return null;
  }

  // Form Step 1 - OK
  private void saveSeedlotFormStep1(Seedlot seedlot, SeedlotFormCollectionDto formStep1) {
    log.info("Saving Seedlot form step 1 for seedlot {}", seedlot.getId());

    seedlot.setCollectionClientNumber(formStep1.collectionClientNumber());
    seedlot.setCollectionLocationCode(formStep1.collectionLocnCode());
    seedlot.setCollectionStartDate(formStep1.collectionStartDate());
    seedlot.setCollectionEndDate(formStep1.collectionEndDate());
    seedlot.setNumberOfContainers(formStep1.noOfContainers());
    seedlot.setContainerVolume(formStep1.volPerContainer());
    seedlot.setTotalConeVolume(formStep1.clctnVolume());
    seedlot.setComment(formStep1.seedlotComment());

    // Script
    List<SeedlotCollectionMethod> seedlotCollectionList =
        seedlotCollectionMethodRepository.findAllBySeedlot_id(seedlot.getId());

    if (!seedlotCollectionList.isEmpty()) {
      List<Integer> existingMethodList = List.of();
      Map<Integer, SeedlotCollectionMethod> collectionMethodMap = Map.of();
      for (SeedlotCollectionMethod collectionMethod : seedlotCollectionList) {
        existingMethodList.add(
            collectionMethod.getConeCollectionMethod().getConeCollectionMethodCode());
        collectionMethodMap.put(
            collectionMethod.getConeCollectionMethod().getConeCollectionMethodCode(),
            collectionMethod);
      }

      List<Integer> methodCodesToInsert = List.of();

      for (Integer formMethodCode : formStep1.coneCollectionMethodCodes()) {
        if (existingMethodList.contains(formMethodCode)) {
          // remove form the list, the one that last will be removed
          existingMethodList.remove(formMethodCode);
        } else {
          methodCodesToInsert.add(formMethodCode);
        }
      }

      // Remove possible leftovers
      log.info("{} collection method code(s) to remove.", existingMethodList.size());
      for (Integer methdCodeToRemove : existingMethodList) {
        seedlotCollectionMethodRepository.delete(collectionMethodMap.get(methdCodeToRemove));
      }

      // Insert new ones
      addSeedlotCollectionMethod(seedlot, methodCodesToInsert);

      return;
    }

    log.info("No previous seedlot collection methods for seedlot {}", seedlot.getId());

    addSeedlotCollectionMethod(seedlot, formStep1.coneCollectionMethodCodes());
  }

  // Form Step 1 related
  private void addSeedlotCollectionMethod(Seedlot seedlot, List<Integer> methods) {
    log.info(
        "Creating {} seedlot collection method(s) for seedlot {}", methods.size(), seedlot.getId());

    for (Integer methodCode : methods) {
      Optional<ConeCollectionMethodEntity> coneCollectionEntity =
          coneCollectionMethodRepository.findById(methodCode);
      if (coneCollectionEntity.isEmpty()) {
        // throw error bad request - 400
      }

      SeedlotCollectionMethod methodEntity =
          new SeedlotCollectionMethod(seedlot, coneCollectionEntity.get());
      methodEntity.setAuditInformation(loggedUserService.createAuditCurrentUser());
      seedlotCollectionMethodRepository.save(methodEntity);
    }
  }

  // Form Step 2 - OK
  private void saveSeedlotFormStep2(Seedlot seedlot, List<SeedlotFormOwnershipDto> formStep2List) {
    log.info("Saving Seedlot form step 2 for seedlot {}", seedlot.getId());
    List<SeedlotOwnerQuantity> ownerQuantityList =
        seedlotOwnerQuantityRepository.findAllBySeedlot_id(seedlot.getId());

    List<SeedlotOwnerQuantity> ownerQuantityToInsert = List.of();

    if (!ownerQuantityList.isEmpty()) {
      List<SeedlotOwnerQuantityId> existingOwnerQtyIdList = List.of();
      Map<SeedlotOwnerQuantityId, SeedlotOwnerQuantity> ownerQuantityMap = Map.of();
      for (SeedlotOwnerQuantity ownerQuantity : ownerQuantityList) {
        existingOwnerQtyIdList.add(ownerQuantity.getId());
        ownerQuantityMap.put(ownerQuantity.getId(), ownerQuantity);
      }

      for (SeedlotFormOwnershipDto ownershipDto : formStep2List) {
        SeedlotOwnerQuantityId ownerId =
            new SeedlotOwnerQuantityId(
                seedlot.getId(), ownershipDto.ownerClientNumber(), ownershipDto.ownerLocnCode());

        if (existingOwnerQtyIdList.contains(ownerId)) {
          // remove form the list, the one that last will be removed
          existingOwnerQtyIdList.remove(ownerId);
        } else {
          SeedlotOwnerQuantity ownerQuantityEntity =
              createSeedlotOwnerQuantityFromDto(seedlot, ownershipDto);
          ownerQuantityToInsert.add(ownerQuantityEntity);
        }
      }

      // Remove possible leftovers
      log.info("{} ownership quantity(ies) to remove.", existingOwnerQtyIdList.size());
      for (SeedlotOwnerQuantityId ownerId : existingOwnerQtyIdList) {
        seedlotOwnerQuantityRepository.deleteById(ownerId);
      }

      // Insert new ones
      seedlotOwnerQuantityRepository.saveAll(ownerQuantityToInsert);

      return;
    }

    // just insert if no previous, all new
    log.info("No previous seedlot owner quantities for seedlot {}", seedlot.getId());

    for (SeedlotFormOwnershipDto ownershipDto : formStep2List) {
      SeedlotOwnerQuantity ownerQuantityEntity =
          createSeedlotOwnerQuantityFromDto(seedlot, ownershipDto);
      ownerQuantityToInsert.add(ownerQuantityEntity);
    }

    seedlotOwnerQuantityRepository.saveAll(ownerQuantityToInsert);
  }

  // Form Step 2 related
  private SeedlotOwnerQuantity createSeedlotOwnerQuantityFromDto(
      Seedlot seedlot, SeedlotFormOwnershipDto ownershipDto) {
    log.info(
        "Creating seedlot owner {} for seedlot {}",
        ownershipDto.ownerClientNumber(),
        seedlot.getId());

    SeedlotOwnerQuantity ownerQuantityEntity =
        new SeedlotOwnerQuantity(
            seedlot, ownershipDto.ownerClientNumber(), ownershipDto.ownerLocnCode());
    ownerQuantityEntity.setOriginalPercentageOwned(ownershipDto.originalPctOwned());
    ownerQuantityEntity.setOriginalPercentageReserved(ownershipDto.originalPctRsrvd());
    ownerQuantityEntity.setOriginalPercentageSurplus(ownershipDto.originalPctSrpls());
    ownerQuantityEntity.setFundingSourceCode(ownershipDto.sparFundSrceCode());
    ownerQuantityEntity.setAuditInformation(loggedUserService.createAuditCurrentUser());

    // Payment method
    Optional<MethodOfPaymentEntity> paymentEntity =
        methodOfPaymentRepository.findById(ownershipDto.methodOfPaymentCode());
    if (paymentEntity.isEmpty()) {
      // throw error bad request
    }
    ownerQuantityEntity.setMethodOfPayment(paymentEntity.get());
    return ownerQuantityEntity;
  }

  // Form Step 3 - OK
  private void saveSeedlotFormStep3(Seedlot seedlot, SeedlotFormInterimDto formStep3) {
    log.info("Saving Seedlot form step 3 for seedlot {}", seedlot.getId());

    seedlot.setInterimStorageClientNumber(formStep3.intermStrgClientNumber());
    seedlot.setInterimStorageLocationCode(formStep3.intermStrgLocnCode());
    seedlot.setInterimStorageStartDate(formStep3.intermStrgStDate());
    seedlot.setInterimStorageEndDate(formStep3.intermStrgEndDate());
    // intermStrgLocn - will be added when PR 685 get merged
    seedlot.setInterimStorageFacilityCode(formStep3.intermFacilityCode());
  }

  // Form Step 4 - OK
  private void saveSeedlotFormStep4(Seedlot seedlot, SeedlotFormOrchardDto formStep4) {
    log.info("Saving Seedlot form step 4 for seedlot {}", seedlot.getId());

    saveSeedlotOrchards(seedlot, formStep4);

    seedlot.setFemaleGameticContributionMethod(formStep4.femaleGameticMthdCode());
    seedlot.setMaleGameticContributionMethod(formStep4.maleGameticMthdCode());
    seedlot.setProducedThroughControlledCross(formStep4.controlledCrossInd());
    seedlot.setProducedWithBiotechnologicalProcesses(formStep4.biotechProcessesInd());
    seedlot.setPollenContaminationPresentInOrchard(formStep4.pollenContaminationInd());
    seedlot.setPollenContaminationPercentage(formStep4.pollenContaminationPct());
    seedlot.setPollenContaminantBreedingValue(formStep4.contaminantPollenBv());
    seedlot.setPollenContaminationMethodCode(formStep4.pollenContaminationMthdCode());
  }

  // Form Step 4 related
  private void saveSeedlotOrchards(Seedlot seedlot, SeedlotFormOrchardDto formStep4) {
    log.info(
        "Creating {} orchard(s) for seedlot {}", formStep4.orchardsId().size(), seedlot.getId());

    // orchardsId - list of orchards
    int orchardsLen = formStep4.orchardsId().size();
    if (orchardsLen > 1 && formStep4.primaryOrchardId().isBlank()) {
      // throw bad request - 400
    }

    String primaryOrchardId =
        formStep4.primaryOrchardId().isBlank()
            ? formStep4.orchardsId().get(0)
            : formStep4.primaryOrchardId();

    List<SeedlotOrchard> seedlotOrchards =
        seedlotOrchardRepository.findAllBySeelot_id(seedlot.getId());

    if (!seedlotOrchards.isEmpty()) {
      List<String> existingSeedlotOrchardList = List.of();
      Map<String, SeedlotOrchard> orchardMap = Map.of();
      for (SeedlotOrchard seedlotOrchard : seedlotOrchards) {
        existingSeedlotOrchardList.add(seedlotOrchard.getOrchard());
        orchardMap.put(seedlotOrchard.getOrchard(), seedlotOrchard);
      }

      List<String> seedlotOrchardIdToInsert = List.of();

      for (String formOrchardId : formStep4.orchardsId()) {
        if (existingSeedlotOrchardList.contains(formOrchardId)) {
          // remove form the list, the one that last will be removed
          existingSeedlotOrchardList.remove(formOrchardId);
        } else {
          seedlotOrchardIdToInsert.add(formOrchardId);
        }
      }

      // Remove possible leftovers
      log.info("{} seedlot orchards to remove.", existingSeedlotOrchardList.size());
      for (String orchardId : existingSeedlotOrchardList) {
        seedlotOrchardRepository.delete(orchardMap.get(orchardId));
      }

      // Insert new ones
      saveSeedlotOrchards(seedlot, seedlotOrchardIdToInsert, primaryOrchardId);

      return;
    }

    // just insert
    saveSeedlotOrchards(seedlot, formStep4.orchardsId(), primaryOrchardId);
  }

  // Form Step 4 related
  private void saveSeedlotOrchards(Seedlot seedlot, List<String> orchardIdList, String primaryId) {
    for (String orchardId : orchardIdList) {
      SeedlotOrchard seedlotOrchard = new SeedlotOrchard(seedlot, orchardId);
      seedlotOrchard.setPrimary(orchardId.equals(primaryId));
      seedlotOrchard.setAuditInformation(loggedUserService.createAuditCurrentUser());
      seedlotOrchardRepository.save(seedlotOrchard);
    }
  }

  // Form Step 5 - WIP
  private void saveSeedlotFormStep5(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {
    log.info("Saving Seedlot form step 5 for seedlot {}", seedlot.getId());

    saveSeedlotParentTree(seedlot, seedlotFormParentTreeDtoList);
    saveSeedlotPtGenQlty(seedlot, seedlotFormParentTreeDtoList);
    saveSeedlotGenWorth(seedlot, seedlotFormParentTreeDtoList);
    // saveSmpMix(); -- keep going on these 3 methods
    // saveSmpMixGenQlty();
    // saveSeedlotPtSmpMix();
  }

  // Form Step 5 SeedlotParent related
  private void saveSeedlotParentTree(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {
    List<SeedlotParentTree> seedlotParentTreeList =
        seedlotParentTreeRepository.findAllBySeedlot_id(seedlot.getId());

    if (!seedlotParentTreeList.isEmpty()) {
      List<Integer> existingSeedlotPtIdList = List.of();
      Map<Integer, SeedlotParentTree> seedlotPtMap = Map.of();
      for (SeedlotParentTree seedlotPt : seedlotParentTreeList) {
        existingSeedlotPtIdList.add(seedlotPt.getParentTreeId());
        seedlotPtMap.put(seedlotPt.getParentTreeId(), seedlotPt);
      }

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
      List<SeedlotParentTreeGeneticQualityId> existingSeedlotPtGenQltyIdList = List.of();
      for (SeedlotParentTreeGeneticQuality seedlotPtGenQlty : seedlotPtGenQltyList) {
        existingSeedlotPtGenQltyIdList.add(seedlotPtGenQlty.getId());
      }

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
