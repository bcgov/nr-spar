package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.enums.LongitudeCodeEnum;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class LongitudeCodeEndpointTest extends DescribedEnumEndpointTest<LongitudeCodeEnum> {

  LongitudeCodeEndpointTest(WebApplicationContext webApplicationContext) {
    super(webApplicationContext);
    enumClass = LongitudeCodeEnum.class;
    endpointPrefix = "/api/longitude-codes";
  }
}
