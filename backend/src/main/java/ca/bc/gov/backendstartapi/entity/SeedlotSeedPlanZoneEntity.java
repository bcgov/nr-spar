package ca.bc.gov.backendstartapi.entity;

import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.idclass.SeedlotSeedPlanZoneId;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

/** This class represents a Seedlot Seed Plan Zone entity. */
@Entity
@Table(name = "seedlot_smp_mix")
@IdClass(SeedlotSeedPlanZoneId.class)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@RequiredArgsConstructor
@Getter
@Setter
public class SeedlotSeedPlanZoneEntity {

  // region Identifier
  @Id
  @JoinColumn(name = "seedlot_number")
  @ManyToOne
  @NonNull
  private Seedlot seedlot;

  @Id
  @Column(name = "seed_plan_zone_code", length = 3, nullable = false)
  @NonNull
  private String seedPlanZoneCode;

  // endregion

  @Column(name = "seed_plan_zone_id", nullable = false)
  @NonNull
  private Integer seedPlanZoneId;

  @ManyToOne
  @JoinColumn(name = "genetic_class_code")
  @NonNull
  private GeneticClassEntity geneticClass;

  @Embedded private AuditInformation auditInformation;

  @Column(name = "revision_count", nullable = false)
  @Version
  @Setter(AccessLevel.NONE)
  private int revisionCount;
}
