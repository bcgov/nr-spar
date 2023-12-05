package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dao.SeedlotEntityDao;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOrchardDto;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOrchard;
import ca.bc.gov.backendstartapi.entity.seedlot.idclass.SeedlotOrchardId;
import ca.bc.gov.backendstartapi.exception.NoPrimaryOrchardException;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.repository.SeedlotOrchardRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
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

  private final SeedlotEntityDao seedlotEntityDao;

  public void saveSeedlotOrchards(String seedlotNumber, SeedlotFormOrchardDto formStep4) {
    int orchardsLen = formStep4.orchardsId().size();
    log.info(
        "Saving {} SeedlotOrchard record(s) for seedlot number {}", orchardsLen, seedlotNumber);

    String primaryOrchardId =
        formStep4.primaryOrchardId().isBlank()
            ? formStep4.orchardsId().get(0)
            : formStep4.primaryOrchardId();

    if (primaryOrchardId.isBlank()) {
      throw new NoPrimaryOrchardException();
    }

    List<SeedlotOrchard> seedlotOrchards =
        seedlotOrchardRepository.findAllBySeedlot_id(seedlotNumber);

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
          seedlotNumber);
      List<SeedlotOrchardId> soiList = List.of();
      existingSeedlotOrchardList.forEach(
          orchardId -> {
            soiList.add(new SeedlotOrchardId(seedlotNumber, orchardId));
          });

      if (!soiList.isEmpty()) {
        seedlotOrchardRepository.deleteAllById(soiList);
      }

      // Insert new ones
      saveSeedlotOrchards(seedlotNumber, seedlotOrchardIdToInsert, primaryOrchardId);

      return;
    }

    log.info("No previous records on SeedlotOrchard table for seedlot number {}", seedlotNumber);

    saveSeedlotOrchards(seedlotNumber, formStep4.orchardsId(), primaryOrchardId);
  }

  private void saveSeedlotOrchards(
      String seedlotNumber, List<String> orchardIdList, String primaryId) {
    Seedlot seedlot =
        seedlotEntityDao.getSeedlot(seedlotNumber).orElseThrow(SeedlotNotFoundException::new);

    List<SeedlotOrchard> seedlotOrchards = List.of();
    for (String orchardId : orchardIdList) {
      SeedlotOrchard seedlotOrchard = new SeedlotOrchard(seedlot, orchardId);
      seedlotOrchard.setPrimary(orchardId.equals(primaryId));
      seedlotOrchard.setAuditInformation(loggedUserService.createAuditCurrentUser());
      seedlotOrchards.add(seedlotOrchard);
    }

    seedlotOrchardRepository.saveAll(seedlotOrchards);
  }
}
