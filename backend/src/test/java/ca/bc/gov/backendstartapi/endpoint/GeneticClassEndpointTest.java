package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.enums.GeneticClassEnum;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.web.context.WebApplicationContext;

@WebMvcTest(GeneticClassEndpoint.class)
class GeneticClassEndpointTest extends DescribedEnumEndpointTest<GeneticClassEnum> {

  GeneticClassEndpointTest(WebApplicationContext webApplicationContext) {
    super(webApplicationContext);
    enumClass = GeneticClassEnum.class;
    endpointPrefix = "/api/genetic-classes";
  }
}
