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
@Table(name = "SEED_PLAN_ZONE_CODE")
public class SeedPlanZoneCode {
  @Id
  @Column(name = "SEED_PLAN_ZONE_CODE")
  private String spzCode;

  @Column(name = "DESCRIPTION", nullable = false)
  private String spzDescription;
}
