package ca.bc.gov.oracleapi.entity.consep;

import ca.bc.gov.oracleapi.entity.consep.idclass.TestCodeSubsetId;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
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
  @EmbeddedId
  private TestCodeSubsetId id;

  @Column(name = "IN_EFFECT_DATE")
  private LocalDate inEffectDate;

  @Column(name = "EXPIRED_DATE")
  private LocalDate expiredDate;
}
