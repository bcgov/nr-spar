package ca.bc.gov.backendstartapi.entity;

import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Entity for the list of cone collection method. */
@Entity
@NoArgsConstructor
@Table(name = "cone_collection_method_list")
@Getter
@Setter
public class ConeCollectionMethodEntity extends CodeDescriptionEntity {
  @Id
  @Column(name = "cone_collection_method_code")
  private int coneCollectionMethodCode;

  public ConeCollectionMethodEntity(
      int coneCollectionMethodCode, String description, EffectiveDateRange effectiveDateRange) {
    super(description, effectiveDateRange);
    this.coneCollectionMethodCode = coneCollectionMethodCode;
  }
}
