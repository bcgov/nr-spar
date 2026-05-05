package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.GermCountDto;
import ca.bc.gov.oracleapi.mapper.GermCountMapper;
import ca.bc.gov.oracleapi.repository.consep.GermCountRepository;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** Service for retrieving daily germination count data from consep.cns_t_germ_count. */
@Service
@RequiredArgsConstructor
public class GermCountService {

  private final GermCountRepository germCountRepository;
  private final GermCountMapper mapper = GermCountMapper.mapper;

  /**
   * Retrieve the germination count record for the given RIA_SKEY.
   *
   * @param riaSkey the request item activity key
   * @return the germination count DTO for the test
   * @throws ResponseStatusException 400 if riaSkey is null, 404 if no record exists
   */
  public GermCountDto getGermCounts(BigDecimal riaSkey) {
    if (riaSkey == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "RIA_SKEY cannot be null");
    }

    SparLog.info("Retrieving germ count data for RIA_SKEY: {}", riaSkey);

    var entity = germCountRepository.findById(riaSkey)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "No germ count data found for RIA_SKEY: " + riaSkey));

    SparLog.info("Germ count data found for RIA_SKEY: {}", riaSkey);

    return mapper.toDto(entity);
  }
}
