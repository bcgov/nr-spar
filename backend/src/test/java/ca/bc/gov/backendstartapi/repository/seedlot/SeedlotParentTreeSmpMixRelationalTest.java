package ca.bc.gov.backendstartapi.repository.seedlot;

import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeSmpMix;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeId;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeSmpMixId;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.GeneticWorthRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeSmpMixRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.transaction.annotation.Transactional;

@DataJpaTest
@Transactional
class SeedlotParentTreeSmpMixRelationalTest extends SeedlotEntityRelationalTest {

  private final SeedlotParentTreeRepository seedlotParentTreeRepository;

  private final SeedlotParentTreeSmpMixRepository seedlotParentTreeSmpMixRepository;

  @Autowired
  SeedlotParentTreeSmpMixRelationalTest(
      SeedlotRepository seedlotRepository,
      GeneticClassRepository geneticClassRepository,
      SeedlotParentTreeRepository seedlotParentTreeRepository,
      SeedlotParentTreeSmpMixRepository seedlotParentTreeSmpMixRepository,
      GeneticWorthRepository geneticWorthRepository,
      SeedlotSourceRepository seedlotSourceRepository) {
    super(
        seedlotRepository, geneticClassRepository, geneticWorthRepository, seedlotSourceRepository);
    this.seedlotParentTreeRepository = seedlotParentTreeRepository;
    this.seedlotParentTreeSmpMixRepository = seedlotParentTreeSmpMixRepository;
  }

  @Test
  void create() {
    var seedlot = createSeedlot("00000");
    var seedlotParentTree =
        new SeedlotParentTree(
            seedlot, 1, new BigDecimal(10), new BigDecimal(10), new AuditInformation("user1"));
    seedlotParentTree.setSmpSuccessPercentage(1);
    seedlotParentTree.setNonOrchardPollenContaminationCount(1);

    var savedSeedlotParentTree = seedlotParentTreeRepository.save(seedlotParentTree);
    var geneticWorth = geneticWorthRepository.findAll().get(0);

    var seedlotParentTreeSmpMix =
        new SeedlotParentTreeSmpMix(
            seedlotParentTree,
            "GC",
            geneticWorth,
            new BigDecimal(10),
            new AuditInformation("user1"));

    seedlotParentTreeSmpMixRepository.saveAndFlush(seedlotParentTreeSmpMix);

    var savedSeedlotParentTreeSmpMix =
        seedlotParentTreeSmpMixRepository.findById(
            new SeedlotParentTreeSmpMixId(
                new SeedlotParentTreeId(seedlot.getId(), savedSeedlotParentTree.getParentTreeId()),
                seedlotParentTreeSmpMix.getGeneticTypeCode(),
                seedlotParentTreeSmpMix.getGeneticWorth().getGeneticWorthCode()));
    assertTrue(savedSeedlotParentTreeSmpMix.isPresent());
  }
}
