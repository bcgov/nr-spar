package ca.bc.gov.oracleapi.service;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.AreaOfUseDto;
import ca.bc.gov.oracleapi.dto.AreaOfUseSpuGeoDto;
import ca.bc.gov.oracleapi.dto.SpzDto;
import ca.bc.gov.oracleapi.entity.SeedPlanUnit;
import ca.bc.gov.oracleapi.entity.SeedPlanZone;
import ca.bc.gov.oracleapi.entity.SeedPlanZoneCode;
import ca.bc.gov.oracleapi.entity.TestedPtAreaOfUse;
import ca.bc.gov.oracleapi.entity.TestedPtAreaOfUseSpu;
import ca.bc.gov.oracleapi.entity.TestedPtAreaOfUseSpz;
import ca.bc.gov.oracleapi.exception.TestedAreaOfUseNotFound;
import ca.bc.gov.oracleapi.repository.SeedPlanUnitRepository;
import ca.bc.gov.oracleapi.repository.SeedPlanZoneCodeRepository;
import ca.bc.gov.oracleapi.repository.SeedPlanZoneRepository;
import ca.bc.gov.oracleapi.repository.TestedPtAreaOfUseSpuRepository;
import ca.bc.gov.oracleapi.repository.TestedPtAreaOfUseSpzRepository;
import ca.bc.gov.oracleapi.repository.TestedPtAreaofUseRepository;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** The class for Area of Use Service. */
@Service
@RequiredArgsConstructor
public class AreaOfUseService {

  private final SeedPlanUnitRepository seedPlanUnitRepository;

  private final SeedPlanZoneRepository seedPlanZoneRepository;

  private final SeedPlanZoneCodeRepository seedPlanZoneCodeRepository;

  private final TestedPtAreaofUseRepository testedPtAreaofUseRepository;

  private final TestedPtAreaOfUseSpzRepository testedPtAreaOfUseSpzRepository;

  private final TestedPtAreaOfUseSpuRepository testedPtAreaOfUseSpuRepository;

  /**
   * Find all spz under a vegCode for A-Class.
   *
   * @return a list of {@link SpzDto}
   */
  public List<SpzDto> getSpzByVegCode(String vegCode) {
    SparLog.info("Begin to query SEED_PLAN_ZONE table for a list of unique spz code");

    List<SeedPlanZone> seedPlanZoneList =
        seedPlanZoneRepository.findAllByGeneticClassCode_AndVegetationCode_id('A', vegCode);

    SparLog.info("Found {} spu for vegetation code {}", seedPlanZoneList.size(), vegCode);

    if (seedPlanZoneList.isEmpty()) {
      return List.of();
    }

    SparLog.info("Begin to query seed_plan_zone_code table for spz description");

    List<String> spzCodeList =
        seedPlanZoneList.stream().map(spz -> spz.getSeedPlanZoneCode().getSpzCode()).toList();

    List<SeedPlanZoneCode> spzCodeEntityList =
        seedPlanZoneCodeRepository.findBySpzCodeIn(spzCodeList);

    SparLog.info("Found {} SPZ code entities", spzCodeEntityList.size());

    SparLog.info("Returning a list of SPZ with {} items", spzCodeEntityList.size());

    return spzCodeEntityList.stream()
        .map(
            spzCodeEntity ->
                new SpzDto(spzCodeEntity.getSpzCode(), spzCodeEntity.getSpzDescription(), null))
        .toList();
  }

  /**
   * Get SPZ and SPU geographical information given a SPU id.
   *
   * @param spuId A SPU id.
   * @return A {@link SpzSpuGeoDto}
   */
  public AreaOfUseDto calcAreaOfUseData(Integer spuId) {
    SparLog.info("Getting area of use data for SPU ID {}", spuId);

    AreaOfUseDto result = new AreaOfUseDto();

    // Step 1: Get tested_pt_area_of_use_id by spuId
    Integer testedPtAreaOfUseId = getTestedPtAreaOfUseId(spuId);
    SparLog.info(
        "Tested parent tree area of used ID {} found with spu ID {}", testedPtAreaOfUseId, spuId);

    // Step 2: Get additional SPUs using the tested_pt_area_of_use_id from the
    // tested_pt_area_of_use_spu table
    List<Integer> spuList =
        testedPtAreaOfUseSpuRepository.findByTestedPtAreaOfUseId(testedPtAreaOfUseId).stream()
            .map(TestedPtAreaOfUseSpu::getSeedPlanUnitId)
            .toList();
    SparLog.info(
        "{} spu found with tested parent tree area of used ID {}",
        spuList.size(),
        testedPtAreaOfUseId);

    // Step 3: Get area of use spu geo data
    result.setAreaOfUseSpuGeoDto(setCalculatedSpuGeoData(spuList));
    SparLog.info("SPU min/max data calculated and set");

    // Step 4: Get SPZs under a testedPtAreaOfUseId
    List<TestedPtAreaOfUseSpz> testedPtAoUspzs =
        testedPtAreaOfUseSpzRepository.findAllByTestedPtAreaOfUse_testedPtAreaOfUseId(
            testedPtAreaOfUseId);
    SparLog.info(
        "{} spz found under tested parent tree area of use id {}",
        testedPtAoUspzs.size(),
        testedPtAreaOfUseId);

    List<SpzDto> spzList =
        testedPtAoUspzs.stream()
            .map(
                testedPtSpz -> {
                  SpzDto spzToAdd = new SpzDto();
                  spzToAdd.setCode(testedPtSpz.getSeedPlanZoneCode().getSpzCode());
                  spzToAdd.setDescription(testedPtSpz.getSeedPlanZoneCode().getSpzDescription());
                  spzToAdd.setIsPrimary(testedPtSpz.getIsPrimary());
                  return spzToAdd;
                })
            .toList();

    result.setSpzList(spzList);
    SparLog.info("SPZ list set in area of use DTO.");

    return result;
  }

