package ca.bc.gov.backendstartapi.entity.embeddable;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Used to track the changes made in a registry. */
@Embeddable
@NoArgsConstructor
@AllArgsConstructor
@Getter
public class EffectiveDateRange {
  /** The date from which the code is in effect. */
  @Column(name = "effective_date", nullable = false)
  @Schema(description = "The date from which the code is in effect.")
  private LocalDate effectiveDate;

  /** The date on which the code expires. */
  @Column(name = "expiry_date", nullable = false)
  @Schema(description = "The date on which the code expires.")
  private LocalDate expiryDate;
}
