package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.CaculatedParentTreeValsDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.dto.GeospatialOracleResDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRequestDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRespondDto;
import ca.bc.gov.backendstartapi.dto.OrchardParentTreeValsDto;
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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** This class holds methods for handling Parent Trees records. */
@Service
@RequiredArgsConstructor
public class ParentTreeService {

  @Qualifier("oracleApi")
  private final Provider oracleApiProvider;

  private final GeneticWorthService geneticWorthService;

  static int DIVISION_SCALE = 6;
  static int DECIMAL_DEGREE_SCALE = 5;
  static BigDecimal PERC_DIVISOR = new BigDecimal(100);
  static BigDecimal HALF_DIVISOR = new BigDecimal(2);
  static BigDecimal PROP_DIVISOR = new BigDecimal(200);
  static BigDecimal MAX_PROPORTION = new BigDecimal(1);

  /**
   * Does the calculation for each genetic trait. PS: if the threshold of 70% of contribution from
   * the parent tree is not met, the trait value will not be shown.
   *
   * @param traitsDto A {@link List} of {@link PtValsCalReqDto} with the traits and values to be
   *     calculated.
   * @return A {@link PtCalculationResDto} containing all calculated values
   */
  public PtCalculationResDto calculatePtVals(PtValsCalReqDto ptVals) {
    BigDecimal neValue = geneticWorthService.calculateNe(ptVals.orchardPtVals());

    List<GeneticWorthTraitsDto> calculatedGws =
        geneticWorthService.calculateGeneticWorth(ptVals.orchardPtVals());

    CaculatedParentTreeValsDto calculatedVals = new CaculatedParentTreeValsDto();
    calculatedVals.setNeValue(neValue);

    GeospatialRespondDto smpMixGeoData = calcMeanGeospatial(ptVals.smpMixIdAndProps());

    calculatedVals.setGeospatialData(calcSeedlotGeoData(ptVals, smpMixGeoData));

    PtCalculationResDto summaryDto =
        new PtCalculationResDto(calculatedGws, calculatedVals, smpMixGeoData);

    return summaryDto;
  }

