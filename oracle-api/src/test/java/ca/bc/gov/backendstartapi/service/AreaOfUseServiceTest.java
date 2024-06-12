package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.AreaOfUseDto;
import ca.bc.gov.backendstartapi.dto.AreaOfUseSpuGeoDto;
import ca.bc.gov.backendstartapi.dto.SpzDto;
import ca.bc.gov.backendstartapi.entity.SeedPlanUnit;
import ca.bc.gov.backendstartapi.entity.SeedPlanZone;
import ca.bc.gov.backendstartapi.entity.SeedPlanZoneCode;
import ca.bc.gov.backendstartapi.entity.TestedPtAreaOfUse;
import ca.bc.gov.backendstartapi.entity.TestedPtAreaOfUseSpu;
import ca.bc.gov.backendstartapi.entity.TestedPtAreaOfUseSpz;
import ca.bc.gov.backendstartapi.entity.VegetationCode;
import ca.bc.gov.backendstartapi.exception.TestedAreaOfUseNotFound;
import ca.bc.gov.backendstartapi.repository.SeedPlanUnitRepository;
import ca.bc.gov.backendstartapi.repository.SeedPlanZoneCodeRepository;
import ca.bc.gov.backendstartapi.repository.SeedPlanZoneRepository;
import ca.bc.gov.backendstartapi.repository.TestedPtAreaOfUseSpuRepository;
import ca.bc.gov.backendstartapi.repository.TestedPtAreaOfUseSpzRepository;
import ca.bc.gov.backendstartapi.repository.TestedPtAreaofUseRepository;
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

  @Mock private SeedPlanUnitRepository seedPlanUnitRepository;

  @Mock private SeedPlanZoneRepository seedPlanZoneRepository;

  @Mock private SeedPlanZoneCodeRepository seedPlanZoneCodeRepository;

  @Mock private TestedPtAreaofUseRepository testedPtAreaofUseRepository;

  @Mock private TestedPtAreaOfUseSpzRepository testedPtAreaOfUseSpzRepository;

  @Mock private TestedPtAreaOfUseSpuRepository testedPtAreaOfUseSpuRepository;

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

  @Test
  @DisplayName("calcAreaOfUseData_successTest")
  void calcAreaOfUseData_successTest() {
    Integer spuId = 7;
    Integer testedPtAoUid = 30;

    // Step 1 Mock
    TestedPtAreaOfUse testedPtAreaOfUse = new TestedPtAreaOfUse(testedPtAoUid, spuId);
    when(testedPtAreaofUseRepository.findAllBySeedPlanUnitId(7))
        .thenReturn(List.of(testedPtAreaOfUse));

    // Step 2 Mock
    TestedPtAreaOfUseSpu testedPtSpu = new TestedPtAreaOfUseSpu(testedPtAoUid, spuId);
    when(testedPtAreaOfUseSpuRepository.findByTestedPtAreaOfUseId(testedPtAoUid))
        .thenReturn(List.of(testedPtSpu));

    // Step 3 Mock
    SeedPlanUnit spu = new SeedPlanUnit(spuId, true, 1284, "Low", 700, 1, null, null, 48, 0, 52, 0);
    when(seedPlanUnitRepository.findBySeedPlanUnitIdIn(List.of(spuId))).thenReturn(List.of(spu));

    // Step 4 Mock
    SeedPlanZoneCode spzCode1 = new SeedPlanZoneCode("GL", "Georgia Lowlands");
    SeedPlanZoneCode spzCode2 = new SeedPlanZoneCode("M", "Maritime");
    TestedPtAreaOfUseSpz testedSpzDto1 =
        new TestedPtAreaOfUseSpz(testedPtAreaOfUse, spzCode1, false);
    TestedPtAreaOfUseSpz testedSpzDto2 =
        new TestedPtAreaOfUseSpz(testedPtAreaOfUse, spzCode2, true);
    when(testedPtAreaOfUseSpzRepository.findAllByTestedPtAreaOfUse_testedPtAreaOfUseId(
            testedPtAoUid))
        .thenReturn(List.of(testedSpzDto1, testedSpzDto2));

    AreaOfUseDto areaOfUseDto = new AreaOfUseDto();
    AreaOfUseSpuGeoDto areaOfUseSpuGeoDto =
        new AreaOfUseSpuGeoDto(
            spu.getElevationMin(),
            spu.getElevationMax(),
            spu.getLatitudeDegreesMin(),
            spu.getLatitudeDegreesMax(),
            spu.getLatitudeMinutesMin(),
            spu.getLatitudeMinutesMin());
    areaOfUseDto.setAreaOfUseSpuGeoDto(areaOfUseSpuGeoDto);

    SpzDto spzDto1 = new SpzDto("GL", "Georgia Lowlands", false);
    SpzDto spzDto2 = new SpzDto("M", "Maritime", true);

    List<SpzDto> spzList = List.of(spzDto1, spzDto2);

    areaOfUseDto.setSpzList(spzList);

    AreaOfUseDto dtoToTest = areaOfUseService.calcAreaOfUseData(spuId);

    // Geo data test
    assertEquals(
        areaOfUseDto.getAreaOfUseSpuGeoDto().getElevationMax(),
        dtoToTest.getAreaOfUseSpuGeoDto().getElevationMax());
    assertEquals(
        areaOfUseDto.getAreaOfUseSpuGeoDto().getElevationMin(),
        dtoToTest.getAreaOfUseSpuGeoDto().getElevationMin());
    assertEquals(
        areaOfUseDto.getAreaOfUseSpuGeoDto().getLatitudeDegreesMax(),
        dtoToTest.getAreaOfUseSpuGeoDto().getLatitudeDegreesMax());
    assertEquals(
        areaOfUseDto.getAreaOfUseSpuGeoDto().getLatitudeDegreesMin(),
        dtoToTest.getAreaOfUseSpuGeoDto().getLatitudeDegreesMin());
    assertEquals(
        areaOfUseDto.getAreaOfUseSpuGeoDto().getLatitudeMinutesMax(),
        dtoToTest.getAreaOfUseSpuGeoDto().getLatitudeMinutesMax());
    assertEquals(
        areaOfUseDto.getAreaOfUseSpuGeoDto().getLatitudeMinutesMin(),
        dtoToTest.getAreaOfUseSpuGeoDto().getLatitudeMinutesMin());
    // SPZ List test
    for (int i = 0; i < spzList.size(); i++) {
      assertEquals(spzList.get(i).getCode(), dtoToTest.getSpzList().get(i).getCode());
      assertEquals(spzList.get(i).getDescription(), dtoToTest.getSpzList().get(i).getDescription());
      assertEquals(spzList.get(i).getIsPrimary(), dtoToTest.getSpzList().get(i).getIsPrimary());
    }
  }

  @Test
  @DisplayName("calcAreaOfUseData_errorTest")
  void calcAreaOfUseData_errorTest() {
    when(testedPtAreaofUseRepository.findAllBySeedPlanUnitId(any()))
        .thenThrow(new TestedAreaOfUseNotFound());

    assertThrows(TestedAreaOfUseNotFound.class, () -> areaOfUseService.calcAreaOfUseData(7));
  }
}
