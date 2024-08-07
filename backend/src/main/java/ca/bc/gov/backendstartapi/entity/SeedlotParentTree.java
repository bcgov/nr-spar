package ca.bc.gov.backendstartapi.entity;

import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeId;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.math.BigDecimal;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/** The contribution of each tree to a seedlot. */
@Entity
@Table(name = "seedlot_parent_tree")
@IdClass(SeedlotParentTreeId.class)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@RequiredArgsConstructor
@Getter
@Setter
@ToString
public class SeedlotParentTree {

  // region Identifier
  @Id
  @JoinColumn(name = "seedlot_number")
  @ManyToOne(fetch = FetchType.LAZY)
  @NonNull
  private Seedlot seedlot;

  @Id
  @Column(name = "parent_tree_id", nullable = false)
  @NonNull
  private Integer parentTreeId;

  @Column(name = "parent_tree_number", nullable = false)
  @NonNull
  private String parentTreeNumber;

  // endregion

  @Column(name = "cone_count", precision = 20, scale = 10, nullable = false)
  @NonNull
  private BigDecimal coneCount;

  @Column(name = "pollen_count", precision = 20, scale = 10, nullable = false)
  @NonNull
  private BigDecimal pollenCount;

  @Column(name = "smp_success_pct")
  private Integer smpSuccessPercentage;

  @Column(name = "non_orchard_pollen_contam_pct")
  private Integer nonOrchardPollenContaminationCount;

  @Embedded @NonNull private AuditInformation auditInformation;

  @Column(name = "revision_count", nullable = false)
  @Version
  @Setter(AccessLevel.NONE)
  private int revisionCount;

  /**
   * Creates an instance of {@link SeedlotParentTreeId} containing: the seedlot id (seedlot number)
   * and the parent tree id.
   *
   * @return A {@link SeedlotParentTreeId}
   */
  public SeedlotParentTreeId getId() {
    return new SeedlotParentTreeId(seedlot.getId(), parentTreeId);
  }
}
