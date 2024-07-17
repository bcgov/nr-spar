package ca.bc.gov.backendstartapi.repository.seedlot;

import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.backendstartapi.entity.SmpMix;
import ca.bc.gov.backendstartapi.entity.SmpMixGeneticQuality;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.idclass.SmpMixGeneticQualityId;
import ca.bc.gov.backendstartapi.entity.idclass.SmpMixId;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.GeneticWorthRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import ca.bc.gov.backendstartapi.repository.SmpMixGeneticQualityRepository;
import ca.bc.gov.backendstartapi.repository.SmpMixRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.transaction.annotation.Transactional;

@DataJpaTest
@Transactional
class SmpMixGeneticQualityRelationalTest extends SeedlotEntityRelationalTest {

  private final SmpMixRepository smpMixRepository;

  private final SmpMixGeneticQualityRepository repository;

  @Autowired
  SmpMixGeneticQualityRelationalTest(
      SeedlotRepository seedlotRepository,
      GeneticClassRepository geneticClassRepository,
      SmpMixRepository smpMixRepository,
      SmpMixGeneticQualityRepository smpMixGeneticQualityRepository,
      GeneticWorthRepository geneticWorthRepository,
      SeedlotSourceRepository seedlotSourceRepository) {
    super(
        seedlotRepository, geneticClassRepository, geneticWorthRepository, seedlotSourceRepository);
    this.smpMixRepository = smpMixRepository;
    repository = smpMixGeneticQualityRepository;
  }

  @Test
  void create() {
    var seedlot = createSeedlot("00000");
    var smpMix = new SmpMix(seedlot, 1, "1", 1, null, new AuditInformation(), 0);
    smpMix.setProportion(new BigDecimal(10));
    smpMix.getAuditInformation().setEntryUserId("userId");
    smpMix.getAuditInformation().setUpdateUserId("userId");

    var geneticWorth = geneticWorthRepository.findAll().get(0);

    var smpMixGeneticQuality =
        new SmpMixGeneticQuality(
            smpMix, "GC", geneticWorth, new BigDecimal(10), true, new AuditInformation(), 0);
    smpMixGeneticQuality.getAuditInformation().setEntryUserId("userId");
    smpMixGeneticQuality.getAuditInformation().setUpdateUserId("userId");

    var savedSmpMix = smpMixRepository.save(smpMix);

    repository.saveAndFlush(smpMixGeneticQuality);

    var savedSmpMixGeneticQuality =
        repository.findById(
            new SmpMixGeneticQualityId(
                new SmpMixId(seedlot.getId(), savedSmpMix.getParentTreeId()),
                smpMixGeneticQuality.getGeneticTypeCode(),
                smpMixGeneticQuality.getGeneticWorth().getGeneticWorthCode()));
    assertTrue(savedSmpMixGeneticQuality.isPresent());
  }
}
