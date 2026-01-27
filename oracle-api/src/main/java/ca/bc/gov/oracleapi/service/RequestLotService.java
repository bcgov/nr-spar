package ca.bc.gov.oracleapi.service;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.repository.RequestSeedlotRepository;
import ca.bc.gov.oracleapi.repository.RequestVeglotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
}
