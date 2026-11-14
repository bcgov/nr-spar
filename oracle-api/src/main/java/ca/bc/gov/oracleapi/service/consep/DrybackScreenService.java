package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.DrybackScreenDto;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
import java.math.BigDecimal;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Service for the G64 Dryback Calculation screen.
 * Retrieves and manages dryback activity data from the database.
 */
@Service
@RequiredArgsConstructor
public class DrybackScreenService {

  private final ActivityRepository activityRepository;

  /**
   * Retrieves the dryback screen data for a given Request Item Activity key.
   * Combines Activity record with current accepted Moisture Content test data.
   *
   * @param riaSkey the Request Item Activity SKEY
   * @return DrybackScreenDto containing all required dryback screen data
   * @throws ResponseStatusException 404 if the RIA with the given key does not exist
   */
  public DrybackScreenDto getDrybackScreenData(BigDecimal riaSkey) {
    if (riaSkey == null) {
      SparLog.error("riaSkey parameter is null");
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "riaSkey is required");
    }

    Optional<DrybackScreenDto> drybackScreenData =
        activityRepository.findDrybackScreenDataByRiaSkey(riaSkey);

    if (drybackScreenData.isEmpty()) {
      SparLog.info("Request Item Activity not found with riaSkey: {}", riaSkey);
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Activity not found");
    }

    return drybackScreenData.get();
  }
}
