package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.Constants;
import ca.bc.gov.backendstartapi.dto.SeedlotApplicationPatchDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateResponseDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormCollectionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormExtractionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormInterimDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOrchardDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOwnershipDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormSubmissionDto;
import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.MethodOfPaymentEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotSourceEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionMethod;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOwnerQuantity;
import ca.bc.gov.backendstartapi.entity.seedlot.idclass.SeedlotOwnerQuantityId;
import ca.bc.gov.backendstartapi.exception.InvalidSeedlotRequestException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotSourceNotFoundException;
import ca.bc.gov.backendstartapi.repository.ConeCollectionMethodRepository;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.MethodOfPaymentRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotCollectionMethodRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotOwnerQuantityRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
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
    saveSeedlotFormStep5(seedlotEntity.get(), form.getSeedlotFormParentTreeSmpDto());
    saveSeedlotFormStep6(seedlotEntity.get(), form.getSeedlotFormExtractionDto());

    log.info("Saving seedlot entity for seedlot number {}", seedlotNumber);
    seedlotRepository.save(seedlot);

    return null;
  }

  // Form Step 1 - OK
  private void saveSeedlotFormStep1(Seedlot seedlot, SeedlotFormCollectionDto formStep1) {
    log.info("Saving Seedlot form step 1");

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
      List<Integer> existingMethodList = new ArrayList<>();
      Map<Integer, SeedlotCollectionMethod> collectionMethodMap = new HashMap<>();
      for (SeedlotCollectionMethod collectionMethod : seedlotCollectionList) {
        existingMethodList.add(
            collectionMethod.getConeCollectionMethod().getConeCollectionMethodCode());
        collectionMethodMap.put(
            collectionMethod.getConeCollectionMethod().getConeCollectionMethodCode(),
            collectionMethod);
      }

      List<Integer> methodCodesToInsert = new ArrayList<>();

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
    log.info("Saving Seedlot form step 2");
    List<SeedlotOwnerQuantity> ownerQuantityList =
        seedlotOwnerQuantityRepository.findAllBySeedlot_id(seedlot.getId());

    List<SeedlotOwnerQuantity> ownerQuantityToInsert = new ArrayList<>();

    if (!ownerQuantityList.isEmpty()) {
      List<SeedlotOwnerQuantityId> existingOwnerQtyIdList = new ArrayList<>();
      Map<SeedlotOwnerQuantityId, SeedlotOwnerQuantity> ownerQuantityMap = new HashMap<>();
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

  private Seedlot saveSeedlotFormStep3(Seedlot seedlot, SeedlotFormInterimDto formStep3) {
    // Step 3
    log.info("Saving Seedlot form step 3");
    // intermStrgClientNumber
    // intermStrgLocnCode
    // intermStrgStDate
    // intermStrgEndDate
    // intermStrgLocn
    // intermFacilityCode
    return seedlot;
  }

  private Seedlot saveSeedlotFormStep4(Seedlot seedlot, SeedlotFormOrchardDto formStep4) {
    // Step 4
    log.info("Saving Seedlot form step 4");
    return seedlot;
  }

  private Seedlot saveSeedlotFormStep5(Seedlot seedlot, String seedlotFormParentTreeSmpDto) {
    // Step 5
    log.info("Saving Seedlot form step 5");
    return seedlot;
  }

  private Seedlot saveSeedlotFormStep6(Seedlot seedlot, SeedlotFormExtractionDto formStep6) {
    // Step 6
    log.info("Saving Seedlot form step 6");
    return seedlot;
  }
}
