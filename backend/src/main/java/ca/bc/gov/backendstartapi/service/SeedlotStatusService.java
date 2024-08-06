package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.repository.SeedlotStatusRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

/** This class contains all routines and database access to a list of seedlot status. */
@Service
public class SeedlotStatusService {
  private SeedlotStatusRepository seedlotStatusRepository;

  public SeedlotStatusService(SeedlotStatusRepository seedlotStatusRepository) {
    this.seedlotStatusRepository = seedlotStatusRepository;
  }

  /** Fetch all valid seedlot status from the repository. */
  public List<CodeDescriptionDto> getAllValidSeedlotStatusDto() {
    SparLog.info("Get all valid Seedlot Statuses for CodeDescriptionDto");
    List<CodeDescriptionDto> resultList = new ArrayList<>();
    getAllValidSeedlotStatusEntity()
        .forEach(
            method -> {
              CodeDescriptionDto methodToAdd =
                  new CodeDescriptionDto(method.getSeedlotStatusCode(), method.getDescription());
              resultList.add(methodToAdd);
            });

    SparLog.info("{} valid seedlot statuses found for CodeDescriptionDto", resultList.size());
    return resultList;
  }

  /**
   * Gets all valid Seedlot Status Entities.
   *
   * @return A List of {@link SeedlotStatusEntity}
   */
  public List<SeedlotStatusEntity> getAllValidSeedlotStatusEntity() {
    SparLog.info("Fetching all seedlot statuses for SeedlotStatusEntity");

    List<SeedlotStatusEntity> list =
        seedlotStatusRepository.findAll().stream().filter(method -> method.isValid()).toList();
    SparLog.info("{} valid seedlot statuses found for SeedlotStatusEntity", list.size());

    return list;
  }

  /**
   * Get a single valid Seedlot Status by its code.
   *
   * @param statusCode The Status code to be considered.
   * @return An Optional of {@link SeedlotStatusEntity}
   */
  public Optional<SeedlotStatusEntity> getValidSeedlotStatus(String statusCode) {
    SparLog.info("Get a single valid seedlot status for SeedlotStatusEntity code {}", statusCode);

    Optional<SeedlotStatusEntity> optionalSeedlot =
        getAllValidSeedlotStatusEntity().stream()
            .filter(x -> x.getSeedlotStatusCode().equals(statusCode))
            .findFirst();

    String empty = "";
    if (optionalSeedlot.isEmpty()) {
      empty = "not";
    }

    SparLog.info("Single seedlot status " + empty + " found for code {}", statusCode);

    return optionalSeedlot;
  }

  /**
   * Get a Seedlot Status entity by id.
   *
   * @param id The status code.
   * @return Optional of a Seedlot Status Entity.
   */
  public Optional<SeedlotStatusEntity> findById(String id) {
    return seedlotStatusRepository.findById(id);
  }
}
