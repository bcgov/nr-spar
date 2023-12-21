package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.SeedlotFormOrchardDto;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOrchard;
import ca.bc.gov.backendstartapi.entity.seedlot.idclass.SeedlotOrchardId;
import ca.bc.gov.backendstartapi.repository.SeedlotOrchardRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/** This class holds methods for handling the {@link SeedlotOrchard} entity. */
@Slf4j
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
  public void saveSeedlotFormStep4(Seedlot seedlot, SeedlotFormOrchardDto formStep4) {
    log.info("Saving Seedlot Form Step 4-Orchard for seedlot number {}", seedlot.getId());

    seedlot.setFemaleGameticContributionMethod(formStep4.femaleGameticMthdCode());
    seedlot.setMaleGameticContributionMethod(formStep4.maleGameticMthdCode());
    seedlot.setProducedThroughControlledCross(formStep4.controlledCrossInd());
    seedlot.setProducedWithBiotechnologicalProcesses(formStep4.biotechProcessesInd());
    seedlot.setPollenContaminationPresentInOrchard(formStep4.pollenContaminationInd());
    seedlot.setPollenContaminationPercentage(formStep4.pollenContaminationPct());
    seedlot.setPollenContaminantBreedingValue(formStep4.contaminantPollenBv());
    seedlot.setPollenContaminationMethodCode(formStep4.pollenContaminationMthdCode());

    log.info(
        "Received {} SeedlotOrchard record(s) for seedlot number {}",
        formStep4.orchardsId().size(),
        seedlot.getId());

    List<SeedlotOrchard> seedlotOrchards =
        seedlotOrchardRepository.findAllBySeedlot_id(seedlot.getId());

    if (!seedlotOrchards.isEmpty()) {
      log.info(
          "Deleting {} previous records on the SeedlotOrchard table for seedlot number {}",
          seedlotOrchards.size(),
          seedlot.getId());

      List<String> existingSeedlotOrchardList =
          new ArrayList<>(seedlotOrchards.stream().map(SeedlotOrchard::getOrchard).toList());

      List<SeedlotOrchardId> idsToDelete = new ArrayList<>();
      existingSeedlotOrchardList.forEach(
          orchardId -> {
            idsToDelete.add(new SeedlotOrchardId(seedlot.getId(), orchardId));
          });

      seedlotOrchardRepository.deleteAllById(idsToDelete);
    }

    saveSeedlotOrchards(seedlot, formStep4.orchardsId());
  }

  private void saveSeedlotOrchards(Seedlot seedlot, List<String> orchardIdList) {
    if (orchardIdList.isEmpty()) {
      log.info(
          "No new records to be inserted on the SeedlotOrchard table for seedlot number {}",
          seedlot.getId());
      return;
    }

    log.info(
        "{} record(s) to be inserted on the SeedlotOrchard table for seedlot number {}",
        orchardIdList.size(),
        seedlot.getId());

    List<SeedlotOrchard> seedlotOrchards = new ArrayList<>();
    for (String orchardId : orchardIdList) {
      SeedlotOrchard seedlotOrchard = new SeedlotOrchard(seedlot, orchardId);
      seedlotOrchard.setAuditInformation(loggedUserService.createAuditCurrentUser());
      seedlotOrchards.add(seedlotOrchard);
    }

    seedlotOrchardRepository.saveAll(seedlotOrchards);
  }
}
