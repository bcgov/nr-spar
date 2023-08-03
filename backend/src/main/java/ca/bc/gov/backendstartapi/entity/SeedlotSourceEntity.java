package ca.bc.gov.backendstartapi.entity;

import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Entity for the list of genetic class */
@Entity
@NoArgsConstructor
@Table(name = "seedlot_source_list")
@Getter
@Setter
public class SeedlotSourceEntity extends CodeDescriptionEntity {
  @Id
  @Column(name = "seedlot_source_code", length = 3)
  private String seedlotSourceCode;

  public SeedlotSourceEntity(
      String seedlotSourceCode, String description, EffectiveDateRange effectiveDateRange) {
    super(description, effectiveDateRange);
    this.seedlotSourceCode = seedlotSourceCode;
  }
}
