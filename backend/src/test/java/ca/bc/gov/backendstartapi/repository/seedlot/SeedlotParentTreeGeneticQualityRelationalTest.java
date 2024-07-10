package ca.bc.gov.backendstartapi.repository.seedlot;

import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.backendstartapi.entity.SeedlotParentTree;
import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeGeneticQuality;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeGeneticQualityId;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeId;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.GeneticWorthRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeGeneticQualityRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotParentTreeRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.transaction.annotation.Transactional;

@DataJpaTest
@Transactional
@DisplayName("Relational Test | Seedlot Parent Tree Genetic Quality")
class SeedlotParentTreeGeneticQualityRelationalTest extends SeedlotEntityRelationalTest {

  private final SeedlotParentTreeRepository seedlotParentTreeRepository;

  private final SeedlotParentTreeGeneticQualityRepository seedlotParentTreeGeneticQualityRepository;

  @Autowired
  SeedlotParentTreeGeneticQualityRelationalTest(
      SeedlotRepository seedlotRepository,
      GeneticClassRepository geneticClassRepository,
      SeedlotParentTreeRepository seedlotParentTreeRepository,
      GeneticWorthRepository geneticWorthRepository,
      SeedlotParentTreeGeneticQualityRepository seedlotParentTreeGeneticQualityRepository,
      SeedlotSourceRepository seedlotSourceRepository) {
    super(
        seedlotRepository, geneticClassRepository, geneticWorthRepository, seedlotSourceRepository);
    this.seedlotParentTreeRepository = seedlotParentTreeRepository;
    this.seedlotParentTreeGeneticQualityRepository = seedlotParentTreeGeneticQualityRepository;
  }

  @Test
  void create() {
    var seedlot = createSeedlot("00000");
    var seedlotParentTree =
        new SeedlotParentTree(
            seedlot, 1, "1", new BigDecimal(10), new BigDecimal(10), new AuditInformation("user1"));
    seedlotParentTree.setSmpSuccessPercentage(1);
    seedlotParentTree.setNonOrchardPollenContaminationCount(1);

    var savedSeedlotParentTree = seedlotParentTreeRepository.save(seedlotParentTree);

    var geneticWorth = geneticWorthRepository.findAll().get(0);

    var seedlotParentTreeGeneticQuality =
        new SeedlotParentTreeGeneticQuality(
            seedlotParentTree,
            "GC",
            geneticWorth,
            new BigDecimal(10),
            new AuditInformation("user1"));
    seedlotParentTreeGeneticQuality.setQualityValueEstimated(true);

    seedlotParentTreeGeneticQualityRepository.saveAndFlush(seedlotParentTreeGeneticQuality);

    var savedSeedlotParentTreeGeneticQuality =
        seedlotParentTreeGeneticQualityRepository.findById(
            new SeedlotParentTreeGeneticQualityId(
                new SeedlotParentTreeId(seedlot.getId(), savedSeedlotParentTree.getParentTreeId()),
                seedlotParentTreeGeneticQuality.getGeneticTypeCode(),
                seedlotParentTreeGeneticQuality.getGeneticWorth().getGeneticWorthCode()));
    assertTrue(savedSeedlotParentTreeGeneticQuality.isPresent());
  }
}
