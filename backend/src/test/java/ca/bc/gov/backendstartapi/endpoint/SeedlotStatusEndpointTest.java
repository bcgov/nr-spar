package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.enums.SeedlotStatusEnum;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.web.context.WebApplicationContext;

@WebMvcTest(SeedlotStatusEndpoint.class)
class SeedlotStatusEndpointTest extends DescribedEnumEndpointTest<SeedlotStatusEnum> {

  SeedlotStatusEndpointTest(WebApplicationContext webApplicationContext) {
    super(webApplicationContext);
    enumClass = SeedlotStatusEnum.class;
    endpointPrefix = "/api/seedlot-status";
  }
}
