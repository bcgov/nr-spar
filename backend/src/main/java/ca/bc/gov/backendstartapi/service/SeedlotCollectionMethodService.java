package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dao.SeedlotEntityDao;
import ca.bc.gov.backendstartapi.dto.SeedlotFormCollectionDto;
import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionMethod;
import ca.bc.gov.backendstartapi.entity.seedlot.idclass.SeedlotCollectionMethodId;
import ca.bc.gov.backendstartapi.exception.ConeCollectionMethodNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.repository.SeedlotCollectionMethodRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
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

  private final SeedlotEntityDao seedlotEntityDao;

  public void saveSeedlotFormStep1(String seedlotNumber, SeedlotFormCollectionDto formStep1) {
    List<SeedlotCollectionMethod> seedlotCollectionList =
        seedlotCollectionMethodRepository.findAllBySeedlot_id(seedlotNumber);

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
          seedlotNumber);

      List<SeedlotCollectionMethodId> scmIdList = List.of();
      for (Integer methdCodeToRemove : existingMethodList) {
        scmIdList.add(new SeedlotCollectionMethodId(seedlotNumber, methdCodeToRemove));
      }

      if (!scmIdList.isEmpty()) {
        seedlotCollectionMethodRepository.deleteAllById(scmIdList);
      }

      // Insert new ones
      addSeedlotCollectionMethod(seedlotNumber, methodCodesToInsert);

      return;
    }

    log.info(
        "No previous records on SeedlotCollectionMethod table for seedlot number {}",
        seedlotNumber);

    addSeedlotCollectionMethod(seedlotNumber, formStep1.coneCollectionMethodCodes());
  }

  /**
   * Saves each Collection method for a given Seedlot.
   *
   * @param seedlotNumber The seedlot number to be saved
   * @param methods List of Collection methods to be saved
   */
  private void addSeedlotCollectionMethod(String seedlotNumber, List<Integer> methods) {
    log.info(
        "Creating {} records in the SeedlotCollectionMethod table for seedlot number {}",
        methods.size(),
        seedlotNumber);

    // Map of Cone Collection Methots
    Map<Integer, ConeCollectionMethodEntity> ccmeMap =
        collectionMethodService.getAllValidConeCollectionMethods().stream()
            .collect(
                Collectors.toMap(
                    ConeCollectionMethodEntity::getConeCollectionMethodCode, Function.identity()));

    List<SeedlotCollectionMethod> scmList = List.of();

    for (Integer methodCode : methods) {
      ConeCollectionMethodEntity coneCollectionEntity = ccmeMap.get(methodCode);
      if (Objects.isNull(coneCollectionEntity)) {
        throw new ConeCollectionMethodNotFoundException();
      }

      Seedlot seedlot =
          seedlotEntityDao.getSeedlot(seedlotNumber).orElseThrow(SeedlotNotFoundException::new);

      SeedlotCollectionMethod methodEntity =
          new SeedlotCollectionMethod(seedlot, coneCollectionEntity);
      methodEntity.setAuditInformation(loggedUserService.createAuditCurrentUser());

      scmList.add(methodEntity);
    }

    seedlotCollectionMethodRepository.saveAll(scmList);
  }
}
