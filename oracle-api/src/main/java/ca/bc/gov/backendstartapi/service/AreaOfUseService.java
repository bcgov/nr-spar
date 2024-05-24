package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SpzDto;
import ca.bc.gov.backendstartapi.entity.SeedPlanZoneCode;
import ca.bc.gov.backendstartapi.repository.SeedPlanZoneCodeRepository;
import ca.bc.gov.backendstartapi.repository.TestedPtAreaOfUseSpzRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** The class for Area of Use Service. */
@Service
@RequiredArgsConstructor
public class AreaOfUseService {

  private final TestedPtAreaOfUseSpzRepository testedPtAreaOfUseSpzRepository;

  private final SeedPlanZoneCodeRepository seedPlanZoneCodeRepository;

  /**
   * Find all spz under tested parent tree area of use.
   *
   * @return a list of {@link SpzDto}
   */
  public List<SpzDto> getAllSpz() {
    SparLog.info("Begin to query tested_pt_area_of_use_spz table for a list of unique spz code");

    List<String> spzCodeList = testedPtAreaOfUseSpzRepository.findAllDistinctSpz();

    SparLog.info("Found {} unique spz codes", spzCodeList.size());

    SparLog.info("Begin to query seed_plan_zone_code table with the unique spz codes");

    List<SeedPlanZoneCode> spzCodeEntityList =
        seedPlanZoneCodeRepository.findBySpzCodeIn(spzCodeList);

    SparLog.info("Found {} SPZ code entities", spzCodeEntityList.size());

    SparLog.info("Returning a list of SPZ with {} items", spzCodeEntityList.size());

    return spzCodeEntityList.stream()
        .map(spzEntity -> new SpzDto(spzEntity.getSpzCode(), spzEntity.getSpzDescription(), null))
        .toList();
  }
}
