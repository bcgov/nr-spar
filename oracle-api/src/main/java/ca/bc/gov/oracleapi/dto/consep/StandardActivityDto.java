package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * This class represents a {@link ca.bc.gov.oracleapi.entity.consep.StandardActivityEntity} object.
 */
@Schema(description = "This class represents a StandardActivityEntity with code and description")
public record StandardActivityDto(
    String standardActivityId,
    String activityDescription,
    String activityTypeCd,
    String testCategoryCd,
    Integer significantStatusIndicator,
    Integer activityDuration,
    String activityTimeUnit
) {}