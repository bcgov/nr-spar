package ca.bc.gov.oracleapi.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.oracleapi.entity.TransferLimitEntity;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.jdbc.Sql;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@Sql(scripts = {"classpath:scripts/TransferLimitRepositoryTest.sql"})
class TransferLimitRepositoryTest {

  @Autowired private TransferLimitRepository transferLimitRepository;

  private List<Long> skeys(List<TransferLimitEntity> limits) {
    return limits.stream().map(TransferLimitEntity::getTransferLimitSkey).toList();
  }

  @Test
  @DisplayName("No criteria returns every row, rows with values before rows with nulls")
  void search_noCriteria() {
    assertEquals(
        List.of(2L, 3L, 4L, 9L, 7L, 5L, 6L, 1L, 8L),
        skeys(transferLimitRepository.search(null, null, null, null, null, null, false)));
  }

  @Test
  @DisplayName("Exact match excludes rows with a null vegetation code")
  void search_exactMatch() {
    assertEquals(
        List.of(2L),
        skeys(transferLimitRepository.search("FDC", "B", false, "C", "M", null, false)));
  }

  @Test
  @DisplayName("Superior provenance true selects the B+ row")
  void search_superiorProvenance() {
    assertEquals(
        List.of(3L),
        skeys(transferLimitRepository.search("FDC", "B", true, "C", "M", null, false)));
  }

  @Test
  @DisplayName("includeNullMatches also returns all-species rows")
  void search_includeNullVegetationCode() {
    assertEquals(
        List.of(2L, 1L),
        skeys(transferLimitRepository.search("FDC", "B", false, "C", "M", null, true)));
  }

  @Test
  @DisplayName("includeNullMatches also returns all-zone rows, zone-specific first")
  void search_includeNullSeedPlanZone() {
    assertEquals(
        List.of(7L, 5L, 8L),
        skeys(transferLimitRepository.search("FDI", "B", false, "I", "EK", 50, true)));
  }

  @Test
  @DisplayName("includeNullMatches also returns rows with a null superior provenance flag")
  void search_includeNullSuperiorProvenance() {
    assertEquals(
        List.of(4L, 9L, 8L),
        skeys(transferLimitRepository.search("FDC", null, false, "I", null, null, true)));
  }

  @Test
  @DisplayName("Latitude matches rows whose site band contains it")
  void search_latitude() {
    assertEquals(
        List.of(6L),
        skeys(transferLimitRepository.search("FDI", null, null, null, null, 53, false)));
    assertTrue(
        transferLimitRepository.search("FDI", null, null, null, null, 61, false).isEmpty());
  }
}
