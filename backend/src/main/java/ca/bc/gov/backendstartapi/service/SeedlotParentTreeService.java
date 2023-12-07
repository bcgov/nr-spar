package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeId;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeedlotParentTreeService {

  private final SeedlotParentTreeRepository seedlotParentTreeRepository;

  private final LoggedUserService loggedUserService;

  /**
   * Gets all SeedlotParentTree records given a Seedlot number.
   *
   * @param seedlotNumber The {@link Seedlot} id number
   * @return A list of {@link SeedlotParentTree}
   */
  public List<SeedlotParentTree> getAllSeedlotParentTree(String seedlotNumber) {
    log.info("Get All SeedlotPrentTree for seedlot number {}", seedlotNumber);
    return seedlotParentTreeRepository.findAllBySeedlot_id(seedlotNumber);
  }

  /**
   * Saves a SeedlotParentTree from the Seedlot Form Registration step 5.
   *
   * @param seedlot The {@link Seedlot} related
   * @param seedlotFormParentTreeDtoList A List of {@link SeedlotFormParentTreeSmpDto}
   */
  public void saveSeedlotFormStep5(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {
    log.info("Saving SeedlotParentTree for seedlot number {}", seedlot.getId());

    List<SeedlotParentTree> sptList =
        seedlotParentTreeRepository.findAllBySeedlot_id(seedlot.getId());

    if (!sptList.isEmpty()) {
      List<Integer> sptExistingList =
          new ArrayList<>(sptList.stream().map(e -> e.getParentTreeId()).toList());

      List<SeedlotFormParentTreeSmpDto> sptInsertList = new ArrayList<>();

      for (SeedlotFormParentTreeSmpDto formParentTree : seedlotFormParentTreeDtoList) {
        if (sptExistingList.contains(formParentTree.parentTreeId())) {
          // remove form the list, the ones that last will be removed
          sptExistingList.remove(formParentTree.parentTreeId());
        } else {
          sptInsertList.add(formParentTree);
        }
      }

      // Remove possible leftovers
      log.info(
          "{} SeedlotParentTrees record(s) to remove for seedlot number {}",
          sptExistingList.size(),
          seedlot.getId());
      List<SeedlotParentTreeId> sptiList = new ArrayList<>();
      for (Integer parentTreeId : sptExistingList) {
        sptiList.add(new SeedlotParentTreeId(seedlot.getId(), parentTreeId));
      }
      if (!sptiList.isEmpty()) {
        seedlotParentTreeRepository.deleteAllByIdInBatch(sptiList);
        seedlotParentTreeRepository.flush();
      }

      // Insert new ones
      addSeedlotParentTree(seedlot, sptInsertList);

      return;
    }

    log.info("No previous SeedlotParentTree records for seedlot number {}", seedlot.getId());

    addSeedlotParentTree(seedlot, seedlotFormParentTreeDtoList);
  }

  private void addSeedlotParentTree(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotPtDtoList) {
    List<SeedlotParentTree> seedlotPtListToInsert = new ArrayList<>();

    for (SeedlotFormParentTreeSmpDto seedlotPtDto : seedlotPtDtoList) {
      SeedlotParentTree seedlotParentTree =
          new SeedlotParentTree(
              seedlot,
              seedlotPtDto.parentTreeId(),
              seedlotPtDto.parentTreeNumber(),
              seedlotPtDto.coneCount(),
              seedlotPtDto.pollenPount(),
              loggedUserService.createAuditCurrentUser());
      seedlotParentTree.setSmpSuccessPercentage(seedlotPtDto.smpSuccessPct());
      seedlotParentTree.setNonOrchardPollenContaminationCount(
          seedlotPtDto.nonOrchardPollenContamPct());
      seedlotPtListToInsert.add(seedlotParentTree);
    }

    seedlotParentTreeRepository.saveAllAndFlush(seedlotPtListToInsert);
  }
}
