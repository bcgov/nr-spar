package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.RequestSeedlot;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.ANY)
class RequestSeedlotRepositoryTest {

  @Autowired private TestEntityManager entityManager;
  @Autowired private RequestSeedlotRepository requestSeedlotRepository;

  @Test
  @DisplayName("getCommitment_shouldReturnCommitmentInd_whenMatchingRowExists")
  void getCommitment_shouldReturnCommitmentInd_whenMatchingRowExists() {
    Long requestSkey = 100L;
    String itemId = "1";

    RequestSeedlot rs = new RequestSeedlot();

    rs.setRequestSkey(requestSkey);
    rs.setItemId(itemId);
    rs.setCommitmentInd("Y");

    entityManager.persistAndFlush(rs);

    String result = requestSeedlotRepository.getCommitment(requestSkey, itemId);

    assertEquals("Y", result);
  }

  @Test
  @DisplayName("getCommitment_shouldReturnNull_whenNoMatchingRow")
  void getCommitment_shouldReturnNull_whenNoMatchingRow() {
    RequestSeedlot rs = new RequestSeedlot();

    rs.setRequestSkey(200L);
    rs.setItemId("999");
    rs.setCommitmentInd("Y");
    entityManager.persistAndFlush(rs);

    String result = requestSeedlotRepository.getCommitment(200L, "1"); // itemId 不匹配

    assertNull(result);
  }

  @Test
  @DisplayName("getCommitment_shouldReturnCorrectRow_whenMultipleRowsExist")
  void getCommitment_shouldReturnCorrectRow_whenMultipleRowsExist() {
    RequestSeedlot rsA = new RequestSeedlot();

    rsA.setRequestSkey(300L);
    rsA.setItemId("1");
    rsA.setCommitmentInd("N");
    entityManager.persist(rsA);

    RequestSeedlot rsB = new RequestSeedlot();

    rsB.setRequestSkey(300L);
    rsB.setItemId("2");
    rsB.setCommitmentInd("Y");
    entityManager.persistAndFlush(rsB);

    String result = requestSeedlotRepository.getCommitment(300L, "2");

    assertEquals("Y", result);
  }
}
