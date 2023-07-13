package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.enums.SeedlotStatusEnum;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class SeedlotStatusEndpointTest extends DescribedEnumEndpointTest<SeedlotStatusEnum> {

  SeedlotStatusEndpointTest(WebApplicationContext webApplicationContext) {
    super(webApplicationContext);
    enumClass = SeedlotStatusEnum.class;
    endpointPrefix = "/api/seedlot-status";
  }
}
