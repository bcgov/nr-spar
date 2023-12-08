package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.entity.SmpMix;
import ca.bc.gov.backendstartapi.entity.idclass.SmpMixId;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.repository.SmpMixRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/** This class holds methods for handling the {@link SmpMix} entity. */
@Slf4j
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
  public void saveSeedlotFormStep5(
      Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> seedlotFormParentTreeDtoList) {
    log.info("Saving SmpMix for seedlot number {}", seedlot.getId());
    List<SmpMix> smpMixs = smpMixRepository.findAllBySeedlot_id(seedlot.getId());

    if (!smpMixs.isEmpty()) {
      log.info(
          "{} previous records on the SmpMix table for seedlot number {}",
          smpMixs.size(),
          seedlot.getId());

      List<Integer> existingParentTreeIds =
          smpMixs.stream().map(SmpMix::getParentTreeId).collect(Collectors.toList());

      List<SeedlotFormParentTreeSmpDto> parentTreeIdsToInsert = new ArrayList<>();

      for (SeedlotFormParentTreeSmpDto formDto : seedlotFormParentTreeDtoList) {
        if (existingParentTreeIds.contains(formDto.parentTreeId())) {
          existingParentTreeIds.remove(formDto.parentTreeId());
        } else {
          parentTreeIdsToInsert.add(formDto);
        }
      }

      // Remove possible leftovers
      log.info(
          "{} leftover record(s) on the SmpMix table to remove for seedlot number {}",
          existingParentTreeIds.size(),
          seedlot.getId());

      List<SmpMixId> smpMixIdsToRemove = new ArrayList<>();
      for (Integer parentTreeId : existingParentTreeIds) {
        SmpMixId smpMixId = new SmpMixId(seedlot.getId(), parentTreeId);
        smpMixIdsToRemove.add(smpMixId);
      }

      if (!smpMixIdsToRemove.isEmpty()) {
        smpMixRepository.deleteAllById(smpMixIdsToRemove);
        smpMixRepository.flush();
      }

      // Insert new ones
      addSmpMix(seedlot, parentTreeIdsToInsert);

      return;
    }

    log.info("No previous records on the SmpMix table for seedlot number {}", seedlot.getId());

    addSmpMix(seedlot, seedlotFormParentTreeDtoList);
  }

  private void addSmpMix(Seedlot seedlot, List<SeedlotFormParentTreeSmpDto> formDtos) {
    if (formDtos.isEmpty()) {
      log.info(
          "No new records to be inserted on the SmpMix table for seedlot number {}",
          seedlot.getId());
      return;
    }

    log.info(
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

    smpMixRepository.saveAllAndFlush(smpMixs);
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
