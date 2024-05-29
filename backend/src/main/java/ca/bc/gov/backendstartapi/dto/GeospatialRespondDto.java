package ca.bc.gov.backendstartapi.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * This class represents a response body when calculating the Geospatial data for a list of parent
 * trees.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GeospatialRespondDto {
  private Integer meanLatitudeDegree;
  private Integer meanLatitudeMinute;
  private Integer meanLatitudeSecond;
  private Integer meanLongitudeDegree;
  private Integer meanLongitudeMinute;
  private Integer meanLongitudeSecond;
  private BigDecimal meanLatitude;
  private BigDecimal meanLongitude;
  private Integer meanElevation;
}
