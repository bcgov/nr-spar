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

/** Entity for the list of genetic class */
@Entity
@Table(name = "genetic_class_list")
@NoArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
@Setter
public class GeneticClassEntity extends CodeDescriptionEntity {
  @Id
  @Column(name = "genetic_class_code", length = 1)
  private String geneticClassCode;

  public GeneticClassEntity(
      String geneticClassCode, String description, EffectiveDateRange effectiveDateRange) {
    super(description, effectiveDateRange);
    this.geneticClassCode = geneticClassCode;
  }
}
