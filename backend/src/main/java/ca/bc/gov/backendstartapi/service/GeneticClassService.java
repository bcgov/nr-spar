package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.exception.NoGeneticClassException;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/** This class contains all routines and database access to a list of genetic class. */
@Slf4j
@Service
public class GeneticClassService {
  private GeneticClassRepository geneticClassRepository;

  public GeneticClassService(GeneticClassRepository geneticClassRepository) {
    this.geneticClassRepository = geneticClassRepository;
  }

  /** Fetch all valid genetic class from the repository. */
  public List<CodeDescriptionDto> getAllGeneticClass() {
    log.info("Fetching all genetic class");
    List<CodeDescriptionDto> resultList = new ArrayList<>();
    geneticClassRepository.findAll().stream()
        .filter(method -> method.isValid())
        .forEach(
            method -> {
              CodeDescriptionDto methodToAdd =
                  new CodeDescriptionDto(method.getGeneticClassCode(), method.getDescription());
              resultList.add(methodToAdd);
            });

    return resultList;
  }

  /** Fetch a single genetic class by code. */
  public CodeDescriptionDto getGeneticClassByCode(String code) {
    log.info("Fetching genetic class with code %s", code);

    Optional<GeneticClassEntity> foundRecord = geneticClassRepository.findById(code);

    if (foundRecord.isPresent()) {
      CodeDescriptionDto dtoToReturn =
          new CodeDescriptionDto(
              foundRecord.get().getGeneticClassCode(), foundRecord.get().getDescription());
      return dtoToReturn;
    }
    throw new NoGeneticClassException();
  }
}
