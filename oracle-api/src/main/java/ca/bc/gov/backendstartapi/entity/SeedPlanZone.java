package ca.bc.gov.backendstartapi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/** This class represents a Seed Plan Zone record in the database. */
@Getter
@Setter
@Entity
@Table(name = "SEED_PLAN_ZONE")
public class SeedPlanZone {

  @Id
  @Column(name = "SEED_PLAN_ZONE_ID")
  private Integer seedPlanZoneId;

  @Column(name = "GENETIC_CLASS_CODE", nullable = false)
  private Character geneticClassCode;

  @Column(name = "SEED_PLAN_ZONE_CODE", length = 3, nullable = false)
  private String seedPlanZoneCode;

  @Column(name = "VEGETATION_CODE", length = 8)
  private String vegetationCode;
}
