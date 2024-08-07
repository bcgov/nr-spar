package ca.bc.gov.oracleapi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** This class represents a Seed Plan Zone record in the database. */
@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "SEED_PLAN_ZONE")
public class SeedPlanZone {
  @Id
  @Column(name = "SEED_PLAN_ZONE_ID")
  private Integer seedPlanZoneId;

  @Column(name = "GENETIC_CLASS_CODE", nullable = false)
  private Character geneticClassCode;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "SEED_PLAN_ZONE_CODE", updatable = false)
  private SeedPlanZoneCode seedPlanZoneCode;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "VEGETATION_CODE", updatable = false)
  private VegetationCode vegetationCode;
}
