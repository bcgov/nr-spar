package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.enums.SeedlotSourceEnum;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class SeedlotSourceEndpointTest extends DescribedEnumEndpointTest<SeedlotSourceEnum> {

  SeedlotSourceEndpointTest(WebApplicationContext webApplicationContext) {
    super(webApplicationContext);
    enumClass = SeedlotSourceEnum.class;
    endpointPrefix = "/api/seedlot-sources";
  }
}
