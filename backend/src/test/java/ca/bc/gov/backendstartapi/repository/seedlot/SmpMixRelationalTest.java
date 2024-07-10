package ca.bc.gov.backendstartapi.repository.seedlot;

import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.backendstartapi.entity.SmpMix;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.idclass.SmpMixId;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.GeneticWorthRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import ca.bc.gov.backendstartapi.repository.SmpMixRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.transaction.annotation.Transactional;

@DataJpaTest
@Transactional
@DisplayName("Relational Test | Smp Mix")
class SmpMixRelationalTest extends SeedlotEntityRelationalTest {

  private final SmpMixRepository repository;

  @Autowired
  SmpMixRelationalTest(
      SeedlotRepository seedlotRepository,
      GeneticClassRepository geneticClassRepository,
      SmpMixRepository smpMixRepository,
      GeneticWorthRepository geneticWorthRepository,
      SeedlotSourceRepository seedlotSourceRepository) {
    super(
        seedlotRepository, geneticClassRepository, geneticWorthRepository, seedlotSourceRepository);
    repository = smpMixRepository;
  }

  @Test
  void create() {
    var seedlot = createSeedlot("00000");
    var smpMix = new SmpMix(seedlot, 1, "1", 1, null, new AuditInformation("user1"), 0);
    smpMix.setProportion(new BigDecimal(10));

    repository.saveAndFlush(smpMix);

    var savedSmpMix = repository.findById(new SmpMixId(seedlot.getId(), 1));
    assertTrue(savedSmpMix.isPresent());
  }
}
