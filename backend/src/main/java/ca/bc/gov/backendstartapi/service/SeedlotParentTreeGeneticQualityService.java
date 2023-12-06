package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dao.GeneticWorthEntityDao;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeGeneticQuality;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeGeneticQualityId;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeId;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeGeneticQualityRepository;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class SeedlotParentTreeGeneticQualityService {

  private final SeedlotParentTreeGeneticQualityRepository seedlotParentTreeGeneticQualityRepository;

  private final LoggedUserService loggedUserService;

  private final SeedlotParentTreeService seedlotParentTreeService;

  private final GeneticWorthEntityDao geneticWorthEntityDao;

  /**
   * Saves a SeedlotParentTree from the Seedlot Form Registration step 5.
   *
   * @param seedlot The {@link Seedlot} related
   * @param seedlotFormParentTreeDtoList A List of {@link SeedlotFormParentTreeSmpDto}
   */
  public void saveSeedlotFormStep5(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {
    log.info("Saving SeedlotParentTreeGeneticQuality for seedlot number {}", seedlot.getId());

    List<SeedlotParentTreeGeneticQuality> sptgqList =
        seedlotParentTreeGeneticQualityRepository.findAllBySeedlotParentTree_Seedlot_id(
            seedlot.getId());

    if (!sptgqList.isEmpty()) {
      List<SeedlotParentTreeGeneticQualityId> existingSeedlotPtGenQltyIdList =
          sptgqList.stream().map(x -> x.getId()).collect(Collectors.toList());

      List<SeedlotFormParentTreeSmpDto> seedlotPtGenQltyToInsert = new ArrayList<>();

      for (SeedlotFormParentTreeSmpDto seedlotPtFormDto : seedlotFormParentTreeDtoList) {
        for (ParentTreeGeneticQualityDto seedlotGenQltyDto :
            seedlotPtFormDto.parentTreeGeneticQualities()) {
          SeedlotParentTreeId seedlotParentTreeId =
              new SeedlotParentTreeId(seedlot.getId(), seedlotPtFormDto.parentTreeId());

          SeedlotParentTreeGeneticQualityId seedlotPtGenQltyId =
              new SeedlotParentTreeGeneticQualityId(
                  seedlotParentTreeId,
                  seedlotGenQltyDto.geneticTypeCode(),
                  seedlotGenQltyDto.geneticWorthCode());

          if (existingSeedlotPtGenQltyIdList.contains(seedlotPtGenQltyId)) {
            // remove form the list, the one that last will be removed
            existingSeedlotPtGenQltyIdList.remove(seedlotPtGenQltyId);
          } else {
            seedlotPtGenQltyToInsert.add(seedlotPtFormDto);
          }
        }
      }

      // Remove possible leftovers
      log.info(
          "{} record(s) in the SeedlotParentTreeGeneticQuality table to remove for seedlot number"
              + " {}",
          existingSeedlotPtGenQltyIdList.size(),
          seedlot.getId());
      if (!existingSeedlotPtGenQltyIdList.isEmpty()) {
        seedlotParentTreeGeneticQualityRepository.deleteAllByIdInBatch(existingSeedlotPtGenQltyIdList);
        seedlotParentTreeGeneticQualityRepository.flush();
      }

      // Insert new ones
      addSeedlotParentTreeGenQlty(seedlot, seedlotPtGenQltyToInsert);

      return;
    }

    log.info(
        "No previous SeedlotParentTreeGeneticQuality records for seedlot number {}",
        seedlot.getId());

    addSeedlotParentTreeGenQlty(seedlot, seedlotFormParentTreeDtoList);
  }

  private void addSeedlotParentTreeGenQlty(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotPtGenQltyToInsert) {
    Map<SeedlotParentTreeId, SeedlotParentTree> sTreeMap =
        seedlotParentTreeService.getAllSeedlotParentTree(seedlot.getId()).stream()
            .collect(Collectors.toMap(SeedlotParentTree::getId, Function.identity()));

    List<SeedlotParentTreeGeneticQuality> seedlotPtToInsert = new ArrayList<>();
    for (SeedlotFormParentTreeSmpDto seedlotPtFormDto : seedlotPtGenQltyToInsert) {
      SeedlotParentTreeId sTreeId =
          new SeedlotParentTreeId(seedlot.getId(), seedlotPtFormDto.parentTreeId());
      SeedlotParentTree sTree = sTreeMap.get(sTreeId);
      if (Objects.isNull(sTree)) {
        // throw error = trying to fetch seedlot parent tree not stored
      }

      for (ParentTreeGeneticQualityDto seedlotGenQltyDto :
          seedlotPtFormDto.parentTreeGeneticQualities()) {

        GeneticWorthEntity genWorthEnt =
            geneticWorthEntityDao
                .getGeneticWorthEntity(seedlotGenQltyDto.geneticWorthCode())
                .orElseThrow();

        SeedlotParentTreeGeneticQuality sQuality =
            new SeedlotParentTreeGeneticQuality(
                sTree,
                seedlotGenQltyDto.geneticTypeCode(),
                genWorthEnt,
                seedlotGenQltyDto.geneticQualityValue(),
                loggedUserService.createAuditCurrentUser());

        sQuality.setQualityValueEstimated(Boolean.FALSE);
        sQuality.setParentTreeUntested(Boolean.FALSE);

        seedlotPtToInsert.add(sQuality);
      }
    }

    seedlotParentTreeGeneticQualityRepository.saveAllAndFlush(seedlotPtToInsert);
  }
}
