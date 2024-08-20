package ca.bc.gov.backendstartapi.endpoint;

import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** This class holds a method for getting the service status. */
@Hidden
@RestController
@RequestMapping("/service-status")
public class StatusPageEndpoint {

  /**
   * Get status service simple http api.
   *
   * @return Fixed OK value.
   */
  @GetMapping
  public ResponseEntity<String> getStatuses() {
    return ResponseEntity.ok("OK");
  }
}
