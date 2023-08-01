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

/** Entity for the list of gametic methodology */
@Entity
@Table(name = "gametic_methodology_list")
@NoArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
@Setter
public class GameticMethodologyEntity {
  @Id
  @Column(name = "gametic_methodology_code", length = 3)
  private String gameticMethodologyCode;

  @Column(name = "description", length = 120)
  @NonNull
  private String description;

  @Column(name = "female_methodology_ind")
  private boolean isFemaleMethodology;

  @Column(name = "pli_species_ind")
  private boolean isPliSpecies;

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

  public GameticMethodologyEntity(
      String gameticMethodologyCode,
      String description,
      boolean isFemaleMethodology,
      boolean isPliSpecies,
      EffectiveDateRange effectiveDateRange) {
    this.gameticMethodologyCode = gameticMethodologyCode;
    this.description = description;
    this.isFemaleMethodology = isFemaleMethodology;
    this.isPliSpecies = isPliSpecies;
    this.effectiveDateRange = effectiveDateRange;
  }
}
