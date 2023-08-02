package ca.bc.gov.backendstartapi.repository.seedlot;

import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeSmpMix;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeId;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeSmpMixId;
import ca.bc.gov.backendstartapi.enums.GeneticWorthEnum;
import ca.bc.gov.backendstartapi.enums.SeedlotStatusEnum;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeSmpMixRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.transaction.annotation.Transactional;

@DataJpaTest
@Transactional
class SeedlotParentTreeSmpMixJpaTest extends SeedlotEntityJpaTest {

  private final SeedlotParentTreeRepository seedlotParentTreeRepository;

  private final SeedlotParentTreeSmpMixRepository repository;

  @Autowired
  SeedlotParentTreeSmpMixJpaTest(
      SeedlotRepository seedlotRepository,
      GeneticClassRepository geneticClassRepository,
      SeedlotParentTreeRepository seedlotParentTreeRepository,
      SeedlotParentTreeSmpMixRepository seedlotParentTreeSmpMixRepository) {
    super(seedlotRepository, geneticClassRepository);
    this.seedlotParentTreeRepository = seedlotParentTreeRepository;
    repository = seedlotParentTreeSmpMixRepository;
  }

  @Test
  void create() {
    var seedlot = createSeedlot("00000", SeedlotStatusEnum.SUB);
    var seedlotParentTree =
        new SeedlotParentTree(
            seedlot, 1, new BigDecimal(10), new BigDecimal(10), new AuditInformation("user1"));
    seedlotParentTree.setSmpSuccessPercentage(1);
    seedlotParentTree.setNonOrchardPollenContaminationCount(1);

    var savedSeedlotParentTree = seedlotParentTreeRepository.save(seedlotParentTree);

    var seedlotParentTreeSmpMix =
        new SeedlotParentTreeSmpMix(
            seedlotParentTree,
            "GC",
            GeneticWorthEnum.AD,
            new BigDecimal(10),
            new AuditInformation("user1"));

    repository.saveAndFlush(seedlotParentTreeSmpMix);

    var savedSeedlotParentTreeSmpMix =
        repository.findById(
            new SeedlotParentTreeSmpMixId(
                new SeedlotParentTreeId(seedlot.getId(), savedSeedlotParentTree.getParentTreeId()),
                seedlotParentTreeSmpMix.getGeneticTypeCode(),
                seedlotParentTreeSmpMix.getGeneticWorthCode()));
    assertTrue(savedSeedlotParentTreeSmpMix.isPresent());
  }
}
