package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.SpzDto;
import ca.bc.gov.backendstartapi.entity.SeedPlanZoneCode;
import ca.bc.gov.backendstartapi.repository.SeedPlanZoneCodeRepository;
import ca.bc.gov.backendstartapi.repository.TestedPtAreaOfUseSpzRepository;
import java.sql.SQLException;
import java.util.List;
import org.hibernate.exception.JDBCConnectionException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;

/** The test class for Area of Use Service. */
@ExtendWith(MockitoExtension.class)
public class AreaOfUseServiceTest {

  @Mock TestedPtAreaOfUseSpzRepository testedPtAreaOfUseSpzRepository;
  @Mock SeedPlanZoneCodeRepository seedPlanZoneCodeRepository;

  @Autowired @InjectMocks private AreaOfUseService areaOfUseService;

  @Test
  @DisplayName("Get a list of SPZ should succeed")
  void getListOfSpz_shouldSucceed() {
    SeedPlanZoneCode spz1 = new SeedPlanZoneCode("BV", "Bulkley Valley");
    SeedPlanZoneCode spz2 = new SeedPlanZoneCode("CP", "Central Plateau");
    SeedPlanZoneCode spz3 = new SeedPlanZoneCode("DK", "Dease Klappan");
    SeedPlanZoneCode spz4 = new SeedPlanZoneCode("EK", "East Kootenay");

    List<String> distinctSpzCodeList =
        List.of(spz1.getSpzCode(), spz2.getSpzCode(), spz3.getSpzCode(), spz4.getSpzCode());
    when(testedPtAreaOfUseSpzRepository.findAllDistinctSpz()).thenReturn(distinctSpzCodeList);

    List<SeedPlanZoneCode> spzCodeEntityList = List.of(spz1, spz2, spz3, spz4);

    when(seedPlanZoneCodeRepository.findBySpzCodeIn(distinctSpzCodeList))
        .thenReturn(spzCodeEntityList);

    List<SpzDto> testList = areaOfUseService.getAllSpz();

    for (int i = 0; i < spzCodeEntityList.size(); i++) {
      assertEquals(spzCodeEntityList.get(i).getSpzCode(), testList.get(i).getCode());
      assertEquals(spzCodeEntityList.get(i).getSpzDescription(), testList.get(i).getDescription());
      assertEquals(null, testList.get(i).getIsPrimary());
    }
  }

  @Test
  @DisplayName("Get spz list should be able to throw encountered exception")
  void getSpzList_canThrowException() {
    when(testedPtAreaOfUseSpzRepository.findAllDistinctSpz())
        .thenThrow(
            new JDBCConnectionException(
                "Oracle DB is down", new SQLException("Threatened by postgres", "Scared", 0)));

    assertThrows(JDBCConnectionException.class, () -> areaOfUseService.getAllSpz());
  }
}
