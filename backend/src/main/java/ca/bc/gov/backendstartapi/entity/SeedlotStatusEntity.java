package ca.bc.gov.backendstartapi.entity;

import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Entity for the list of seedlot status. */
@Entity
@NoArgsConstructor
@Table(name = "seedlot_status_list")
@Getter
@Setter
public class SeedlotStatusEntity extends CodeDescriptionEntity {
  @Id
  @Column(name = "seedlot_status_code", length = 3)
  private String seedlotStatusCode;

  public SeedlotStatusEntity(
      String seedlotStatusCode, String description, EffectiveDateRange effectiveDateRange) {
    super(description, effectiveDateRange);
    this.seedlotStatusCode = seedlotStatusCode;
  }
}
