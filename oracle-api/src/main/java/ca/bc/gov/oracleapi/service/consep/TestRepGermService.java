package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.TestRepGermDto;
import ca.bc.gov.oracleapi.entity.consep.TestRepGermEntity;
import ca.bc.gov.oracleapi.entity.consep.idclass.ReplicateId;
import ca.bc.gov.oracleapi.mapper.TestRepGermMapper;
import ca.bc.gov.oracleapi.repository.consep.TestRepGermRepository;
import ca.bc.gov.oracleapi.repository.consep.TestResultRepository;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** The class for Germination Test Replicate Service. */
@Service
@RequiredArgsConstructor
public class TestRepGermService {

  private final TestRepGermRepository testRepGermRepository;

  private final TestResultRepository testResultRepository;

  /**
   * Get all germination test replicates for a riaKey, ordered by replicate number.
   */
  public List<TestRepGermDto> getTestReplicates(BigDecimal riaKey) {
    SparLog.info("Retrieving germ test replicates for RIA_SKEY: {}", riaKey);

    List<TestRepGermDto> replicates =
        testRepGermRepository.findByRiaKeyOrderByReplicateNumber(riaKey).stream()
            .map(TestRepGermMapper::convertToDto)
            .toList();

    SparLog.info("Found {} germ test replicates for RIA_SKEY: {}", replicates.size(), riaKey);
    return replicates;
  }

  /**
   * Tick or untick one replicate's Accept box (#2756). Unlike the counts, which lock once the
   * test is completed (#2841), this stays open on a completed test so the technician can see the
   * result with and without a replicate; only an accepted test is locked.
   *
   * @throws ResponseStatusException 404 if the test or replicate is missing, 409 if the test is
   *     accepted
   */
  @Transactional
  public TestRepGermDto updateRepAccepted(
      BigDecimal riaKey, Integer replicateNumber, Integer repAcceptedInd) {
    Integer accepted = testResultRepository.findByIdForUpdate(riaKey)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, "No germination test data found for given RIA_SKEY"))
        .getAcceptResult();
    if (accepted != null && accepted != 0) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "This test is accepted and can no longer be edited");
    }
    TestRepGermEntity rep = testRepGermRepository
        .findById(new ReplicateId(riaKey, replicateNumber))
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, "No replicate " + replicateNumber + " for this test"));
    rep.setRepAcceptedInd(repAcceptedInd);
    SparLog.info("Set replicate {} accepted={} for RIA_SKEY: {}",
        replicateNumber, repAcceptedInd, riaKey);
    return TestRepGermMapper.convertToDto(testRepGermRepository.save(rep));
  }
}