  /**
   * Calculate lat long and elevation values given a list of {@link GeospatialRequestDto}.
   *
   * @param ptreeIds List of parent trees and traits.
   * @return A List of {@link GeospatialRespondDto}
   */
  private GeospatialRespondDto calcMeanGeospatial(
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

      BigDecimal proportion = dto.proportion();
      if (proportion.compareTo(MAX_PROPORTION) >= 0) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            String.format(
                "Invalid proportion with %s for parent tree id: %s.",
                proportion.toString(), dto.parentTreeId().toString()));
      }

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
   * All reference to Certification Template Col is labled with an id such as AM, AN or AL Find
   * these calculation definition in SPR01A_PTContribution.htm
   */
  private GeospatialRespondDto calcSeedlotGeoData(
      PtValsCalReqDto ptValDtos, GeospatialRespondDto smpMixGeoData) {
    List<OrchardParentTreeValsDto> orchardPtVals = ptValDtos.orchardPtVals();

    BigDecimal totalConeCount =
        orchardPtVals.stream()
            .map(OrchardParentTreeValsDto::coneCount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal totalPollenCount =
        orchardPtVals.stream()
            .map(OrchardParentTreeValsDto::pollenCount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    List<Integer> orchardPtIds =
        orchardPtVals.stream()
            .map(OrchardParentTreeValsDto::parentTreeId)
            .map(Integer::parseInt)
            .toList();
    List<GeospatialOracleResDto> orchardPtGeoData =
        oracleApiProvider.getPtGeospatialDataByIdList(orchardPtIds);

    Map<Integer, GeospatialOracleResDto> orchardPtGeoDataMap =
        orchardPtGeoData.stream()
            .collect(Collectors.toMap(GeospatialOracleResDto::parentTreeId, Function.identity()));

    BigDecimal wtdLatSum = BigDecimal.ZERO;
    BigDecimal wtdLongSum = BigDecimal.ZERO;
    BigDecimal wtdElevSum = BigDecimal.ZERO;

    for (OrchardParentTreeValsDto ptVal : orchardPtVals) {

      GeospatialOracleResDto ptGeoData =
          orchardPtGeoDataMap.get(Integer.valueOf(ptVal.parentTreeId()));

      if (Objects.isNull(ptGeoData)) {
        SparLog.info(
            "Unable to calculate for parent tree {}, no data found on Oracle!",
            ptVal.parentTreeId());
        continue;
      }

      BigDecimal femaleCropPop = calcFemaleCropPop(ptVal, totalConeCount);

      BigDecimal proportion =
          calcProportion(ptVal, femaleCropPop, totalConeCount, totalPollenCount);

      BigDecimal smpSuccessPerc = new BigDecimal(ptVal.smpSuccessPerc());

      /*
       * Mean Lat = SUM(Wtd Lat. with parent and SMP pollen)
       * Wtd Lat. with parent and SMP pollen is defined in  w/ id = AM
       *
       *  STEP 3
       *  AM:
       *  v_wtd_lat_p_and_smp_poll := v_p_contrib_lat_no_smp_poll + v_smp_poll_wtd_contrib_lat;
       *  v_sum_wtd_lat_p_and_smp_poll := v_sum_wtd_lat_p_and_smp_poll + v_wtd_lat_p_and_smp_poll;
       *
       *  STEP 2
       *  AG:
       *  v_p_contrib_lat_no_smp_poll := v_coll_lat * (v_p_prop_contrib-((v_female_crop_pop*v_a_smp_success_pct)/200));
       *
       *  STEP 1
       *  AJ:
       *  v_smp_poll_wtd_contrib_lat := ((v_lat * v_a_smp_success_pct)/200)*v_female_crop_pop;
       *
       *  STEP 0
       *  T:
       *  v_lat := (v_a_smp_mix_latitude_degrees*3600) + (v_a_smp_mix_latitude_minutes*60);
       *  Although smp_mix_latitude_degrees and smp_mix_minutes are individual values in the Oracle Seedlot_Parent_Tree table,
       *  according to SPR_001A_SMP_CALCULATION.PKS, those values are the same for a given seedlot, calculated from v_sum_wtd_lat.
       *
       *  NOTE: We use decimal degrees instead of converting everything to seconds.
       */

      // Step 0 - v_lat
      BigDecimal smpMixLat = smpMixGeoData.getMeanLatitude();

      // Step 1
      BigDecimal smpPollWtdContribLat =
          smpMixLat.multiply(smpSuccessPerc).divide(PROP_DIVISOR).multiply(femaleCropPop);

      // Step 2
      Integer[] latDms =
          new Integer[] {
            ptGeoData.latitudeDegree(), ptGeoData.latitudeMinute(), ptGeoData.latitudeSecond()
          };
      BigDecimal ptDecimalLat = LatLongUtil.dmsToDecimalDegree(latDms);
      BigDecimal parentContribLatNoSmpPoll = ptDecimalLat.multiply(proportion);

      // Step 3
      BigDecimal wtdParentLat = parentContribLatNoSmpPoll.add(smpPollWtdContribLat);
      wtdLatSum = wtdLatSum.add(wtdParentLat);

      // Mean Long = SUM(Wtd. Long. with parent and SMP pollen)
      // Wtd Long. with parent and SMP pollen is defined in Certification Template Col w/ id
      // AN
      // Calculations are similar to those of Lat's, but wiht long values
      BigDecimal smpMixLong = smpMixGeoData.getMeanLongitude();

      BigDecimal smpPollWtdContribLong =
          smpMixLong.multiply(smpSuccessPerc).divide(PROP_DIVISOR).multiply(femaleCropPop);

      Integer[] longDms =
          new Integer[] {
            ptGeoData.longitudeDegree(), ptGeoData.longitudeMinute(), ptGeoData.longitudeSecond()
          };
      BigDecimal ptDecimalLong = LatLongUtil.dmsToDecimalDegree(longDms);
      BigDecimal parentContribLongNoSmpPoll = ptDecimalLong.multiply(proportion);

      BigDecimal wtdParentLong = parentContribLongNoSmpPoll.add(smpPollWtdContribLong);
      wtdLongSum = wtdLongSum.add(wtdParentLong);

      // Mean Elev. = SUM(Wtd. elev with parent and SMP pollen)
      // Wtd elev. with parent and SMP pollen is defined in Certification Template Col w/ id
      // AL
      // Calculations are similar to those of Lat's, but wiht elevation values
      BigDecimal smpMixElev = new BigDecimal(smpMixGeoData.getMeanElevation());

      BigDecimal smpPollWtdContribElev =
          smpMixElev.multiply(smpSuccessPerc).divide(PROP_DIVISOR).multiply(femaleCropPop);

      BigDecimal ptElev = new BigDecimal(ptGeoData.elevation());
      BigDecimal parentContribElevNoSmpPoll = ptElev.multiply(proportion);

      BigDecimal wtdParentElev = parentContribElevNoSmpPoll.add(smpPollWtdContribElev);
      wtdElevSum = wtdElevSum.add(wtdParentElev);
    }

    GeospatialRespondDto result = new GeospatialRespondDto();

    result.setMeanElevation(wtdElevSum.intValue());
    result.setMeanLatitude(wtdLatSum.setScale(DECIMAL_DEGREE_SCALE, RoundingMode.HALF_UP));
    result.setMeanLongitude(wtdLongSum.setScale(DECIMAL_DEGREE_SCALE, RoundingMode.HALF_UP));

    Integer[] latDMS = LatLongUtil.decimalDegreeToDms(wtdLatSum);
    result.setMeanLatitudeDegree(latDMS[0]);
    result.setMeanLatitudeMinute(latDMS[1]);
    result.setMeanLatitudeSecond(latDMS[2]);

    Integer[] longDMS = LatLongUtil.decimalDegreeToDms(wtdLongSum);
    result.setMeanLongitudeDegree(longDMS[0]);
    result.setMeanLongitudeMinute(longDMS[1]);
    result.setMeanLongitudeSecond(longDMS[2]);

    return result;
  }

  // DEF: prop = v_p_prop_contrib-((v_female_crop_pop*v_a_smp_success_pct)/200)
  private BigDecimal calcProportion(
      OrchardParentTreeValsDto ptValDto,
      BigDecimal femaleCropPop,
      BigDecimal totalConeCount,
      BigDecimal totalPollenCount) {
    /*
     * REFERENCE v_parent_prop_orch_poll
     * --col:W
     * IF v_total_pollen_count = 0 THEN
     *  v_parent_prop_orch_poll := 0;
     * ELSE
     *  v_parent_prop_orch_poll := NVL(p_pt(i).pollen_count,0) / v_total_pollen_count;
     */
    BigDecimal parentPropOrchPoll = BigDecimal.ZERO;
    if (!totalPollenCount.equals(BigDecimal.ZERO)) {
      parentPropOrchPoll =
          ptValDto.pollenCount().divide(totalPollenCount, DIVISION_SCALE, RoundingMode.HALF_UP);
    }

    /*
     * REFERENCE v_p_prop_contrib
     * --col:AE
     * IF v_total_pollen_count = 0 THEN
     *  v_p_prop_contrib := v_female_crop_pop;
     * ELSE
     *  v_p_prop_contrib := (v_female_crop_pop + v_parent_prop_orch_poll) / 2;
     */
    BigDecimal parentPropContrib = BigDecimal.ZERO;
    if (totalPollenCount.equals(BigDecimal.ZERO)) {
      parentPropContrib = femaleCropPop;
    } else {
      parentPropContrib = (femaleCropPop.add(parentPropOrchPoll)).divide(HALF_DIVISOR);
    }

    BigDecimal smpSuccessPerc = new BigDecimal(ptValDto.smpSuccessPerc()).divide(PERC_DIVISOR);

    // prop = v_p_prop_contrib-((v_female_crop_pop*v_a_smp_success_pct)/200)
    BigDecimal prop =
        parentPropContrib.subtract((femaleCropPop).multiply(smpSuccessPerc).divide(PROP_DIVISOR));

    return prop;
  }

  private BigDecimal calcFemaleCropPop(
      OrchardParentTreeValsDto ptValDto, BigDecimal totalConeCount) {
    /*
     * REFERENCE v_female_crop_pop
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

    return femaleCropPop;
  }
}
