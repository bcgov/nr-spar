package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.enums.GeneticWorthEnum;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoints to fetch {@link GeneticWorthEnum}. */
@RestController
@RequestMapping(path = "/api/genetic-worth", produces = MimeTypeUtils.APPLICATION_JSON_VALUE)
@Tag(name = "GeneticWorth")
@Slf4j
public class GeneticWorthEndpoint implements DescribedEnumEndpoint<GeneticWorthEnum> {

  @Override
  public Class<GeneticWorthEnum> enumClass() {
    return GeneticWorthEnum.class;
  }

  @Override
  public Logger logger() {
    return log;
  }
}
