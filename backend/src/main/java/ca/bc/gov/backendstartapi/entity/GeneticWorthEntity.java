package ca.bc.gov.backendstartapi.entity;

import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
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

  @Column(name = "default_bv", nullable = false, precision = 3, scale = 1)
  private BigDecimal defaultBv;

  /** Constructor. */
  public GeneticWorthEntity(
      String geneticWorthCode,
      String description,
      EffectiveDateRange effectiveDateRange,
      BigDecimal defaultBv) {
    super(description, effectiveDateRange);
    this.geneticWorthCode = geneticWorthCode;
    this.defaultBv = defaultBv;
  }
}
