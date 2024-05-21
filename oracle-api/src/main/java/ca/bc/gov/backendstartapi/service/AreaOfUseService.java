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
    List<String> spzCodeList = testedPtAreaOfUseSpzRepository.findAllDistinctSpz();

    List<SeedPlanZoneCode> spzCodeEntityList =
        seedPlanZoneCodeRepository.findBySpzCodeIn(spzCodeList);

    SparLog.info("Returning a list of SPZ with {} items", spzCodeEntityList.size());

    return spzCodeEntityList.stream()
        .map(spzEntity -> new SpzDto(spzEntity.getSpzCode(), spzEntity.getSpzDescription(), null))
        .toList();
  }
}
