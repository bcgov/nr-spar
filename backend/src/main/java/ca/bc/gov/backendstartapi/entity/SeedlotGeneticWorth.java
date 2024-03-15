package ca.bc.gov.backendstartapi.entity;

import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotGeneticWorthId;
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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

/** Quantification of a given genetic quality in a seedlot. */
@Entity
@Table(name = "seedlot_genetic_worth")
@IdClass(SeedlotGeneticWorthId.class)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@RequiredArgsConstructor
@Getter
@Setter
public class SeedlotGeneticWorth {

  // region Identifier
  @Id
  @JoinColumn(name = "seedlot_number")
  @ManyToOne(optional = false)
  @NonNull
  private Seedlot seedlot;

  @Id
  @JoinColumn(name = "genetic_worth_code")
  @ManyToOne
  @NonNull
  private GeneticWorthEntity geneticWorth;

  // endregion

  @Column(name = "genetic_quality_value", precision = 4, scale = 1, nullable = false)
  private BigDecimal geneticQualityValue;

  @Column(name = "tested_parent_tree_cont_pct", precision = 6, scale = 2)
  private BigDecimal testedParentTreeContributionPercentage;

  @Embedded @NonNull private AuditInformation auditInformation;

  @Column(name = "revision_count", nullable = false)
  @Version
  @Setter(AccessLevel.NONE)
  private int revisionCount;

  /**
   * Gets the genetic worth code.
   *
   * @return The {@link GeneticWorthEntity} code.
   */
  public String getGeneticWorthCode() {
    return geneticWorth.getGeneticWorthCode();
  }
}
