package ca.bc.gov.oracleapi.service;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.SeedlotSpeciesDto;
import ca.bc.gov.oracleapi.repository.RequestSeedlotRepository;
import ca.bc.gov.oracleapi.repository.RequestVeglotRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** The class for Request Lot Service. */
@Service
@RequiredArgsConstructor
public class RequestLotService {

  private final RequestSeedlotRepository requestSeedlotRepository;

  private final RequestVeglotRepository requestVeglotRepository;

  /**
   * Check if the commitment indicator is Y for the given requestSkey and itemId.
   *
   * @return true if the commitment indicator is "Y", false otherwise
   */
  public boolean isCommitmentIndicatorYes(Long requestSkey, String itemId) {
    SparLog.info(
        "Finding commitment indicator for requestSkey {} and itemId {}",
        requestSkey,
        itemId
    );

    boolean seedlotCommitted =
        requestSeedlotRepository.existsCommitmentYes(requestSkey, itemId);

    if (seedlotCommitted) {
      SparLog.info("Commitment found in RequestSeedlot");
      return true;
    }

    boolean veglotCommitted =
        requestVeglotRepository.existsCommitmentYes(requestSkey, itemId);

    SparLog.info(
        "Commitment found in RequestVeglot: {}",
        veglotCommitted
    );

    return veglotCommitted;
  }

  /**
   * Find the seedlot and species (vegetation code) mapped to a request key. A request key maps to
   * exactly one seedlot (1:1).
   *
   * @param requestKey the request key to look up
   * @return the {@link SeedlotSpeciesDto} for the request key
   * @throws ResponseStatusException with 404 status when the request key does not exist, or 409
   *     status when the request key maps to more than one seedlot
   */
  public SeedlotSpeciesDto getSeedlotAndSpecies(Long requestKey) {
    SparLog.info("Finding seedlot and species for requestKey {}", requestKey);

    List<SeedlotSpeciesDto> results =
        requestSeedlotRepository.findSeedlotAndSpeciesByRequestKey(requestKey);

    if (results.isEmpty()) {
      SparLog.info("No seedlot found for requestKey {}", requestKey);
      throw new ResponseStatusException(
          HttpStatus.NOT_FOUND, "No seedlot found for the given request key");
    }

    if (results.size() > 1) {
      SparLog.warn(
          "Multiple seedlot/species rows found for requestKey {} ({} rows)",
          requestKey,
          results.size());
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "Multiple seedlots found for the given request key");
    }

    return results.get(0);
  }
}
