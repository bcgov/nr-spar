package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.enums.LongitudeCodeEnum;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.web.context.WebApplicationContext;

@WebMvcTest(LongitudeCodeEndpoint.class)
class LongitudeCodeEndpointTest extends DescribedEnumEndpointTest<LongitudeCodeEnum> {

  LongitudeCodeEndpointTest(WebApplicationContext webApplicationContext) {
    super(webApplicationContext);
    enumClass = LongitudeCodeEnum.class;
    endpointPrefix = "/api/longitude-codes";
  }
}
