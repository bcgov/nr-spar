package ca.bc.gov.backendstartapi.repository.seedlot;

import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.backendstartapi.entity.MethodOfPaymentEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOwnerQuantity;
import ca.bc.gov.backendstartapi.entity.seedlot.idclass.SeedlotOwnerQuantityId;
import ca.bc.gov.backendstartapi.enums.SeedlotStatusEnum;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.GeneticWorthRepository;
import ca.bc.gov.backendstartapi.repository.MethodOfPaymentRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotOwnerQuantityRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.transaction.annotation.Transactional;

@DataJpaTest
@Transactional
class SeedlotOwnerQuantityJpaTest extends SeedlotEntityJpaTest {

  private final SeedlotOwnerQuantityRepository repository;
  private final MethodOfPaymentRepository methodOfPaymentRepository;

  @Autowired
  SeedlotOwnerQuantityJpaTest(
      SeedlotRepository seedlotRepository,
      GeneticClassRepository geneticClassRepository,
      SeedlotOwnerQuantityRepository seedlotOwnerQuantityRepository,
      GeneticWorthRepository geneticWorthRepository,
      MethodOfPaymentRepository methodOfPaymentRepository) {
    super(seedlotRepository, geneticClassRepository, geneticWorthRepository);
    repository = seedlotOwnerQuantityRepository;
    this.methodOfPaymentRepository = methodOfPaymentRepository;
  }

  @Test
  void create() {
    var seedlot = createSeedlot("00000", SeedlotStatusEnum.SUB);
    var seedlotOwnerQuantity = new SeedlotOwnerQuantity(seedlot, "00020", "21");

    LocalDate now = LocalDate.now();
    var effectiveDate = now.minusDays(2);
    var expiryDate = now.plusDays(2);
    var effectiveDateRange = new EffectiveDateRange(effectiveDate, expiryDate);

    var methodOfPayment =
        new MethodOfPaymentEntity("ITC", "Invoice to Client Address", effectiveDateRange);
    methodOfPaymentRepository.saveAndFlush(methodOfPayment);

    seedlotOwnerQuantity.setOriginalPercentageOwned(new BigDecimal(0));
    seedlotOwnerQuantity.setOriginalPercentageReserved(new BigDecimal(0));
    seedlotOwnerQuantity.setOriginalPercentageSurplus(new BigDecimal(0));
    seedlotOwnerQuantity.setMethodOfPayment(methodOfPayment);
    seedlotOwnerQuantity.setFundingSourceCode("ABC");
    seedlotOwnerQuantity.setAuditInformation(new AuditInformation("user1"));

    repository.saveAndFlush(seedlotOwnerQuantity);

    var savedSeedlotOwnerQuantity =
        repository.findById(
            new SeedlotOwnerQuantityId(
                seedlot.getId(),
                seedlotOwnerQuantity.getOwnerClientNumber(),
                seedlotOwnerQuantity.getOwnerLocationCode()));
    assertTrue(savedSeedlotOwnerQuantity.isPresent());
  }
}
