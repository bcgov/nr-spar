package ca.bc.gov.oracleapi.entity;

import ca.bc.gov.oracleapi.entity.idclass.TestedPtAreaOfUseSpzId;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;
import org.hibernate.type.YesNoConverter;

/** This class represents a Tested Parent Tree Area of Use SPZ record in the database. */
@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@IdClass(TestedPtAreaOfUseSpzId.class)
@Table(name = "TESTED_PT_AREA_OF_USE_SPZ")
public class TestedPtAreaOfUseSpz {
  @Id
  @JoinColumn(name = "TESTED_PT_AREA_OF_USE_ID")
  @ManyToOne
  @NonNull
  private TestedPtAreaOfUse testedPtAreaOfUse;

  @Id
  @JoinColumn(name = "SEED_PLAN_ZONE_CODE")
  @ManyToOne
  @NonNull
  private SeedPlanZoneCode seedPlanZoneCode;

  @Column(name = "PRIMARY_IND", nullable = false)
  @Convert(converter = YesNoConverter.class)
  private Boolean isPrimary;
}
