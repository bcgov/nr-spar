package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

/** This class represents the JSON that will be returned by the GW calculations. */
@Schema(
    description =
        """
        This class represents the JSON that will be returned when requesting the
        Parent tree values data.
        """)
public record CaculatedParentTreeValsDto(
    @Schema(
            description = "The calculated value for the Effective Population Size.",
            example = "2.97655")
        BigDecimal neValue,
    @Schema(description = "Legacy mean latitude degree", example = "49") Integer meanLatitudeDegree,
    @Schema(description = "Legacy mean latitude minute", example = "16") Integer meanLatitudeMinute,
    @Schema(description = "Legacy mean latitude second", example = "57") Integer meanLatitudeSecond,
    @Schema(description = "Legacy mean longitude degree", example = "49")
        Integer meanLongitudeDegree,
    @Schema(description = "Legacy mean longitude minute", example = "16")
        Integer meanLongitudeMinute,
    @Schema(description = "Legacy mean longitude second", example = "57")
        Integer meanLongitudeSecond,
    @Schema(description = "Decimal mean latitude", example = "49.2827") BigDecimal meanLatitude,
    @Schema(description = "Decimal mean longitude", example = "49.2827") BigDecimal meanLongitude,
    @Schema(description = "Mean elevation", example = "128") Integer meanElevation) {}
