package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.enums.SeedlotSourceEnum;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.web.context.WebApplicationContext;

@WebMvcTest(SeedlotSourceEndpoint.class)
class SeedlotSourceEndpointTest extends DescribedEnumEndpointTest<SeedlotSourceEnum> {

  SeedlotSourceEndpointTest(WebApplicationContext webApplicationContext) {
    super(webApplicationContext);
    enumClass = SeedlotSourceEnum.class;
    endpointPrefix = "/api/seedlot-sources";
  }
}
