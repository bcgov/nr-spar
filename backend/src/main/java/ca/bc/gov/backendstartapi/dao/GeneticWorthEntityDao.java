package ca.bc.gov.backendstartapi.dao;

import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.repository.GeneticWorthRepository;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/** This class holds methods for storing a {@link GeneticWorthEntity} in memory. */
@RequiredArgsConstructor
@Component
@Slf4j
public class GeneticWorthEntityDao {

  private final GeneticWorthRepository geneticWorthRepository;

  private Map<String, GeneticWorthEntity> map = new HashMap<>();

  /**
   * Gets a {@link GeneticWorthEntity} from memory, if it's not there, will fetch from the database
   * and save it.
   *
   * @param geneticWorthCode The genetic worth code to be fetched.
   * @return An Optional of the {@link GeneticWorthEntity}
   */
  public Optional<GeneticWorthEntity> getGeneticWorthEntity(String geneticWorthCode) {
    if (map.containsKey(geneticWorthCode)) {
      return Optional.of(map.get(geneticWorthCode));
    }

    Optional<GeneticWorthEntity> entity = geneticWorthRepository.findById(geneticWorthCode);
    if (entity.isEmpty()) {
      log.error("Genetic Worth Code not present in the database {}", geneticWorthCode);
      return entity;
    }

    map.put(geneticWorthCode, entity.get());
    return entity;
  }
}
