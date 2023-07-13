package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.enums.GeneticClassEnum;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class GeneticClassEndpointTest extends DescribedEnumEndpointTest<GeneticClassEnum> {

  GeneticClassEndpointTest(WebApplicationContext webApplicationContext) {
    super(webApplicationContext);
    enumClass = GeneticClassEnum.class;
    endpointPrefix = "/api/genetic-classes";
  }
}
