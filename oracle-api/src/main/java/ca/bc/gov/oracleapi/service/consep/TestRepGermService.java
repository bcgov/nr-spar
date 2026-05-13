package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.TestRepGermDto;
import ca.bc.gov.oracleapi.mapper.TestRepGermMapper;
import ca.bc.gov.oracleapi.repository.consep.TestRepGermRepository;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** The class for Germination Test Replicate Service. */
@Service
@RequiredArgsConstructor
public class TestRepGermService {

  private final TestRepGermRepository testRepGermRepository;

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
}
