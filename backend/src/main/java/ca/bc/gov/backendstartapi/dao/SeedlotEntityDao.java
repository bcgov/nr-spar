package ca.bc.gov.backendstartapi.dao;

import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/** This class works like a place to store in-transit information, in memory for the seedlot. */
@RequiredArgsConstructor
@Component
@Slf4j
public class SeedlotEntityDao {

  private final SeedlotRepository seedlotRepository;

  private Map<String, Seedlot> seedlotMap = new HashMap<>();

  /**
   * Saves a {@link Seedlot} in memory temporarily.
   *
   * @param seedlot the Seedlot to be saved.
   */
  public void storeSeedlot(Seedlot seedlot) {
    log.info("Storing Seedlot number {} on SeedlotEntityDao", seedlot.getId());
    seedlotMap.put(seedlot.getId(), seedlot);
  }

  /**
   * Get a previously stored Seedlot by its number.
   *
   * @param seedlotNumber The seedlot number
   * @return An Optional of {@link Seedlot}
   */
  public Optional<Seedlot> getSeedlot(String seedlotNumber) {
    if (seedlotMap.containsKey(seedlotNumber)) {
      return Optional.of(seedlotMap.get(seedlotNumber));
    }

    Optional<Seedlot> entity = seedlotRepository.findById(seedlotNumber);
    if (entity.isEmpty()) {
      log.error("Seedlot {} not present in the database!", seedlotNumber);
      return entity;
    }

    seedlotMap.put(seedlotNumber, entity.get());
    return entity;
  }
}
