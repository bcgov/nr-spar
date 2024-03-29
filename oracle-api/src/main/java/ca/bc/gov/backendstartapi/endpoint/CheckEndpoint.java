package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.vo.CheckVo;
import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** This class represents a check endpoint object. */
@RestController
@Hidden
public class CheckEndpoint {

  @Value("${nr-spar-oracle-api.version}")
  private String nrSparOracleApiVersion;

  /**
   * Check if the service is up and running.
   *
   * @return a CheckVo object containing a message and a release version
   */
  @GetMapping(value = "/check", produces = MediaType.APPLICATION_JSON_VALUE)
  public CheckVo check() {
    SparLog.info("nrSparOracleApiVersion: {}", nrSparOracleApiVersion);
    return new CheckVo("OK", nrSparOracleApiVersion);
  }
}
