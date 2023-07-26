package ca.bc.gov.backendstartapi.entity;

import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;
import java.time.Instant;
import org.hibernate.annotations.SourceType;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * The Parent Trees that contributed to the Supplemental Mass Pollination mix of an Orchard Seedlot
 * (Genetic Class = "A").
 */
@Entity
@Table(name = "cone_collection_method")
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor
@Getter
@Setter
public class ConeCollectionMethodEntity {
  @Id
  @Column(name = "code", nullable = false, length = 3)
  private String code;

  @Column(name = "description", length = 120)
  @Embedded
  @NonNull
  private EffectiveDateRange effectiveDateRange;

  /** The date and time of the last update. */
  @UpdateTimestamp(source = SourceType.DB)
  private Instant updateTimestamp;
}
