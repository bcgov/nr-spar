package ca.bc.gov.backendstartapi.repository.seedlot;

import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOrchard;
import ca.bc.gov.backendstartapi.entity.seedlot.idclass.SeedlotOrchardId;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.GeneticWorthRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotOrchardRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.transaction.annotation.Transactional;

@DataJpaTest
@Transactional
class SeedlotOrchardRelationalTest extends SeedlotEntityRelationalTest {

  private final SeedlotOrchardRepository repository;

  @Autowired
  protected SeedlotOrchardRelationalTest(
      SeedlotRepository seedlotRepository,
      GeneticClassRepository geneticClassRepository,
      SeedlotOrchardRepository seedlotOrchardRepository,
      GeneticWorthRepository geneticWorthRepository,
      SeedlotSourceRepository seedlotSourceRepository) {
    super(
        seedlotRepository, geneticClassRepository, geneticWorthRepository, seedlotSourceRepository);
    repository = seedlotOrchardRepository;
  }

  @Test
  void create() {
    var seedlot = createSeedlot("00000");
    var seedlotOrchard = new SeedlotOrchard(seedlot, false, "ABC");
    seedlotOrchard.setAuditInformation(new AuditInformation("user1"));

    repository.saveAndFlush(seedlotOrchard);

    var savedSeedlotOrchard = repository.findById(new SeedlotOrchardId(seedlot.getId(), false));
    assertTrue(savedSeedlotOrchard.isPresent());
  }
}
