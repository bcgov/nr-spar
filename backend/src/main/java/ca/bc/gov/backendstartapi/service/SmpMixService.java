package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.entity.SmpMix;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.repository.SmpMixRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** This class holds methods for handling the {@link SmpMix} entity. */
@Service
@RequiredArgsConstructor
public class SmpMixService {

  private final SmpMixRepository smpMixRepository;

  private final LoggedUserService loggedUserService;

  /**
   * Saves a SeedlotParentTree from the Seedlot Form Registration step 5.
   *
   * @param seedlot The {@link Seedlot} related
   * @param seedlotFormParentTreeDtoList A List of {@link SeedlotFormParentTreeSmpDto}
   */
  public List<SmpMix> saveSeedlotFormStep5(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {
    SparLog.info("Saving SmpMix for seedlot number {}", seedlot.getId());

    return addSmpMix(seedlot, seedlotFormParentTreeDtoList);
  }

  private List<SmpMix> addSmpMix(Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> formDtos) {
    if (formDtos.isEmpty()) {
      SparLog.info(
          "No new records to be inserted on the SmpMix table for seedlot number {}",
          seedlot.getId());
      return List.of();
    }

    SparLog.info(
        "{} record(s) to be inserted on the SmpMix table for seedlot number {}",
        formDtos.size(),
        seedlot.getId());

    List<SmpMix> smpMixs = new ArrayList<>();

    for (SeedlotFormParentTreeSmpDto formDto : formDtos) {
      SmpMix smpMix =
          new SmpMix(
              seedlot,
              formDto.parentTreeId(),
              formDto.parentTreeNumber(),
              formDto.amountOfMaterial(),
              formDto.proportion(),
              loggedUserService.createAuditCurrentUser(),
              0);

      smpMixs.add(smpMix);
    }

    return smpMixRepository.saveAll(smpMixs);
  }

  /**
   * Gets all SmpMix given a {@link Seedlot} id number.
   *
   * @param seedlotNumber The Seedlot id.
   * @return A List of {@link SmpMix}
   */
  public List<SmpMix> getAllBySeedlotNumber(String seedlotNumber) {
    return smpMixRepository.findAllBySeedlot_id(seedlotNumber);
  }
}
