package ca.bc.gov.backendstartapi.dao;

import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Component;

import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.repository.GeneticWorthRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Component
@Slf4j
public class GeneticWorthEntityDao {

  private final GeneticWorthRepository geneticWorthRepository;
  
  private Map<String, GeneticWorthEntity> map = Map.of();

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
