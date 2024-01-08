package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.exception.NoGeneticWorthException;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

/** This class contains all routines and database access to a list of genetic class. */
@Service
public class GeneticClassService {
  private GeneticClassRepository geneticClassRepository;

  public GeneticClassService(GeneticClassRepository geneticClassRepository) {
    this.geneticClassRepository = geneticClassRepository;
  }

  /** Fetch all valid genetic class from the repository. */
  public List<CodeDescriptionDto> getAllGeneticClass() {
    SparLog.info("Fetching all genetic class");
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
    SparLog.info("Fetching genetic class with code {}", code);

    return geneticClassRepository
        .findById(code)
        .map(
            entity -> new CodeDescriptionDto(entity.getGeneticClassCode(), entity.getDescription()))
        .orElseThrow(NoGeneticWorthException::new);
  }
}
