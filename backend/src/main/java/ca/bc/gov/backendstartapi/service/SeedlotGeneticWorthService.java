package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dao.GeneticWorthEntityDao;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotGeneticWorth;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotGeneticWorthId;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.SeedlotConflictDataException;
import ca.bc.gov.backendstartapi.repository.SeedlotGeneticWorthRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.ArrayList;
import java.util.List;
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
   * Saves a SeedlotParentTree from the Seedlot Form Registration step 5.
   *
   * @param seedlot The {@link Seedlot} related
   * @param seedlotFormParentTreeDtoList A List of {@link SeedlotFormParentTreeSmpDto}
   */
  public List<SeedlotGeneticWorth> saveSeedlotFormStep5(
      Seedlot seedlot,
      List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList,
      boolean canDelete) {
    SparLog.info("Saving SeedlotGeneticWorth for seedlot number {}", seedlot.getId());

    List<SeedlotGeneticWorth> sgwList =
        seedlotGeneticWorthRepository.findAllBySeedlot_id(seedlot.getId());

    List<ParentTreeGeneticQualityDto> sgwInsertList = new ArrayList<>();

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
    } else if (!sgwList.isEmpty() && !canDelete) {
      throw new SeedlotConflictDataException(seedlot.getId());
    }

    for (SeedlotFormParentTreeSmpDto seedlotPtFormDto : seedlotFormParentTreeDtoList) {
      sgwInsertList.addAll(seedlotPtFormDto.parentTreeGeneticQualities());
    }

    return addSeedlotGeneticWorth(seedlot, sgwInsertList);
  }

  private List<SeedlotGeneticWorth> addSeedlotGeneticWorth(
      Seedlot seedlot, List<ParentTreeGeneticQualityDto> genWorthCodeToInsert) {
    if (genWorthCodeToInsert.isEmpty()) {
      SparLog.info(
          "No new records to be inserted on the SeedlotGeneticWorth table for seedlot number {}",
          seedlot.getId());
      return List.of();
    }

    SparLog.info(
        "{} record(s) to be inserted on the SeedlotGeneticWorth table for seedlot number {}",
        genWorthCodeToInsert.size(),
        seedlot.getId());

    List<SeedlotGeneticWorth> seedlotGeneticWorths = new ArrayList<>();
    for (ParentTreeGeneticQualityDto ptgqDto : genWorthCodeToInsert) {

      GeneticWorthEntity gwEntity =
          geneticWorthEntityDao.getGeneticWorthEntity(ptgqDto.geneticWorthCode()).orElseThrow();

      SeedlotGeneticWorth sgw =
          new SeedlotGeneticWorth(seedlot, gwEntity, loggedUserService.createAuditCurrentUser());
      sgw.setGeneticQualityValue(ptgqDto.geneticQualityValue());
      seedlotGeneticWorths.add(sgw);
    }

    return seedlotGeneticWorthRepository.saveAll(seedlotGeneticWorths);
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
