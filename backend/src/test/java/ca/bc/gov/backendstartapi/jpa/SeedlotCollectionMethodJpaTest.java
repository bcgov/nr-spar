package ca.bc.gov.backendstartapi.jpa;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionMethod;
import ca.bc.gov.backendstartapi.entity.seedlot.idclass.SeedlotCollectionMethodId;
import ca.bc.gov.backendstartapi.enums.SeedlotStatusEnum;
import ca.bc.gov.backendstartapi.repository.ConeCollectionMethodRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotCollectionMethodRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(classes = SeedlotCollectionMethodJpaTest.class)
class SeedlotCollectionMethodJpaTest extends SeedlotEntityJpaTest {

  private SeedlotCollectionMethodRepository seedlotCollectionMethodRepo;
  private ConeCollectionMethodRepository coneCollectionMethodRepo;

  @Autowired
  protected SeedlotCollectionMethodJpaTest(
      SeedlotRepository seedlotRepository,
      SeedlotCollectionMethodRepository seedlotCollectionMethodRepo,
      ConeCollectionMethodRepository coneCollectionMethodRepo) {
    super(seedlotRepository);
    this.seedlotCollectionMethodRepo = seedlotCollectionMethodRepo;
    this.coneCollectionMethodRepo = coneCollectionMethodRepo;
  }

  @Test
  void create() {
    LocalDate now = LocalDate.now();
    var effectiveDate = now.minusDays(2);
    var expiryDate = now.plusDays(2);
    var effectiveDateRange = new EffectiveDateRange(effectiveDate, expiryDate);
    var seedlot = createSeedlot("00000", SeedlotStatusEnum.SUB);
    var coneCollectionMethod =
        new ConeCollectionMethodEntity(999, "digging", effectiveDateRange, null);

    coneCollectionMethodRepo.saveAndFlush(coneCollectionMethod);

    var seedlotCollectionMethod = new SeedlotCollectionMethod(seedlot, coneCollectionMethod);
    seedlotCollectionMethod.setConeCollectionMethodDescription(
        coneCollectionMethod.getDescription());
    seedlotCollectionMethod.setAuditInformation(new AuditInformation("user1"));

    // Using saved here for debugging
    SeedlotCollectionMethod saved =
        seedlotCollectionMethodRepo.saveAndFlush(seedlotCollectionMethod);

    assertEquals(1, seedlotCollectionMethodRepo.count());

    var savedSeedlotCollectionMethod =
        seedlotCollectionMethodRepo.findById(
            new SeedlotCollectionMethodId(
                seedlot.getId(), coneCollectionMethod.getConeCollectionMethodCode()));
    assertTrue(savedSeedlotCollectionMethod.isPresent());
  }
}
