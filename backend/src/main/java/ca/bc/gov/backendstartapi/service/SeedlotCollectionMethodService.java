package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SeedlotFormCollectionDto;
import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionMethod;
import ca.bc.gov.backendstartapi.exception.SeedlotConflictDataException;
import ca.bc.gov.backendstartapi.repository.SeedlotCollectionMethodRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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
    if (!Objects.isNull(seedlot.getCollectionStartDate())
        && !formStep1.collectionStartDate().isEqual(seedlot.getCollectionStartDate())) {
      seedlot.setCollectionStartDate(formStep1.collectionStartDate());
    }
    if (!Objects.isNull(seedlot.getCollectionEndDate())
        && !formStep1.collectionEndDate().isEqual(seedlot.getCollectionEndDate())) {
      seedlot.setCollectionEndDate(formStep1.collectionEndDate());
    }
    if (formStep1.noOfContainers().compareTo(seedlot.getNumberOfContainers()) != 0) {
      seedlot.setNumberOfContainers(formStep1.noOfContainers());
    }
    if (formStep1.volPerContainer().compareTo(seedlot.getContainerVolume()) != 0) {
      seedlot.setContainerVolume(formStep1.volPerContainer());
    }
    if (formStep1.clctnVolume().compareTo(seedlot.getTotalConeVolume()) != 0) {
      seedlot.setTotalConeVolume(formStep1.clctnVolume());
    }
    seedlot.setComment(formStep1.seedlotComment());

    SparLog.info(
        "Received {} collection method(s) for seedlot number {}",
        formStep1.coneCollectionMethodCodes().size(),
        seedlot.getId());

    List<SeedlotCollectionMethod> seedlotCollectionList =
        seedlotCollectionMethodRepository.findAllBySeedlot_id(seedlot.getId());

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
