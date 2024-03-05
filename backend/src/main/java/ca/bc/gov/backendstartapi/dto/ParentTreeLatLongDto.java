package ca.bc.gov.backendstartapi.dto;

import java.math.BigDecimal;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ParentTreeLatLongDto {

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
  private Map<String, BigDecimal> weightedTraitList;
}
