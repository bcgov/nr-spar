package ca.bc.gov.backendstartapi.repository.seedlot;

import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.backendstartapi.entity.SeedlotGeneticWorth;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotGeneticWorthId;
import ca.bc.gov.backendstartapi.enums.GeneticWorthEnum;
import ca.bc.gov.backendstartapi.enums.SeedlotStatusEnum;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotGeneticWorthRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.transaction.annotation.Transactional;

@DataJpaTest
@Transactional
class SeedlotGeneticWorthTest extends SeedlotEntityJpaTest {

  private final SeedlotGeneticWorthRepository repository;

  @Autowired
  SeedlotGeneticWorthTest(
      SeedlotRepository seedlotRepository,
      GeneticClassRepository geneticClassRepository,
      SeedlotGeneticWorthRepository seedlotGeneticWorthRepository) {
    super(seedlotRepository, geneticClassRepository);
    repository = seedlotGeneticWorthRepository;
  }

  @Test
  void create() {
    var seedlot = createSeedlot("00000", SeedlotStatusEnum.SUB);
    var seedlotGeneticWorth =
        new SeedlotGeneticWorth(seedlot, GeneticWorthEnum.AD, new AuditInformation("user1"));
    seedlotGeneticWorth.setGeneticQualityValue(new BigDecimal(10));

    repository.saveAndFlush(seedlotGeneticWorth);

    var savedSeedlotGeneticWorth =
        repository.findById(
            new SeedlotGeneticWorthId(seedlot.getId(), seedlotGeneticWorth.getGeneticWorthCode()));
    assertTrue(savedSeedlotGeneticWorth.isPresent());
  }
}
