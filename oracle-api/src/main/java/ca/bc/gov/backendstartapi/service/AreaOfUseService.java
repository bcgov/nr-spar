package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SpzDto;
import ca.bc.gov.backendstartapi.entity.SeedPlanZone;
import ca.bc.gov.backendstartapi.entity.SeedPlanZoneCode;
import ca.bc.gov.backendstartapi.repository.SeedPlanZoneCodeRepository;
import ca.bc.gov.backendstartapi.repository.SeedPlanZoneRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** The class for Area of Use Service. */
@Service
@RequiredArgsConstructor
public class AreaOfUseService {

  private final SeedPlanZoneRepository seedPlanZoneRepository;

  private final SeedPlanZoneCodeRepository seedPlanZoneCodeRepository;

  /**
   * Find all spz under a vegCode for A-Class.
   *
   * @return a list of {@link SpzDto}
   */
  public List<SpzDto> getSpzByVegCode(String vegCode) {
    SparLog.info("Begin to query tested_pt_area_of_use_spz table for a list of unique spz code");

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
}
