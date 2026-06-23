package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SeedlotSpeciesDto;
import ca.bc.gov.backendstartapi.provider.Provider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

/** This class contains methods to serve planting related requests to external consumers. */
@Service
public class PlantingService {

  private final Provider oracleApiProvider;

  PlantingService(@Qualifier("oracleApi") Provider oracleApiProvider) {
    this.oracleApiProvider = oracleApiProvider;
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
}
