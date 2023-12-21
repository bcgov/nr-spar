package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.repository.SeedlotStatusRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/** This class contains all routines and database access to a list of seedlot status. */
@Slf4j
@Service
public class SeedlotStatusService {
  private SeedlotStatusRepository seedlotStatusRepository;

  public SeedlotStatusService(SeedlotStatusRepository seedlotStatusRepository) {
    this.seedlotStatusRepository = seedlotStatusRepository;
  }

  /** Fetch all valid seedlot status from the repository. */
  public List<CodeDescriptionDto> getAllValidSeedlotStatusDto() {
    log.info("Get all valid Seedlot Statuses for CodeDescriptionDto");
    List<CodeDescriptionDto> resultList = new ArrayList<>();
    getAllValidSeedlotStatusEntity()
        .forEach(
            method -> {
              CodeDescriptionDto methodToAdd =
                  new CodeDescriptionDto(method.getSeedlotStatusCode(), method.getDescription());
              resultList.add(methodToAdd);
            });

    return resultList;
  }

  /**
   * Gets all valid Seedlot Status Entities.
   *
   * @return A List of {@link SeedlotStatusEntity}
   */
  public List<SeedlotStatusEntity> getAllValidSeedlotStatusEntity() {
    log.info("Fetching all seedlot statuses for SeedlotStatusEntity");
    return seedlotStatusRepository.findAll().stream().filter(method -> method.isValid()).toList();
  }

  /**
   * Get a single valid Seedlot Status by its code.
   *
   * @param statusCode The Status code to be considered.
   * @return An Optional of {@link SeedlotStatusEntity}
   */
  public Optional<SeedlotStatusEntity> getValidSeedlotStatus(String statusCode) {
    log.info("Get a single valid seedlot status for SeedlotStatusEntity code {}", statusCode);
    return getAllValidSeedlotStatusEntity().stream()
        .filter(x -> x.getSeedlotStatusCode().equals(statusCode))
        .findFirst();
  }
}
