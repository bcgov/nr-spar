package ca.bc.gov.oracleapi.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.oracleapi.dto.SuperiorProvenanceDto;
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
@Sql(scripts = {"classpath:scripts/SuperiorProvenanceRepositoryTest.sql"})
class SuperiorProvenanceRepositoryTest {

  @Autowired private SuperiorProvenanceRepository superiorProvenanceRepository;

  @Test
  @DisplayName("findDtoById returns a current provenance")
  void findDtoById_current() {
    assertEquals(
        new SuperiorProvenanceDto(1, "FDC", "Current Provenance"),
        superiorProvenanceRepository.findDtoById(1).orElseThrow());
  }

  @Test
  @DisplayName("findDtoById also returns an expired provenance")
  void findDtoById_expired() {
    assertEquals(
        new SuperiorProvenanceDto(2, "FDC", "Expired Provenance"),
        superiorProvenanceRepository.findDtoById(2).orElseThrow());
  }

  @Test
  @DisplayName("findDtoById is empty for an unknown id")
  void findDtoById_unknown() {
    assertTrue(superiorProvenanceRepository.findDtoById(99).isEmpty());
  }

  @Test
  @DisplayName("findValidByVegetationCode still excludes expired provenances")
  void findValidByVegetationCode_excludesExpired() {
    List<SuperiorProvenanceDto> result =
        superiorProvenanceRepository.findValidByVegetationCode("FDC");
    assertEquals(List.of(new SuperiorProvenanceDto(1, "FDC", "Current Provenance")), result);
  }
}
