package ca.bc.gov.backendstartapi.jpa;

import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.backendstartapi.entity.SmpMix;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.idclass.SmpMixId;
import ca.bc.gov.backendstartapi.enums.SeedlotStatusEnum;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SmpMixRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.transaction.annotation.Transactional;

@DataJpaTest
@Transactional
class SmpMixJpaTest extends SeedlotEntityJpaTest {

  private final SmpMixRepository repository;

  @Autowired
  SmpMixJpaTest(SeedlotRepository seedlotRepository, SmpMixRepository smpMixRepository) {
    super(seedlotRepository);
    repository = smpMixRepository;
  }

  @Test
  void create() {
    var seedlot = createSeedlot("00000", SeedlotStatusEnum.SUB);
    var smpMix = new SmpMix(seedlot, 1, 1, null, new AuditInformation("user1"), 0);
    smpMix.setProportion(new BigDecimal(10));

    repository.saveAndFlush(smpMix);

    var savedSmpMix = repository.findById(new SmpMixId(seedlot.getId(), 1));
    assertTrue(savedSmpMix.isPresent());
  }
}
