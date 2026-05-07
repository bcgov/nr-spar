package ca.bc.gov.oracleapi.service.consep;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.dto.consep.TestRepGermDto;
import ca.bc.gov.oracleapi.entity.consep.TestRepGermEntity;
import ca.bc.gov.oracleapi.entity.consep.idclass.ReplicateId;
import ca.bc.gov.oracleapi.repository.consep.TestRepGermRepository;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * The test class for Germination Test Replicate Service.
 */
@ExtendWith(MockitoExtension.class)
class TestRepGermServiceTest {

  @Mock
  private TestRepGermRepository testRepGermRepository;

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
  @DisplayName("Get test replicates should return empty list when no replicates exist")
  void getTestReplicates_shouldReturnEmptyList() {
    BigDecimal riaKey = new BigDecimal("999999");
    when(testRepGermRepository.findByRiaKeyOrderByReplicateNumber(riaKey))
        .thenReturn(Collections.emptyList());

    List<TestRepGermDto> result = testRepGermService.getTestReplicates(riaKey);

    assertThat(result).isEmpty();
    verify(testRepGermRepository).findByRiaKeyOrderByReplicateNumber(riaKey);
  }
}
