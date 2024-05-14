package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dao.GeneticWorthEntityDao;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeGeneticQuality;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeId;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.SeedlotParentTreeNotFoundException;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeGeneticQualityRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** This class holds methods for handling the {@link SeedlotParentTreeGeneticQuality} entity. */
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
    SparLog.info("Saving SeedlotParentTreeGeneticQuality for seedlot number {}", seedlot.getId());

    addSeedlotParentTreeGenQlty(seedlot, seedlotFormParentTreeDtoList);
  }

  private void addSeedlotParentTreeGenQlty(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotPtGenQltyToInsert) {
    if (seedlotPtGenQltyToInsert.isEmpty()) {
      SparLog.info(
          "No new records to be inserted on the SeedlotParentTreeGeneticQuality table for seedlot"
              + " number {}",
          seedlot.getId());
      return;
    }

    SparLog.info(
        "{} record(s) to be inserted on the SeedlotParentTreeGeneticQuality table for seedlot"
            + " number {}",
        seedlotPtGenQltyToInsert.size(),
        seedlot.getId());

    Map<SeedlotParentTreeId, SeedlotParentTree> sptMap =
        seedlotParentTreeService.getAllSeedlotParentTree(seedlot.getId()).stream()
            .collect(Collectors.toMap(SeedlotParentTree::getId, Function.identity()));

    List<SeedlotParentTreeGeneticQuality> seedlotPtToInsert = new ArrayList<>();
    for (SeedlotFormParentTreeSmpDto seedlotPtFormDto : seedlotPtGenQltyToInsert) {
      SeedlotParentTreeId sptId =
          new SeedlotParentTreeId(seedlot.getId(), seedlotPtFormDto.parentTreeId());
      SeedlotParentTree spt = sptMap.get(sptId);
      if (Objects.isNull(spt)) {
        throw new SeedlotParentTreeNotFoundException();
      }

      for (ParentTreeGeneticQualityDto seedlotGenQltyDto :
          seedlotPtFormDto.parentTreeGeneticQualities()) {

        GeneticWorthEntity genWorthEnt =
            geneticWorthEntityDao
                .getGeneticWorthEntity(seedlotGenQltyDto.geneticWorthCode())
                .orElseThrow();

        SeedlotParentTreeGeneticQuality sptgq =
            new SeedlotParentTreeGeneticQuality(
                spt,
                seedlotGenQltyDto.geneticTypeCode(),
                genWorthEnt,
                seedlotGenQltyDto.geneticQualityValue(),
                loggedUserService.createAuditCurrentUser());

        sptgq.setQualityValueEstimated(Boolean.FALSE);
        sptgq.setParentTreeUntested(Boolean.FALSE);

        seedlotPtToInsert.add(sptgq);
      }
    }

    seedlotParentTreeGeneticQualityRepository.saveAll(seedlotPtToInsert);
  }

  /**
   * Gets all SeedlotParentTreeGeneticQuality given a {@link Seedlot} id number.
   *
   * @param seedlotNumber The Seedlot id.
   * @return A List of {@link SeedlotParentTreeGeneticQuality}
   */
  public List<SeedlotParentTreeGeneticQuality> getAllBySeedlotNumber(String seedlotNumber) {
    return seedlotParentTreeGeneticQualityRepository
        .findAllBySeedlotParentTree_Seedlot_id(seedlotNumber);
  }
}
