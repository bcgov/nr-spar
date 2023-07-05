package ca.bc.gov.backendstartapi.endpoint;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("/test")
public class TestEndpoint {
  
  @GetMapping
  public String name() {
    return "Encora";
  }
}
