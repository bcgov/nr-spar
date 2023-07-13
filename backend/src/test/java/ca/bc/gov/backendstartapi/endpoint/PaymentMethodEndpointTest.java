package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.enums.PaymentMethodEnum;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class PaymentMethodEndpointTest extends DescribedEnumEndpointTest<PaymentMethodEnum> {

  PaymentMethodEndpointTest(WebApplicationContext webApplicationContext) {
    super(webApplicationContext);
    enumClass = PaymentMethodEnum.class;
    endpointPrefix = "/api/payment-methods";
  }
}
