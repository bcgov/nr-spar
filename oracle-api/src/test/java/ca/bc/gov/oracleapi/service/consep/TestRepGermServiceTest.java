package ca.bc.gov.oracleapi.service.consep;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.dto.consep.TestRepGermDto;
import ca.bc.gov.oracleapi.entity.consep.TestRepGermEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.entity.consep.idclass.ReplicateId;
import ca.bc.gov.oracleapi.repository.consep.TestRepGermRepository;
import ca.bc.gov.oracleapi.repository.consep.TestResultRepository;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * The test class for Germination Test Replicate Service.
 */
@ExtendWith(MockitoExtension.class)
class TestRepGermServiceTest {

  @Mock
  private TestRepGermRepository testRepGermRepository;

  @Mock
  private TestResultRepository testResultRepository;

  @Mock
  private GermCountService germCountService;

  @InjectMocks
  private TestRepGermService testRepGermService;

  private TestRepGermEntity buildEntity(BigDecimal riaKey, int replicateNumber, int totalSeeds) {
    TestRepGermEntity entity = new TestRepGermEntity();
    entity.setId(new ReplicateId(riaKey, replicateNumber));
    entity.setTotalNoSeeds(totalSeeds);
    entity.setFinalUngrmNormal(1);
    entity.setFinalUngrmShrvl(2);
    entity.setFinalUngrmEmpty(3);
    entity.setFinalUngrmInsct(4);
    entity.setFinalUngrmDamagd(5);
    entity.setFinalUngrmRotten(6);
    entity.setFinalPregerm(7);
    entity.setRepAcceptedInd(1);
    entity.setTolrncOvrrdeDesc("ok");
    return entity;
  }

  @Test
  @DisplayName("Get test replicates should return mapped DTOs")
  void getTestReplicates_shouldReturnMappedDtos() {
    BigDecimal riaKey = new BigDecimal("881191");
    TestRepGermEntity rep1 = buildEntity(riaKey, 1, 100);
    TestRepGermEntity rep2 = buildEntity(riaKey, 2, 100);

    when(testRepGermRepository.findByRiaKeyOrderByReplicateNumber(riaKey))
        .thenReturn(List.of(rep1, rep2));

    List<TestRepGermDto> result = testRepGermService.getTestReplicates(riaKey);

    assertThat(result).hasSize(2);
    assertThat(result.get(0).riaKey()).isEqualTo(riaKey);
    assertThat(result.get(0).replicateNumber()).isEqualTo(1);
    assertThat(result.get(0).totalNoSeeds()).isEqualTo(100);
    assertThat(result.get(0).finalUngrmNormal()).isEqualTo(1);
    assertThat(result.get(0).finalPregerm()).isEqualTo(7);
    assertThat(result.get(0).repAcceptedInd()).isEqualTo(1);
    assertThat(result.get(0).tolrncOvrrdeDesc()).isEqualTo("ok");
    assertThat(result.get(1).replicateNumber()).isEqualTo(2);

    verify(testRepGermRepository).findByRiaKeyOrderByReplicateNumber(riaKey);
  }

  @Test
  @DisplayName("Replicate with totalNoSeeds <= 0 should not be accepted")
  void getTestReplicates_shouldForceNotAcceptedWhenTotalSeedsNotPositive() {
    BigDecimal riaKey = new BigDecimal("881191");
    TestRepGermEntity zeroSeeds = buildEntity(riaKey, 1, 0);
    zeroSeeds.setRepAcceptedInd(1);
    TestRepGermEntity nullSeeds = buildEntity(riaKey, 2, 0);
    nullSeeds.setTotalNoSeeds(null);
    nullSeeds.setRepAcceptedInd(1);

    when(testRepGermRepository.findByRiaKeyOrderByReplicateNumber(riaKey))
        .thenReturn(List.of(zeroSeeds, nullSeeds));

    List<TestRepGermDto> result = testRepGermService.getTestReplicates(riaKey);

    assertThat(result).hasSize(2);
    assertThat(result.get(0).totalNoSeeds()).isEqualTo(0);
    assertThat(result.get(0).repAcceptedInd()).isEqualTo(0);
    assertThat(result.get(1).totalNoSeeds()).isNull();
    assertThat(result.get(1).repAcceptedInd()).isEqualTo(0);
  }

  @Test
  @DisplayName("Get test replicates should return empty list when no replicates exist")
  void getTestReplicates_shouldReturnEmptyList() {
    BigDecimal riaKey = new BigDecimal("999999");
    when(testRepGermRepository.findByRiaKeyOrderByReplicateNumber(riaKey))
        .thenReturn(Collections.emptyList());

    List<TestRepGermDto> result = testRepGermService.getTestReplicates(riaKey);

    assertThat(result).isEmpty();
    verify(testRepGermRepository).findByRiaKeyOrderByReplicateNumber(riaKey);
  }

  /*---------------------- updateRepAccepted (#2756) ----------------------------------------*/

  private static final BigDecimal RIA = new BigDecimal("1068771");

  private TestResultEntity test(int complete, int accepted) {
    TestResultEntity test = new TestResultEntity();
    test.setRiaKey(RIA);
    test.setTestCompleteInd(complete);
    test.setAcceptResult(accepted);
    return test;
  }

  @Test
  @DisplayName("A completed test can still untick a replicate")
  void updateRepAccepted_worksOnACompletedTest() {
    when(testResultRepository.findByIdForUpdate(RIA)).thenReturn(Optional.of(test(-1, 0)));
    TestRepGermEntity rep = buildEntity(RIA, 2, 100);
    when(testRepGermRepository.findById(new ReplicateId(RIA, 2))).thenReturn(Optional.of(rep));
    when(testRepGermRepository.saveAndFlush(rep)).thenReturn(rep);

    TestRepGermDto result = testRepGermService.updateRepAccepted(RIA, 2, 0);

    assertThat(result.repAcceptedInd()).isZero();
    verify(testRepGermRepository).saveAndFlush(rep);
    // The stored cumulative % follows the accept flags.
    verify(germCountService).refreshStoredCumulative(RIA);
  }

  @Test
  @DisplayName("An accepted test is locked")
  void updateRepAccepted_refusesAnAcceptedTest() {
    when(testResultRepository.findByIdForUpdate(RIA)).thenReturn(Optional.of(test(-1, -1)));

    ResponseStatusException ex = assertThrows(ResponseStatusException.class,
        () -> testRepGermService.updateRepAccepted(RIA, 2, 0));

    assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    verify(testRepGermRepository, never()).saveAndFlush(any());
  }

  @Test
  @DisplayName("A missing replicate is a 404")
  void updateRepAccepted_missingReplicate() {
    when(testResultRepository.findByIdForUpdate(RIA)).thenReturn(Optional.of(test(0, 0)));
    when(testRepGermRepository.findById(new ReplicateId(RIA, 3))).thenReturn(Optional.empty());

    ResponseStatusException ex = assertThrows(ResponseStatusException.class,
        () -> testRepGermService.updateRepAccepted(RIA, 3, 1));

    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
  }
}
