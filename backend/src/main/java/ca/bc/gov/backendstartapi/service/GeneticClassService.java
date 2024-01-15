package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.exception.NoGeneticWorthException;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.lang.NonNull;
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
    SparLog.info("Fetching all genetic classes");
    List<CodeDescriptionDto> resultList = new ArrayList<>();
    geneticClassRepository.findAll().stream()
        .filter(method -> method.isValid())
        .forEach(
            method -> {
              CodeDescriptionDto methodToAdd =
                  new CodeDescriptionDto(method.getGeneticClassCode(), method.getDescription());
              resultList.add(methodToAdd);
            });

    SparLog.info("{} genetic classes found.", resultList.size());
    return resultList;
  }

  /** Fetch a single genetic class by code. */
  public CodeDescriptionDto getGeneticClassByCode(@NonNull String code) {
    SparLog.info("Fetching genetic class for code {}", code);

    Optional<GeneticClassEntity> gceOptional = geneticClassRepository.findById(code);
    gceOptional.ifPresent(entity -> SparLog.info("Genetic class {} found.", code));

    return gceOptional
        .map(
            entity -> new CodeDescriptionDto(entity.getGeneticClassCode(), entity.getDescription()))
        .orElseThrow(NoGeneticWorthException::new);
  }
}
