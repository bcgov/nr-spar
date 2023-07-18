package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.enums.GeneticWorthEnum;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class GeneticWorthEndpointTest extends DescribedEnumEndpointTest<GeneticWorthEnum> {

  GeneticWorthEndpointTest(WebApplicationContext webApplicationContext) {
    super(webApplicationContext);
    enumClass = GeneticWorthEnum.class;
    endpointPrefix = "/api/genetic-worth";
  }
}
