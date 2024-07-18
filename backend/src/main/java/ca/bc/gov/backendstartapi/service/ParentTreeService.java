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
import java.util.HashMap;
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

  static int DIVISION_SCALE = 10;
  static BigDecimal PERC_DIVISOR = new BigDecimal(100);
  static BigDecimal HALF_DIVISOR = new BigDecimal(2);
  static BigDecimal PROP_DIVISOR = new BigDecimal(200);
  static BigDecimal MAX_PROPORTION = new BigDecimal(1);

  /**
   * Does the calculation for each genetic trait. PS: if the threshold of 70% of contribution from
   * the parent tree is not met, the trait value will not be shown.
   *
   * @param ptVals A {@link PtValsCalReqDto} sent by an endpoint consumer for calculation
   * @return A {@link PtCalculationResDto} containing all calculated values
   */
  public PtCalculationResDto calculatePtVals(PtValsCalReqDto ptVals) {
    SparLog.info(
        "Started calculation for parent tree contribution values. Number of rchard parent received:"
            + " {}. Number of SMP mix parent tree received: {}.",
        ptVals.orchardPtVals().size(),
        ptVals.smpMixIdAndProps().size());

    Map<String, BigDecimal> valueHolder = new HashMap<>();

    CaculatedParentTreeValsDto calculatedVals = new CaculatedParentTreeValsDto();

    GeospatialRespondDto smpMixGeoData = calcMeanGeospatial(ptVals.smpMixIdAndProps());
    SparLog.info("SMP mix mean geospatial calculation complete.");

    calculatedVals.setGeospatialData(calcSeedlotGeoData(ptVals, smpMixGeoData, valueHolder));
    SparLog.info("Seedlot mean geospatial calculation complete.");

    BigDecimal neValue = geneticWorthService.calculateNe(ptVals.orchardPtVals(), valueHolder);
    calculatedVals.setNeValue(neValue);

    List<GeneticWorthTraitsDto> calculatedGws =
        geneticWorthService.calculateGeneticWorth(ptVals.orchardPtVals());

    PtCalculationResDto summaryDto =
        new PtCalculationResDto(calculatedGws, calculatedVals, smpMixGeoData);

    return summaryDto;
  }

  /**
   * Calculate mean geospatial values given a list of {@link GeospatialRequestDto}.
   *
   * @param ptreeIdAndProportions List of parent tree id and proportion.
   * @return A List of {@link GeospatialRespondDto}
   */
  private GeospatialRespondDto calcMeanGeospatial(
      List<GeospatialRequestDto> ptreeIdAndProportions) {
    SparLog.info(
        "{} parent tree record(s) received to calculate lat long and elevation",
        ptreeIdAndProportions.size());

    List<GeospatialOracleResDto> oracleDtoList = List.of();
    if (!ptreeIdAndProportions.isEmpty()) {
      List<Long> ptIds =
        ptreeIdAndProportions.stream().map(GeospatialRequestDto::parentTreeId).toList();

      oracleDtoList = oracleApiProvider.getPtGeospatialDataByIdList(ptIds);
    }

    if (oracleDtoList.isEmpty() && !ptreeIdAndProportions.isEmpty()) {
      SparLog.info(
          "Parent tree ids not found from Oracle for the given parent tree ids: {}",
          ptreeIdAndProportions.stream().map(GeospatialRequestDto::parentTreeId).toList());
      throw new PtGeoDataNotFoundException();
    }

    Map<Long, GeospatialOracleResDto> oracleMap =
        oracleDtoList.stream()
            .collect(Collectors.toMap(GeospatialOracleResDto::parentTreeId, Function.identity()));

    // Accumulators of weigthed values, convert DMS to minutes (legacy algo) then sum it up.
    BigDecimal meanLatMinSum = BigDecimal.ZERO;
    BigDecimal meanLongMinSum = BigDecimal.ZERO;
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
      Integer[] ptLatDms =
          new Integer[] {
            geospatialResDto.latitudeDegree(),
            geospatialResDto.latitudeMinute(),
            geospatialResDto.latitudeSecond()
          };
      BigDecimal latMinute = LatLongUtil.dmsToMinute(ptLatDms);
      BigDecimal weightedLatMin = proportion.multiply(latMinute);
      meanLatMinSum = meanLatMinSum.add(weightedLatMin);

      // Longitude
      Integer[] ptLongDms =
          new Integer[] {
            geospatialResDto.longitudeDegree(),
            geospatialResDto.longitudeMinute(),
            geospatialResDto.longitudeSecond()
          };
      BigDecimal longMinute = LatLongUtil.dmsToMinute(ptLongDms);
      BigDecimal weightedLongMin = proportion.multiply(longMinute);
      meanLongMinSum = meanLongMinSum.add(weightedLongMin);
    }

    // latitude
    Integer[] latitudeDms = LatLongUtil.minuteToDms(meanLatMinSum);
    BigDecimal latitudeDecimalDegree = LatLongUtil.dmsToDecimalDegree(latitudeDms);

    // longitude
    Integer[] longitudeDms = LatLongUtil.minuteToDms(meanLongMinSum);
    BigDecimal longitudeDecimalDegree = LatLongUtil.dmsToDecimalDegree(longitudeDms);

    GeospatialRespondDto result = new GeospatialRespondDto();

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
   * All reference to Certification Template Col is labelled with an id such as AM, AN or AL Find
   * these calculation definition in SPR01A_PTContribution.htm
   */
  private GeospatialRespondDto calcSeedlotGeoData(
      PtValsCalReqDto ptValDtos, GeospatialRespondDto smpMixGeoData, Map<String, BigDecimal> valueHolder) {
    List<OrchardParentTreeValsDto> orchardPtVals = ptValDtos.orchardPtVals();

    BigDecimal totalConeCount =
        orchardPtVals.stream()
            .map(OrchardParentTreeValsDto::coneCount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal totalPollenCount =
        orchardPtVals.stream()
            .map(OrchardParentTreeValsDto::pollenCount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    List<Long> orchardPtIds =
        orchardPtVals.stream()
            .map(OrchardParentTreeValsDto::parentTreeId)
            .map(Long::parseLong)
            .toList();
    List<GeospatialOracleResDto> orchardPtGeoData =
        oracleApiProvider.getPtGeospatialDataByIdList(orchardPtIds);

    Map<Long, GeospatialOracleResDto> orchardPtGeoDataMap =
        orchardPtGeoData.stream()
            .collect(Collectors.toMap(GeospatialOracleResDto::parentTreeId, Function.identity()));

    BigDecimal wtdLatMinuteSum = BigDecimal.ZERO;
    BigDecimal wtdLongMinuteSum = BigDecimal.ZERO;
    BigDecimal wtdElevSum = BigDecimal.ZERO;

    for (OrchardParentTreeValsDto ptVal : orchardPtVals) {

      GeospatialOracleResDto ptGeoData =
          orchardPtGeoDataMap.get(Long.valueOf(ptVal.parentTreeId()));

      if (Objects.isNull(ptGeoData)) {
        SparLog.info(
            "Unable to calculate for parent tree {}, no data found on Oracle!",
            ptVal.parentTreeId());
        continue;
      }

      BigDecimal femaleCropPop = calcFemaleCropPop(ptVal, totalConeCount);

      BigDecimal proportion = calcProportion(ptVal, femaleCropPop, totalPollenCount, valueHolder);

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
       *  v_p_contrib_lat_no_smp_poll :=
       *      v_coll_lat * (v_p_prop_contrib-((v_female_crop_pop*v_a_smp_success_pct)/200));
       *
       *  STEP 1
       *  AJ:
       *  v_smp_poll_wtd_contrib_lat := ((v_lat * v_a_smp_success_pct)/200)*v_female_crop_pop;
       *
       *  STEP 0
       *  T:
       *  v_lat := (v_a_smp_mix_latitude_degrees*3600) + (v_a_smp_mix_latitude_minutes*60);
       *  Although smp_mix_latitude_degrees and smp_mix_minutes are individual values
       *  in the Oracle Seedlot_Parent_Tree table, according to SPR_001A_SMP_CALCULATION.PKS,
       *  those values are the same for a given seedlot, calculated from v_sum_wtd_lat.
       *
       *  NOTE: We use decimal degrees instead of converting everything to seconds.
       */

      // Step 0 - smpMixLat is v_lat as the name v_lat is too generic
      BigDecimal smpMixLat = smpMixGeoData.getMeanLatitude();

      // Step 1
      BigDecimal smpPollWtdContribLat =
          smpMixLat.multiply(smpSuccessPerc).divide(PROP_DIVISOR).multiply(femaleCropPop);

      // Step 2
      Integer[] latDms =
          new Integer[] {
            ptGeoData.latitudeDegree(), ptGeoData.latitudeMinute(), ptGeoData.latitudeSecond()
          };
      BigDecimal ptLatMinute = LatLongUtil.dmsToMinute(latDms);
      BigDecimal parentContribLatNoSmpPoll = ptLatMinute.multiply(proportion);

      // Step 3
      BigDecimal wtdParentLat = parentContribLatNoSmpPoll.add(smpPollWtdContribLat);
      wtdLatMinuteSum = wtdLatMinuteSum.add(wtdParentLat);

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
      BigDecimal ptLongMinute = LatLongUtil.dmsToMinute(longDms);
      BigDecimal parentContribLongNoSmpPoll = ptLongMinute.multiply(proportion);

      BigDecimal wtdParentLong = parentContribLongNoSmpPoll.add(smpPollWtdContribLong);
      wtdLongMinuteSum = wtdLongMinuteSum.add(wtdParentLong);

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

    Integer[] latDms = LatLongUtil.minuteToDms(wtdLatMinuteSum);
    result.setMeanLatitudeDegree(latDms[0]);
    result.setMeanLatitudeMinute(latDms[1]);
    result.setMeanLatitudeSecond(latDms[2]);

    Integer[] longDms = LatLongUtil.minuteToDms(wtdLongMinuteSum);
    result.setMeanLongitudeDegree(longDms[0]);
    result.setMeanLongitudeMinute(longDms[1]);
    result.setMeanLongitudeSecond(longDms[2]);

    result.setMeanElevation(wtdElevSum.setScale(0, RoundingMode.HALF_UP).intValue());
    result.setMeanLatitude(LatLongUtil.dmsToDecimalDegree(latDms));
    result.setMeanLongitude(LatLongUtil.dmsToDecimalDegree(longDms));

    return result;
  }

  /**
   * Calculate the proportion for parent contribution without SMP Pollen.
   *
   * @return prop = v_p_prop_contrib-((v_female_crop_pop*v_a_smp_success_pct)/200)
   */
  private BigDecimal calcProportion(
      OrchardParentTreeValsDto ptValDto, BigDecimal femaleCropPop, BigDecimal totalPollenCount, Map<String, BigDecimal> valueHolder) {
    /*
     * REFERENCE v_parent_prop_orch_poll
     * --col:W
     * IF v_total_pollen_count = 0 THEN
     *  v_parent_prop_orch_poll := 0;
     * ELSE
     *  v_parent_prop_orch_poll := NVL(p_pt(i).pollen_count,0) / v_total_pollen_count;
     */
    BigDecimal parentPropOrchPoll = BigDecimal.ZERO;
    if (totalPollenCount.compareTo(BigDecimal.ZERO) > 0) {
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
    BigDecimal parentPropContrib;
    if (totalPollenCount.compareTo(BigDecimal.ZERO) == 0) {
      parentPropContrib = femaleCropPop;
    } else {
      parentPropContrib = (femaleCropPop.add(parentPropOrchPoll)).divide(HALF_DIVISOR);
    }
    valueHolder.put("parentPropContrib", parentPropContrib);

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

    if (totalConeCount.compareTo(BigDecimal.ZERO) > 0) {
      femaleCropPop =
          ptValDto.coneCount().divide(totalConeCount, DIVISION_SCALE, RoundingMode.HALF_UP);
    }

    return femaleCropPop;
  }
}
