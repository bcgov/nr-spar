package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.CaculatedParentTreeValsDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.dto.GeospatialOracleResDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRequestDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRespondDto;
import ca.bc.gov.backendstartapi.dto.OrchardParentTreeValsDto;
import ca.bc.gov.backendstartapi.dto.PtCalculationResDto;
import ca.bc.gov.backendstartapi.dto.PtValsCalReqDto;
import ca.bc.gov.backendstartapi.exception.PtGeoDataNotFoundException;
import ca.bc.gov.backendstartapi.provider.OracleApiProvider;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class ParentTreeServiceTest {

  @Mock GeneticWorthService geneticWorthService;
  @Mock OracleApiProvider oracleApiProvider;

  private ParentTreeService parentTreeService;

  @BeforeEach
  void setup() {
    parentTreeService = new ParentTreeService(oracleApiProvider, geneticWorthService);
  }

  @Test
  @DisplayName("Caculate parent tree values should succeed")
  void calculatePtVals_successTest() {
    // Using species FDC as example

    List<Long> smpPtIds =
        List.of(Long.valueOf(4033), Long.valueOf(4079), Long.valueOf(4080), Long.valueOf(5197));
    List<Long> orchardPtIds =
        List.of(Long.valueOf(4032), Long.valueOf(4033), Long.valueOf(4079), Long.valueOf(4080));

    /* ********* SERVICE REQUEST DATA ********* */
    GeospatialRequestDto smp4033 = new GeospatialRequestDto(smpPtIds.get(0), new BigDecimal(0.194));
    GeospatialRequestDto smp4079 = new GeospatialRequestDto(smpPtIds.get(1), new BigDecimal(0.371));
    GeospatialRequestDto smp4080 = new GeospatialRequestDto(smpPtIds.get(2), new BigDecimal(0.194));
    GeospatialRequestDto smp5197 = new GeospatialRequestDto(smpPtIds.get(3), new BigDecimal(0.242));
    List<GeospatialRequestDto> smpMixIdAndProps = List.of(smp4033, smp4079, smp4080, smp5197);

    OrchardParentTreeValsDto pt4032 =
        new OrchardParentTreeValsDto(
            orchardPtIds.get(0).toString(),
            "37",
            new BigDecimal(12),
            new BigDecimal(33),
            23,
            List.of(
                new GeneticWorthTraitsDto("dfw", new BigDecimal("0"), null, null),
                new GeneticWorthTraitsDto("gvo", new BigDecimal("18"), null, null),
                new GeneticWorthTraitsDto("wwd", new BigDecimal("0.1"), null, null)));

    OrchardParentTreeValsDto pt4033 =
        new OrchardParentTreeValsDto(
            orchardPtIds.get(1).toString(),
            "38",
            new BigDecimal(12),
            new BigDecimal(23),
            12,
            List.of(
                new GeneticWorthTraitsDto("dfw", new BigDecimal("0"), null, null),
                new GeneticWorthTraitsDto("gvo", new BigDecimal("27"), null, null),
                new GeneticWorthTraitsDto("wwd", new BigDecimal("-2.6"), null, null)));

    OrchardParentTreeValsDto pt4079 =
        new OrchardParentTreeValsDto(
            orchardPtIds.get(2).toString(),
            "53",
            new BigDecimal(32),
            new BigDecimal(22),
            12,
            List.of(
                new GeneticWorthTraitsDto("dfw", new BigDecimal("0"), null, null),
                new GeneticWorthTraitsDto("gvo", new BigDecimal("19"), null, null),
                new GeneticWorthTraitsDto("wwd", new BigDecimal("-4.7"), null, null)));

    OrchardParentTreeValsDto pt4080 =
        new OrchardParentTreeValsDto(
            orchardPtIds.get(3).toString(),
            "54",
            new BigDecimal(12),
            new BigDecimal(45),
            3,
            List.of(
                new GeneticWorthTraitsDto("dfw", new BigDecimal("0"), null, null),
                new GeneticWorthTraitsDto("gvo", new BigDecimal("18"), null, null),
                new GeneticWorthTraitsDto("wwd", new BigDecimal("-3"), null, null)));

    List<OrchardParentTreeValsDto> orchardPtVals = List.of(pt4032, pt4033, pt4079, pt4080);

    PtValsCalReqDto reqDto = new PtValsCalReqDto(orchardPtVals, smpMixIdAndProps);

    /* ********* ORACLE GEOSPATIAL MOCK DATA ********* */
    List<GeospatialOracleResDto> oracleMockSmpGeoData =
        List.of(
            new GeospatialOracleResDto(smpPtIds.get(0), 47, 55, 0, 121, 40, 0, 212),
            new GeospatialOracleResDto(smpPtIds.get(1), 49, 18, 0, 122, 34, 0, 366),
            new GeospatialOracleResDto(smpPtIds.get(2), 49, 16, 0, 121, 34, 0, 152),
            new GeospatialOracleResDto(smpPtIds.get(3), 50, 31, 0, 122, 28, 0, 451));
    when(oracleApiProvider.getPtGeospatialDataByIdList(smpPtIds)).thenReturn(oracleMockSmpGeoData);

    List<GeospatialOracleResDto> oracleMockOrchardGeoData =
        List.of(
            new GeospatialOracleResDto(orchardPtIds.get(0), 49, 2, 0, 124, 3, 0, 579),
            new GeospatialOracleResDto(orchardPtIds.get(1), 47, 55, 0, 121, 40, 0, 212),
            new GeospatialOracleResDto(orchardPtIds.get(2), 49, 18, 0, 122, 34, 0, 366),
            new GeospatialOracleResDto(orchardPtIds.get(3), 49, 16, 0, 122, 34, 0, 152));
    when(oracleApiProvider.getPtGeospatialDataByIdList(orchardPtIds))
        .thenReturn(oracleMockOrchardGeoData);

    /* ********* GENETIC WORTH SERVICE MOCK DATA ********* */
    BigDecimal mockNeValue = new BigDecimal(3.8247490490);
    when(geneticWorthService.calculateNe(reqDto.orchardPtVals())).thenReturn(mockNeValue);
    when(geneticWorthService.calculateGeneticWorth(reqDto.orchardPtVals())).thenReturn(List.of());

    /* ********* SERVICE TESTS ********* */
    PtCalculationResDto resDtoToTest = parentTreeService.calculatePtVals(reqDto);

    List<GeneticWorthTraitsDto> traitsToTest = resDtoToTest.geneticTraits();
    assertTrue(traitsToTest.isEmpty());

    CaculatedParentTreeValsDto ptValsToTest = resDtoToTest.calculatedPtVals();
    assertTrue(mockNeValue.equals(ptValsToTest.getNeValue()));

    GeospatialRespondDto ptGeoDataToTest = ptValsToTest.getGeospatialData();
    assertEquals(346, ptGeoDataToTest.getMeanElevation());
    assertTrue(ptGeoDataToTest.getMeanLatitude().equals(new BigDecimal("51.94257")));
    assertTrue(ptGeoDataToTest.getMeanLongitude().equals(new BigDecimal("130.16470")));
    assertEquals(51, ptGeoDataToTest.getMeanLatitudeDegree());
    assertEquals(56, ptGeoDataToTest.getMeanLatitudeMinute());
    assertEquals(33, ptGeoDataToTest.getMeanLatitudeSecond());
    assertEquals(130, ptGeoDataToTest.getMeanLongitudeDegree());
    assertEquals(9, ptGeoDataToTest.getMeanLongitudeMinute());
    assertEquals(52, ptGeoDataToTest.getMeanLongitudeSecond());

    GeospatialRespondDto smpGeoDataToTest = resDtoToTest.smpMixMeanGeoData();
    assertEquals(315, smpGeoDataToTest.getMeanElevation());
    assertTrue(smpGeoDataToTest.getMeanLatitude().equals(new BigDecimal("48.45000")));
    assertTrue(smpGeoDataToTest.getMeanLongitude().equals(new BigDecimal("121.55000")));
    assertEquals(48, smpGeoDataToTest.getMeanLatitudeDegree());
    assertEquals(27, smpGeoDataToTest.getMeanLatitudeMinute());
    assertEquals(0, smpGeoDataToTest.getMeanLatitudeSecond());
    assertEquals(121, smpGeoDataToTest.getMeanLongitudeDegree());
    assertEquals(33, smpGeoDataToTest.getMeanLongitudeMinute());
    assertEquals(0, smpGeoDataToTest.getMeanLongitudeSecond());
  }

  @Test
  @DisplayName("Invalid parent tree ID should throw error.")
  void calculateGeospatial_oracleEmptyTest() {
    // Although geo data for a parent tree can be null, parent tree id must exist in
    // parent_tree_table.
    // The only time it's does not exist in the table it's when the data is malformed.
    Long badPtId = Long.valueOf(999999);
    GeospatialRequestDto badSmp = new GeospatialRequestDto(badPtId, new BigDecimal(0.242));
    List<GeospatialRequestDto> smpMixIdAndProps = List.of(badSmp);
    when(oracleApiProvider.getPtGeospatialDataByIdList(List.of(badPtId))).thenReturn(List.of());

    List<OrchardParentTreeValsDto> orchardPtVals = List.of();
    PtValsCalReqDto reqDto = new PtValsCalReqDto(orchardPtVals, smpMixIdAndProps);

    when(geneticWorthService.calculateNe(reqDto.orchardPtVals())).thenReturn(BigDecimal.ZERO);
    when(geneticWorthService.calculateGeneticWorth(reqDto.orchardPtVals())).thenReturn(List.of());

    assertThrows(
        PtGeoDataNotFoundException.class,
        () -> {
          parentTreeService.calculatePtVals(reqDto);
        });
  }
}
