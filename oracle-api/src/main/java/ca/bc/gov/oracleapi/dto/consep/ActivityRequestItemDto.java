package ca.bc.gov.oracleapi.dto.consep;

import java.math.BigDecimal;

/**
 * Data transfer object representing an activity and its description.
 *
 * @param riaSkey The unique key of the request item activity.
 * @param activityDesc The description of the standard activity.
 */
public record ActivityRequestItemDto(
    BigDecimal riaSkey,
    String activityDesc
) {}