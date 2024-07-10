package ca.bc.gov.backendstartapi.repository.seedlot;

import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeId;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.GeneticWorthRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotStatusRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
@DisplayName("Relational Test | Seedlot Parent Tree")
class SeedlotParentTreeRelationalTest extends SeedlotEntityRelationalTest {

  private final SeedlotParentTreeRepository repository;

  @Autowired
  SeedlotParentTreeRelationalTest(
      SeedlotRepository seedlotRepository,
      GeneticClassRepository geneticClassRepository,
      SeedlotParentTreeRepository seedlotParentTreeRepository,
      GeneticWorthRepository geneticWorthRepository,
      SeedlotSourceRepository seedlotSourceRepository,
      SeedlotStatusRepository seedlotStatusRepository
  ) {
    super(
        seedlotRepository, geneticClassRepository, geneticWorthRepository, seedlotSourceRepository, seedlotStatusRepository);
    this.repository = seedlotParentTreeRepository;
  }

  @Test
  void create() {
    var seedlot = createSeedlot("00000");
    var seedlotParentTree =
        new SeedlotParentTree(
            seedlot, 1, "1", new BigDecimal(10), new BigDecimal(10), new AuditInformation("user1"));
    seedlotParentTree.setSmpSuccessPercentage(1);
    seedlotParentTree.setNonOrchardPollenContaminationCount(1);

    repository.saveAndFlush(seedlotParentTree);

    var savedSeedlotParentTree = repository.findById(new SeedlotParentTreeId(seedlot.getId(), 1));
    assertTrue(savedSeedlotParentTree.isPresent());
  }
}
