package ca.bc.gov.oracleapi.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

/** Represents a Ministry of Forests district org unit from the Oracle ORG_UNIT table. */
@Getter
@Setter
@Entity
@Table(name = "ORG_UNIT")
@Schema(description = "A Ministry of Forests district org unit.")
public class OrgUnitEntity {

  @Id
  @Column(name = "ORG_UNIT_NO")
  @Schema(description = "Numeric identifier for the org unit.", example = "45")
  private Integer orgUnitNo;

  @Column(name = "ORG_UNIT_CODE")
  @Schema(description = "Org unit code; district codes start with 'D'.", example = "DCC")
  private String orgUnitCode;

  @Column(name = "ORG_UNIT_NAME")
  @Schema(description = "Display name of the org unit.", example = "Cariboo-Chilcotin Natural Resource District")
  private String orgUnitName;

  @Column(name = "ROLLUP_DIST_NO")
  @Schema(description = "The district this unit rolls up to. Equals ORG_UNIT_NO for districts.")
  private Integer rollupDistNo;

  @Column(name = "EFFECTIVE_DATE")
  @Schema(description = "Date the org unit became effective.", type = "string", format = "date")
  private LocalDate effectiveDate;

  @Column(name = "EXPIRY_DATE")
  @Schema(description = "Date the org unit expired.", type = "string", format = "date")
  private LocalDate expiryDate;
}
