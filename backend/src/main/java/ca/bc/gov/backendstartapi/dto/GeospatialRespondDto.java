package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

/**
 * This record represents a response body when calculating the Geospatial data for a list of parent
 * trees.
 */
public record GeospatialRespondDto(
    @Schema(description = "Legacy mean latitude degree", example = "49") Integer meanLatitudeDegree,
    @Schema(description = "Legacy mean latitude minute", example = "16") Integer meanLatitudeMinute,
    @Schema(description = "Legacy mean latitude second", example = "57") Integer meanLatitudeSecond,
    @Schema(description = "Legacy mean longitude degree", example = "49")
        Integer meanLongitudeDegree,
    @Schema(description = "Legacy mean longitude minute", example = "16")
        Integer meanLongitudeMinute,
    @Schema(description = "Legacy mean longitude second", example = "57")
        Integer meanLongitudeSecond,
    @Schema(description = "Decimal mean latitude", example = "49.28272") BigDecimal meanLatitude,
    @Schema(description = "Decimal mean longitude", example = "49.28272") BigDecimal meanLongitude,
    @Schema(description = "Mean elevation", example = "128") Integer meanElevation) {}
