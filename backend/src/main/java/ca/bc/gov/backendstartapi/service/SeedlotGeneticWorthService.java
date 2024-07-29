package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dao.GeneticWorthEntityDao;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotGeneticWorth;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotGeneticWorthId;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.repository.SeedlotGeneticWorthRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** This class holds methods for handling the {@link SeedlotGeneticWorth} entity. */
@Service
@RequiredArgsConstructor
public class SeedlotGeneticWorthService {

  private final SeedlotGeneticWorthRepository seedlotGeneticWorthRepository;

  private final LoggedUserService loggedUserService;

  private final GeneticWorthEntityDao geneticWorthEntityDao;

  /**
   * Override the seedlot genetic worth data.
   *
   * @param seedlot The Seedlot instance.
   * @param seedlotGeneticWorthTraits Seedlot Genetic Worth data provided by the TSC Admin.
   */
  public List<SeedlotGeneticWorth> saveSeedlotGenWorth(
      Seedlot seedlot, List<GeneticWorthTraitsDto> seedlotGeneticWorthTraits) {
    SparLog.info("Saving calculated Seedlot Genetic Worth for seedlot number {}", seedlot.getId());
    return saveSeedlotGenWorthPrivate(seedlot, seedlotGeneticWorthTraits);
  }

  /**
   * Override the seedlot genetic worth data.
   *
   * @param seedlot The Seedlot instance.
   * @param seedlotGeneticWorthTraits Seedlot Genetic Worth data provided by the TSC Admin.
   */
  public List<SeedlotGeneticWorth> overrideSeedlotGenWorth(
      Seedlot seedlot, List<GeneticWorthTraitsDto> seedlotGeneticWorthTraits) {
    SparLog.info("Overriding saved Seedlot Genetic Worth for seedlot number {}", seedlot.getId());
    return saveSeedlotGenWorthPrivate(seedlot, seedlotGeneticWorthTraits);
  }

  private List<SeedlotGeneticWorth> saveSeedlotGenWorthPrivate(
      Seedlot seedlot, List<GeneticWorthTraitsDto> seedlotGeneticWorthTraits) {
    List<SeedlotGeneticWorth> sgwList =
        seedlotGeneticWorthRepository.findAllBySeedlot_id(seedlot.getId());

    if (!sgwList.isEmpty()) {
      SparLog.info(
          "Deleting {} previous records on the SeedlotGeneticWorth table for seedlot number {}",
          sgwList.size(),
          seedlot.getId());

      List<String> sgwExistingList =
          new ArrayList<>(sgwList.stream().map(SeedlotGeneticWorth::getGeneticWorthCode).toList());

      List<SeedlotGeneticWorthId> sgwiList = new ArrayList<>();
      for (String genWorthCode : sgwExistingList) {
        sgwiList.add(new SeedlotGeneticWorthId(seedlot.getId(), genWorthCode));
      }

      seedlotGeneticWorthRepository.deleteAllById(sgwiList);
    }

    List<SeedlotGeneticWorth> seedlotGenWorthList = new ArrayList<>();
    for (GeneticWorthTraitsDto traitDto : seedlotGeneticWorthTraits) {
      // Adding null check due to breeding values that did not match the minimum of
      // 70% threshold, they should not be stored as valid
      if (!Objects.isNull(traitDto.calculatedValue())) {
        GeneticWorthEntity gwEntity =
            geneticWorthEntityDao.getGeneticWorthEntity(traitDto.traitCode()).orElseThrow();
        SeedlotGeneticWorth sgw =
            new SeedlotGeneticWorth(seedlot, gwEntity, loggedUserService.createAuditCurrentUser());
        sgw.setGeneticQualityValue(traitDto.calculatedValue());
        sgw.setTestedParentTreeContributionPercentage(traitDto.testedParentTreePerc());
        seedlotGenWorthList.add(sgw);
      }
    }

    if (seedlotGenWorthList.isEmpty()) {
      return List.of();
    }

    return seedlotGeneticWorthRepository.saveAll(seedlotGenWorthList);
  }

  /**
   * Gets all SeedlotGeneticWorth given a {@link Seedlot} id number.
   *
   * @param seedlotNumber The Seedlot id.
   * @return A List of {@link SeedlotGeneticWorth}
   */
  public List<SeedlotGeneticWorth> getAllBySeedlotNumber(String seedlotNumber) {
    return seedlotGeneticWorthRepository.findAllBySeedlot_id(seedlotNumber);
  }
}
