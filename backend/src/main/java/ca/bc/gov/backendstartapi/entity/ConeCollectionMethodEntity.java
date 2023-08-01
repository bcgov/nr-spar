package ca.bc.gov.backendstartapi.entity;

import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.beans.Transient;
import java.time.Instant;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;
import org.hibernate.annotations.SourceType;
import org.hibernate.annotations.UpdateTimestamp;

/** Entity for the list of cone collection method */
@Entity
@Table(name = "cone_collection_method_list")
@NoArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
@Setter
public class ConeCollectionMethodEntity {
  @Id
  @Column(name = "cone_collection_method_code")
  private int coneCollectionMethodCode;

  @Column(name = "description", length = 120)
  @NonNull
  private String description;

  @Embedded @NonNull private EffectiveDateRange effectiveDateRange;

  /** The date and time of the last update. */
  @UpdateTimestamp(source = SourceType.DB)
  private Instant updateTimestamp;

  @Transient
  public boolean isValid() {
    var today = LocalDate.now();
    return !effectiveDateRange.getEffectiveDate().isAfter(today)
        && effectiveDateRange.getExpiryDate().isAfter(today);
  }

  public ConeCollectionMethodEntity(
      int coneCollectionMethodCode, String description, EffectiveDateRange effectiveDateRange) {
    this.coneCollectionMethodCode = coneCollectionMethodCode;
    this.description = description;
    this.effectiveDateRange = effectiveDateRange;
  }
}
