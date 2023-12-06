package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dao.GeneticWorthEntityDao;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.entity.SmpMix;
import ca.bc.gov.backendstartapi.entity.SmpMixGeneticQuality;
import ca.bc.gov.backendstartapi.entity.idclass.SmpMixGeneticQualityId;
import ca.bc.gov.backendstartapi.entity.idclass.SmpMixId;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.repository.SmpMixGeneticQualityRepository;
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
    log.info("Saving SmpMixGeneticQuality for seedlot number {}", seedlot.getId());
    List<SmpMixGeneticQuality> smpMixGenQltyList =
        smpMixGeneticQualityRepository.findAllBySmpMix_Seedlot_id(seedlot.getId());

    if (!smpMixGenQltyList.isEmpty()) {
      List<SmpMixGeneticQualityId> existingSmpMixGenQltyIdList =
          smpMixGenQltyList.stream().map(x -> x.getId()).collect(Collectors.toList());

      List<SeedlotFormParentTreeSmpDto> smpMixGenQltyToInsert = new ArrayList<>();

      for (SeedlotFormParentTreeSmpDto seedlotPtFormDto : seedlotFormParentTreeDtoList) {
        for (ParentTreeGeneticQualityDto seedlotGenQltyDto :
            seedlotPtFormDto.parentTreeGeneticQualities()) {
          SmpMixId mixId = new SmpMixId(seedlot.getId(), seedlotPtFormDto.parentTreeId());
          SmpMixGeneticQualityId smpMixGenId =
              new SmpMixGeneticQualityId(
                  mixId, seedlotGenQltyDto.geneticTypeCode(), seedlotGenQltyDto.geneticWorthCode());

          if (existingSmpMixGenQltyIdList.contains(smpMixGenId)) {
            // remove form the list, the one that last will be removed
            existingSmpMixGenQltyIdList.remove(smpMixGenId);
          } else {
            smpMixGenQltyToInsert.add(seedlotPtFormDto);
          }
        }
      }

      // Remove possible leftovers
      log.info(
          "{} SmpMixGeneticQuality record(s) to remove for seedlot number {}",
          existingSmpMixGenQltyIdList.size());
      if (!existingSmpMixGenQltyIdList.isEmpty()) {
        smpMixGeneticQualityRepository.deleteAllByIdInBatch(existingSmpMixGenQltyIdList);
      }

      // Insert new ones
      addSmpMixGenQlty(seedlot, smpMixGenQltyToInsert);

      return;
    }

    log.info("No previous SmpMixGeneticQuality records for seedlot number {}", seedlot.getId());

    addSmpMixGenQlty(seedlot, seedlotFormParentTreeDtoList);
  }

  // Form Step 5 SMP Mix Genetic Quality related
  private void addSmpMixGenQlty(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {
    Map<Integer, SmpMix> smMap =
        smpMixService.getAllBySeedlotNumber(seedlot.getId()).stream()
            .collect(Collectors.toMap(SmpMix::getParentTreeId, Function.identity()));

    List<SmpMixGeneticQuality> smpMixGenQltys = new ArrayList<>();
    for (SeedlotFormParentTreeSmpDto seedlotPtFormDto : seedlotFormParentTreeDtoList) {
      for (ParentTreeGeneticQualityDto seedlotGenQltyDto :
          seedlotPtFormDto.parentTreeGeneticQualities()) {
        SmpMix smpMix = smMap.get(seedlotPtFormDto.parentTreeId());
        if (Objects.isNull(smpMix)) {
          // throw error smp mix not found!
        }

        GeneticWorthEntity gEntity =
            geneticWorthEntityDao
                .getGeneticWorthEntity(seedlotGenQltyDto.geneticWorthCode())
                .orElseThrow();

        SmpMixGeneticQuality smpMixGeneticQuality =
            new SmpMixGeneticQuality(
                smpMix,
                seedlotGenQltyDto.geneticTypeCode(),
                gEntity,
                seedlotGenQltyDto.geneticQualityValue(),
                Boolean.FALSE,
                loggedUserService.createAuditCurrentUser(),
                0);

        smpMixGenQltys.add(smpMixGeneticQuality);
      }
    }

    smpMixGeneticQualityRepository.saveAll(smpMixGenQltys);
  }
}
