package ca.bc.gov.oracleapi.entity.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

/**
 * Represents a code mapping entity in CONSEP.
 */
@Getter
@Setter
@Entity
@Table(name = "CNS_T_CODE_SUBSET_TBL", schema = "CONSEP")
@Schema(
    description = "Represents the mapping of codes with expanded results and effective/expiry dates"
)
public class TestCodeSubsetEntity {
  @Id
  @Column(name = "CODE_SUBSET_NAME", length = 18)
  private String codeSubsetName;

  @Column(name = "COLUMN_NAME", length = 18)
  private String columnName;

  @Column(name = "CODE_ARGUMENT", length = 50)
  private String codeArgument;

  @Column(name = "IN_EFFECT_DATE")
  private LocalDate inEffectDate;

  @Column(name = "EXPIRED_DATE")
  private LocalDate expiredDate;
}
