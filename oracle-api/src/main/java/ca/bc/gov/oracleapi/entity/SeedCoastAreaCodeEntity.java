package ca.bc.gov.oracleapi.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

/** This class presents a seed coast geographic area code for B-class seedlots. */
@Getter
@Setter
@Entity
@Table(name = "SEED_COAST_AREA_CODE")
@Schema(description = "Represents a Seed Coast Area code in the database")
public class SeedCoastAreaCodeEntity {

  @Id
  @Column(name = "SEED_COAST_AREA_CODE")
  @Schema(
      description = "Seed coast area code, from SEED_COAST_AREA_CODE column",
      example = "N")
  private String code;

  @Column(name = "DESCRIPTION")
  @Schema(
      description = "Seed coast area description, from DESCRIPTION column",
      example = "North Coast")
  private String description;

  @Column(name = "EFFECTIVE_DATE")
  @Schema(description = "Code effective date.", type = "string", format = "date")
  private LocalDate effectiveDate;

  @Column(name = "EXPIRY_DATE")
  @Schema(description = "Code expiry date.", type = "string", format = "date")
  private LocalDate expiryDate;
}
