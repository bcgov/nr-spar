package ca.bc.gov.oracleapi.entity.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

/**
 * This class represents the data of spar request in CONSEP.
 */
@Getter
@Setter
@Entity
@Table(name = "CNS_T_SPAR_REQUEST", schema = "CONSEP")
@Schema(description = "Represents the data in the spar request table")
public class SparRequestEntity {
  @Id
  @Column(name = "REQUEST_SKEY", precision = 10, scale = 0)
  @NotNull
  private BigDecimal requestSkey;

  @Column(name = "REQUEST_TYPE_ST", length = 3)
  private String requestTypeSt;
}
