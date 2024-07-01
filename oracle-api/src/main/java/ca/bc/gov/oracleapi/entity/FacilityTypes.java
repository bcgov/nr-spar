package ca.bc.gov.oracleapi.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

/** This class presents a interim facility code to an agency seedlot interim storage. */
@Getter
@Setter
@Entity
@Table(name = "INTERM_FACILITY_CODE")
@Schema(description = "Represents a Facility Code object in the database")
public class FacilityTypes {

  @Id
  @Column(name = "INTERM_FACILITY_CODE")
  @Schema(description = "Facility type code, from INTERM_FACILITY_CODE column", example = "OCV")
  private String code;

  @Column(name = "DESCRIPTION")
  @Schema(
      description = "Facility type's description, from DESCRIPTION column",
      example = "Outside Covered")
  private String description;

  @Column(name = "EFFECTIVE_DATE")
  @Schema(description = "Facility type's effective date.", type = "string", format = "date")
  private LocalDate effectiveDate;

  @Column(name = "EXPIRY_DATE")
  @Schema(description = "Facility type's expiry date.", type = "string", format = "date")
  private LocalDate expiryDate;

  @Column(name = "UPDATE_TIMESTAMP")
  @Schema(description = "Facility type's update timestamp.", type = "string", format = "date")
  private LocalDate updateTimeStamp;
}
