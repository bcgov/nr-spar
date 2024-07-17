package ca.bc.gov.oracleapi.dto;

import java.time.LocalDateTime;

/** This interface holds methods for fetching data from SPAR Bec Zone catalogue entity. */
public interface SparBecZoneDescriptionDto {
  
  public String getBecZoneCode();

  public String getBecZoneName();

  public LocalDateTime getBacZoneUpdateTimestamp();

}
