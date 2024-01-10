package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.FacilityTypes;

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
class FacilityTypesRepositoryTest {

  @Autowired private FacilityTypesRepository facilityTypesRepository;

  private boolean isValid(FacilityTypes facilityTypes) {
    LocalDate today = LocalDate.now();

    // Effective date - Should be before or same as today
    if (facilityTypes.getEffectiveDate().isAfter(today)) {
      return false;
    }

    // Expiry date - Should be after today
    return facilityTypes.getExpiryDate().isAfter(today);
  }

  @Test
  @DisplayName("findAllTest")
  @Sql(scripts = {"classpath:scripts/FacilityTypeRepositoryTest_findAllTest.sql"})
  void findAllTest() {
    List<FacilityTypes> sources = facilityTypesRepository.findAllValid();

    Assertions.assertFalse(sources.isEmpty());
    Assertions.assertEquals(4, sources.size());

    FacilityTypes facilityTypeOcv = sources.get(0);
    Assertions.assertEquals("OCV", facilityTypeOcv.getCode());
    Assertions.assertEquals("Outside Covered", facilityTypeOcv.getDescription());
    Assertions.assertTrue(isValid(facilityTypeOcv));

    FacilityTypes facilityTypeOth = sources.get(1);
    Assertions.assertEquals("OTH", facilityTypeOth.getCode());
    Assertions.assertEquals("Other", facilityTypeOth.getDescription());
    Assertions.assertTrue(isValid(facilityTypeOth));

    FacilityTypes facilityTypeRfr = sources.get(2);
    Assertions.assertEquals("RFR", facilityTypeRfr.getCode());
    Assertions.assertEquals("Reefer", facilityTypeRfr.getDescription());
    Assertions.assertTrue(isValid(facilityTypeRfr));

    FacilityTypes facilityTypeVrm = sources.get(3);
    Assertions.assertEquals("VRM", facilityTypeVrm.getCode());
    Assertions.assertEquals("Ventilated Room", facilityTypeVrm.getDescription());
    Assertions.assertTrue(isValid(facilityTypeVrm));
  }
}
