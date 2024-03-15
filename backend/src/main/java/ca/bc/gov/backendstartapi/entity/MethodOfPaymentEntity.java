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
@Table(name = "method_of_payment_list")
@Getter
@Setter
public class MethodOfPaymentEntity extends CodeDescriptionEntity {
  @Id
  @Column(name = "method_of_payment_code", length = 3)
  private String methodOfPaymentCode;

  @Column(name = "default_method_ind", nullable = true)
  private Boolean isDefault;

  public MethodOfPaymentEntity(
      String methodOfPaymentCode, String description, EffectiveDateRange effectiveDateRange) {
    super(description, effectiveDateRange);
    this.methodOfPaymentCode = methodOfPaymentCode;
  }
}
