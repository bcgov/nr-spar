package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dao.GeneticWorthEntityDao;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.SameSpeciesTreeDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeSmpMix;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.SeedlotParentTreeNotFoundException;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeSmpMixRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** This class holds methods for handling the {@link SeedlotParentTreeSmpMix} entity. */
@Service
@RequiredArgsConstructor
public class SeedlotParentTreeSmpMixService {

  private final SeedlotParentTreeSmpMixRepository seedlotParentTreeSmpMixRepository;

  private final SeedlotParentTreeService seedlotParentTreeService;

  private final OrchardService orchardService;

  private final GeneticWorthEntityDao geneticWorthEntityDao;

  private final LoggedUserService loggedUserService;

  /**
   * Saves a SeedlotParentTree from the Seedlot Form Registration step 5.
   *
   * @param seedlot The {@link Seedlot} related
   * @param seedlotFormParentTreeDtoList A List of {@link SeedlotFormParentTreeSmpDto}
   */
  public List<SeedlotParentTreeSmpMix> saveSeedlotFormStep5(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {
    SparLog.info("Saving SeedlotParentTreeSmpMix for seedlot number {}", seedlot.getId());

    return addSeedlotPtSmpMix(seedlot, seedlotFormParentTreeDtoList);
  }

  // Form Step 5 Seedlot Parent Tree SMP Fix related
  private List<SeedlotParentTreeSmpMix> addSeedlotPtSmpMix(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {
    if (seedlotFormParentTreeDtoList.isEmpty()) {
      SparLog.info(
          "No new records to be inserted on the SeedlotParentTreeSmpMix table for seedlot number"
              + " {}",
          seedlot.getId());
      return List.of();
    }

    SparLog.info(
        "{} record(s) to be inserted on the SeedlotParentTreeSmpMix table for seedlot number {}",
        seedlotFormParentTreeDtoList.size(),
        seedlot.getId());

    Map<Integer, SeedlotParentTree> sptMap =
        seedlotParentTreeService.getAllSeedlotParentTree(seedlot.getId()).stream()
            .collect(Collectors.toMap(SeedlotParentTree::getParentTreeId, Function.identity()));

    List<SameSpeciesTreeDto> allPtData =
        orchardService.findParentTreesByVegCode(seedlot.getVegetationCode());

    List<SeedlotParentTreeSmpMix> sptsmToInsertList = new ArrayList<>();

    for (SeedlotFormParentTreeSmpDto seedlotPtFormDto : seedlotFormParentTreeDtoList) {

      for (ParentTreeGeneticQualityDto seedlotGenQltyDto :
          seedlotPtFormDto.parentTreeGeneticQualities()) {

        GeneticWorthEntity gwe =
            geneticWorthEntityDao
                .getGeneticWorthEntity(seedlotGenQltyDto.geneticWorthCode())
                .orElseThrow();

        SeedlotParentTree sptEntity = sptMap.get(seedlotPtFormDto.parentTreeId());

        List<SameSpeciesTreeDto> ptFilteredList = allPtData.stream()
            .filter(parentTree -> {
              if (parentTree.getParentTreeNumber().equals(seedlotPtFormDto.parentTreeNumber())) {
                return true;
              }
              return false;
            })
            .collect(Collectors.toList());

        if (!Objects.isNull(sptEntity)) {
          SeedlotParentTreeSmpMix sptsmEntity =
              new SeedlotParentTreeSmpMix(
                  sptEntity,
                  seedlotGenQltyDto.geneticTypeCode(),
                  gwe,
                  seedlotGenQltyDto.geneticQualityValue(),
                  loggedUserService.createAuditCurrentUser());
          sptsmToInsertList.add(sptsmEntity);
        } else if (!ptFilteredList.isEmpty()) {
          // This is the case where the parent tree is outside of the selected
          // orchard, so we need to create a new seedlot parent tree before
          // creating the seedlot parent tree sp mix
          SeedlotParentTree outOfOrchardParentTree = new SeedlotParentTree(
            seedlot,
            seedlotPtFormDto.parentTreeId(),
            seedlotPtFormDto.parentTreeNumber(),
            seedlotPtFormDto.coneCount(),
            seedlotPtFormDto.pollenPount(),
            loggedUserService.createAuditCurrentUser());

          SeedlotParentTreeSmpMix sptsmEntity =
            new SeedlotParentTreeSmpMix(
                outOfOrchardParentTree,
                seedlotGenQltyDto.geneticTypeCode(),
                gwe,
                seedlotGenQltyDto.geneticQualityValue(),
                loggedUserService.createAuditCurrentUser());

          sptsmToInsertList.add(sptsmEntity);
        } else {
          throw new SeedlotParentTreeNotFoundException();
        }
      }
    }

    return seedlotParentTreeSmpMixRepository.saveAll(sptsmToInsertList);
  }
}
