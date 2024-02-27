package ca.bc.gov.backendstartapi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/** This class represents a Tested Parent Tree Area of Use record in the database. */
@Getter
@Setter
@Entity
@Table(name = "TESTED_PT_AREA_OF_USE")
public class TestedPtAreaOfUse {
  
  @Id
  @Column(name = "TESTED_PT_AREA_OF_USE_ID")
  private Integer testedPtAreaOfUseId;

  @Column(name = "SEED_PLAN_UNIT_ID", nullable = false)
  private Integer seedPlanUnitId;

}
