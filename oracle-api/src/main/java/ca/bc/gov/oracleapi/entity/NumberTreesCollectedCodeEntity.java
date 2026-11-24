package ca.bc.gov.oracleapi.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

/** This class presents a "number of trees collected from" code for B-class seedlots. */
@Getter
@Setter
@Entity
@Table(name = "NMBR_TREES_FROM_CODE")
@Schema(description = "Represents a Number of Trees Collected From code in the database")
public class NumberTreesCollectedCodeEntity {

  @Id
  @Column(name = "NMBR_TREES_FROM_CODE")
  @Schema(
      description = "Number of trees collected from code, from NMBR_TREES_FROM_CODE column",
      example = "1")
  private String code;

  @Column(name = "DESCRIPTION")
  @Schema(
      description = "Code description, from DESCRIPTION column",
      example = "1 to 10 trees")
  private String description;

  @Column(name = "EFFECTIVE_DATE")
  @Schema(description = "Code effective date.", type = "string", format = "date")
  private LocalDate effectiveDate;

  @Column(name = "EXPIRY_DATE")
  @Schema(description = "Code expiry date.", type = "string", format = "date")
  private LocalDate expiryDate;
}
