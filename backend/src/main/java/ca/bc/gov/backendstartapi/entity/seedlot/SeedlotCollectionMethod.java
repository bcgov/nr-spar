package ca.bc.gov.backendstartapi.entity.seedlot;

import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.idclass.SeedlotCollectionMethodId;
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
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;
import lombok.ToString;

/** The method used for the collection of a lot of seeds. */
@Entity
@Table(name = "seedlot_collection_method")
@IdClass(SeedlotCollectionMethodId.class)
@Getter
@Setter
@NoArgsConstructor
@ToString
@EqualsAndHashCode
public class SeedlotCollectionMethod {
  // region Identifier
  @Id
  @JoinColumn(name = "seedlot_number", updatable = false, nullable = false)
  @ManyToOne(fetch = FetchType.LAZY)
  @NonNull
  private Seedlot seedlot;

  @Id
  @JoinColumn(name = "cone_collection_method_code", updatable = false, nullable = false)
  @ManyToOne(fetch = FetchType.LAZY)
  @NonNull
  private ConeCollectionMethodEntity coneCollectionMethod;

  // endregion

  @Column(name = "cone_collection_method_other_desc", length = 50)
  private String coneCollectionMethodOtherDescription;

  @Embedded private AuditInformation auditInformation;

  @Column(name = "revision_count", nullable = false)
  @Version
  @Setter(AccessLevel.NONE)
  private int revisionCount;

  public SeedlotCollectionMethod(Seedlot seedlot, ConeCollectionMethodEntity collectionMethod) {
    this.seedlot = seedlot;
    this.coneCollectionMethod = collectionMethod;
  }
}