  private Integer getTestedPtAreaOfUseId(Integer spuId) {
    List<TestedPtAreaOfUse> testedAoU = testedPtAreaofUseRepository.findAllBySeedPlanUnitId(spuId);
    if (testedAoU.isEmpty()) {
      throw new TestedAreaOfUseNotFound();
    }
    // Assuming 1-to-1 relation ship between TestedPtAreaOfUseId and SpuId
    return testedAoU.get(0).getTestedPtAreaOfUseId();
  }

  private AreaOfUseSpuGeoDto setCalculatedSpuGeoData(List<Integer> spuIds) {
    List<SeedPlanUnit> spuEntityList = seedPlanUnitRepository.findBySeedPlanUnitIdIn(spuIds);

    AreaOfUseSpuGeoDto areaOfUseSpuGeoDto = new AreaOfUseSpuGeoDto();

    // Max Elevation
    // Filter out null values first so it can be used with the Stream.max()
    List<SeedPlanUnit> filteredMaxElevSpu =
        spuEntityList.stream().filter(spu -> spu.getElevationMax() != null).toList();
    Integer maxElevation =
        filteredMaxElevSpu.size() > 0
            ? filteredMaxElevSpu.stream()
                .max(Comparator.comparing(SeedPlanUnit::getElevationMax))
                .get()
                .getElevationMax()
            : null;
    areaOfUseSpuGeoDto.setElevationMax(maxElevation);

    // Min Elevation
    List<SeedPlanUnit> filteredMinElevSpu =
        spuEntityList.stream().filter(spu -> spu.getElevationMin() != null).toList();
    Integer minElevation =
        filteredMinElevSpu.size() > 0
            ? filteredMinElevSpu.stream()
                .min(Comparator.comparing(SeedPlanUnit::getElevationMin))
                .get()
                .getElevationMin()
            : null;
    areaOfUseSpuGeoDto.setElevationMin(minElevation);

    // Max Lat Degree
    List<SeedPlanUnit> filteredMaxLatDegSpu =
        spuEntityList.stream().filter(spu -> spu.getLatitudeDegreesMax() != null).toList();
    Integer maxLatDeg =
        filteredMaxLatDegSpu.size() > 0
            ? filteredMaxLatDegSpu.stream()
                .max(Comparator.comparing(SeedPlanUnit::getLatitudeDegreesMax))
                .get()
                .getLatitudeDegreesMax()
            : null;
    areaOfUseSpuGeoDto.setLatitudeDegreesMax(maxLatDeg);

    // Min Lat Degree
    List<SeedPlanUnit> filteredMinLatDegSpu =
        spuEntityList.stream().filter(spu -> spu.getLatitudeDegreesMin() != null).toList();
    Integer minLatDeg =
        filteredMinLatDegSpu.size() > 0
            ? filteredMinLatDegSpu.stream()
                .min(Comparator.comparing(SeedPlanUnit::getLatitudeDegreesMin))
                .get()
                .getLatitudeDegreesMin()
            : null;
    areaOfUseSpuGeoDto.setLatitudeDegreesMin(minLatDeg);

    // Max Lat Minute
    List<SeedPlanUnit> filteredMaxLatMinuteSpu =
        spuEntityList.stream().filter(spu -> spu.getLatitudeMinutesMax() != null).toList();
    Integer maxLatMinute =
        filteredMaxLatMinuteSpu.size() > 0
            ? filteredMaxLatMinuteSpu.stream()
                .max(Comparator.comparing(SeedPlanUnit::getLatitudeMinutesMax))
                .get()
                .getLatitudeMinutesMax()
            : null;
    areaOfUseSpuGeoDto.setLatitudeMinutesMax(maxLatMinute);

    // Min Lat Minute
    List<SeedPlanUnit> filteredMinLatMinuteSpu =
        spuEntityList.stream().filter(spu -> spu.getLatitudeMinutesMin() != null).toList();
    Integer minLatMinute =
        filteredMinLatMinuteSpu.size() > 0
            ? filteredMinLatMinuteSpu.stream()
                .min(Comparator.comparing(SeedPlanUnit::getLatitudeMinutesMin))
                .get()
                .getLatitudeMinutesMin()
            : null;
    areaOfUseSpuGeoDto.setLatitudeMinutesMin(minLatMinute);

    return areaOfUseSpuGeoDto;
  }
}
