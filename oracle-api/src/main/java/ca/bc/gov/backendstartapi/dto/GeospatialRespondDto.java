package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** This class represents a json response object when fetching geospatial data for a Parent Tree. */
@Schema(
    description =
        "This class represents a json response object when fetching geospatial data for a Parent"
            + " Tree.")
public record GeospatialRespondDto(
    @Schema(description = "The id of a parent tree", example = "8512") Long parentTreeId,
    @Schema(description = "Latitude degree", example = "49") Integer latitudeDegree,
    @Schema(description = "Latitude minute", example = "16") Integer latitudeMinute,
    @Schema(description = "Latitude second", example = "57") Integer latitudeSecond,
    @Schema(description = "Longitude degree", example = "49") Integer longitudeDegree,
    @Schema(description = "Longitude minute", example = "16") Integer longitudeMinute,
    @Schema(description = "Longitude second", example = "57") Integer longitudeSecond,
    @Schema(description = "Elevation", example = "128") Integer elevation) {}
