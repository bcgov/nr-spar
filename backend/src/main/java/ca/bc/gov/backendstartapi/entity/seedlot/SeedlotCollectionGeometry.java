package ca.bc.gov.backendstartapi.entity.seedlot;

import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.locationtech.jts.geom.Geometry;

/** Natural-stand collection area polygon for a Class B seedlot. */
@Entity
@Table(name = "seedlot_collection_geometry", schema = "spar")
@NoArgsConstructor
@Getter
@Setter
public class SeedlotCollectionGeometry {

  @Id
  @Column(name = "seedlot_number", length = 5)
  private String seedlotNumber;

  @MapsId
  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "seedlot_number")
  private Seedlot seedlot;

  @Column(name = "geometry", columnDefinition = "geometry(Geometry,3005)")
  private Geometry geometry;

  @Column(name = "feature_class_skey")
  private Integer featureClassSkey;

  @Column(name = "feature_area")
  private BigDecimal featureArea;

  @Column(name = "feature_perimeter")
  private BigDecimal featurePerimeter;

  @Column(name = "observation_date")
  private LocalDateTime observationDate;

  @Embedded private AuditInformation auditInformation;

  @Column(name = "revision_count", nullable = false)
  @Version
  @Setter(AccessLevel.NONE)
  private int revisionCount;

  public SeedlotCollectionGeometry(String seedlotNumber) {
    this.seedlotNumber = seedlotNumber;
  }
}
