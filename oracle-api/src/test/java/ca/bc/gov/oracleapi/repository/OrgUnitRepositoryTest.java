package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.OrgUnitEntity;
import java.time.LocalDate;
import java.util.List;
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
class OrgUnitRepositoryTest {

  @Autowired private OrgUnitRepository orgUnitRepository;

  private boolean isValid(OrgUnitEntity entity) {
    LocalDate today = LocalDate.now();
    return !entity.getEffectiveDate().isAfter(today) && entity.getExpiryDate().isAfter(today);
  }

  @Test
  @DisplayName("findAllDistrictsTest")
  @Sql(scripts = {"classpath:scripts/OrgUnitRepositoryTest_findAllTest.sql"})
  void findAllDistrictsTest() {
    List<OrgUnitEntity> districts = orgUnitRepository.findAllDistricts();

    Assertions.assertFalse(districts.isEmpty());
    Assertions.assertEquals(2, districts.size());

    OrgUnitEntity dcc = districts.get(0);
    Assertions.assertEquals(45, dcc.getOrgUnitNo());
    Assertions.assertEquals("DCC", dcc.getOrgUnitCode());
    Assertions.assertEquals("Cariboo-Chilcotin Natural Resource District", dcc.getOrgUnitName());
    Assertions.assertEquals(45, dcc.getRollupDistNo());
    Assertions.assertTrue(isValid(dcc));

    OrgUnitEntity dpg = districts.get(1);
    Assertions.assertEquals(46, dpg.getOrgUnitNo());
    Assertions.assertEquals("DPG", dpg.getOrgUnitCode());
    Assertions.assertTrue(isValid(dpg));
  }
}
