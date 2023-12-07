package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.SeedlotFormOwnershipDto;
import ca.bc.gov.backendstartapi.entity.MethodOfPaymentEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOwnerQuantity;
import ca.bc.gov.backendstartapi.entity.seedlot.idclass.SeedlotOwnerQuantityId;
import ca.bc.gov.backendstartapi.exception.MethodOfPaymentNotFoundException;
import ca.bc.gov.backendstartapi.repository.SeedlotOwnerQuantityRepository;
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

/** This class holds methods for handling the {@link SeedlotOwnerQuantity} entity. */
@Slf4j
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
   */
  public void saveSeedlotFormStep2(Seedlot seedlot, List<SeedlotFormOwnershipDto> formStep2List) {
    log.info("Saving Seedlot Form Step 2-Ownership for seedlot number {}", seedlot.getId());

    List<SeedlotOwnerQuantity> soqList =
        seedlotOwnerQuantityRepository.findAllBySeedlot_id(seedlot.getId());

    if (!soqList.isEmpty()) {
      List<SeedlotOwnerQuantityId> existingOwnerQtyIdList =
          soqList.stream().map(x -> x.getId()).collect(Collectors.toList());

      List<SeedlotFormOwnershipDto> sfodToInsertList = List.of();

      for (SeedlotFormOwnershipDto ownershipDto : formStep2List) {
        SeedlotOwnerQuantityId soqId =
            new SeedlotOwnerQuantityId(
                seedlot.getId(), ownershipDto.ownerClientNumber(), ownershipDto.ownerLocnCode());

        if (existingOwnerQtyIdList.contains(soqId)) {
          // remove form the list, the one that last will be removed
          existingOwnerQtyIdList.remove(soqId);
        } else {
          sfodToInsertList.add(ownershipDto);
        }
      }

      // Remove possible leftovers
      log.info(
          "{} record(s) in the SeedlotOwerQuantity table to remove for seedlot number {}",
          existingOwnerQtyIdList.size(),
          seedlot.getId());

      if (!existingOwnerQtyIdList.isEmpty()) {
        seedlotOwnerQuantityRepository.deleteAllById(existingOwnerQtyIdList);
        seedlotOwnerQuantityRepository.flush();
      }

      // Insert new ones
      addSeedlotOwnerQuantityFromForm(seedlot, sfodToInsertList);

      return;
    }

    log.info(
        "No previous records on SeedlotOwnerQuantity table for seedlot number {}", seedlot.getId());

    addSeedlotOwnerQuantityFromForm(seedlot, formStep2List);
  }

  private void addSeedlotOwnerQuantityFromForm(
      Seedlot seedlot, List<SeedlotFormOwnershipDto> sfodList) {
    Map<String, MethodOfPaymentEntity> mopeMap =
        methodOfPaymentService.getAllValidMethodOfPayments().stream()
            .collect(
                Collectors.toMap(
                    MethodOfPaymentEntity::getMethodOfPaymentCode, Function.identity()));

    List<SeedlotOwnerQuantity> soqList = new ArrayList<>();
    for (SeedlotFormOwnershipDto ownershipDto : sfodList) {
      SeedlotOwnerQuantity ownerQuantityEntity =
          new SeedlotOwnerQuantity(
              seedlot, ownershipDto.ownerClientNumber(), ownershipDto.ownerLocnCode());
      ownerQuantityEntity.setOriginalPercentageOwned(ownershipDto.originalPctOwned());
      ownerQuantityEntity.setOriginalPercentageReserved(ownershipDto.originalPctRsrvd());
      ownerQuantityEntity.setOriginalPercentageSurplus(ownershipDto.originalPctSrpls());
      ownerQuantityEntity.setFundingSourceCode(ownershipDto.sparFundSrceCode());
      ownerQuantityEntity.setAuditInformation(loggedUserService.createAuditCurrentUser());

      MethodOfPaymentEntity mope = mopeMap.get(ownershipDto.methodOfPaymentCode());
      if (Objects.isNull(mope)) {
        throw new MethodOfPaymentNotFoundException();
      }
      ownerQuantityEntity.setMethodOfPayment(mope);

      soqList.add(ownerQuantityEntity);
    }

    seedlotOwnerQuantityRepository.saveAllAndFlush(soqList);
  }
}
