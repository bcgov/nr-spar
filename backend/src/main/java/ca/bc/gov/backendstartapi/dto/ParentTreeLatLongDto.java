package ca.bc.gov.backendstartapi.dto;

public record ParentTreeLatLongDto(
    Integer parentTreeId,
    Integer meanLatitudeDegrees,
    Integer meanLatitudeMinutes,
    Integer meanLatitudeSeconds,
    Integer meanLongitudeDegrees,
    Integer meanLongitudeMinutes,
    Integer meanLongitudeSeconds,
    Integer meanElevation) {}
