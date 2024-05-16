package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOrchardDto;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOrchard;
import ca.bc.gov.backendstartapi.exception.SeedlotConflictDataException;
import ca.bc.gov.backendstartapi.repository.SeedlotOrchardRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.List;
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
    seedlot.setPollenContaminantBreedingValue(formStep4.contaminantPollenBv());
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

    if (!seedlotOrchards.isEmpty() && canDelete) {
      SparLog.info(
          "Deleting {} previous records on the SeedlotOrchard table for seedlot number {}",
          seedlotOrchards.size(),
          seedlot.getId());

      seedlotOrchardRepository.deleteAllBySeedlot_id(seedlot.getId());
    } else if (!seedlotOrchards.isEmpty() && !canDelete) {
      SparLog.info("Update seedlot {} orchard data failed due to conflict.", seedlot.getId());
      throw new SeedlotConflictDataException(seedlot.getId());
    }

    saveSeedlotOrchards(seedlot, formStep4.primaryOrchardId(), formStep4.secondaryOrchardId());
  }

  private void saveSeedlotOrchards(
      Seedlot seedlot, String primaryOrchardId, String secondaryOrchardId) {

    SeedlotOrchard primary = new SeedlotOrchard(seedlot, true, primaryOrchardId);
    primary.setAuditInformation(loggedUserService.createAuditCurrentUser());
    seedlotOrchardRepository.save(primary);
    SparLog.info(
        "Primary orchard id {} inserted on Seedlot_Orchard table for seedlot number {}",
        primaryOrchardId,
        seedlot.getId());

    if (secondaryOrchardId != null) {
      SeedlotOrchard secondary = new SeedlotOrchard(seedlot, false, secondaryOrchardId);
      secondary.setAuditInformation(loggedUserService.createAuditCurrentUser());
      seedlotOrchardRepository.save(secondary);
      SparLog.info(
          "Secondary orchard id {} inserted on Seedlot_Orchard table for seedlot number {}",
          secondaryOrchardId,
          seedlot.getId());
    }
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
}
