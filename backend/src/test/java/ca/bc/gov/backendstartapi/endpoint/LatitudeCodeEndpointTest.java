package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.enums.LatitudeCodeEnum;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class LatitudeCodeEndpointTest extends DescribedEnumEndpointTest<LatitudeCodeEnum> {

  LatitudeCodeEndpointTest(WebApplicationContext webApplicationContext) {
    super(webApplicationContext);
    enumClass = LatitudeCodeEnum.class;
    endpointPrefix = "/api/latitude-codes";
  }
}
