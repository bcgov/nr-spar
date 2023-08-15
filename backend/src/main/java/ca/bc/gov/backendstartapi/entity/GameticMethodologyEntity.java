package ca.bc.gov.backendstartapi.entity;

import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Entity for the list of gametic methodology. */
@Entity
@Table(name = "gametic_methodology_list")
@NoArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
@Setter
public class GameticMethodologyEntity extends CodeDescriptionEntity {
  @Id
  @Column(name = "gametic_methodology_code", length = 3)
  private String gameticMethodologyCode;

  @Column(name = "female_methodology_ind")
  private boolean isFemaleMethodology;

  @Column(name = "pli_species_ind")
  private boolean isPliSpecies;

  /** Constructor for {@link GameticMethodologyEntity}. */
  public GameticMethodologyEntity(
      String gameticMethodologyCode,
      String description,
      boolean isFemaleMethodology,
      boolean isPliSpecies,
      EffectiveDateRange effectiveDateRange) {
    super(description, effectiveDateRange);
    this.gameticMethodologyCode = gameticMethodologyCode;
    this.isFemaleMethodology = isFemaleMethodology;
    this.isPliSpecies = isPliSpecies;
  }
}
