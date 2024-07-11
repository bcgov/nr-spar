package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.OrchardEntity;
import ca.bc.gov.oracleapi.entity.OrchardLotTypeCode;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.jdbc.Sql;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@Sql(scripts = {"classpath:scripts/OrchardRepositoryTest.sql"})
class OrchardRepositoryTest {

  @Autowired private OrchardRepository orchardRepository;

  @Test
  @DisplayName("findByIdSuccessTest")
  void findByIdSuccessTest() {
    Optional<OrchardEntity> orchardPrd = orchardRepository.findNotRetiredById("337");

    Assertions.assertTrue(orchardPrd.isPresent());
    OrchardEntity orchardOne = orchardPrd.get();
    OrchardLotTypeCode orchardLotTypeCodeOne = orchardOne.getOrchardLotTypeCode();

    Assertions.assertNotNull(orchardLotTypeCodeOne);
    Assertions.assertEquals("GRANDVIEW", orchardOne.getName());
    Assertions.assertEquals("PLI", orchardOne.getVegetationCode());
    Assertions.assertEquals('S', orchardLotTypeCodeOne.getCode());
    Assertions.assertEquals("Seed Lot", orchardLotTypeCodeOne.getDescription());
    Assertions.assertEquals("PRD", orchardOne.getStageCode());

    Optional<OrchardEntity> orchardEsb = orchardRepository.findNotRetiredById("820");

    Assertions.assertTrue(orchardEsb.isPresent());
    OrchardEntity orchardTwo = orchardEsb.get();
    OrchardLotTypeCode orchardLotTypeCodeTwo = orchardTwo.getOrchardLotTypeCode();

    Assertions.assertNotNull(orchardLotTypeCodeTwo);
    Assertions.assertEquals("FERNDALE INSTITUTE", orchardTwo.getName());
    Assertions.assertEquals("AX", orchardTwo.getVegetationCode());
    Assertions.assertEquals('C', orchardLotTypeCodeTwo.getCode());
    Assertions.assertEquals("Cutting Lot", orchardLotTypeCodeTwo.getDescription());
    Assertions.assertEquals("ESB", orchardTwo.getStageCode());
  }

  @Test
  @DisplayName("findByIdNotFoundTest")
  void findByIdNotFoundTest() {
    Optional<OrchardEntity> orchardRet = orchardRepository.findNotRetiredById("612");

    Assertions.assertTrue(orchardRet.isEmpty());
  }

  @Test
  @DisplayName("findOrchardByVegCodeRepoSuccessTest")
  void findOrchardByVegCodeRepoSuccessTest() {
    String vegCode = "PLI";
    List<OrchardEntity> orchardRet = orchardRepository.findAllByVegetationCode(vegCode);

    Assertions.assertFalse(orchardRet.isEmpty());
    Assertions.assertEquals(2, orchardRet.size());
    Assertions.assertEquals(vegCode, orchardRet.get(0).getVegetationCode());
    Assertions.assertEquals(vegCode, orchardRet.get(1).getVegetationCode());
  }

  @Test
  @DisplayName("Find orchard by veg code should include retired orchard")
  void findOrchardByVegCodeRepoErrorTest() {
    List<OrchardEntity> orchardRet =
        orchardRepository.findAllByVegetationCode("FDC").stream()
            .filter(orchard -> orchard.getStageCode() == "RET")
            .toList();

    Assertions.assertTrue(orchardRet.isEmpty());
  }
}
