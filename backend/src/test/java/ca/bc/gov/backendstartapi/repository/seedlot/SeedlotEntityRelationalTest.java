package ca.bc.gov.backendstartapi.repository.seedlot;

import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotSourceEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.extension.AbstractTestContainerIntegrationTest;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import ca.bc.gov.backendstartapi.repository.GeneticWorthRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;

abstract class SeedlotEntityRelationalTest extends AbstractTestContainerIntegrationTest {

  protected SeedlotRepository seedlotRepository;
  protected GeneticClassRepository geneticClassRepository;
  protected GeneticWorthRepository geneticWorthRepository;
  protected SeedlotSourceRepository seedlotSourceRepository;

  protected SeedlotEntityRelationalTest(
      SeedlotRepository seedlotRepository,
      GeneticClassRepository geneticClassRepository,
      GeneticWorthRepository geneticWorthRepository,
      SeedlotSourceRepository seedlotSourceRepository) {
    this.seedlotRepository = seedlotRepository;
    this.geneticClassRepository = geneticClassRepository;
    this.geneticWorthRepository = geneticWorthRepository;
    this.seedlotSourceRepository = seedlotSourceRepository;
  }

  protected Seedlot createSeedlot(String id) {
    LocalDate now = LocalDate.now();
    var effectiveDate = now.minusDays(2);
    var nonExpiryDate = now.plusDays(2);
    var effectiveDateRange = new EffectiveDateRange(effectiveDate, nonExpiryDate);

    var geneticClass = new GeneticClassEntity("V", "V for vendetta", effectiveDateRange);
    geneticClassRepository.saveAndFlush(geneticClass);

    var geneticWorth =
        new GeneticWorthEntity("AD", "Animal browse resistance (deer)", effectiveDateRange);
    geneticWorthRepository.saveAndFlush(geneticWorth);

    var seedlotSource = new SeedlotSourceEntity("CUS", "Custom Lot", effectiveDateRange, null);
    seedlotSourceRepository.saveAndFlush(seedlotSource);

    var seedlot = new Seedlot(id);

    seedlot.setComment("A seedlot.");
    seedlot.setApplicantClientNumber("00000001");
    seedlot.setApplicantLocationCode("02");
    seedlot.setApplicantEmailAddress("applicant@email.com");

    seedlot.setVegetationCode("VEG");
    seedlot.setGeneticClass(geneticClass);
    seedlot.setSeedlotSource(seedlotSource);
    seedlot.setIntendedForCrownLand(true);
    seedlot.setSourceInBc(true);

    seedlot.setCollectionClientNumber("00000003");
    seedlot.setCollectionLocationCode("04");
    seedlot.setCollectionStartDate(LocalDateTime.now());
    seedlot.setCollectionEndDate(LocalDateTime.now());
    seedlot.setNumberOfContainers(new BigDecimal(10));
    seedlot.setContainerVolume(new BigDecimal(20));
    seedlot.setTotalConeVolume(new BigDecimal(200));

    seedlot.setInterimStorageClientNumber("00000005");
    seedlot.setInterimStorageLocationCode("06");
    seedlot.setInterimStorageStartDate(LocalDateTime.now());
    seedlot.setInterimStorageEndDate(LocalDateTime.now());
    seedlot.setInterimStorageFacilityCode("007");

    seedlot.setFemaleGameticContributionMethod("F");
    seedlot.setMaleGameticContributionMethod("M");
    seedlot.setProducedThroughControlledCross(true);
    seedlot.setProducedWithBiotechnologicalProcesses(true);
    seedlot.setPollenContaminationPresentInOrchard(true);
    seedlot.setPollenContaminationPercentage(30);
    seedlot.setPollenContaminantBreedingValue(new BigDecimal(100));
    seedlot.setPollenContaminationMethodCode("P");

    seedlot.setTotalParentTrees(10);
    seedlot.setSmpSuccessPercentage(70);
    seedlot.setEffectivePopulationSize(new BigDecimal(300));
    seedlot.setParentsOutsideTheOrchardUsedInSmp(20);
    seedlot.setNonOrchardPollenContaminationPercentage(50);

    seedlot.setExtractionClientNumber("00000009");
    seedlot.setExtractionLocationCode("10");
    seedlot.setExtractionStartDate(LocalDateTime.now());
    seedlot.setExtractionEndDate(LocalDateTime.now());
    seedlot.setStorageClientNumber("00000011");
    seedlot.setStorageLocationCode("12");
    seedlot.setTemporaryStorageStartDate(LocalDateTime.now());
    seedlot.setTemporaryStorageEndDate(LocalDateTime.now());

    seedlot.setDeclarationOfTrueInformationUserId("user1");
    seedlot.setDeclarationOfTrueInformationTimestamp(LocalDateTime.now());
    seedlot.setAuditInformation(new AuditInformation("user1"));

    return seedlotRepository.saveAndFlush(seedlot);
  }
}
