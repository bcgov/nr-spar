package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SeedlotSourceDto;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

/** This class contains all routines and database access to a list of seedlot source. */
@Service
public class SeedlotSourceService {
  private SeedlotSourceRepository seedlotSourceRepository;

  public SeedlotSourceService(SeedlotSourceRepository seedlotSourceRepository) {
    this.seedlotSourceRepository = seedlotSourceRepository;
  }

  /** Fetch all valid seedlot source from the repository. */
  public List<SeedlotSourceDto> getAllSeedlotSource() {
    SparLog.info("Fetching all seedlot source");
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

    SparLog.info("{} valid seedlot sources found.", resultList.size());
    return resultList;
  }
}
