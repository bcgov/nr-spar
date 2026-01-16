package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

/**
 * Data transfer object representing an activity and its description.
 *
 * @param riaSkey The unique key of the request item activity.
 * @param activityDesc The description of the standard activity.
 */
@Schema(description =
    "This class represents an activity entity with riaSkey and activity description.")
public record ActivityRequestItemDto(
    BigDecimal riaSkey,
    String activityDesc
) {}