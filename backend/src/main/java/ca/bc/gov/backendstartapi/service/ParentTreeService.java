package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.CaculatedParentTreeValsDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsRequestDto;
import ca.bc.gov.backendstartapi.dto.GeospatialOracleResDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRequestDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRespondDto;
import ca.bc.gov.backendstartapi.dto.PtCalculationResDto;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.util.LatLongUtil;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

/** This class holds methods for handling Parent Trees records. */
@Service
@RequiredArgsConstructor
public class ParentTreeService {

  @Qualifier("oracleApi")
  private final Provider oracleApiProvider;

  private final GeneticWorthService geneticWorthService;

  /**
   * Calculate lat long and elevation values given a list of {@link GeospatialRequestDto}.
   *
   * @param ptreeIds List of parent trees and traits.
   * @return A List of {@link GeospatialRespondDto}
   */
  public GeospatialRespondDto calculateGeospatial(
      List<GeospatialRequestDto> ptreeIdAndProportions) {
    SparLog.info(
        "{} parent tree record(s) received to calculate lat long and elevation",
        ptreeIdAndProportions.size());

    List<Integer> ptIds =
        ptreeIdAndProportions.stream().map(GeospatialRequestDto::parentTreeId).toList();

    List<GeospatialOracleResDto> oracleDtoList =
        oracleApiProvider.getPtGeospatialDataByIdList(ptIds);

    if (oracleDtoList.isEmpty()) {
      SparLog.info("No parent tree lat long data from Oracle for the given parent tree ids.");
      // TODO: custom type
      return new GeospatialRespondDto(null, null, null, null, null, null, null, null, null);
    }

    Map<Integer, GeospatialOracleResDto> oracleMap =
        oracleDtoList.stream()
            .collect(Collectors.toMap(GeospatialOracleResDto::parentTreeId, Function.identity()));

    // Accumulators
    BigDecimal meanLatDegSum = BigDecimal.ZERO;
    BigDecimal meanLatMinSum = BigDecimal.ZERO;
    BigDecimal meanLatSecSum = BigDecimal.ZERO;
    BigDecimal meanLongDegSum = BigDecimal.ZERO;
    BigDecimal meanLongMinSum = BigDecimal.ZERO;
    BigDecimal meanLongSecSum = BigDecimal.ZERO;
    BigDecimal meanElevationSum = BigDecimal.ZERO;

    // Loop through list to calculate weighted values then sum them up.
    for (GeospatialRequestDto dto : ptreeIdAndProportions) {
      // frontend already do this:

      GeospatialOracleResDto geospatialResDto = oracleMap.get(dto.parentTreeId());
      if (Objects.isNull(geospatialResDto)) {
        SparLog.info(
            "Unable to calculate for parent tree {}, no data found on Oracle!", dto.parentTreeId());
        continue;
      }

      // weighted value = parent tree proportion * value



      BigDecimal weightedElevation =
          dto.proportion().multiply(new BigDecimal(geospatialResDto.elevation()));

      meanElevationSum.add(weightedElevation);
    }

    // latitude
    Integer[] latitudeDms =
        new Integer[] {
          meanLatDegSum.intValue(), meanLatMinSum.intValue(), meanLatSecSum.intValue()
        };
    BigDecimal latitudeDegreeDecimal = LatLongUtil.degreeToMinutes(latitudeDms);

    // longitude
    Integer[] longitudeDms =
        new Integer[] {
          meanLongDegSum.intValue(), meanLongMinSum.intValue(), meanLongSecSum.intValue()
        };
    BigDecimal longitudeDegreeDecimal = LatLongUtil.degreeToMinutes(longitudeDms);

    return new GeospatialRespondDto(
        null,
        null,
        null,
        null,
        null,
        null,
        latitudeDegreeDecimal,
        longitudeDegreeDecimal,
        meanElevationSum.intValue());
  }

  /**
   * Does the calculation for each genetic trait. PS: if the threshold of 70% of contribution from
   * the parent tree is not met, the trait value will not be shown.
   *
   * @param traitsDto A {@link List} of {@link GeneticWorthTraitsRequestDto} with the traits and
   *     values to be calculated.
   * @return A {@link PtCalculationResDto} containing all calculated values
   */
  public PtCalculationResDto calculatePtVals(List<GeneticWorthTraitsRequestDto> traitsDto) {
    BigDecimal neValue = geneticWorthService.calculateNe(traitsDto);

    List<GeneticWorthTraitsDto> calculatedGws =
        geneticWorthService.calculateGeneticWorth(traitsDto);

    PtCalculationResDto summaryDto =
        new PtCalculationResDto(
            calculatedGws,
            new CaculatedParentTreeValsDto(
                neValue,
                new GeospatialRespondDto(null, null, null, null, null, null, null, null, null)));

    return summaryDto;
  }
}
