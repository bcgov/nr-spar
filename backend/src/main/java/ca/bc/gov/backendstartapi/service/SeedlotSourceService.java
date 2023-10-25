package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.SeedlotSourceDto;
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
  public List<SeedlotSourceDto> getAllSeedlotSource() {
    log.info("Fetching all seedlot source");
    List<SeedlotSourceDto> resultList = new ArrayList<>();
    seedlotSourceRepository.findAll().stream()
        .filter(method -> method.isValid())
        .forEach(
            method -> {
              SeedlotSourceDto methodToAdd =
                  new SeedlotSourceDto(
                      method.getSeedlotSourceCode(),
                      method.getDescription(),
                      method.getIsDefault());
              resultList.add(methodToAdd);
            });

    return resultList;
  }
}
