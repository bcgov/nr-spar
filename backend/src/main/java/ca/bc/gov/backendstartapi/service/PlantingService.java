package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SeedlotSpeciesDto;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

/** This class contains methods to serve planting related requests to external consumers. */
@Service
public class PlantingService {

  private final Provider oracleApiProvider;

  private final SeedlotRepository seedlotRepository;

  PlantingService(
      @Qualifier("oracleApi") Provider oracleApiProvider, SeedlotRepository seedlotRepository) {
    this.oracleApiProvider = oracleApiProvider;
    this.seedlotRepository = seedlotRepository;
  }

  /**
   * Find the seedlot and species (vegetation code) mapped to a request key. A request key maps to
   * exactly one seedlot (1:1).
   *
   * @param requestKey the request key to look up
   * @return the {@link SeedlotSpeciesDto} for the request key
   */
  public SeedlotSpeciesDto getSeedlotAndSpeciesByRequestKey(Long requestKey) {
    SparLog.info("Fetching seedlot and species for requestKey {}", requestKey);
    return oracleApiProvider.getSeedlotAndSpeciesByRequestKey(requestKey);
  }

  /**
   * Find the species (vegetation code) of a seedlot, without needing a request key.
   *
   * @param seedlotNumber the seedlot number to look up
   * @return the {@link SeedlotSpeciesDto} for the seedlot
   * @throws SeedlotNotFoundException when the seedlot does not exist in SPAR
   */
  public SeedlotSpeciesDto getSpeciesBySeedlot(String seedlotNumber) {
    SparLog.info("Fetching species for seedlot {}", seedlotNumber);
    return seedlotRepository
        .findById(seedlotNumber)
        .map(
            seedlot ->
                new SeedlotSpeciesDto(
                    Long.valueOf(seedlot.getId()), seedlot.getVegetationCode()))
        .orElseThrow(SeedlotNotFoundException::new);
  }
}
