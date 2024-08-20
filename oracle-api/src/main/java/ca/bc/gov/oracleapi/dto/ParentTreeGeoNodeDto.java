package ca.bc.gov.oracleapi.dto;

import ca.bc.gov.oracleapi.entity.ParentTreeEntity;
import java.util.Optional;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** This class represents a GeoNode with all elevation, lat and long mean values. */
@Setter
@NoArgsConstructor
public class ParentTreeGeoNodeDto {

  private Integer elevation;
  private Integer latitudeDegrees;
  private Integer latitudeMinutes;
  private Integer latitudeSeconds;
  private Integer longitudeDegrees;
  private Integer longitudeMinutes;
  private Integer longitudeSeconds;

  ParentTreeGeoNodeDto(ParentTreeEntity entity) {
    this.elevation = entity.getElevation();
    this.latitudeDegrees = entity.getLatitudeDegrees();
    this.latitudeMinutes = entity.getLatitudeMinutes();
    this.latitudeSeconds = entity.getLatitudeSeconds();
    this.longitudeDegrees = entity.getLongitudeDegrees();
    this.longitudeMinutes = entity.getLongitudeMinutes();
    this.longitudeSeconds = entity.getLongitudeSeconds();
  }

  public Integer getElevation() {
    return this.elevation;
  }

  public int getElevationIntVal() {
    return Optional.ofNullable(elevation).orElse(0);
  }

  public int getLatitudeDegreesIntVal() {
    return Optional.ofNullable(latitudeDegrees).orElse(0);
  }

  public int getLatitudeMinutesIntVal() {
    return Optional.ofNullable(latitudeMinutes).orElse(0);
  }

  public int getLatitudeSecondsIntVal() {
    return Optional.ofNullable(latitudeSeconds).orElse(0);
  }

  public int getLongitudeDegreesIntVal() {
    return Optional.ofNullable(longitudeDegrees).orElse(0);
  }

  public int getLongitudeMinutesIntVal() {
    return Optional.ofNullable(longitudeMinutes).orElse(0);
  }

  public int getLongitudeSecondsIntVal() {
    return Optional.ofNullable(longitudeSeconds).orElse(0);
  }
}
