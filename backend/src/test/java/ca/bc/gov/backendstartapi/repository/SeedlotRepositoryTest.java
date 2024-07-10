package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.extension.AbstractTestContainerIntegrationTest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.test.context.jdbc.Sql;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@DisplayName("Repository Test | Seedlot")
@Sql(scripts = {"classpath:sql_scripts/SeedlotRepositoryTest.sql"})
class SeedlotRepositoryTest extends AbstractTestContainerIntegrationTest {

  @Autowired private SeedlotRepository seedlotRepository;

  @Test
  @DisplayName("findNextSeedlotNumberTest")
  void findNextSeedlotNumberTest() {
    Integer nextNumberA = seedlotRepository.findNextSeedlotNumber(63000, 65000);
    Assertions.assertNotNull(nextNumberA);
    Assertions.assertEquals(63000, nextNumberA);
  }

  @Test
  @DisplayName("findAllByApplicantClientNumberTest")
  void findAllByApplicantClientNumberTest() {
    Pageable sortedPageable =
        PageRequest.of(0, 10, Sort.by(Direction.DESC, "AuditInformation_UpdateTimestamp"));
    Page<Seedlot> page =
        seedlotRepository.findAllByApplicantClientNumber("00012797", sortedPageable);

    Assertions.assertNotNull(page);
    Assertions.assertFalse(page.isEmpty());
    Assertions.assertEquals(1, page.getContent().size());
  }
}
