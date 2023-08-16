package ca.bc.gov.backendstartapi.entity;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.MappedSuperclass;
import java.beans.Transient;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

/**
 * Abstract class for entity with code and description, related to {@link CodeDescriptionDto}
 * Inheritance must declare its own @Id column.
 */
@NoArgsConstructor
@Getter
@Setter
@MappedSuperclass
public abstract class CodeDescriptionEntity {
  @Column(name = "description", length = 120, nullable = false)
  @NonNull
  private String description;

  @Embedded @NonNull private EffectiveDateRange effectiveDateRange;

  /** The date and time of the last update. */
  @Column(name = "update_timestamp")
  private Instant updateTimestamp;

  /** The boolean value determines if the entity is within the effective date range. */
  @Transient
  public boolean isValid() {
    var today = LocalDate.now();
    return !effectiveDateRange.getEffectiveDate().isAfter(today)
        && effectiveDateRange.getExpiryDate().isAfter(today);
  }

  public CodeDescriptionEntity(String description, EffectiveDateRange effectiveDateRange) {
    this.description = description;
    this.effectiveDateRange = effectiveDateRange;
  }
}
