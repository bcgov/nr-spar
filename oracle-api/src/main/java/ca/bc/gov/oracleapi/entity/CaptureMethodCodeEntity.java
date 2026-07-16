package ca.bc.gov.oracleapi.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

/** This class presents a capture method code for collection area geometry. */
@Getter
@Setter
@Entity
@Table(name = "CORP_CAPTURE_METHOD")
@Schema(description = "Represents a Capture Method code in the database")
public class CaptureMethodCodeEntity {

  @Id
  @Column(name = "CAPTURE_METHOD_CODE")
  @Schema(
      description = "Capture method code, from CAPTURE_METHOD_CODE column",
      example = "GPS")
  private String code;

  @Column(name = "DESCRIPTION")
  @Schema(
      description = "Capture method description, from DESCRIPTION column",
      example = "GPS")
  private String description;

  @Column(name = "EFFECTIVE_DATE")
  @Schema(description = "Code effective date.", type = "string", format = "date")
  private LocalDate effectiveDate;

  @Column(name = "EXPIRY_DATE")
  @Schema(description = "Code expiry date.", type = "string", format = "date")
  private LocalDate expiryDate;
}
