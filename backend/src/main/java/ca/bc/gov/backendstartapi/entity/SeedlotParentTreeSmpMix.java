package ca.bc.gov.backendstartapi.entity;

import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeId;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeSmpMixId;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
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
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Supplemental Mass Polination for a given Seedlot, Parent Tree, Genetic Type and Genetic worth
 * combination.
 */
@Entity
@Table(name = "seedlot_parent_tree_smp_mix")
@IdClass(SeedlotParentTreeSmpMixId.class)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@RequiredArgsConstructor
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
public class SeedlotParentTreeSmpMix {

  // region Identifier
  @Id
  @JoinColumn(name = "seedlot_number", referencedColumnName = "seedlot_number")
  @JoinColumn(name = "parent_tree_id", referencedColumnName = "parent_tree_id")
  @ManyToOne
  @NonNull
  private SeedlotParentTree seedlotParentTree;

  @Id
  @Column(name = "genetic_type_code", length = 2, nullable = false)
  @NonNull
  private String geneticTypeCode;

  @Id
  @JoinColumn(name = "genetic_worth_code")
  @ManyToOne
  @NonNull
  private GeneticWorthEntity geneticWorth;

  // endregion

  @Column(name = "genetic_quality_value", precision = 4, scale = 1, nullable = false)
  @NonNull
  private BigDecimal geneticQualityValue;

  @Embedded @NonNull private AuditInformation auditInformation;

  @Column(name = "revision_count", nullable = false)
  @Version
  @Setter(AccessLevel.NONE)
  private int revisionCount;

  /**
   * Gets the {@link SeedlotParentTreeSmpMix} id class containing the {@link SeedlotParentTreeId},
   * the geneticTypeCode and the geneticWorth.
   *
   * @return A {@link SeedlotParentTreeSmpMixId}
   */
  public SeedlotParentTreeSmpMixId getId() {
    return new SeedlotParentTreeSmpMixId(
        seedlotParentTree.getId(), geneticTypeCode, geneticWorth.getGeneticWorthCode());
  }
}
