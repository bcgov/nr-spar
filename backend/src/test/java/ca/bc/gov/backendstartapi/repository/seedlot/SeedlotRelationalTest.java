package ca.bc.gov.backendstartapi.repository.seedlot;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.GeneticWorthRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.transaction.annotation.Transactional;

@DataJpaTest
@Transactional
@DisplayName("Relational Test | Seedlot")
class SeedlotRelationalTest extends SeedlotEntityRelationalTest {
  @Autowired
  SeedlotRelationalTest(
      SeedlotRepository seedlotRepository,
      GeneticClassRepository geneticClassRepository,
      GeneticWorthRepository geneticWorthRepository,
      SeedlotSourceRepository seedlotSourceRepository) {
    super(
        seedlotRepository, geneticClassRepository, geneticWorthRepository, seedlotSourceRepository);
  }

  @Test
  void create() {
    var savedSeedlot = createSeedlot("00000");
    var audit = savedSeedlot.getAuditInformation();

    assertEquals("user1", audit.getEntryUserId());
    assertEquals("user1", audit.getUpdateUserId());
    assertNotNull(audit.getEntryTimestamp());
    assertEquals(audit.getEntryTimestamp(), audit.getUpdateTimestamp());
    assertTrue(audit.getEntryTimestamp().until(LocalDateTime.now(), ChronoUnit.SECONDS) < 5);
    assertEquals(0, savedSeedlot.getRevisionCount());
  }

  @Test
  void update() {
    var savedSeedlot = createSeedlot("00000");
    var auditInfo = savedSeedlot.getAuditInformation();

    final var entryUserId = auditInfo.getEntryUserId();
    final var entryTimestamp = auditInfo.getEntryTimestamp();
    final var updateUserId = auditInfo.getUpdateUserId();
    final var updateTimestamp = auditInfo.getUpdateTimestamp();
    final var revisionCount = savedSeedlot.getRevisionCount();

    var newUpdateUserId = updateUserId + 1;
    auditInfo.setUpdateUserId(newUpdateUserId);

    var newSavedSeedlot = seedlotRepository.saveAndFlush(savedSeedlot);

    var newAuditInfo = newSavedSeedlot.getAuditInformation();
    assertEquals(entryUserId, newAuditInfo.getEntryUserId());
    assertEquals(entryTimestamp, newAuditInfo.getEntryTimestamp());
    assertEquals(newUpdateUserId, newAuditInfo.getUpdateUserId());
    assertTrue(updateTimestamp.isBefore(newAuditInfo.getUpdateTimestamp()));
    assertTrue(
        newAuditInfo.getUpdateTimestamp().until(LocalDateTime.now(), ChronoUnit.SECONDS) < 5);
    assertEquals(revisionCount + 1, newSavedSeedlot.getRevisionCount());
  }
}
