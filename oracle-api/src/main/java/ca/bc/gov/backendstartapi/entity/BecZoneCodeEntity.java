package ca.bc.gov.backendstartapi.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

/** Represents a BEC Zone Code object in the database. */
@Getter
@Setter
@Entity
@Table(name = "BEC_ZONE_CODE", schema = "THE")
@Schema(description = "Represents a BEC Zone Code object in the database.")
public class BecZoneCodeEntity {

  @Id
  @Column(name = "BEC_ZONE_CODE")
  @Schema(description = "BEC zone code", example = "BG")
  private String code;

  @Column(name = "DESCRIPTION")
  @Schema(description = "BEC zone code's description", example = "Bunchgrass")
  private String description;

  @Column(name = "EFFECTIVE_DATE")
  @Schema(description = "BEC zone code's effective date.", type = "string", format = "date")
  private LocalDate effectiveDate;

  @Column(name = "EXPIRY_DATE")
  @Schema(description = "BEC zone code's expiry date.", type = "string", format = "date")
  private LocalDate expiryDate;

  @Column(name = "UPDATE_TIMESTAMP")
  @Schema(description = "BEC zone code's update timestamp.", type = "string", format = "date")
  private LocalDate updateTimeStamp;
}
