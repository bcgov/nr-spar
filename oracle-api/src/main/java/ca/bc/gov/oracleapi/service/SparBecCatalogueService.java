package ca.bc.gov.oracleapi.service;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.entity.SparBecCatalogueEntity;
import ca.bc.gov.oracleapi.repository.SparBecCatalogueRepository;
import java.util.List;
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
  public String getBecDescriptionByCode(String becZoneCode) {
    SparLog.info("Begin service request to find the description of a given BEC zone code");

    if (becZoneCode == null) {
      SparLog.info("BEC Zone code param is null, returning null value for BEC zone description");
      return null;
    }

    List<SparBecCatalogueEntity> sparBecList =
        sparBecCatalogueRepository.findAllByBecCodeOrderByUpdateTimeStampDesc(becZoneCode);

    if (sparBecList.isEmpty()) {
      SparLog.info(
          "Cannot find a BEC zone code entity, returning null value for BEC zone description");
      return null;
    }

    String description = sparBecList.get(0).getBecZoneDescription();
    SparLog.info(
        "Spar BEC Catalogue entity found, returning the description with value: {}", description);
    return description;
  }
}
