package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.dto.OrgUnitDto;
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

  private boolean isValid(OrgUnitDto dto) {
    LocalDate today = LocalDate.now();
    return !dto.effectiveDate().isAfter(today) && dto.expiryDate().isAfter(today);
  }

  @Test
  @DisplayName("findAllDistrictsTest")
  @Sql(scripts = {"classpath:scripts/OrgUnitRepositoryTest_findAllTest.sql"})
  void findAllDistrictsTest() {
    List<OrgUnitDto> districts = orgUnitRepository.findAllDistricts();

    Assertions.assertFalse(districts.isEmpty());
    Assertions.assertEquals(2, districts.size());

    OrgUnitDto dcc = districts.get(0);
    Assertions.assertEquals(45, dcc.orgUnitNo());
    Assertions.assertEquals("DCC", dcc.orgUnitCode());
    Assertions.assertEquals("Cariboo-Chilcotin Natural Resource District", dcc.orgUnitName());
    Assertions.assertEquals(45, dcc.rollupDistNo());
    Assertions.assertTrue(isValid(dcc));

    OrgUnitDto dpg = districts.get(1);
    Assertions.assertEquals(46, dpg.orgUnitNo());
    Assertions.assertEquals("DPG", dpg.orgUnitCode());
    Assertions.assertTrue(isValid(dpg));
  }
}
