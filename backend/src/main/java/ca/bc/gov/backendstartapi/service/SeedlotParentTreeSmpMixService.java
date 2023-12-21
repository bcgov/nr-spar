package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dao.GeneticWorthEntityDao;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/** This class holds methods for handling the {@link SeedlotParentTreeSmpMix} entity. */
@Slf4j
@Service
@RequiredArgsConstructor
public class SeedlotParentTreeSmpMixService {

  private final SeedlotParentTreeSmpMixRepository seedlotParentTreeSmpMixRepository;

  private final SeedlotParentTreeService seedlotParentTreeService;

  private final GeneticWorthEntityDao geneticWorthEntityDao;

  private final LoggedUserService loggedUserService;

  /**
   * Saves a SeedlotParentTree from the Seedlot Form Registration step 5.
   *
   * @param seedlot The {@link Seedlot} related
   * @param seedlotFormParentTreeDtoList A List of {@link SeedlotFormParentTreeSmpDto}
   */
  public void saveSeedlotFormStep5(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {
    log.info("Saving SeedlotParentTreeSmpMix for seedlot number {}", seedlot.getId());

    addSeedlotPtSmpMix(seedlot, seedlotFormParentTreeDtoList);
  }

  // Form Step 5 Seedlot Parent Tree SMP Fix related
  private void addSeedlotPtSmpMix(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {
    if (seedlotFormParentTreeDtoList.isEmpty()) {
      log.info(
          "No new records to be inserted on the SeedlotParentTreeSmpMix table for seedlot number"
              + " {}",
          seedlot.getId());
      return;
    }

    log.info(
        "{} record(s) to be inserted on the SeedlotParentTreeSmpMix table for seedlot number {}",
        seedlotFormParentTreeDtoList.size(),
        seedlot.getId());

    Map<Integer, SeedlotParentTree> sptMap =
        seedlotParentTreeService.getAllSeedlotParentTree(seedlot.getId()).stream()
            .collect(Collectors.toMap(SeedlotParentTree::getParentTreeId, Function.identity()));

    List<SeedlotParentTreeSmpMix> sptsmToInsertList = new ArrayList<>();
    for (SeedlotFormParentTreeSmpDto seedlotPtFormDto : seedlotFormParentTreeDtoList) {
      for (ParentTreeGeneticQualityDto seedlotGenQltyDto :
          seedlotPtFormDto.parentTreeGeneticQualities()) {
        SeedlotParentTree sptEntity = sptMap.get(seedlotPtFormDto.parentTreeId());
        if (Objects.isNull(sptEntity)) {
          throw new SeedlotParentTreeNotFoundException();
        }

        GeneticWorthEntity gwe =
            geneticWorthEntityDao
                .getGeneticWorthEntity(seedlotGenQltyDto.geneticWorthCode())
                .orElseThrow();

        SeedlotParentTreeSmpMix sptsmEntity =
            new SeedlotParentTreeSmpMix(
                sptEntity,
                seedlotGenQltyDto.geneticTypeCode(),
                gwe,
                seedlotGenQltyDto.geneticQualityValue(),
                loggedUserService.createAuditCurrentUser());

        sptsmToInsertList.add(sptsmEntity);
      }
    }

    seedlotParentTreeSmpMixRepository.saveAll(sptsmToInsertList);
  }
}
