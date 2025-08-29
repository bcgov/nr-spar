package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.CalculatedParentTreeValsDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.dto.GeospatialOracleResDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRequestDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRespondDto;
import ca.bc.gov.backendstartapi.dto.OrchardParentTreeValsDto;
import ca.bc.gov.backendstartapi.dto.PtCalculationResDto;
import ca.bc.gov.backendstartapi.dto.PtValsCalReqDto;
import ca.bc.gov.backendstartapi.dto.SmpBreedingValueDto;
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
  @DisplayName("Calculate parent tree values should succeed")
  void calculatePtVals_successTest() {
    // Using species FDC as example

    List<Long> smpPtIds =
        List.of(Long.valueOf(4033), Long.valueOf(4079), Long.valueOf(4080), Long.valueOf(5197));
    List<Long> orchardPtIds =
        List.of(Long.valueOf(4032), Long.valueOf(4033), Long.valueOf(4079), Long.valueOf(4080));

    /* ********* SERVICE REQUEST DATA ********* */
    GeospatialRequestDto smp4033 =
        new GeospatialRequestDto(smpPtIds.get(0), new BigDecimal("0.1935"));
    GeospatialRequestDto smp4079 =
        new GeospatialRequestDto(smpPtIds.get(1), new BigDecimal("0.3710"));
    GeospatialRequestDto smp4080 =
        new GeospatialRequestDto(smpPtIds.get(2), new BigDecimal("0.1935"));
    GeospatialRequestDto smp5197 =
        new GeospatialRequestDto(smpPtIds.get(3), new BigDecimal("0.2419"));
    List<GeospatialRequestDto> smpMixIdAndProps = List.of(smp4033, smp4079, smp4080, smp5197);

    OrchardParentTreeValsDto pt4032 =
        new OrchardParentTreeValsDto(
            orchardPtIds.get(0).toString(),
            "37",
            new BigDecimal(12),
            new BigDecimal(33),
            23,
            20,
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
            10,
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
            10,
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
            2,
            List.of(
                new GeneticWorthTraitsDto("dfw", new BigDecimal("0"), null, null),
                new GeneticWorthTraitsDto("gvo", new BigDecimal("18"), null, null),
                new GeneticWorthTraitsDto("wwd", new BigDecimal("-3"), null, null)));

    List<OrchardParentTreeValsDto> orchardPtVals = List.of(pt4032, pt4033, pt4079, pt4080);

    PtValsCalReqDto reqDto =
            new PtValsCalReqDto(orchardPtVals, smpMixIdAndProps, 0, BigDecimal.ZERO,
                    new SmpBreedingValueDto());

    /* ********* ORACLE GEOSPATIAL MOCK DATA ********* */
    List<GeospatialOracleResDto> oracleMockSmpGeoData =
        List.of(
            new GeospatialOracleResDto(smpPtIds.get(0), 47, 55, 0, 121, 40, 0, 212),
            new GeospatialOracleResDto(smpPtIds.get(1), 49, 18, 0, 122, 34, 0, 366),
            new GeospatialOracleResDto(smpPtIds.get(2), 49, 16, 0, 122, 34, 0, 152),
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
    BigDecimal coancestry = null;
    BigDecimal varSumOrchGameteContr = null;
    BigDecimal varSumNeNoSmpContrib = null;
    Integer smpParentsOutside = 0;
    when(geneticWorthService.calculateNe(
            coancestry, varSumOrchGameteContr, varSumNeNoSmpContrib, smpParentsOutside))
        .thenReturn(mockNeValue);

    /* ********* SERVICE TESTS ********* */
    PtCalculationResDto resDtoToTest = parentTreeService.calculatePtVals(reqDto);

    List<GeneticWorthTraitsDto> traitsToTest = resDtoToTest.geneticTraits();
    assertFalse(traitsToTest.isEmpty());

    CalculatedParentTreeValsDto ptValsToTest = resDtoToTest.calculatedPtVals();
    assertFalse(mockNeValue.equals(ptValsToTest.getNeValue()));

    GeospatialRespondDto ptGeoDataToTest = ptValsToTest.getGeospatialData();
    assertEquals(347, ptGeoDataToTest.getMeanElevation());
    assertTrue(ptGeoDataToTest.getMeanLatitude().equals(new BigDecimal("49.00000")));
    assertTrue(ptGeoDataToTest.getMeanLongitude().equals(new BigDecimal("123.78333")));
    assertEquals(49, ptGeoDataToTest.getMeanLatitudeDegree());
    assertEquals(0, ptGeoDataToTest.getMeanLatitudeMinute());
    assertEquals(0, ptGeoDataToTest.getMeanLatitudeSecond());
    assertEquals(123, ptGeoDataToTest.getMeanLongitudeDegree());
    assertEquals(47, ptGeoDataToTest.getMeanLongitudeMinute());
    assertEquals(0, ptGeoDataToTest.getMeanLongitudeSecond());

    GeospatialRespondDto smpGeoDataToTest = resDtoToTest.smpMixMeanGeoData();
    assertEquals(315, smpGeoDataToTest.getMeanElevation());
    assertTrue(smpGeoDataToTest.getMeanLatitude().equals(new BigDecimal("49.31667")));
    assertTrue(smpGeoDataToTest.getMeanLongitude().equals(new BigDecimal("122.35000")));
    assertEquals(49, smpGeoDataToTest.getMeanLatitudeDegree());
    assertEquals(19, smpGeoDataToTest.getMeanLatitudeMinute());
    assertEquals(0, smpGeoDataToTest.getMeanLatitudeSecond());
    assertEquals(122, smpGeoDataToTest.getMeanLongitudeDegree());
    assertEquals(21, smpGeoDataToTest.getMeanLongitudeMinute());
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
    PtValsCalReqDto reqDto =
        new PtValsCalReqDto(orchardPtVals, smpMixIdAndProps, 0, BigDecimal.ZERO, null);

    BigDecimal coancestry = null;
    BigDecimal varSumOrchGameteContr = null;
    BigDecimal varSumNeNoSmpContrib = null;
    Integer smpParentsOutside = 0;
    when(geneticWorthService.calculateNe(
            coancestry, varSumOrchGameteContr, varSumNeNoSmpContrib, smpParentsOutside))
        .thenReturn(BigDecimal.ZERO);

    assertThrows(
        PtGeoDataNotFoundException.class,
        () -> {
          parentTreeService.calculatePtVals(reqDto);
        });
  }
}
