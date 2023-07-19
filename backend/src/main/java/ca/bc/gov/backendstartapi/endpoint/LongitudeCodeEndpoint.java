package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.enums.LongitudeCodeEnum;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** This class exposes resources to handle all longitude codes. */
@RestController
@RequestMapping(path = "/api/longitude-codes", produces = "application/json")
@Tag(name = "LongitudeCode", description = "Resources to handle all longitude codes")
@Slf4j
public class LongitudeCodeEndpoint implements DescribedEnumEndpoint<LongitudeCodeEnum> {

  @Override
  public Class<LongitudeCodeEnum> enumClass() {
    return LongitudeCodeEnum.class;
  }

  @Override
  public Logger logger() {
    return log;
  }
}
