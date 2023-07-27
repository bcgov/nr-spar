package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.UniversalDataDto;
import ca.bc.gov.backendstartapi.repository.ConeCollectionMethodRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/** This class contains all routines and database access to a users' favorite activity. */
@Slf4j
@Service
public class ConeCollectionMethodService {
  private ConeCollectionMethodRepository coneCollectionMethodRepository;

  public ConeCollectionMethodService(
      ConeCollectionMethodRepository coneCollectionMethodRepository) {
    this.coneCollectionMethodRepository = coneCollectionMethodRepository;
  }

  public List<UniversalDataDto> getAllConeCollectionMethods() {
    log.info("Fetching Cone Collection Methods");
    List<UniversalDataDto> resultList = new ArrayList<>();
    coneCollectionMethodRepository.findAll().stream()
        .filter(method -> method.isValid())
        .forEach(
            method -> {
              UniversalDataDto methodToAdd =
                  new UniversalDataDto(
                      String.valueOf(method.getConeCollectionMethodCode()),
                      method.getDescription());
              resultList.add(methodToAdd);
            });

    return resultList;
  }
}
