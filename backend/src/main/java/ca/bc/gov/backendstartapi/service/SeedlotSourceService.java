package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SeedlotSourceDto;
import ca.bc.gov.backendstartapi.entity.SeedlotSourceEntity;
import ca.bc.gov.backendstartapi.exception.InvalidSeedlotRequestException;
import ca.bc.gov.backendstartapi.exception.SeedlotSourceNotFoundException;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** This class contains all routines and database access to a list of seedlot source. */
@RequiredArgsConstructor
@Service
public class SeedlotSourceService {

  private final SeedlotSourceRepository seedlotSourceRepository;

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

  public SeedlotSourceEntity getSeedlotSourceEntity(String code) {
    if (null == code || "null".equals(code)) {
      throw new InvalidSeedlotRequestException();
    }

    Optional<SeedlotSourceEntity> entity = seedlotSourceRepository.findById(code);
    if (entity.isEmpty()) {
      throw new SeedlotSourceNotFoundException();
    }

    return entity.get();
  }
}
