package ca.bc.gov.oracleapi.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

/** B+ superior provenance reference row from Oracle SUPERIOR_PROVENANCE. */
@Getter
@Setter
@Entity
@Table(name = "SUPERIOR_PROVENANCE")
@Schema(description = "Represents a Superior Provenance row in the database")
public class SuperiorProvenanceEntity {

  @Id
  @Column(name = "PROVENANCE_ID")
  @Schema(description = "Provenance identifier.", example = "1")
  private Integer provenanceId;

  @Column(name = "VEGETATION_CODE")
  @Schema(description = "Species vegetation code.", example = "FDC")
  private String vegetationCode;

  @Column(name = "DESCRIPTION")
  @Schema(description = "Display name.", example = "Fraser Valley Provenance")
  private String provenanceDescription;

  @Column(name = "HERITAGE_IND")
  @Schema(description = "Heritage indicator (Y/N).", example = "N")
  private String heritageInd;

  @Column(name = "EFFECTIVE_DATE")
  @Schema(description = "Code effective date.", type = "string", format = "date")
  private LocalDate effectiveDate;

  @Column(name = "EXPIRY_DATE")
  @Schema(description = "Code expiry date.", type = "string", format = "date")
  private LocalDate expiryDate;
}
