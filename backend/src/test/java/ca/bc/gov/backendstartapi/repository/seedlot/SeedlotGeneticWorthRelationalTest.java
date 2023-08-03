package ca.bc.gov.backendstartapi.repository.seedlot;

import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.backendstartapi.entity.SeedlotGeneticWorth;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotGeneticWorthId;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.GeneticWorthRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotGeneticWorthRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.transaction.annotation.Transactional;

@DataJpaTest
@Transactional
class SeedlotGeneticWorthRelationalTest extends SeedlotEntityRelationalTest {

  private final SeedlotGeneticWorthRepository seedlotGeneticWorthRepository;

  @Autowired
  SeedlotGeneticWorthRelationalTest(
      SeedlotRepository seedlotRepository,
      GeneticClassRepository geneticClassRepository,
      GeneticWorthRepository geneticWorthRepository,
      SeedlotGeneticWorthRepository seedlotGeneticWorthRepository,
      SeedlotSourceRepository seedlotSourceRepository) {
    super(
        seedlotRepository, geneticClassRepository, geneticWorthRepository, seedlotSourceRepository);
    this.seedlotGeneticWorthRepository = seedlotGeneticWorthRepository;
  }

  @Test
  void create() {
    var seedlot = createSeedlot("00000");
    var geneticWorth = geneticWorthRepository.findAll().get(0);
    var seedlotGeneticWorth =
        new SeedlotGeneticWorth(seedlot, geneticWorth, new AuditInformation("user1"));
    seedlotGeneticWorth.setGeneticQualityValue(new BigDecimal(10));

    seedlotGeneticWorthRepository.saveAndFlush(seedlotGeneticWorth);

    var savedSeedlotGeneticWorth =
        seedlotGeneticWorthRepository.findById(
            new SeedlotGeneticWorthId(seedlot.getId(), geneticWorth.getGeneticWorthCode()));
    assertTrue(savedSeedlotGeneticWorth.isPresent());
  }
}
