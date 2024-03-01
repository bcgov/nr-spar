package ca.bc.gov.backendstartapi.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ParentTreeLatLongDto {

  private Integer parentTreeId;
  private Integer latitudeDegrees;
  private Integer latitudeMinutes;
  private Integer latitudeSeconds;
  private Integer longitudeDegrees;
  private Integer longitudeMinutes;
  private Integer longitudeSeconds;
  private Integer elevation;
  private BigDecimal weightedLatMinutes;
  private BigDecimal weightedLatDecimal;
  private BigDecimal weightedLongMinutes;
  private BigDecimal weightedLongDecimal;
  private BigDecimal weightedElevation;
  private List<String> weightedTraiList;
}
