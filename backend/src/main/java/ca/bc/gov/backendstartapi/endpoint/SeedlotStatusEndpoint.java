package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.enums.SeedlotStatusEnum;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoints to fetch {@link SeedlotStatusEnum}. */
@RestController
@RequestMapping(path = "/api/seedlot-status", produces = MimeTypeUtils.APPLICATION_JSON_VALUE)
@Tag(name = "SeedlotStatus")
@Slf4j
public class SeedlotStatusEndpoint implements DescribedEnumEndpoint<SeedlotStatusEnum> {

  @Override
  public Class<SeedlotStatusEnum> enumClass() {
    return SeedlotStatusEnum.class;
  }

  @Override
  public Logger logger() {
    return log;
  }
}
