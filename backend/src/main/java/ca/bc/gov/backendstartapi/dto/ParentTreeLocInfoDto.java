package ca.bc.gov.backendstartapi.dto;

import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

/** This class represents a response body when calculating the SMP values. */
@Getter
@Setter
public class ParentTreeLocInfoDto {

  private Integer parentTreeId;
  private Integer latitudeDegrees;
  private Integer latitudeMinutes;
  private Integer latitudeSeconds;
  private BigDecimal latitudeDegreesFmt;
  private Integer longitudeDegrees;
  private Integer longitudeMinutes;
  private Integer longitudeSeconds;
  private BigDecimal longitudeDegreeFmt;
  private Integer elevation;
  private BigDecimal weightedLatitude;
  private BigDecimal weightedLongitude;
  private BigDecimal weightedElevation;
}
