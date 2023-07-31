package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.enums.GeneticWorthEnum;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.web.context.WebApplicationContext;

@WebMvcTest(GeneticWorthEndpoint.class)
class GeneticWorthEndpointTest extends DescribedEnumEndpointTest<GeneticWorthEnum> {

  GeneticWorthEndpointTest(WebApplicationContext webApplicationContext) {
    super(webApplicationContext);
    enumClass = GeneticWorthEnum.class;
    endpointPrefix = "/api/genetic-worth";
  }
}
