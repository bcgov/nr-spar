package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.repository.SeedlotStatusRepository;
import java.util.ArrayList;
import java.util.List;
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
  public List<CodeDescriptionDto> getAllSeedlotStatus() {
    log.info("Fetching all seedlot status");
    List<CodeDescriptionDto> resultList = new ArrayList<>();
    seedlotStatusRepository.findAll().stream()
        .filter(method -> method.isValid())
        .forEach(
            method -> {
              CodeDescriptionDto methodToAdd =
                  new CodeDescriptionDto(method.getSeedlotStatusCode(), method.getDescription());
              resultList.add(methodToAdd);
            });

    return resultList;
  }
}
