package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.LatLongRequestDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeLocInfoDto;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.util.LatLongUtil;
import java.math.BigDecimal;
import java.util.ArrayList;
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

  /**
   * Calculate lat long and elevation values given a list of {@link LatLongRequestDto}.
   *
   * @param ptreeIds List of parent trees and traits.
   * @return A List of {@link ParentTreeLocInfoDto}
   */
  public List<ParentTreeLocInfoDto> getLatLongElevation(List<LatLongRequestDto> ptreeIds) {
    SparLog.info(
        "{} parent tree record(s) received to calculate lat long and elevation", ptreeIds.size());

    List<Integer> ptIds = ptreeIds.stream().map(LatLongRequestDto::parentTreeId).toList();

    List<ParentTreeLocInfoDto> oracleDtoList =
        oracleApiProvider.getParentTreeLatLongByIdList(ptIds);

    if (oracleDtoList.isEmpty()) {
      SparLog.info("No parent tree lat long data from Oracle for the given parent tree ids.");
      return List.of();
    }

    Map<Integer, ParentTreeLocInfoDto> oracleMap =
        oracleDtoList.stream()
            .collect(Collectors.toMap(ParentTreeLocInfoDto::getParentTreeId, Function.identity()));

    List<ParentTreeLocInfoDto> resultList = new ArrayList<>();

    // Second loop through list to calculate proportion and weight values.
    for (LatLongRequestDto dto : ptreeIds) {
      // frontend already do this:

      ParentTreeLocInfoDto parentTreeDto = oracleMap.get(dto.parentTreeId());
      if (Objects.isNull(parentTreeDto)) {
        SparLog.info(
            "Unable to calculate for parent tree {}, no data found on Oracle!", dto.parentTreeId());
        continue;
      }

      parentTreeDto.setLongitudeDegrees(parentTreeDto.getLongitudeDegrees() * -1);

      // mean elevation = parent tree proportion * elevation
      BigDecimal weightedElevation =
          dto.proportion().multiply(new BigDecimal(parentTreeDto.getElevation()));
      parentTreeDto.setWeightedElevation(weightedElevation);

      // latitude
      double[] latDegree =
          new double[] {
            parentTreeDto.getLatitudeDegrees(),
            parentTreeDto.getLatitudeMinutes(),
            parentTreeDto.getLatitudeSeconds()
          };
      BigDecimal collectionLat = LatLongUtil.degreeToMinutes(latDegree); // (degree*60)+min+(sec/60)
      parentTreeDto.setLatitudeDegreesFmt(LatLongUtil.degreeToDecimal(latDegree));

      // longitude
      double[] longDegree =
          new double[] {
            parentTreeDto.getLongitudeDegrees(),
            parentTreeDto.getLongitudeMinutes(),
            parentTreeDto.getLongitudeSeconds()
          };
      BigDecimal collectionLong =
          LatLongUtil.degreeToMinutes(longDegree); // (degree*60)+min+(sec/60)
      parentTreeDto.setLongitudeDegreeFmt(LatLongUtil.degreeToDecimal(longDegree));

      // parent tree weighted lat x long
      parentTreeDto.setWeightedLatitude(dto.proportion().multiply(collectionLat));
      parentTreeDto.setWeightedLongitude(dto.proportion().multiply(collectionLong));

      resultList.add(parentTreeDto);
    }

    return resultList;
  }
}
