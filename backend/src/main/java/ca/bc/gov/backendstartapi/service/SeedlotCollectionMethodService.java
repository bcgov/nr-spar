package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.SeedlotFormCollectionDto;
import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionMethod;
import ca.bc.gov.backendstartapi.entity.seedlot.idclass.SeedlotCollectionMethodId;
import ca.bc.gov.backendstartapi.exception.ConeCollectionMethodNotFoundException;
import ca.bc.gov.backendstartapi.repository.SeedlotCollectionMethodRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/** This class contains methods for handling the relation between Seedlots and CollectionMethods. */
@Slf4j
@Service
@RequiredArgsConstructor
public class SeedlotCollectionMethodService {

  private final SeedlotCollectionMethodRepository seedlotCollectionMethodRepository;

  private final ConeCollectionMethodService collectionMethodService;

  private final LoggedUserService loggedUserService;

  /**
   * Saves a SeedlotParentTree from the Seedlot Form Registration step 1.
   *
   * @param seedlot The {@link Seedlot} related
   * @param formStep1 The {@link SeedlotFormCollectionDto} to be saved
   */
  public void saveSeedlotFormStep1(Seedlot seedlot, SeedlotFormCollectionDto formStep1) {
    log.info("Saving Seedlot Form Step 1-Collection for seedlot number {}", seedlot.getId());

    seedlot.setCollectionClientNumber(formStep1.collectionClientNumber());
    seedlot.setCollectionLocationCode(formStep1.collectionLocnCode());
    seedlot.setCollectionStartDate(formStep1.collectionStartDate());
    seedlot.setCollectionEndDate(formStep1.collectionEndDate());
    seedlot.setNumberOfContainers(formStep1.noOfContainers());
    seedlot.setContainerVolume(formStep1.volPerContainer());
    seedlot.setTotalConeVolume(formStep1.clctnVolume());
    seedlot.setComment(formStep1.seedlotComment());

    List<SeedlotCollectionMethod> seedlotCollectionList =
        seedlotCollectionMethodRepository.findAllBySeedlot_id(seedlot.getId());

    if (!seedlotCollectionList.isEmpty()) {
      List<Integer> existingMethodList =
          seedlotCollectionList.stream()
              .map(x -> x.getConeCollectionMethod().getConeCollectionMethodCode())
              .collect(Collectors.toList());

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
      log.info(
          "{} record(s) in the SeedlotCollectionMethod table to remove for seedlot number {}",
          existingMethodList.size(),
          seedlot.getId());

      List<SeedlotCollectionMethodId> scmIdList = List.of();
      for (Integer methdCodeToRemove : existingMethodList) {
        scmIdList.add(new SeedlotCollectionMethodId(seedlot.getId(), methdCodeToRemove));
      }

      if (!scmIdList.isEmpty()) {
        seedlotCollectionMethodRepository.deleteAllById(scmIdList);
        seedlotCollectionMethodRepository.flush();
      }

      // Insert new ones
      addSeedlotCollectionMethod(seedlot, methodCodesToInsert);

      return;
    }

    log.info(
        "No previous records on SeedlotCollectionMethod table for seedlot number {}",
        seedlot.getId());

    addSeedlotCollectionMethod(seedlot, formStep1.coneCollectionMethodCodes());
  }

  /**
   * Saves each Collection method for a given Seedlot.
   *
   * @param seedlotNumber The seedlot number to be saved
   * @param methods List of Collection methods to be saved
   */
  private void addSeedlotCollectionMethod(Seedlot seedlot, List<Integer> methods) {
    log.info(
        "Creating {} record(s) in the SeedlotCollectionMethod table for seedlot number {}",
        methods.size(),
        seedlot.getId());

    // Map of Cone Collection Methots
    Map<Integer, ConeCollectionMethodEntity> ccmeMap =
        collectionMethodService.getAllValidConeCollectionMethods().stream()
            .collect(
                Collectors.toMap(
                    ConeCollectionMethodEntity::getConeCollectionMethodCode, Function.identity()));

    List<SeedlotCollectionMethod> scmList = new ArrayList<>();

    for (Integer methodCode : methods) {
      ConeCollectionMethodEntity coneCollectionEntity = ccmeMap.get(methodCode);
      if (Objects.isNull(coneCollectionEntity)) {
        throw new ConeCollectionMethodNotFoundException();
      }

      SeedlotCollectionMethod methodEntity = new SeedlotCollectionMethod();
      methodEntity.setSeedlot(seedlot);
      methodEntity.setConeCollectionMethod(coneCollectionEntity);
      methodEntity.setAuditInformation(loggedUserService.createAuditCurrentUser());

      scmList.add(methodEntity);
    }

    seedlotCollectionMethodRepository.saveAllAndFlush(scmList);
  }
}
