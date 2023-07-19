package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.enums.PaymentMethodEnum;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoints to fetch {@link PaymentMethodEnum}. */
@RestController
@RequestMapping(path = "/api/payment-methods", produces = MimeTypeUtils.APPLICATION_JSON_VALUE)
@Tag(name = "PaymentMethod")
@Slf4j
public class PaymentMethodEndpoint implements DescribedEnumEndpoint<PaymentMethodEnum> {

  @Override
  public Class<PaymentMethodEnum> enumClass() {
    return PaymentMethodEnum.class;
  }

  @Override
  public Logger logger() {
    return log;
  }
}
