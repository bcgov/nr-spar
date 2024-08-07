package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SeedlotFormCollectionDto;
import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionMethod;
import ca.bc.gov.backendstartapi.exception.SeedlotConflictDataException;
import ca.bc.gov.backendstartapi.repository.SeedlotCollectionMethodRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import ca.bc.gov.backendstartapi.util.ValueUtil;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** This class contains methods for handling the relation between Seedlots and CollectionMethods. */
@Service
@RequiredArgsConstructor
public class SeedlotCollectionMethodService {

  private final SeedlotCollectionMethodRepository seedlotCollectionMethodRepository;

  private final ConeCollectionMethodService coneCollectionMethodService;

  private final LoggedUserService loggedUserService;

  /**
   * Saves a SeedlotParentTree from the Seedlot Form Registration step 1.
   *
   * @param seedlot The {@link Seedlot} related
   * @param formStep1 The {@link SeedlotFormCollectionDto} to be saved
   */
  public void saveSeedlotFormStep1(
      Seedlot seedlot, SeedlotFormCollectionDto formStep1, boolean canDelete) {
    SparLog.info("Saving Seedlot Form Step 1-Collection for seedlot number {}", seedlot.getId());

    seedlot.setCollectionClientNumber(formStep1.collectionClientNumber());
    seedlot.setCollectionLocationCode(formStep1.collectionLocnCode());
    if (!ValueUtil.isValueEqual(
        seedlot.getCollectionStartDate(), formStep1.collectionStartDate())) {
      seedlot.setCollectionStartDate(formStep1.collectionStartDate());
    }
    if (!ValueUtil.isValueEqual(seedlot.getCollectionEndDate(), formStep1.collectionEndDate())) {
      seedlot.setCollectionEndDate(formStep1.collectionEndDate());
    }
    if (!ValueUtil.isValueEqual(formStep1.noOfContainers(), seedlot.getNumberOfContainers())) {
      seedlot.setNumberOfContainers(formStep1.noOfContainers());
    }
    if (!ValueUtil.isValueEqual(formStep1.volPerContainer(), seedlot.getContainerVolume())) {
      seedlot.setContainerVolume(formStep1.volPerContainer());
    }
    if (!ValueUtil.isValueEqual(formStep1.clctnVolume(), seedlot.getTotalConeVolume())) {
      seedlot.setTotalConeVolume(formStep1.clctnVolume());
    }
    seedlot.setComment(formStep1.seedlotComment());

    SparLog.info(
        "Received {} collection method(s) for seedlot number {}",
        formStep1.coneCollectionMethodCodes().size(),
        seedlot.getId());

    List<SeedlotCollectionMethod> seedlotCollectionList =
        seedlotCollectionMethodRepository.findAllBySeedlot_id(seedlot.getId());

    boolean allEqual = 
        areExistingEqualsNewOnes(seedlotCollectionList, formStep1.coneCollectionMethodCodes());

    if (allEqual) {
      SparLog.info("Do not need to touch seedlot cone collection methods, they are the same");
      return;
    }

    if (!seedlotCollectionList.isEmpty() && canDelete) {
      SparLog.info(
          "Deleting {} previous records on the SeedlotCollectionMethod table for seedlot number {}",
          seedlotCollectionList.size(),
          seedlot.getId());

      seedlotCollectionMethodRepository.deleteAllBySeedlot_id(seedlot.getId());
      seedlotCollectionMethodRepository.flush();
    } else if (!seedlotCollectionList.isEmpty() && !canDelete) {
      SparLog.info("Update seedlot {} collection data failed due to conflict.", seedlot.getId());
      throw new SeedlotConflictDataException(seedlot.getId());
    }

    addSeedlotCollectionMethod(seedlot, formStep1.coneCollectionMethodCodes());
  }

  private boolean areExistingEqualsNewOnes(
      List<SeedlotCollectionMethod> existing, List<Integer> newOnes) {
    List<Integer> existingOnes =
        existing.stream()
            .map(
                scm -> Integer.valueOf(scm.getConeCollectionMethod().getConeCollectionMethodCode()))
            .toList();

    List<Integer> sortedList1 = new ArrayList<>(existingOnes);
    List<Integer> sortedList2 = new ArrayList<>(newOnes);

    Collections.sort(sortedList1);
    Collections.sort(sortedList2);

    return sortedList1.equals(sortedList2);
  }

  /**
   * Saves each Collection method for a given Seedlot.
   *
   * @param seedlotNumber The seedlot number to be saved
   * @param methods List of Collection methods to be saved
   */
  private void addSeedlotCollectionMethod(Seedlot seedlot, List<Integer> methods) {
    if (methods.isEmpty()) {
      SparLog.info(
          "No new records to be inserted on the SeedlotCollectionMethod table for seedlot number"
              + " {}",
          seedlot.getId());
      return;
    }

    SparLog.info(
        "{} record(s) to be inserted on the SeedlotCollectionMethod table for seedlot number {}",
        methods.size(),
        seedlot.getId());

    // Map of Cone Collection Methods
    Map<Integer, ConeCollectionMethodEntity> ccmeMap =
        coneCollectionMethodService.getAllByIdIn(methods).stream()
            .collect(
                Collectors.toMap(
                    ConeCollectionMethodEntity::getConeCollectionMethodCode, Function.identity()));

    List<SeedlotCollectionMethod> scmList = new ArrayList<>();

    for (Integer methodCode : methods) {
      SeedlotCollectionMethod methodEntity = new SeedlotCollectionMethod();
      methodEntity.setSeedlot(seedlot);
      methodEntity.setConeCollectionMethod(ccmeMap.get(methodCode));
      methodEntity.setAuditInformation(loggedUserService.createAuditCurrentUser());

      scmList.add(methodEntity);
    }

    seedlotCollectionMethodRepository.saveAll(scmList);
  }

  /**
   * Get All Seedlot collection method codes given a seedlot number.
   *
   * @param seedlotNumber The seedlot number.
   * @return List of collection method codes or an empty list.
   */
  public List<Integer> getAllSeedlotCollectionMethodsBySeedlot(String seedlotNumber) {
    return seedlotCollectionMethodRepository.findAllBySeedlot_id(seedlotNumber).stream()
        .map(col -> col.getConeCollectionMethod().getConeCollectionMethodCode())
        .collect(Collectors.toList());
  }
}
