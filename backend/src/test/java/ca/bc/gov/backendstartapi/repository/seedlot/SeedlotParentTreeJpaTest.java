package ca.bc.gov.backendstartapi.repository.seedlot;

import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeId;
import ca.bc.gov.backendstartapi.enums.SeedlotStatusEnum;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.GeneticWorthRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.transaction.annotation.Transactional;

@DataJpaTest
@Transactional
class SeedlotParentTreeJpaTest extends SeedlotEntityJpaTest {

  private final SeedlotParentTreeRepository repository;

  @Autowired
  SeedlotParentTreeJpaTest(
      SeedlotRepository seedlotRepository,
      GeneticClassRepository geneticClassRepository,
      SeedlotParentTreeRepository seedlotParentTreeRepository,
      GeneticWorthRepository geneticWorthRepository) {
    super(seedlotRepository, geneticClassRepository, geneticWorthRepository);
    this.repository = seedlotParentTreeRepository;
  }

  @Test
  void create() {
    var seedlot = createSeedlot("00000", SeedlotStatusEnum.SUB);
    var seedlotParentTree =
        new SeedlotParentTree(
            seedlot, 1, new BigDecimal(10), new BigDecimal(10), new AuditInformation("user1"));
    seedlotParentTree.setSmpSuccessPercentage(1);
    seedlotParentTree.setNonOrchardPollenContaminationCount(1);

    repository.saveAndFlush(seedlotParentTree);

    var savedSeedlotParentTree = repository.findById(new SeedlotParentTreeId(seedlot.getId(), 1));
    assertTrue(savedSeedlotParentTree.isPresent());
  }
}
