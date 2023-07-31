package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.enums.PaymentMethodEnum;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.web.context.WebApplicationContext;

@WebMvcTest(PaymentMethodEndpoint.class)
class PaymentMethodEndpointTest extends DescribedEnumEndpointTest<PaymentMethodEnum> {

  PaymentMethodEndpointTest(WebApplicationContext webApplicationContext) {
    super(webApplicationContext);
    enumClass = PaymentMethodEnum.class;
    endpointPrefix = "/api/payment-methods";
  }
}
