package ca.bc.gov.oracleapi.repository.consep;

import static org.assertj.core.api.Assertions.assertThat;

import ca.bc.gov.oracleapi.entity.consep.SparRequestEntity;
import ca.bc.gov.oracleapi.entity.projection.RequestSeedlotProj;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.TestPropertySource;

/**
 * The request item is not stored -- it is assembled in the query from the request type, a year, a
 * sequence and (for SRQ) the org unit code. That assembly is the whole of the SRQ / non-SRQ rule,
 * so it can only be verified against a database.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:sparrequestrepositorytestdb;"
    + "MODE=Oracle;"
    + "DB_CLOSE_DELAY=-1",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.sql.init.mode=always",
    "spring.sql.init.schema-locations=classpath:schema-consep-only.sql"
})
class SparRequestRepositoryTest {

  @Autowired
  private SparRequestRepository sparRequestRepository;

  @Autowired
  private TestEntityManager entityManager;

  private void persistRequest(
      long requestSkey, String requestTypeSt, Integer sowingYr, Integer requestYr,
      Integer requestSequence, Long orgUnitNo) {
    SparRequestEntity request = new SparRequestEntity();
    request.setRequestSkey(BigDecimal.valueOf(requestSkey));
    request.setRequestTypeSt(requestTypeSt);
    request.setSowingYr(sowingYr);
    request.setRequestYr(requestYr);
    request.setRequestSequence(requestSequence);
    request.setOrgUnitNo(orgUnitNo);
    entityManager.persist(request);
  }

  /** No entity maps these, so Hibernate does not create them and JPA cannot write to them. */
  private void insertNonEntityRow(String sql, Object... params) {
    var query = entityManager.getEntityManager().createNativeQuery(sql);
    for (int i = 0; i < params.length; i++) {
      query.setParameter(i + 1, params[i]);
    }
    query.executeUpdate();
  }

  private void persistRequestSeedlot(long requestSkey, String itemId, String seedlotNumber) {
    insertNonEntityRow(
        "INSERT INTO CONSEP.CNS_T_REQUEST_SEEDLOT (REQUEST_SKEY, ITEM_ID, SEEDLOT_NUMBER)"
            + " VALUES (?1, ?2, ?3)",
        BigDecimal.valueOf(requestSkey), itemId, seedlotNumber);
  }

  private void persistSeedlot(String seedlotNumber, String vegetationSt) {
    insertNonEntityRow(
        "INSERT INTO CONSEP.CNS_T_SEEDLOT (SEEDLOT_NUMBER, VEGETATION_ST) VALUES (?1, ?2)",
        seedlotNumber, vegetationSt);
  }

  private void persistOrgUnit(long orgUnitNo, String orgUnitCode) {
    insertNonEntityRow(
        "INSERT INTO CONSEP.CNS_T_ORG_UNIT (ORG_UNIT_NO, ORG_UNIT_CODE) VALUES (?1, ?2)",
        BigDecimal.valueOf(orgUnitNo), orgUnitCode);
  }

  @Test
  void findBySeedlotAndRequestId_nonSrq_buildsTypeYearSequenceThenItemId() {
    persistRequest(1L, "TST", null, 2026, 1, null);
    persistRequestSeedlot(1L, "A", "00098");
    persistSeedlot("00098", "SX");
    entityManager.flush();

    // 'TST' || '2026' || '0001' truncated to 11, then the item id appended.
    Optional<RequestSeedlotProj> found =
        sparRequestRepository.findBySeedlotNumberAndRequestId("00098", "TST20260001A");

    assertThat(found).isPresent();
    assertThat(found.get().getRequestItem()).isEqualTo("TST20260001A");
    assertThat(found.get().getRequestSkey()).isEqualByComparingTo(BigDecimal.ONE);
    assertThat(found.get().getItemId()).isEqualTo("A");
    assertThat(found.get().getSeedlotNumber()).isEqualTo("00098");
    assertThat(found.get().getVegetationSt()).isEqualTo("SX");
  }

  @Test
  void findBySeedlotAndRequestId_srq_buildsSowingYearOrgUnitAndSequence() {
    persistOrgUnit(17L, "MOF123");
    persistRequest(2L, "SRQ", 2026, null, 42, 17L);
    persistRequestSeedlot(2L, "B", "00099");
    persistSeedlot("00099", "PLI");
    entityManager.flush();

    // '2026' || 'MOF' (first three of the org unit code) || '0042'. No item id:
    // an SRQ request item is the whole twelve-character string on its own.
    Optional<RequestSeedlotProj> found =
        sparRequestRepository.findBySeedlotNumberAndRequestId("00099", "2026MOF0042");

    assertThat(found).isPresent();
    assertThat(found.get().getRequestItem()).isEqualTo("2026MOF0042");
    assertThat(found.get().getItemId()).isEqualTo("B");
    assertThat(found.get().getVegetationSt()).isEqualTo("PLI");
  }

  // The two branches must not be interchangeable: an SRQ request must not be
  // findable under the non-SRQ spelling of the same numbers, or the copy would
  // land on a request item the user never typed.
  @Test
  void findBySeedlotAndRequestId_srqIsNotFoundUnderTheNonSrqFormat() {
    persistOrgUnit(17L, "MOF123");
    persistRequest(3L, "SRQ", 2026, 2026, 42, 17L);
    persistRequestSeedlot(3L, "A", "00100");
    persistSeedlot("00100", "SX");
    entityManager.flush();

    assertThat(sparRequestRepository.findBySeedlotNumberAndRequestId("00100", "SRQ20260042A"))
        .isEmpty();
  }

  @Test
  void findBySeedlotAndRequestId_returnsEmptyWhenTheSeedlotIsNotOnThatRequest() {
    persistRequest(4L, "TST", null, 2026, 1, null);
    persistRequestSeedlot(4L, "A", "00098");
    persistSeedlot("00098", "SX");
    entityManager.flush();

    assertThat(sparRequestRepository.findBySeedlotNumberAndRequestId("00777", "TST20260001A"))
        .isEmpty();
  }
}
