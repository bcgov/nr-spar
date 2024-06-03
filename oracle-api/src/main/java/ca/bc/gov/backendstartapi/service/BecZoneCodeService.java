package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.entity.BecZoneCodeEntity;
import ca.bc.gov.backendstartapi.repository.BecZoneCodeRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** The class for BEC Zone Code Service. */
@Service
@RequiredArgsConstructor
public class BecZoneCodeService {

  private final BecZoneCodeRepository becZoneCodeRepository;

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

    Optional<BecZoneCodeEntity> optionalBecEntitiy = becZoneCodeRepository.findById(becZoneCode);

    if (optionalBecEntitiy.isEmpty()) {
      SparLog.info(
          "Cannot find a BEC zone code entity, returning null value for BEC zone description");
      return null;
    }

    String description = optionalBecEntitiy.get().getDescription();
    SparLog.info(
        "BEC zone code entity found, returning the description with value: {}", description);
    return description;
  }
}
