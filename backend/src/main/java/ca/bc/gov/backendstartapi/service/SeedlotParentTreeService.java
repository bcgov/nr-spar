package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeGeneticQuality;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeSmpMix;
import ca.bc.gov.backendstartapi.entity.SmpMix;
import ca.bc.gov.backendstartapi.entity.SmpMixGeneticQuality;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeGeneticQualityId;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeId;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeSmpMixId;
import ca.bc.gov.backendstartapi.entity.idclass.SmpMixGeneticQualityId;
import ca.bc.gov.backendstartapi.entity.idclass.SmpMixId;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeGeneticQualityRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeSmpMixRepository;
import ca.bc.gov.backendstartapi.repository.SmpMixGeneticQualityRepository;
import ca.bc.gov.backendstartapi.repository.SmpMixRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/** This class holds methods for handling the {@link SeedlotParentTree} entity. */
@Slf4j
@Service
@RequiredArgsConstructor
public class SeedlotParentTreeService {

  private final SeedlotParentTreeRepository seedlotParentTreeRepository;

  private final SeedlotParentTreeGeneticQualityRepository seedlotParentTreeGeneticQualityRepository;

  private final SeedlotParentTreeSmpMixRepository seedlotParentTreeSmpMixRepository;

  private final SmpMixGeneticQualityRepository smpMixGeneticQualityRepository;

  private final SmpMixRepository smpMixRepository;

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
  public List<SeedlotParentTree> saveSeedlotFormStep5(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {
    log.info("Saving SeedlotParentTree for seedlot number {}", seedlot.getId());

    List<SeedlotParentTreeGeneticQuality> sptgqList =
        seedlotParentTreeGeneticQualityRepository.findAllBySeedlotParentTree_Seedlot_id(
            seedlot.getId());

    // Delete Foreign Keys Dependencies in SeedlotParentTreeGeneticQuality
    if (!sptgqList.isEmpty()) {
      log.info(
          "Deleting {} previous records on the SeedlotParentTreeGeneticQuality table for seedlot"
              + " number {}",
          sptgqList.size(),
          seedlot.getId());

      List<SeedlotParentTreeGeneticQualityId> existingSeedlotPtGenQltyIdList =
          sptgqList.stream().map(x -> x.getId()).collect(Collectors.toList());

      seedlotParentTreeGeneticQualityRepository.deleteAllById(
          existingSeedlotPtGenQltyIdList);
    }

    // Delete Foreign Keys Dependencies in SmpMixGeneticQuality
    List<SmpMixGeneticQuality> smpMixGenQltyList =
        smpMixGeneticQualityRepository.findAllBySmpMix_Seedlot_id(seedlot.getId());

    if (!smpMixGenQltyList.isEmpty()) {
      log.info(
          "Deleting {} previous records on the SmpMixGeneticQuality table for seedlot number {}",
          smpMixGenQltyList.size(),
          seedlot.getId());

      List<SmpMixGeneticQualityId> existingSmpMixGenQltyIdList =
          smpMixGenQltyList.stream().map(x -> x.getId()).collect(Collectors.toList());

      smpMixGeneticQualityRepository.deleteAllById(existingSmpMixGenQltyIdList);
    }

    // Delete Foreign Keys Dependencies in SmpMix
    List<SmpMix> smpMixs = smpMixRepository.findAllBySeedlot_id(seedlot.getId());

    if (!smpMixs.isEmpty()) {
      log.info(
          "Deleting {} previous records on the SmpMix table for seedlot number {}",
          smpMixs.size(),
          seedlot.getId());

      List<Integer> existingParentTreeIds =
          smpMixs.stream().map(SmpMix::getParentTreeId).collect(Collectors.toList());

      List<SmpMixId> smpMixIdsToRemove = new ArrayList<>();
      for (Integer parentTreeId : existingParentTreeIds) {
        SmpMixId smpMixId = new SmpMixId(seedlot.getId(), parentTreeId);
        smpMixIdsToRemove.add(smpMixId);
      }

      smpMixRepository.deleteAllById(smpMixIdsToRemove);
    }

    // Delete Foreign Keys Dependencies in SeedlotParentTreeSmpMix
    List<SeedlotParentTreeSmpMix> sptsmList =
        seedlotParentTreeSmpMixRepository.findAllBySeedlotParentTree_Seedlot_id(seedlot.getId());

    if (!sptsmList.isEmpty()) {
      log.info(
          "Deleting {} previous records on the SeedlotParentTreeSmpMix table for seedlot number {}",
          sptsmList.size(),
          seedlot.getId());

      List<SeedlotParentTreeSmpMixId> sptsmExistingList =
          sptsmList.stream().map(x -> x.getId()).collect(Collectors.toList());

      seedlotParentTreeSmpMixRepository.deleteAllById(sptsmExistingList);
    }

    List<SeedlotParentTree> sptList =
        seedlotParentTreeRepository.findAllBySeedlot_id(seedlot.getId());

    if (!sptList.isEmpty()) {
      log.info(
          "Deleting {} previous records on the SeedlotParentTree table for seedlot number {}",
          sptList.size(),
          seedlot.getId());

      List<Integer> sptExistingList =
          new ArrayList<>(sptList.stream().map(e -> e.getParentTreeId()).toList());

      List<SeedlotParentTreeId> idsToDelete = new ArrayList<>();
      for (Integer parentTreeId : sptExistingList) {
        idsToDelete.add(new SeedlotParentTreeId(seedlot.getId(), parentTreeId));
      }

      seedlotParentTreeRepository.deleteAllById(idsToDelete);
    }

    return addSeedlotParentTree(seedlot, seedlotFormParentTreeDtoList);
  }

  private List<SeedlotParentTree> addSeedlotParentTree(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotPtDtoList) {
    if (seedlotPtDtoList.isEmpty()) {
      log.info(
          "No new records to be inserted on the SeedlotParentTree table for seedlot number {}",
          seedlot.getId());
      return List.of();
    }

    log.info(
        "{} record(s) to be inserted on the SeedlotParentTree table for seedlot number {}",
        seedlotPtDtoList.size(),
        seedlot.getId());

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

    log.info(
        "3. seedlotParentTreeRepository size: {}", seedlotParentTreeRepository.findAll().size());

    return seedlotParentTreeRepository.saveAll(seedlotPtListToInsert);
  }
}
