package ca.bc.gov.oracleapi.service;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.SpuDto;
import ca.bc.gov.oracleapi.repository.RequestSeedlotRepository;
import ca.bc.gov.oracleapi.repository.RequestVeglotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** The class for BEC Zone Code Service. */
@Service
@RequiredArgsConstructor
public class RequestLotService {

  private final RequestSeedlotRepository requestSeedlotRepository;

  private final RequestVeglotRepository requestVeglotRepository;

  /**
   * Get the description of a Seed Plan Unit by an ID.
   *
   * @return a {@link SpuDto} if found
   */
  public boolean isCommitmentChecked(Long requestSkey, String itemId) {
    SparLog.info("Finding commitment indicator for requestSkey {} and itemId {}", requestSkey, itemId);

    String commitmentInd = requestSeedlotRepository.getCommitment(requestSkey, itemId);
    if (commitmentInd == null) {
      commitmentInd = requestVeglotRepository.getCommitment(requestSkey, itemId);
    }

    SparLog.info(
        "Commitment indicator found for requestSkey {} and itemId {}: {}",
        requestSkey,
        itemId,
        commitmentInd);

    return commitmentInd != null && commitmentInd.equalsIgnoreCase("Y");
  }
}
