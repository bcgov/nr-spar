package ca.bc.gov.backendstartapi.entity;

import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeGeneticQualityId;
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

/** Genetic quantification of a parent tree in a seedlot. */
@Entity
@Table(name = "seedlot_parent_tree_gen_qlty")
@IdClass(SeedlotParentTreeGeneticQualityId.class)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@RequiredArgsConstructor
@Getter
@Setter
public class SeedlotParentTreeGeneticQuality {

  // region Identifier
  @Id
  @JoinColumn(name = "seedlot_number", referencedColumnName = "seedlot_number")
  @JoinColumn(name = "parent_tree_id", referencedColumnName = "parent_tree_id")
  @ManyToOne(fetch = FetchType.LAZY)
  @NonNull
  private SeedlotParentTree seedlotParentTree;

  @Id
  @Column(name = "genetic_type_code", length = 2, nullable = false)
  @NonNull
  private String geneticTypeCode;

  @Id
  @JoinColumn(name = "genetic_worth_code")
  @ManyToOne(fetch = FetchType.LAZY)
  @NonNull
  private GeneticWorthEntity geneticWorth;

  // endregion

  @Column(name = "genetic_quality_value", precision = 4, scale = 1, nullable = false)
  @NonNull
  private BigDecimal geneticQualityValue;

  @Column(name = "estimated_ind")
  public Boolean qualityValueEstimated;

  @Column(name = "untested_ind")
  public Boolean parentTreeUntested;

  @Embedded @NonNull private AuditInformation auditInformation;

  @Column(name = "revision_count", nullable = false)
  @Version
  @Setter(AccessLevel.NONE)
  private int revisionCount;

  /**
   * Creates an instance of {@link SeedlotParentTreeGeneticQualityId} containing: the seedlot parent
   * tree id, the genetic type code and the genetic worth code.
   *
   * @return A {@link SeedlotParentTreeGeneticQualityId}
   */
  public SeedlotParentTreeGeneticQualityId getId() {
    return new SeedlotParentTreeGeneticQualityId(
        seedlotParentTree.getId(), geneticTypeCode, geneticWorth.getGeneticWorthCode());
  }
}
