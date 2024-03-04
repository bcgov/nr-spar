package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dao.GeneticWorthEntityDao;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.entity.SmpMix;
import ca.bc.gov.backendstartapi.entity.SmpMixGeneticQuality;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.SmpMixNotFoundException;
import ca.bc.gov.backendstartapi.repository.SmpMixGeneticQualityRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** This class holds methods for handling the {@link SmpMixGeneticQuality} entity. */
@Service
@RequiredArgsConstructor
public class SmpMixGeneticQualityService {

  private final SmpMixGeneticQualityRepository smpMixGeneticQualityRepository;

  private final SmpMixService smpMixService;

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
    SparLog.info("Saving SmpMixGeneticQuality for seedlot number {}", seedlot.getId());

    addSmpMixGenQlty(seedlot, seedlotFormParentTreeDtoList);
  }

  // Form Step 5 SMP Mix Genetic Quality related
  private void addSmpMixGenQlty(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {
    if (seedlotFormParentTreeDtoList.isEmpty()) {
      SparLog.info(
          "No new records to be inserted on the SmpMixGeneticQuality table for seedlot number {}",
          seedlot.getId());
      return;
    }

    SparLog.info(
        "{} record(s) to be inserted on the SmpMixGeneticQuality table for seedlot number {}",
        seedlotFormParentTreeDtoList.size(),
        seedlot.getId());

    Map<Integer, SmpMix> smMap =
        smpMixService.getAllBySeedlotNumber(seedlot.getId()).stream()
            .collect(Collectors.toMap(SmpMix::getParentTreeId, Function.identity()));

    List<SmpMixGeneticQuality> smpMixGenQltys = new ArrayList<>();
    for (SeedlotFormParentTreeSmpDto seedlotPtFormDto : seedlotFormParentTreeDtoList) {
      for (ParentTreeGeneticQualityDto seedlotGenQltyDto :
          seedlotPtFormDto.parentTreeGeneticQualities()) {
        SmpMix smpMix = smMap.get(seedlotPtFormDto.parentTreeId());
        if (Objects.isNull(smpMix)) {
          throw new SmpMixNotFoundException();
        }

        GeneticWorthEntity gwe =
            geneticWorthEntityDao
                .getGeneticWorthEntity(seedlotGenQltyDto.geneticWorthCode())
                .orElseThrow();

        SmpMixGeneticQuality smpMixGeneticQuality =
            new SmpMixGeneticQuality(
                smpMix,
                seedlotGenQltyDto.geneticTypeCode(),
                gwe,
                seedlotGenQltyDto.geneticQualityValue(),
                Boolean.FALSE,
                loggedUserService.createAuditCurrentUser(),
                0);

        smpMixGenQltys.add(smpMixGeneticQuality);
      }
    }

    smpMixGeneticQualityRepository.saveAll(smpMixGenQltys);
  }

  /**
   * Gets all SmpMixGeneticQuality given a {@link Seedlot} id number.
   *
   * @param seedlotNumber The Seedlot id.
   * @return A List of {@link SmpMixGeneticQuality}
   */
  public List<SmpMixGeneticQuality> getAllBySeedlotNumber(String seedlotNumber) {
    return smpMixGeneticQualityRepository.findAllBySmpMix_Seedlot_id(seedlotNumber);
  }
}
