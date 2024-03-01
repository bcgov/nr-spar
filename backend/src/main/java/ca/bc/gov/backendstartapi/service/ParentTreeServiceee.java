package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.dto.LatLongRequestDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeLatLongDto;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.util.LatLongUtil;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

/** This class holds methods for handling Parent Trees records. */
@Service
public class ParentTreeServiceee {

  @Autowired
  @Qualifier("oracleApi")
  private  Provider oracleProvider;

  public List<ParentTreeLatLongDto> getLatLongElevation(List<LatLongRequestDto> ptreeIds) {
    SparLog.info(
        "{} parent tree record(s) received to calculate lat long and elevation", ptreeIds.size());

    List<Long> ptIds = ptreeIds.stream().map(LatLongRequestDto::parentTreeId).toList();

    List<ParentTreeLatLongDto> oracleDtoList = oracleProvider.getParentTreeLatLongByIdList(ptIds);

    if (oracleDtoList.isEmpty()) {
      SparLog.info("No parent tree lat long data from Oracle for the given parent tree ids.");
      return List.of();
    }

    Map<Integer, ParentTreeLatLongDto> oracleMap =
        oracleDtoList.stream()
            .collect(Collectors.toMap(ParentTreeLatLongDto::getParentTreeId, Function.identity()));

    BigDecimal amountOfMaterialSum = BigDecimal.ZERO;
    // int amountOutside = 0;

    // First loop through list to get total amount of material and # of pt outside of seedlot.
    for (LatLongRequestDto dto : ptreeIds) {
      amountOfMaterialSum = amountOfMaterialSum.add(dto.amountOfMaterial());

      // if (!dto.insideOrchard()) {
      //  amountOutside++;
      // }
    }

    List<ParentTreeLatLongDto> resultList = new ArrayList<>();

    // Second loop through list to calculate proportion and weight values.
    for (LatLongRequestDto dto : ptreeIds) {
      // frontend already do this:
      BigDecimal proportion =
          dto.amountOfMaterial().divide(amountOfMaterialSum, 10, RoundingMode.HALF_UP);

      ParentTreeLatLongDto parentTreeDto = oracleMap.get(dto.parentTreeId());
      if (Objects.isNull(parentTreeDto)) {
        SparLog.info(
            "Unable to calculate for parent tree {}, no data found on Oracle!", dto.parentTreeId());
        continue;
      }

      parentTreeDto.setWeightedTraiList(new ArrayList<>());
      for (GeneticWorthTraitsDto traitDto : dto.traitsList()) {
        // weighted for each trait
        BigDecimal weighted = proportion.multiply(traitDto.traitValue());

        String waightedTrait = traitDto.traitCode() + ": " + weighted;
        parentTreeDto.getWeightedTraiList().add(waightedTrait);
      }

      // mean elevation
      BigDecimal weightedElevation =
          proportion.multiply(new BigDecimal(parentTreeDto.getElevation()));
      parentTreeDto.setWeightedElevation(weightedElevation);

      int[] latDegree =
          new int[] {
            parentTreeDto.getLatitudeDegrees(),
            parentTreeDto.getLatitudeMinutes(),
            parentTreeDto.getLatitudeSeconds()
          };
      BigDecimal vCollLatMin = LatLongUtil.degreeToMinutes(latDegree);
      BigDecimal vCollLatDec = LatLongUtil.degreeToDecimal(latDegree, false);

      int[] longDegree =
          new int[] {
            parentTreeDto.getLongitudeDegrees(),
            parentTreeDto.getLongitudeMinutes(),
            parentTreeDto.getLongitudeSeconds()
          };
      BigDecimal vCollLongMin = LatLongUtil.degreeToMinutes(longDegree);
      BigDecimal vCollLongDec = LatLongUtil.degreeToDecimal(longDegree, true);

      parentTreeDto.setWeightedLatMinutes(proportion.multiply(vCollLatMin));
      parentTreeDto.setWeightedLatDecimal(proportion.multiply(vCollLatDec));
      parentTreeDto.setWeightedLongMinutes(proportion.multiply(vCollLongMin));
      parentTreeDto.setWeightedLongDecimal(proportion.multiply(vCollLongDec));

      resultList.add(parentTreeDto);
    }

    return resultList;
  }
}
