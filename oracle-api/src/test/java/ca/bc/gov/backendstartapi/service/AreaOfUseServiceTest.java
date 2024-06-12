package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.SpzDto;
import ca.bc.gov.backendstartapi.entity.SeedPlanZone;
import ca.bc.gov.backendstartapi.entity.SeedPlanZoneCode;
import ca.bc.gov.backendstartapi.entity.VegetationCode;
import ca.bc.gov.backendstartapi.repository.SeedPlanZoneCodeRepository;
import ca.bc.gov.backendstartapi.repository.SeedPlanZoneRepository;
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

  @Mock SeedPlanZoneRepository seedPlanZoneRepository;
  @Mock SeedPlanZoneCodeRepository seedPlanZoneCodeRepository;

  @Autowired @InjectMocks private AreaOfUseService areaOfUseService;

  @Test
  @DisplayName("Get a list of SPZ should succeed")
  void getListOfSpz_shouldSucceed() {
    SeedPlanZoneCode spzCode1 = new SeedPlanZoneCode("BV", "Bulkley Valley");
    SeedPlanZoneCode spzCode2 = new SeedPlanZoneCode("CP", "Central Plateau");
    SeedPlanZoneCode spzCode3 = new SeedPlanZoneCode("DK", "Dease Klappan");
    SeedPlanZoneCode spzCode4 = new SeedPlanZoneCode("EK", "East Kootenay");

    String vegCode = "FDC";
    VegetationCode vegetationCode = new VegetationCode("99", vegCode, null, null, null);

    SeedPlanZone spz1 = new SeedPlanZone(1, 'A', spzCode1, vegetationCode);
    SeedPlanZone spz2 = new SeedPlanZone(2, 'A', spzCode2, vegetationCode);
    SeedPlanZone spz3 = new SeedPlanZone(3, 'A', spzCode3, vegetationCode);
    SeedPlanZone spz4 = new SeedPlanZone(4, 'A', spzCode4, vegetationCode);

    List<SeedPlanZone> spzList = List.of(spz1, spz2, spz3, spz4);

    when(seedPlanZoneRepository.findAllByGeneticClassCode_AndVegetationCode_id('A', vegCode))
        .thenReturn(spzList);

    List<SeedPlanZoneCode> spzCodeEntityList = List.of(spzCode1, spzCode2, spzCode3, spzCode4);
    List<String> spzCodeList =
        spzList.stream().map(spz -> spz.getSeedPlanZoneCode().getSpzCode()).toList();

    when(seedPlanZoneCodeRepository.findBySpzCodeIn(spzCodeList)).thenReturn(spzCodeEntityList);

    List<SpzDto> testList = areaOfUseService.getSpzByVegCode(vegCode);

    for (int i = 0; i < spzCodeEntityList.size(); i++) {
      assertEquals(spzCodeEntityList.get(i).getSpzCode(), testList.get(i).getCode());
      assertEquals(spzCodeEntityList.get(i).getSpzDescription(), testList.get(i).getDescription());
      assertEquals(null, testList.get(i).getIsPrimary());
    }
  }

  @Test
  @DisplayName("Get spz list should be able to throw encountered exception")
  void getSpzList_canThrowException() {
    when(seedPlanZoneRepository.findAllByGeneticClassCode_AndVegetationCode_id(any(), any()))
        .thenThrow(
            new JDBCConnectionException(
                "Oracle DB is down", new SQLException("Threatened by postgres", "Scared", 0)));

    String vegCode = "FDC";
    assertThrows(JDBCConnectionException.class, () -> areaOfUseService.getSpzByVegCode(vegCode));
  }
}
