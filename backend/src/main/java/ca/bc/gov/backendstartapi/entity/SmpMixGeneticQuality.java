package ca.bc.gov.backendstartapi.entity;

import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.idclass.SmpMixGeneticQualityId;
import ca.bc.gov.backendstartapi.entity.idclass.SmpMixId;
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
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

/** The calculated Genetic Worth value(s) for the Supplemental Mass Pollination mix. */
@Entity
@Table(name = "smp_mix_gen_qlty")
@IdClass(SmpMixGeneticQualityId.class)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor
@Getter
@Setter
public class SmpMixGeneticQuality {

  // region Identifier
  @Id
  @JoinColumn(name = "seedlot_number", referencedColumnName = "seedlot_number")
  @JoinColumn(name = "parent_tree_id", referencedColumnName = "parent_tree_id")
  @ManyToOne(fetch = FetchType.LAZY)
  @NonNull
  private SmpMix smpMix;

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

  @Column(name = "estimated_ind", nullable = false)
  public boolean qualityValueEstimated;

  @Embedded @NonNull private AuditInformation auditInformation;

  @Column(name = "revision_count", nullable = false)
  @Version
  @Setter(AccessLevel.NONE)
  private int revisionCount;

  /**
   * Gets the {@link SmpMixGeneticQualityId} id containing the {@link SmpMixId}, the geneticTypeCode
   * and the geneticWorth.
   *
   * @return A {@link SmpMixGeneticQualityId}
   */
  public SmpMixGeneticQualityId getId() {
    SmpMixId mixId = new SmpMixId(smpMix.getSeedlot().getId(), smpMix.getParentTreeId());
    return new SmpMixGeneticQualityId(mixId, geneticTypeCode, geneticWorth.getGeneticWorthCode());
  }
}
