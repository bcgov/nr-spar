package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.CaculatedParentTreeValsDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.dto.GeospatialOracleResDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRequestDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRespondDto;
import ca.bc.gov.backendstartapi.dto.PtCalculationResDto;
import ca.bc.gov.backendstartapi.dto.PtValsCalReqDto;
import ca.bc.gov.backendstartapi.exception.PtGeoDataNotFoundException;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.util.LatLongUtil;
import java.math.BigDecimal;
import java.math.RoundingMode;
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
  public GeospatialRespondDto calcSmpMixGeospatial(
      List<GeospatialRequestDto> ptreeIdAndProportions) {
    SparLog.info(
        "{} parent tree record(s) received to calculate lat long and elevation",
        ptreeIdAndProportions.size());

    List<Integer> ptIds =
        ptreeIdAndProportions.stream().map(GeospatialRequestDto::parentTreeId).toList();

    List<GeospatialOracleResDto> oracleDtoList =
        oracleApiProvider.getPtGeospatialDataByIdList(ptIds);

    if (oracleDtoList.isEmpty()) {
      SparLog.info("No parent tree geo data from Oracle for the given parent tree ids");
      throw new PtGeoDataNotFoundException();
    }

    Map<Integer, GeospatialOracleResDto> oracleMap =
        oracleDtoList.stream()
            .collect(Collectors.toMap(GeospatialOracleResDto::parentTreeId, Function.identity()));

    // Accumulators of weigthed values, convert DMS to Decimal degrees in the end for max precision.
    BigDecimal meanLatDegSum = BigDecimal.ZERO;
    BigDecimal meanLatMinSum = BigDecimal.ZERO;
    BigDecimal meanLatSecSum = BigDecimal.ZERO;
    BigDecimal meanLongDegSum = BigDecimal.ZERO;
    BigDecimal meanLongMinSum = BigDecimal.ZERO;
    BigDecimal meanLongSecSum = BigDecimal.ZERO;
    BigDecimal meanElevationSum = BigDecimal.ZERO;

    // Loop through list to calculate weighted values then sum them up.
    // Reference: legacy SPAR database/ddl/pkg/SPR_001A_SMP_CALCULATION.PKS
    for (GeospatialRequestDto dto : ptreeIdAndProportions) {
      // frontend already do this:

      GeospatialOracleResDto geospatialResDto = oracleMap.get(dto.parentTreeId());
      if (Objects.isNull(geospatialResDto)) {
        SparLog.info(
            "Unable to calculate for parent tree {}, no data found on Oracle!", dto.parentTreeId());
        continue;
      }

      // Definition: weighted value = proportion * value

      BigDecimal proportion = dto.proportion().divide(new BigDecimal(100));

      // Elevation
      BigDecimal weightedElevation =
          proportion.multiply(new BigDecimal(geospatialResDto.elevation()));
      meanElevationSum = meanElevationSum.add(weightedElevation);

      // Latitude
      BigDecimal weightedLatDeg =
          proportion.multiply(new BigDecimal(geospatialResDto.latitudeDegree()));
      meanLatDegSum = meanLatDegSum.add(weightedLatDeg);

      BigDecimal weightedLatMin =
          proportion.multiply(new BigDecimal(geospatialResDto.latitudeMinute()));
      meanLatMinSum = meanLatMinSum.add(weightedLatMin);

      BigDecimal weightedLatSec =
          proportion.multiply(new BigDecimal(geospatialResDto.latitudeSecond()));
      meanLatSecSum = meanLatSecSum.add(weightedLatSec);

      // Longitude
      BigDecimal weightedLongDeg =
          proportion.multiply(new BigDecimal(geospatialResDto.longitudeDegree()));
      meanLongDegSum = meanLongDegSum.add(weightedLongDeg);

      BigDecimal weightedLongMin =
          proportion.multiply(new BigDecimal(geospatialResDto.longitudeMinute()));
      meanLongMinSum = meanLongMinSum.add(weightedLongMin);

      BigDecimal weightedLongSec =
          proportion.multiply(new BigDecimal(geospatialResDto.longitudeSecond()));
      meanLongSecSum = meanLongSecSum.add(weightedLongSec);
    }

    // latitude
    Integer[] latitudeDms =
        new Integer[] {
          meanLatDegSum.intValue(), meanLatMinSum.intValue(), meanLatSecSum.intValue()
        };
    BigDecimal latitudeDecimalDegree = LatLongUtil.dmsToDecimalDegree(latitudeDms);

    // longitude
    Integer[] longitudeDms =
        new Integer[] {
          meanLongDegSum.intValue(), meanLongMinSum.intValue(), meanLongSecSum.intValue()
        };
    BigDecimal longitudeDecimalDegree = LatLongUtil.dmsToDecimalDegree(longitudeDms);

    GeospatialRespondDto result = new GeospatialRespondDto();
    /**
     * latitudeDms[0], latitudeDms[1], latitudeDms[2], longitudeDms[0], longitudeDms[1],
     * longitudeDms[2], latitudeDecimalDegree, longitudeDecimalDegree, meanElevationSum.intValue()
     */
    result.setMeanElevation(meanElevationSum.intValue());
    result.setMeanLatitudeDegree(latitudeDms[0]);
    result.setMeanLatitudeMinute(latitudeDms[1]);
    result.setMeanLatitudeSecond(latitudeDms[2]);
    result.setMeanLongitudeDegree(longitudeDms[0]);
    result.setMeanLongitudeMinute(longitudeDms[1]);
    result.setMeanLongitudeSecond(longitudeDms[2]);
    result.setMeanLatitude(latitudeDecimalDegree);
    result.setMeanLongitude(longitudeDecimalDegree);

    return result;
  }

  /**
   * Does the calculation for each genetic trait. PS: if the threshold of 70% of contribution from
   * the parent tree is not met, the trait value will not be shown.
   *
   * @param traitsDto A {@link List} of {@link PtValsCalReqDto} with the traits and values to be
   *     calculated.
   * @return A {@link PtCalculationResDto} containing all calculated values
   */
  public PtCalculationResDto calculatePtVals(List<PtValsCalReqDto> traitsDto) {
    BigDecimal neValue = geneticWorthService.calculateNe(traitsDto);

    List<GeneticWorthTraitsDto> calculatedGws =
        geneticWorthService.calculateGeneticWorth(traitsDto);

    CaculatedParentTreeValsDto calculatedVals = new CaculatedParentTreeValsDto();
    calculatedVals.setNeValue(neValue);
    calculatedVals.setGeospatialData(calcSeedlotGeoData(traitsDto));

    PtCalculationResDto summaryDto = new PtCalculationResDto(calculatedGws, calculatedVals);

    return summaryDto;
  }

  /**
   * All reference to Certification Template Col is labled with an id such as AM, AN or AL Find
   * these calculation definition in SPR01A_PTContribution.htm
   */
  private GeospatialRespondDto calcSeedlotGeoData(List<PtValsCalReqDto> ptValDtos) {
    BigDecimal totalConeCount =
        ptValDtos.stream().map(PtValsCalReqDto::coneCount).reduce(BigDecimal.ZERO, BigDecimal::add);

    // Proportion: (v_p_prop_contrib-((v_female_crop_pop*v_a_smp_success_pct)/200)

    ptValDtos.forEach(
        ptVal -> {
          BigDecimal proportion = calcProportion(ptVal, totalConeCount);
        });

    // Mean Lat = SUM(Wtd Lat. with parent and SMP pollen)
    // Wtd Lat. with parent and SMP pollen is defined in  w/ id = AM

    // Mean Long = SUM(Wtd. Long. with parent and SMP pollen)
    // Wtd Long. with parent and SMP pollen is defined in Certification Template Col w/ id = AN

    // Mean Elev. = SUM(Wtd. elev with parent and SMP pollen)
    // Wtd elev. with parent and SMP pollen is defined in Certification Template Col w/ id = AL

    return new GeospatialRespondDto();
  }

  // DEF: prop = v_p_prop_contrib-((v_female_crop_pop*v_a_smp_success_pct)/200)
  private BigDecimal calcProportion(PtValsCalReqDto ptValDto, BigDecimal totalConeCount) {
    int DIVISION_SCALE = 6;
    /*
     * --col:V
     * IF v_total_cone_count = 0 THEN
     *   v_female_crop_pop := 0;
     * ELSE
     *    v_female_crop_pop := v_a_cone_count / v_total_cone_count;
     */
    BigDecimal femaleCropPop = BigDecimal.ZERO;

    if (!totalConeCount.equals(BigDecimal.ZERO)) {
      femaleCropPop =
          ptValDto.coneCount().divide(totalConeCount, DIVISION_SCALE, RoundingMode.HALF_UP);
    }

    // Integer sum = integers.stream().reduce(0, (a, b) -> a + b);

    /*
     * --col:AE
     * IF v_total_pollen_count = 0 THEN
     *  v_p_prop_contrib := v_female_crop_pop;
     * ELSE
     *  v_p_prop_contrib := (v_female_crop_pop + v_parent_prop_orch_poll) / 2;
     */

    BigDecimal prop = BigDecimal.ZERO;

    return prop;
  }
}
