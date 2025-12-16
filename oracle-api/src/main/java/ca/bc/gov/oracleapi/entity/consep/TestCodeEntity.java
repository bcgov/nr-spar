package ca.bc.gov.oracleapi.entity.consep;

import ca.bc.gov.oracleapi.entity.consep.idclass.TestCodeId;
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
@Table(name = "CNS_T_CODE_LIST_TABLE", schema = "CONSEP")
@Schema(
    description = "Represents the mapping of codes with expanded results and effective/expiry dates"
)
public class TestCodeEntity {

  @EmbeddedId
  private TestCodeId id;

  @Column(name = "EXPANDED_RESULT", length = 120)
  private String expandedResult;

  @Column(name = "EFFECTIVE_DATE")
  private LocalDate effectiveDate;

  @Column(name = "EXPIRY_DATE")
  private LocalDate expiryDate;
}
