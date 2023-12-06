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

@Slf4j
@Service
@RequiredArgsConstructor
public class SeedlotOrchardService {

  private final SeedlotOrchardRepository seedlotOrchardRepository;

  private final LoggedUserService loggedUserService;

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

    int orchardsLen = formStep4.orchardsId().size();
    log.info(
        "Saving {} SeedlotOrchard record(s) for seedlot number {}", orchardsLen, seedlot.getId());

    List<SeedlotOrchard> seedlotOrchards =
        seedlotOrchardRepository.findAllBySeedlot_id(seedlot.getId());

    if (!seedlotOrchards.isEmpty()) {
      List<String> existingSeedlotOrchardList =
          seedlotOrchards.stream().map(SeedlotOrchard::getOrchard).toList();

      List<String> seedlotOrchardIdToInsert = List.of();

      for (String formOrchardId : formStep4.orchardsId()) {
        if (existingSeedlotOrchardList.contains(formOrchardId)) {
          // remove form the list, the one that last will be removed
          existingSeedlotOrchardList.remove(formOrchardId);
        } else {
          seedlotOrchardIdToInsert.add(formOrchardId);
        }
      }

      // Remove possible leftovers
      log.info(
          "{} record(s) in the SeedlotOrchard table to remove for seedlot number {}",
          existingSeedlotOrchardList.size(),
          seedlot.getId());
      List<SeedlotOrchardId> soiList = List.of();
      existingSeedlotOrchardList.forEach(
          orchardId -> {
            soiList.add(new SeedlotOrchardId(seedlot.getId(), orchardId));
          });

      if (!soiList.isEmpty()) {
        seedlotOrchardRepository.deleteAllById(soiList);
      }

      // Insert new ones
      saveSeedlotOrchards(seedlot, seedlotOrchardIdToInsert);

      return;
    }

    log.info("No previous records on SeedlotOrchard table for seedlot number {}", seedlot.getId());

    saveSeedlotOrchards(seedlot, formStep4.orchardsId());
  }

  private void saveSeedlotOrchards(Seedlot seedlot, List<String> orchardIdList) {
    List<SeedlotOrchard> seedlotOrchards = new ArrayList<>();
    for (String orchardId : orchardIdList) {
      SeedlotOrchard seedlotOrchard = new SeedlotOrchard(seedlot, orchardId);
      seedlotOrchard.setAuditInformation(loggedUserService.createAuditCurrentUser());
      seedlotOrchards.add(seedlotOrchard);
    }

    seedlotOrchardRepository.saveAll(seedlotOrchards);
  }
}
