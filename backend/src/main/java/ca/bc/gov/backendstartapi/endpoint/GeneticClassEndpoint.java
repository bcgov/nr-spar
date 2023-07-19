package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.enums.GeneticClassEnum;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** This class exposes resources to handle all genetic class codes. */
@RestController
@RequestMapping(path = "/api/genetic-classes", produces = "application/json")
@Tag(name = "GeneticClass")
@Slf4j
public class GeneticClassEndpoint implements DescribedEnumEndpoint<GeneticClassEnum> {

  @Override
  public Class<GeneticClassEnum> enumClass() {
    return GeneticClassEnum.class;
  }

  @Override
  public Logger logger() {
    return log;
  }
}
