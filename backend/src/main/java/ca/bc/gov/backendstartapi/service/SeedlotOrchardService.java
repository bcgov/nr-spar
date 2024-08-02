package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOrchardDto;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOrchard;
import ca.bc.gov.backendstartapi.exception.SeedlotConflictDataException;
import ca.bc.gov.backendstartapi.repository.SeedlotOrchardRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import ca.bc.gov.backendstartapi.util.ValueUtil;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** This class holds methods for handling the {@link SeedlotOrchard} entity. */
@Service
@RequiredArgsConstructor
public class SeedlotOrchardService {

  private final SeedlotOrchardRepository seedlotOrchardRepository;

  private final LoggedUserService loggedUserService;

  /**
   * Saves all {link @SeedlotOrchard} from the Seedlot Form Registration step 4.
   *
   * @param seedlot The {@link Seedlot} related
   * @param formStep4 The {@link SeedlotFormOrchardDto} to be saved
   */
  public void saveSeedlotFormStep4(
      Seedlot seedlot, SeedlotFormOrchardDto formStep4, boolean canDelete) {
    SparLog.info("Saving Seedlot Form Step 4-Orchard for seedlot number {}", seedlot.getId());

    seedlot.setFemaleGameticContributionMethod(formStep4.femaleGameticMthdCode());
    seedlot.setMaleGameticContributionMethod(formStep4.maleGameticMthdCode());
    seedlot.setProducedThroughControlledCross(formStep4.controlledCrossInd());
    seedlot.setProducedWithBiotechnologicalProcesses(formStep4.biotechProcessesInd());
    seedlot.setPollenContaminationPresentInOrchard(formStep4.pollenContaminationInd());
    seedlot.setPollenContaminationPercentage(formStep4.pollenContaminationPct());
    if (!ValueUtil.isValueEqual(
        formStep4.contaminantPollenBv(), seedlot.getPollenContaminantBreedingValue())) {
      seedlot.setPollenContaminantBreedingValue(formStep4.contaminantPollenBv());
    }
    seedlot.setPollenContaminationMethodCode(formStep4.pollenContaminationMthdCode());

    SparLog.info(
        "Received primary orchard id {} for seedlot number {}",
        formStep4.primaryOrchardId(),
        seedlot.getId());

    if (formStep4.secondaryOrchardId() != null) {
      SparLog.info(
          "Received secondary orchard id {} for seedlot number {}",
          formStep4.secondaryOrchardId(),
          seedlot.getId());
    }
    List<SeedlotOrchard> seedlotOrchards = getAllSeedlotOrchardBySeedlotNumber(seedlot.getId());

    boolean allEqual = areExistingEqualsNewOnes(seedlotOrchards, formStep4);
    if (allEqual) {
      SparLog.info("Do not need to touch seedlot orchards, they are the same");
      return;
    }

    if (!seedlotOrchards.isEmpty() && canDelete) {
      SparLog.info(
          "Deleting {} previous records on the SeedlotOrchard table for seedlot number {}",
          seedlotOrchards.size(),
          seedlot.getId());

      seedlotOrchardRepository.deleteAllBySeedlot_id(seedlot.getId());
      seedlotOrchardRepository.flush();
    } else if (!seedlotOrchards.isEmpty() && !canDelete) {
      SparLog.info("Update seedlot {} orchard data failed due to conflict.", seedlot.getId());
      throw new SeedlotConflictDataException(seedlot.getId());
    }

    saveSeedlotOrchards(seedlot, formStep4.primaryOrchardId(), formStep4.secondaryOrchardId());
  }

  private boolean areExistingEqualsNewOnes(
      List<SeedlotOrchard> seedlotOrchards, SeedlotFormOrchardDto formStep4) {
    // Primary
    Optional<SeedlotOrchard> primaryOpt =
        seedlotOrchards.stream().filter(SeedlotOrchard::getIsPrimary).findFirst();

    if (primaryOpt.isEmpty()) {
      return false;
    }

    boolean primaryEqual = ValueUtil.isValueEqual(primaryOpt.get(), formStep4.primaryOrchardId());

    // Secondary
    Optional<SeedlotOrchard> secondaryOpt =
        seedlotOrchards.stream().filter(so -> !so.getIsPrimary()).findFirst();

    if (secondaryOpt.isEmpty()) {
      return primaryEqual;
    }

    boolean secondaryEqual =
        ValueUtil.isValueEqual(secondaryOpt.get(), formStep4.secondaryOrchardId());
    return secondaryEqual && primaryEqual;
  }

  private void saveSeedlotOrchards(
      Seedlot seedlot, String primaryOrchardId, String secondaryOrchardId) {

    List<SeedlotOrchard> seedlotsToSaveList = new ArrayList<>();

    SeedlotOrchard primary = new SeedlotOrchard(seedlot, true, primaryOrchardId);
    primary.setAuditInformation(loggedUserService.createAuditCurrentUser());
    seedlotsToSaveList.add(primary);
    SparLog.info(
        "Primary orchard id {} to be saved for Seedlot number {}",
        primaryOrchardId,
        seedlot.getId());

    if (secondaryOrchardId != null) {
      SeedlotOrchard secondary = new SeedlotOrchard(seedlot, false, secondaryOrchardId);
      secondary.setAuditInformation(loggedUserService.createAuditCurrentUser());
      seedlotsToSaveList.add(secondary);
      SparLog.info(
          "Secondary orchard id {} to be saved for Seedlot number {}",
          secondaryOrchardId,
          seedlot.getId());
    }

    seedlotOrchardRepository.saveAll(seedlotsToSaveList);
  }

  /**
   * Get all {@link SeedlotOrchard} given a {@link Seedlot} id (seedlot number).
   *
   * @param seedlotNumber the seedlot id
   * @return A List of SeedlotOrchard containing the found records or an empty list.
   */
  public List<SeedlotOrchard> getAllSeedlotOrchardBySeedlotNumber(String seedlotNumber) {
    return seedlotOrchardRepository.findAllBySeedlot_id(seedlotNumber);
  }

  /**
   * Get the primary {@link SeedlotOrchard} given a {@link Seedlot} id (seedlot number).
   *
   * @param seedlotNumber the seedlot id
   * @return A List of SeedlotOrchard containing the found records or an empty list.
   */
  public Optional<SeedlotOrchard> getPrimarySeedlotOrchard(String seedlotNumber) {
    return seedlotOrchardRepository.findBySeedlot_idAndIsPrimaryTrue(seedlotNumber);
  }
}
