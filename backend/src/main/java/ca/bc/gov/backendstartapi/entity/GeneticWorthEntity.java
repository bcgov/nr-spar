package ca.bc.gov.backendstartapi.entity;

import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Entity for the list of genetic class. */
@Entity
@NoArgsConstructor
@Table(name = "genetic_worth_list")
@Getter
@Setter
public class GeneticWorthEntity extends CodeDescriptionEntity {
  @Id
  @Column(name = "genetic_worth_code", length = 3)
  private String geneticWorthCode;

  public GeneticWorthEntity(
      String geneticWorthCode, String description, EffectiveDateRange effectiveDateRange) {
    super(description, effectiveDateRange);
    this.geneticWorthCode = geneticWorthCode;
  }
}
