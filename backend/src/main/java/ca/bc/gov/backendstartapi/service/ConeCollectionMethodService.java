package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import ca.bc.gov.backendstartapi.repository.ConeCollectionMethodRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/** This class contains all routines and database access to a list of cone collection method. */
@Slf4j
@Service
public class ConeCollectionMethodService {
  private ConeCollectionMethodRepository coneCollectionMethodRepository;

  public ConeCollectionMethodService(
      ConeCollectionMethodRepository coneCollectionMethodRepository) {
    this.coneCollectionMethodRepository = coneCollectionMethodRepository;
  }

  /** Fetch all valid cone cllection method from the repository. */
  public List<CodeDescriptionDto> getAllConeCollectionMethods() {
    log.info("Fetching all Cone Collection Methods for CodeDescriptionDto");
    List<CodeDescriptionDto> resultList = new ArrayList<>();
    coneCollectionMethodRepository.findAll().stream()
        .filter(method -> method.isValid())
        .forEach(
            method -> {
              CodeDescriptionDto methodToAdd =
                  new CodeDescriptionDto(
                      String.valueOf(method.getConeCollectionMethodCode()),
                      method.getDescription());
              resultList.add(methodToAdd);
            });

    return resultList;
  }

  /**
   * Fetches all valid Cone Collection methods returning the list of entities.
   *
   * @return A {@link List} of {@link ConeCollectionMethodEntity}
   */
  public List<ConeCollectionMethodEntity> getAllValidConeCollectionMethods() {
    log.info("Fetching all Cone Collection Methods for ConeCollectionMethodEntity");
    return coneCollectionMethodRepository.findAll().stream().filter(x -> x.isValid()).toList();
  }
}
