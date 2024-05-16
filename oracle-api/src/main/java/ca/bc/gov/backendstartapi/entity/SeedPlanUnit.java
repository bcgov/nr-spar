package ca.bc.gov.backendstartapi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.type.YesNoConverter;

/** This class represents a Seed Plan Unit record in the database. */
@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "SEED_PLAN_UNIT")
public class SeedPlanUnit {

  @Id
  @Column(name = "SEED_PLAN_UNIT_ID")
  private Integer seedPlanUnitId;

  @Column(name = "PRIMARY_IND", nullable = false)
  @Convert(converter = YesNoConverter.class)
  private boolean primaryInd;

  @Column(name = "SEED_PLAN_ZONE_ID", nullable = false)
  private Integer seedPlanZoneId;

  @Column(name = "ELEVATION_BAND", length = 10, nullable = false)
  private String elevationBand;

  @Column(name = "ELEVATION_MAX", nullable = false)
  private Integer elevationMax;

  @Column(name = "ELEVATION_MIN", nullable = false)
  private Integer elevationMin;

  @Column(name = "CREATE_DATE")
  private LocalDate createDate;

  @Column(name = "LATITUDE_BAND", length = 5)
  private String latitudeBand;

  @Column(name = "LATITUDE_DEGREES_MIN")
  private Integer latitudeDegreesMin;

  @Column(name = "LATITUDE_MINUTES_MIN")
  private Integer latitudeMinutesMin;

  @Column(name = "LATITUDE_DEGREES_MAX")
  private Integer latitudeDegreesMax;

  @Column(name = "LATITUDE_MINUTES_MAX")
  private Integer latitudeMinutesMax;
}
