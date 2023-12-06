package ca.bc.gov.backendstartapi.dao;

import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.repository.GeneticWorthRepository;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
@Slf4j
public class GeneticWorthEntityDao {

  private final GeneticWorthRepository geneticWorthRepository;

  private Map<String, GeneticWorthEntity> map = new HashMap<>();

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
