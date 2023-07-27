package ca.bc.gov.backendstartapi.entity.seedlot;

import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.idclass.SeedlotCollectionMethodId;
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
import lombok.Setter;

/** The method used for the collection of a lot of seeds. */
@Entity
@Table(name = "seedlot_collection_method")
@IdClass(SeedlotCollectionMethodId.class)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@Getter
@Setter
public class SeedlotCollectionMethod {

  // region Identifier
  @Id
  @JoinColumn(name = "seedlot_number")
  @ManyToOne
  @NonNull
  private Seedlot seedlot;

  @Id
  @JoinColumn(name = "cone_collection_method_code")
  @ManyToOne
  @NonNull
  private ConeCollectionMethodEntity coneCollectionMethod;

  // endregion

  @Column(name = "cone_collection_method_desc", length = 400)
  private String coneCollectionMethodDescription;

  @Embedded private AuditInformation auditInformation;

  @Column(name = "revision_count", nullable = false)
  @Version
  @Setter(AccessLevel.NONE)
  private int revisionCount;

  public SeedlotCollectionMethod(
      @NonNull Seedlot seedlot, @NonNull ConeCollectionMethodEntity collectionMethod) {
    this.seedlot = seedlot;
    this.coneCollectionMethod = collectionMethod;
  }
}
