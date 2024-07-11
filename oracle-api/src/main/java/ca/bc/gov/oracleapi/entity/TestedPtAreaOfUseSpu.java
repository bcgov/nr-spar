package ca.bc.gov.oracleapi.entity;

import ca.bc.gov.oracleapi.entity.idclass.TestedPtAreaOfUseSpuId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** This class represents a Tested Parent Tree Area of Use SPU record in the database. */
@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@IdClass(TestedPtAreaOfUseSpuId.class)
@Table(name = "TESTED_PT_AREA_OF_USE_SPU")
public class TestedPtAreaOfUseSpu {
  @Id
  @Column(name = "TESTED_PT_AREA_OF_USE_ID")
  private Integer testedPtAreaOfUseId;

  @Id
  @Column(name = "SEED_PLAN_UNIT_ID")
  private Integer seedPlanUnitId;
}
