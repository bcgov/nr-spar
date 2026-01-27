package ca.bc.gov.oracleapi.repository;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.oracleapi.entity.RequestVeglot;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;


@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.ANY)
class RequestVeglotRepositoryTest {

  @Autowired private TestEntityManager entityManager;
  @Autowired private RequestVeglotRepository requestVeglotRepository;

  @Test
  @DisplayName("existsCommitmentYes_shouldReturnTrue_whenMatchingRowWithYesExists")
  void existsCommitmentYes_shouldReturnTrue_whenMatchingRowWithYesExists() {
    RequestVeglot rv = new RequestVeglot();
    rv.setRequestSkey(100L);
    rv.setItemId("1");
    rv.setCommitmentInd("Y");

    entityManager.persistAndFlush(rv);

    boolean result =
        requestVeglotRepository.existsCommitmentYes(100L, "1");

    assertTrue(result);
  }

  @Test
  @DisplayName("existsCommitmentYes_shouldReturnFalse_whenNoMatchingRow")
  void existsCommitmentYes_shouldReturnFalse_whenNoMatchingRow() {
    RequestVeglot rv = new RequestVeglot();
    rv.setRequestSkey(200L);
    rv.setItemId("999");
    rv.setCommitmentInd("Y");

    entityManager.persistAndFlush(rv);

    boolean result =
        requestVeglotRepository.existsCommitmentYes(200L, "1");

    assertFalse(result);
  }

  @Test
  @DisplayName("existsCommitmentYes_shouldIgnoreNonYesValues")
  void existsCommitmentYes_shouldIgnoreNonYesValues() {
    RequestVeglot rv1 = new RequestVeglot();
    rv1.setRequestSkey(300L);
    rv1.setItemId("1");
    rv1.setCommitmentInd("N");
    entityManager.persist(rv1);

    RequestVeglot rv2 = new RequestVeglot();
    rv2.setRequestSkey(300L);
    rv2.setItemId("2");
    rv2.setCommitmentInd("n"); // lowercase to verify UPPER()
    entityManager.persistAndFlush(rv2);

    boolean result =
        requestVeglotRepository.existsCommitmentYes(300L, "1");

    assertFalse(result);
  }

  @Test
  @DisplayName("existsCommitmentYes_shouldReturnTrue_whenAnyMatchingRowHasYes")
  void existsCommitmentYes_shouldReturnTrue_whenAnyMatchingRowHasYes() {
    Long requestSkey = 400L;

    RequestVeglot rv1 = new RequestVeglot();
    rv1.setRequestSkey(requestSkey);
    rv1.setItemId("A");
    rv1.setCommitmentInd("N");
    entityManager.persist(rv1);

    RequestVeglot rv2 = new RequestVeglot();
    rv2.setRequestSkey(requestSkey);
    rv2.setItemId("B");
    rv2.setCommitmentInd("Y");
    entityManager.persistAndFlush(rv2);

    assertTrue(requestVeglotRepository.existsCommitmentYes(requestSkey, "B"));
    assertFalse(requestVeglotRepository.existsCommitmentYes(requestSkey, "A"));
  }
}
