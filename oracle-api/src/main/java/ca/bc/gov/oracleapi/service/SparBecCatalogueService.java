package ca.bc.gov.oracleapi.service;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.SparBecZoneDescriptionDto;
import ca.bc.gov.oracleapi.repository.SparBecCatalogueRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** The class for BEC Zone Code Service. */
@Service
@RequiredArgsConstructor
public class SparBecCatalogueService {

  private final SparBecCatalogueRepository sparBecCatalogueRepository;

  /**
   * Get the description of a BEC Zone by a code, returns null if not found or code provided is
   * null.
   */
  public Map<String, String> getBecDescriptionsByCode(List<String> becZoneCodes) {
    SparLog.info("Begin service request to find the description of a given BEC zone code");

    if (becZoneCodes.isEmpty()) {
      SparLog.info("No BEC Zone code param, returning empty values for BEC zone descriptions");
      return Map.of();
    }

    List<SparBecZoneDescriptionDto> sparBecList =
        sparBecCatalogueRepository.findAllBecZonesByCodeIn(becZoneCodes);

    if (sparBecList.isEmpty()) {
      SparLog.info("Cannot find BEC zones codes, returning empty values for BEC zone descriptions");
      return Map.of();
    }

    Map<String, String> map = new HashMap<>();
    sparBecList.forEach(dto -> map.put(dto.getBecZoneCode(), dto.getBecZoneName()));

    SparLog.info(
        "Spar BEC Catalogue entity found, returning {} descriptions found", sparBecList.size());
    return map;
  }
}
