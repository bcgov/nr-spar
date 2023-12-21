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
   * @return A list of {@link SeedlotOwnerQuantity} created, if any
   */
  public List<SeedlotOwnerQuantity> saveSeedlotFormStep2(
      Seedlot seedlot, List<SeedlotFormOwnershipDto> formStep2List) {
    log.info("Saving Seedlot Form Step 2-Ownership for seedlot number {}", seedlot.getId());

    log.info(
        "Received {} SeedlotOwerQuantity record(s) for seedlot number {}",
        formStep2List.size(),
        seedlot.getId());

    List<SeedlotOwnerQuantity> soqList =
        seedlotOwnerQuantityRepository.findAllBySeedlot_id(seedlot.getId());

    if (!soqList.isEmpty()) {
      log.info(
          "Deleting {} previous records on the SeedlotOwerQuantity table for seedlot number {}",
          soqList.size(),
          seedlot.getId());

      List<SeedlotOwnerQuantityId> idsToDelete =
          soqList.stream().map(x -> x.getId()).collect(Collectors.toList());


      seedlotOwnerQuantityRepository.deleteAllById(idsToDelete);
    }

    return addSeedlotOwnerQuantityFromForm(seedlot, formStep2List);
  }

  private List<SeedlotOwnerQuantity> addSeedlotOwnerQuantityFromForm(
      Seedlot seedlot, List<SeedlotFormOwnershipDto> sfodList) {
    if (sfodList.isEmpty()) {
      log.info(
          "No new records to be inserted on the SeedlotOwnerQuantity table for seedlot number {}",
          seedlot.getId());
      return List.of();
    }

    log.info(
        "{} record(s) to be inserted on the SeedlotOwnerQuantity table for seedlot number {}",
        sfodList.size(),
        seedlot.getId());

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

    return seedlotOwnerQuantityRepository.saveAll(soqList);
  }
}
