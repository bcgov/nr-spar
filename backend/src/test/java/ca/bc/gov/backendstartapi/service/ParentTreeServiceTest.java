package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.CalculatedParentTreeValsDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.dto.GeospatialOracleResDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRequestDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRespondDto;
import ca.bc.gov.backendstartapi.dto.OrchardParentTreeValsDto;
import ca.bc.gov.backendstartapi.dto.PtCalculationResDto;
import ca.bc.gov.backendstartapi.dto.PtValsCalReqDto;
import ca.bc.gov.backendstartapi.dto.SeedlotManagementBreedingValueDto;
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
import org.springframework.web.server.ResponseStatusException;

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
                    new SeedlotManagementBreedingValueDto());

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

  @Test
  @DisplayName("Empty orchardPtVals and smpMix should return empty result")
  void calculatePtVals_emptyInput() {
    PtValsCalReqDto reqDto =
        new PtValsCalReqDto(
            List.of(), List.of(), 0, BigDecimal.ZERO, new SeedlotManagementBreedingValueDto());

    when(oracleApiProvider.getPtGeospatialDataByIdList(List.of())).thenReturn(List.of());
    when(geneticWorthService.calculateNe(any(), any(), any(), any())).thenReturn(BigDecimal.ONE);

    PtCalculationResDto result = parentTreeService.calculatePtVals(reqDto);

    assertNotNull(result);
    assertTrue(result.geneticTraits().isEmpty());
    assertEquals(BigDecimal.ONE, result.calculatedPtVals().getNeValue());
  }

  @Test
  @DisplayName("Zero pollen count with null SMP BV fields should succeed")
  void calculatePtVals_zeroPollenAndNullSmpBv() {
    SeedlotManagementBreedingValueDto smpBv =
        new SeedlotManagementBreedingValueDto(
            null, null, null, null, null, null, null, null, null, null, null, null);

    OrchardParentTreeValsDto pt =
        new OrchardParentTreeValsDto(
            "1001",
            "101",
            new BigDecimal("100"),
            BigDecimal.ZERO,
            0,
            0,
            List.of(new GeneticWorthTraitsDto("GVO", new BigDecimal("20"), null, null)));

    PtValsCalReqDto reqDto = new PtValsCalReqDto(List.of(pt), List.of(), 0, null, smpBv);

    when(oracleApiProvider.getPtGeospatialDataByIdList(List.of())).thenReturn(List.of());
    when(oracleApiProvider.getPtGeospatialDataByIdList(List.of(1001L)))
        .thenReturn(List.of(new GeospatialOracleResDto(1001L, 49, 2, 0, 124, 3, 0, 500)));
    when(geneticWorthService.calculateNe(any(), any(), any(), any())).thenReturn(BigDecimal.ONE);

    PtCalculationResDto result = parentTreeService.calculatePtVals(reqDto);

    assertNotNull(result);
    assertEquals(1, result.geneticTraits().size());
    assertEquals("GVO", result.geneticTraits().get(0).traitCode());
    assertEquals(new BigDecimal("20.0"), result.geneticTraits().get(0).calculatedValue());
  }

  @Test
  @DisplayName("Zero cone count should produce empty genetic traits")
  void calculatePtVals_zeroConeCount() {
    OrchardParentTreeValsDto pt =
        new OrchardParentTreeValsDto(
            "2001",
            "201",
            BigDecimal.ZERO,
            new BigDecimal("100"),
            0,
            0,
            List.of(new GeneticWorthTraitsDto("GVO", new BigDecimal("20"), null, null)));

    PtValsCalReqDto reqDto =
        new PtValsCalReqDto(
            List.of(pt), List.of(), 0, BigDecimal.ZERO, new SeedlotManagementBreedingValueDto());

    when(oracleApiProvider.getPtGeospatialDataByIdList(List.of())).thenReturn(List.of());
    when(oracleApiProvider.getPtGeospatialDataByIdList(List.of(2001L)))
        .thenReturn(List.of(new GeospatialOracleResDto(2001L, 49, 2, 0, 124, 3, 0, 500)));
    when(geneticWorthService.calculateNe(any(), any(), any(), any())).thenReturn(BigDecimal.ONE);

    PtCalculationResDto result = parentTreeService.calculatePtVals(reqDto);

    assertNotNull(result);
    assertTrue(result.geneticTraits().isEmpty());
  }

  @Test
  @DisplayName("Row with both zero cone and pollen is skipped, non-zero contaminant is applied")
  void calculatePtVals_skippedRowWithNonZeroContaminant() {
    OrchardParentTreeValsDto validPt =
        new OrchardParentTreeValsDto(
            "3001",
            "301",
            new BigDecimal("100"),
            new BigDecimal("100"),
            10,
            15,
            List.of(new GeneticWorthTraitsDto("GVO", new BigDecimal("20"), null, null)));

    OrchardParentTreeValsDto skippedPt =
        new OrchardParentTreeValsDto(
            "3002", "302", BigDecimal.ZERO, BigDecimal.ZERO, 0, 0, List.of());

    PtValsCalReqDto reqDto =
        new PtValsCalReqDto(
            List.of(validPt, skippedPt),
            List.of(),
            0,
            new BigDecimal("5.0"),
            new SeedlotManagementBreedingValueDto());

    when(oracleApiProvider.getPtGeospatialDataByIdList(List.of())).thenReturn(List.of());
    when(oracleApiProvider.getPtGeospatialDataByIdList(List.of(3001L, 3002L)))
        .thenReturn(
            List.of(
                new GeospatialOracleResDto(3001L, 49, 2, 0, 124, 3, 0, 500),
                new GeospatialOracleResDto(3002L, 50, 0, 0, 125, 0, 0, 600)));
    when(geneticWorthService.calculateNe(any(), any(), any(), any())).thenReturn(BigDecimal.ONE);

    PtCalculationResDto result = parentTreeService.calculatePtVals(reqDto);

    assertNotNull(result);
    assertFalse(result.geneticTraits().isEmpty());
    assertEquals("GVO", result.geneticTraits().get(0).traitCode());
  }

  @Test
  @DisplayName("All twelve genetic traits above threshold should all be returned")
  void calculatePtVals_allTraitsAboveThreshold() {
    List<GeneticWorthTraitsDto> allTraits =
        List.of(
            new GeneticWorthTraitsDto("AD", new BigDecimal("10"), null, null),
            new GeneticWorthTraitsDto("DFS", new BigDecimal("10"), null, null),
            new GeneticWorthTraitsDto("DFU", new BigDecimal("10"), null, null),
            new GeneticWorthTraitsDto("DFW", new BigDecimal("10"), null, null),
            new GeneticWorthTraitsDto("DSB", new BigDecimal("10"), null, null),
            new GeneticWorthTraitsDto("DSC", new BigDecimal("10"), null, null),
            new GeneticWorthTraitsDto("DSG", new BigDecimal("10"), null, null),
            new GeneticWorthTraitsDto("GVO", new BigDecimal("10"), null, null),
            new GeneticWorthTraitsDto("IWS", new BigDecimal("10"), null, null),
            new GeneticWorthTraitsDto("WDU", new BigDecimal("10"), null, null),
            new GeneticWorthTraitsDto("WVE", new BigDecimal("10"), null, null),
            new GeneticWorthTraitsDto("WWD", new BigDecimal("10"), null, null));

    OrchardParentTreeValsDto pt =
        new OrchardParentTreeValsDto(
            "4001", "401", new BigDecimal("100"), new BigDecimal("100"), 0, 0, allTraits);

    PtValsCalReqDto reqDto =
        new PtValsCalReqDto(
            List.of(pt), List.of(), 0, BigDecimal.ZERO, new SeedlotManagementBreedingValueDto());

    when(oracleApiProvider.getPtGeospatialDataByIdList(List.of())).thenReturn(List.of());
    when(oracleApiProvider.getPtGeospatialDataByIdList(List.of(4001L)))
        .thenReturn(List.of(new GeospatialOracleResDto(4001L, 49, 2, 0, 124, 3, 0, 500)));
    when(geneticWorthService.calculateNe(any(), any(), any(), any())).thenReturn(BigDecimal.ONE);

    PtCalculationResDto result = parentTreeService.calculatePtVals(reqDto);

    assertNotNull(result);
    assertEquals(12, result.geneticTraits().size());
    for (GeneticWorthTraitsDto trait : result.geneticTraits()) {
      assertEquals(new BigDecimal("10.0"), trait.calculatedValue());
    }
  }

  @Test
  @DisplayName("SMP mix proportion exceeding one should throw ResponseStatusException")
  void calculatePtVals_proportionExceedsOne() {
    GeospatialRequestDto smp = new GeospatialRequestDto(5001L, new BigDecimal("1.5"));

    PtValsCalReqDto reqDto =
        new PtValsCalReqDto(
            List.of(), List.of(smp), 0, BigDecimal.ZERO, new SeedlotManagementBreedingValueDto());

    when(oracleApiProvider.getPtGeospatialDataByIdList(List.of(5001L)))
        .thenReturn(List.of(new GeospatialOracleResDto(5001L, 49, 2, 0, 124, 3, 0, 500)));
    when(geneticWorthService.calculateNe(any(), any(), any(), any())).thenReturn(BigDecimal.ONE);

    assertThrows(
        ResponseStatusException.class,
        () -> {
          parentTreeService.calculatePtVals(reqDto);
        });
  }

  @Test
  @DisplayName("SMP parent tree not found in Oracle map should be skipped")
  void calculatePtVals_smpPtNotFoundInMap() {
    GeospatialRequestDto smpA = new GeospatialRequestDto(6001L, new BigDecimal("0.5"));
    GeospatialRequestDto smpB = new GeospatialRequestDto(6002L, new BigDecimal("0.5"));

    PtValsCalReqDto reqDto =
        new PtValsCalReqDto(
            List.of(),
            List.of(smpA, smpB),
            0,
            BigDecimal.ZERO,
            new SeedlotManagementBreedingValueDto());

    when(oracleApiProvider.getPtGeospatialDataByIdList(List.of(6001L, 6002L)))
        .thenReturn(List.of(new GeospatialOracleResDto(6001L, 49, 2, 0, 124, 3, 0, 500)));
    when(oracleApiProvider.getPtGeospatialDataByIdList(List.of())).thenReturn(List.of());
    when(geneticWorthService.calculateNe(any(), any(), any(), any())).thenReturn(BigDecimal.ONE);

    PtCalculationResDto result = parentTreeService.calculatePtVals(reqDto);

    assertNotNull(result);
    assertNotNull(result.smpMixMeanGeoData());
  }

  @Test
  @DisplayName("Orchard parent tree not found in geo data should be skipped in seedlot calc")
  void calculatePtVals_orchardPtNotFoundInGeoData() {
    OrchardParentTreeValsDto pt1 =
        new OrchardParentTreeValsDto(
            "7001",
            "701",
            new BigDecimal("50"),
            new BigDecimal("50"),
            0,
            0,
            List.of(new GeneticWorthTraitsDto("GVO", new BigDecimal("20"), null, null)));

    OrchardParentTreeValsDto pt2 =
        new OrchardParentTreeValsDto(
            "7002",
            "702",
            new BigDecimal("50"),
            new BigDecimal("50"),
            0,
            0,
            List.of(new GeneticWorthTraitsDto("GVO", new BigDecimal("15"), null, null)));

    PtValsCalReqDto reqDto =
        new PtValsCalReqDto(
            List.of(pt1, pt2),
            List.of(),
            0,
            BigDecimal.ZERO,
            new SeedlotManagementBreedingValueDto());

    when(oracleApiProvider.getPtGeospatialDataByIdList(List.of())).thenReturn(List.of());
    when(oracleApiProvider.getPtGeospatialDataByIdList(List.of(7001L, 7002L)))
        .thenReturn(List.of(new GeospatialOracleResDto(7001L, 49, 2, 0, 124, 3, 0, 500)));
    when(geneticWorthService.calculateNe(any(), any(), any(), any())).thenReturn(BigDecimal.ONE);

    PtCalculationResDto result = parentTreeService.calculatePtVals(reqDto);

    assertNotNull(result);
    assertNotNull(result.calculatedPtVals().getGeospatialData());
  }
}
