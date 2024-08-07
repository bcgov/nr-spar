package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOwnershipDto;
import ca.bc.gov.backendstartapi.entity.MethodOfPaymentEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOwnerQuantity;
import ca.bc.gov.backendstartapi.exception.SeedlotConflictDataException;
import ca.bc.gov.backendstartapi.repository.SeedlotOwnerQuantityRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** This class holds methods for handling the {@link SeedlotOwnerQuantity} entity. */
@Service
@RequiredArgsConstructor
public class SeedlotOwnerQuantityService {

  private final SeedlotOwnerQuantityRepository seedlotOwnerQuantityRepository;

  private final LoggedUserService loggedUserService;

  private final MethodOfPaymentService methodOfPaymentService;

  /**
   * Saves a SeedlotParentTree from the Seedlot Form Registration step 2.
   *
   * @param seedlot The {@link Seedlot} related
   * @param formStep2List A List of {@link SeedlotFormOwnershipDto}
   * @return A list of {@link SeedlotOwnerQuantity} created, if any
   */
  public List<SeedlotOwnerQuantity> saveSeedlotFormStep2(
      Seedlot seedlot, List<SeedlotFormOwnershipDto> formStep2List, boolean canDelete) {
    SparLog.info("Saving Seedlot Form Step 2-Ownership for seedlot number {}", seedlot.getId());

    SparLog.info(
        "Received {} owner record(s) for seedlot number {}", formStep2List.size(), seedlot.getId());

    List<SeedlotOwnerQuantity> soqList =
        seedlotOwnerQuantityRepository.findAllBySeedlot_id(seedlot.getId());

    if (!soqList.isEmpty() && canDelete) {
      SparLog.info(
          "Deleting {} previous owner records for seedlot number {}",
          soqList.size(),
          seedlot.getId());

      seedlotOwnerQuantityRepository.deleteAllBySeedlot_id(seedlot.getId());
      seedlotOwnerQuantityRepository.flush();
    } else if (!soqList.isEmpty() && !canDelete) {
      SparLog.info("Update seedlot {} ownership data failed due to conflict.", seedlot.getId());
      throw new SeedlotConflictDataException(seedlot.getId());
    }

    return addSeedlotOwnerQuantityFromForm(seedlot, formStep2List);
  }

  private List<SeedlotOwnerQuantity> addSeedlotOwnerQuantityFromForm(
      Seedlot seedlot, List<SeedlotFormOwnershipDto> sfodList) {
    if (sfodList.isEmpty()) {
      SparLog.info("No new owner records to be inserted for seedlot number {}", seedlot.getId());
      return List.of();
    }

    SparLog.info(
        "{} owner record(s) to be inserted for seedlot number {}",
        sfodList.size(),
        seedlot.getId());

    // Using Set here to avoid duplications
    Set<String> paymentMethods =
        new HashSet<>(sfodList.stream().map(SeedlotFormOwnershipDto::methodOfPaymentCode).toList());
    List<String> methods = paymentMethods.stream().toList();

    Map<String, MethodOfPaymentEntity> mopeMap =
        methodOfPaymentService.getAllMethodsByCodeList(methods).stream()
            .collect(
                Collectors.toMap(
                    MethodOfPaymentEntity::getMethodOfPaymentCode, Function.identity()));

    List<SeedlotOwnerQuantity> soqList = new ArrayList<>();
    for (SeedlotFormOwnershipDto ownershipDto : sfodList) {
      SeedlotOwnerQuantity ownerQuantityEntity =
          new SeedlotOwnerQuantity(
              seedlot,
              ownershipDto.ownerClientNumber(),
              ownershipDto.ownerLocnCode(),
              mopeMap.get(ownershipDto.methodOfPaymentCode()));
      ownerQuantityEntity.setOriginalPercentageOwned(ownershipDto.originalPctOwned());
      ownerQuantityEntity.setOriginalPercentageReserved(ownershipDto.originalPctRsrvd());
      ownerQuantityEntity.setOriginalPercentageSurplus(ownershipDto.originalPctSrpls());
      ownerQuantityEntity.setFundingSourceCode(ownershipDto.sparFundSrceCode());
      ownerQuantityEntity.setAuditInformation(loggedUserService.createAuditCurrentUser());
      soqList.add(ownerQuantityEntity);
    }

    return seedlotOwnerQuantityRepository.saveAll(soqList);
  }

  /**
   * Find all seedlot owner quantity given a seedlot number.
   *
   * @param seedlotNumber The seedlot number.
   * @return A list of found records, or an empty list.
   */
  public List<SeedlotOwnerQuantity> findAllBySeedlot(String seedlotNumber) {
    return seedlotOwnerQuantityRepository.findAllBySeedlot_id(seedlotNumber);
  }
}
