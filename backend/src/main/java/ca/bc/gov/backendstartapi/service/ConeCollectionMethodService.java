package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import ca.bc.gov.backendstartapi.repository.ConeCollectionMethodRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

/** This class contains all routines and database access to a list of cone collection method. */
@Service
public class ConeCollectionMethodService {
  private ConeCollectionMethodRepository coneCollectionMethodRepository;

  public ConeCollectionMethodService(
      ConeCollectionMethodRepository coneCollectionMethodRepository) {
    this.coneCollectionMethodRepository = coneCollectionMethodRepository;
  }

  /** Fetch all valid cone cllection method from the repository. */
  public List<CodeDescriptionDto> getAllConeCollectionMethods() {
    SparLog.info("Fetching all Cone Collection Methods for CodeDescriptionDto");
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

    SparLog.info("{} Cone Collection Methods found.", resultList.size());
    return resultList;
  }

  /**
   * Fetches all valid Cone Collection methods returning the list of entities.
   *
   * @return A {@link List} of {@link ConeCollectionMethodEntity}
   */
  public List<ConeCollectionMethodEntity> getAllValidConeCollectionMethods() {
    SparLog.info("Fetching all Cone Collection Methods for ConeCollectionMethodEntity");

    List<ConeCollectionMethodEntity> list =
        coneCollectionMethodRepository.findAll().stream().filter(x -> x.isValid()).toList();
    SparLog.info("{} Cone Collection Methods found.", list.size());
    return list;
  }

  /**
   * Get all cone collection methods by id in a single query.
   *
   * @param ids All cone collection method ids.
   * @return List of found cone collection method entities.
   */
  public List<ConeCollectionMethodEntity> getAllByIdIn(List<Integer> ids) {
    SparLog.info("Fetching list of Cone Collection Methods by Id with ids {}", ids);
    List<ConeCollectionMethodEntity> list =
        coneCollectionMethodRepository.findAllByConeCollectionMethodCodeIn(ids);
    SparLog.info("{} Cone Collection Methods found.", list.size());
    return list;
  }
}
