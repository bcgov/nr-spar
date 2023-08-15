package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.enums.LatitudeCodeEnum;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.web.context.WebApplicationContext;

@WebMvcTest(LatitudeCodeEndpoint.class)
class LatitudeCodeEndpointTest extends DescribedEnumEndpointTest<LatitudeCodeEnum> {

  LatitudeCodeEndpointTest(WebApplicationContext webApplicationContext) {
    super(webApplicationContext);
    enumClass = LatitudeCodeEnum.class;
    endpointPrefix = "/api/latitude-codes";
  }
}
