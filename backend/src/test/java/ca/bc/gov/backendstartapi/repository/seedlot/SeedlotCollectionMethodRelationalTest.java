package ca.bc.gov.backendstartapi.repository.seedlot;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionMethod;
import ca.bc.gov.backendstartapi.entity.seedlot.idclass.SeedlotCollectionMethodId;
import ca.bc.gov.backendstartapi.repository.ConeCollectionMethodRepository;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.GeneticWorthRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotCollectionMethodRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.transaction.annotation.Transactional;

@DataJpaTest
@Transactional
class SeedlotCollectionMethodRelationalTest extends SeedlotEntityRelationalTest {

  private final SeedlotCollectionMethodRepository seedlotCollectionMethodTestRepo;
  private final ConeCollectionMethodRepository coneCollectionMethodTestRepo;

  @Autowired
  protected SeedlotCollectionMethodRelationalTest(
      SeedlotRepository seedlotRepository,
      GeneticClassRepository geneticClassRepository,
      SeedlotCollectionMethodRepository seedlotCollectionMethodRepo,
      ConeCollectionMethodRepository coneCollectionMethodRepo,
      GeneticWorthRepository geneticWorthRepository,
      SeedlotSourceRepository seedlotSourceRepository) {
    super(
        seedlotRepository, geneticClassRepository, geneticWorthRepository, seedlotSourceRepository);
    seedlotCollectionMethodTestRepo = seedlotCollectionMethodRepo;
    coneCollectionMethodTestRepo = coneCollectionMethodRepo;
  }

  @Test
  void create() {
    LocalDate now = LocalDate.now();
    var effectiveDate = now.minusDays(2);
    var expiryDate = now.plusDays(2);
    var effectiveDateRange = new EffectiveDateRange(effectiveDate, expiryDate);
    var seedlot = createSeedlot("00000");
    var coneCollectionMethod = new ConeCollectionMethodEntity(999, "digging", effectiveDateRange);

    coneCollectionMethodTestRepo.saveAndFlush(coneCollectionMethod);

    var seedlotCollectionMethod = new SeedlotCollectionMethod(seedlot, coneCollectionMethod);
    // seedlotCollectionMethod.setSeedlot(seedlot);
    // seedlotCollectionMethod.setConeCollectionMethod(coneCollectionMethod);
    seedlotCollectionMethod.setConeCollectionMethodOtherDescription(
        coneCollectionMethod.getDescription());
    seedlotCollectionMethod.setAuditInformation(new AuditInformation());
    seedlotCollectionMethod.getAuditInformation().setEntryUserId("userId");
    seedlotCollectionMethod.getAuditInformation().setUpdateUserId("userId");

    seedlotCollectionMethodTestRepo.saveAndFlush(seedlotCollectionMethod);

    assertEquals(1, seedlotCollectionMethodTestRepo.count());

    var savedSeedlotCollectionMethod =
        seedlotCollectionMethodTestRepo.findById(
            new SeedlotCollectionMethodId(
                seedlot.getId(), coneCollectionMethod.getConeCollectionMethodCode()));
    assertTrue(savedSeedlotCollectionMethod.isPresent());
  }
}
