package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.enums.MaleFemaleMethodologyEnum;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class MaleFemaleMethodologyEndpointTest
    extends DescribedEnumEndpointTest<MaleFemaleMethodologyEnum> {

  MaleFemaleMethodologyEndpointTest(WebApplicationContext webApplicationContext) {
    super(webApplicationContext);
    enumClass = MaleFemaleMethodologyEnum.class;
    endpointPrefix = "/api/male-female-methodologies";
  }
}
