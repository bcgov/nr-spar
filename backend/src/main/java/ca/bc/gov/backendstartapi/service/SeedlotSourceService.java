package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/** This class contains all routines and database access to a list of seedlot source. */
@Slf4j
@Service
public class SeedlotSourceService {
  private SeedlotSourceRepository seedlotSourceRepository;

  public SeedlotSourceService(SeedlotSourceRepository seedlotSourceRepository) {
    this.seedlotSourceRepository = seedlotSourceRepository;
  }

  /** Fetch all valid seedlot source from the repository. */
  public List<CodeDescriptionDto> getAllSeedlotSource() {
    log.info("Fetching all seedlot source");
    List<CodeDescriptionDto> resultList = new ArrayList<>();
    seedlotSourceRepository.findAll().stream()
        .filter(method -> method.isValid())
        .forEach(
            method -> {
              CodeDescriptionDto methodToAdd =
                  new CodeDescriptionDto(method.getSeedlotSourceCode(), method.getDescription());
              resultList.add(methodToAdd);
            });

    return resultList;
  }
}
