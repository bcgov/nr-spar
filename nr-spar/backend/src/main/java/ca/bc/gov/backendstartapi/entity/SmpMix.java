package ca.bc.gov.backendstartapi.entity;

import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeId;
import ca.bc.gov.backendstartapi.entity.idclass.SmpMixId;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.math.BigDecimal;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

/**
 * The Parent Trees that contributed to the Supplemental Mass Pollination mix of an Orchard Seedlot
 * (Genetic Class = "A").
 */
@Entity
@Table(name = "smp_mix")
@IdClass(SmpMixId.class)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor
@Getter
@Setter
public class SmpMix {

  // region Identifier
  @Id
  @JoinColumn(name = "seedlot_number")
  @ManyToOne
  @NonNull
  private Seedlot seedlot;

  @Id
  @Column(name = "parent_tree_id", nullable = false)
  private int parentTreeId;
  // endregion

  @Column(name = "parent_tree_number", nullable = false)
  private String parentTreeNumber;

  @Column(name = "amount_of_material", nullable = false)
  private int amountOfMaterial;

  @Column(name = "proportion", precision = 20, scale = 10)
  private BigDecimal proportion;

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
  public SeedlotParentTreeId getSeedlotParentTreeId() {
    return new SeedlotParentTreeId(seedlot.getId(), parentTreeId);
  }
}
