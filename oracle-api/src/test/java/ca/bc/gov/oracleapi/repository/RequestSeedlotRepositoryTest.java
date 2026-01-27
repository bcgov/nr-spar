package ca.bc.gov.oracleapi.repository;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.oracleapi.entity.RequestSeedlot;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.ANY)
class RequestSeedlotRepositoryTest {

  @Autowired private TestEntityManager entityManager;
  @Autowired private RequestSeedlotRepository requestSeedlotRepository;

  @Test
  @DisplayName("existsCommitmentYes_shouldReturnTrue_whenMatchingRowWithYesExists")
  void existsCommitmentYes_shouldReturnTrue_whenMatchingRowWithYesExists() {
    RequestSeedlot rs = new RequestSeedlot();
    rs.setRequestSkey(100L);
    rs.setItemId("1");
    rs.setCommitmentInd("Y");

    entityManager.persistAndFlush(rs);

    boolean result =
        requestSeedlotRepository.existsCommitmentYes(100L, "1");

    assertTrue(result);
  }

  @Test
  @DisplayName("existsCommitmentYes_shouldReturnFalse_whenNoMatchingRow")
  void existsCommitmentYes_shouldReturnFalse_whenNoMatchingRow() {
    RequestSeedlot rs = new RequestSeedlot();
    rs.setRequestSkey(200L);
    rs.setItemId("999");
    rs.setCommitmentInd("Y");

    entityManager.persistAndFlush(rs);

    boolean result =
        requestSeedlotRepository.existsCommitmentYes(200L, "1");

    assertFalse(result);
  }

  @Test
  @DisplayName("existsCommitmentYes_shouldIgnoreNonYesValues")
  void existsCommitmentYes_shouldIgnoreNonYesValues() {
    RequestSeedlot rs = new RequestSeedlot();
    rs.setRequestSkey(300L);
    rs.setItemId("1");
    rs.setCommitmentInd("N");

    entityManager.persistAndFlush(rs);

    boolean result =
        requestSeedlotRepository.existsCommitmentYes(300L, "1");

    assertFalse(result);
  }
}
