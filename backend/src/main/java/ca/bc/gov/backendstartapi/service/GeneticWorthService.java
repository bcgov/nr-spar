package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.exception.NoGeneticWorthException;
import ca.bc.gov.backendstartapi.repository.GeneticWorthRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/** This class contains all routines and database access to a list of genetic worth. */
@Slf4j
@Service
public class GeneticWorthService {
  private GeneticWorthRepository geneticWorthRepository;

  public GeneticWorthService(GeneticWorthRepository geneticWorthRepository) {
    this.geneticWorthRepository = geneticWorthRepository;
  }

  /** Fetch all valid genetic worth from the repository. */
  public List<CodeDescriptionDto> getAllGeneticWorth() {
    log.info("Fetching all genetic worth");
    List<CodeDescriptionDto> resultList = new ArrayList<>();

    geneticWorthRepository.findAll().stream()
        .filter(method -> method.isValid())
        .forEach(
            method -> {
              CodeDescriptionDto methodToAdd =
                  new CodeDescriptionDto(method.getGeneticWorthCode(), method.getDescription());
              resultList.add(methodToAdd);
            });

    return resultList;
  }

  /** Fetch a genetic worth from the repository by code. */
  public CodeDescriptionDto getGeneticWorthByCode(String code) {
    log.info("Fetching genetic worth with code %s", code);

    Optional<GeneticWorthEntity> foundRecord = geneticWorthRepository.findById(code);

    if (foundRecord.isPresent()) {
      CodeDescriptionDto dtoToReturn =
          new CodeDescriptionDto(
              foundRecord.get().getGeneticWorthCode(), foundRecord.get().getDescription());
      return dtoToReturn;
    }
    throw new NoGeneticWorthException();
  }
}
