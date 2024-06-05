package ca.bc.gov.backendstartapi.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

/** Represents a SPAR BEC Catalogue object in the database. */
@Getter
@Setter
@Entity
@Table(name = "SPAR_BIOGEOCLIMATIC_CATALOGUE")
@Schema(description = "Represents a Spar BEC Catalogue object in the database.")
public class SparBecCatalogueEntity {
  @Id
  @Column(name = "BIOGEOCLIMATIC_CATALOGUE_ID")
  @Schema(description = "The id of a Spar BEC Catalogue object", example = "4")
  private Integer id;

  @Column(name = "BEC_NATURAL_DISTURBANCE_CODE", length = 4)
  @Schema(description = "The BEC natural disturbance code", example = "NDT4")
  private String becNaturalDisturbanceCode;

  @Column(name = "BEC_ZONE_CODE")
  @Schema(description = "BEC zone code", example = "BG")
  private String becCode;

  @Column(name = "SUBZONE", length = 3)
  @Schema(description = "BEC sub zone code", example = "xh")
  private String becSubZoneCode;

  @Column(name = "VARIANT", length = 1)
  @Schema(description = "BEC Variant", example = "1")
  private String variant;

  @Column(name = "PHASE", length = 1)
  @Schema(description = "The phase", example = "a")
  private String phase;

  @Column(name = "ZONE_NAME", length = 35)
  @Schema(description = "BEC zone code's description", example = "Bunchgrass")
  private String becZoneDescription;

  @Column(name = "SUBZONE_NAME", length = 35)
  @Schema(description = "BEC sub zone code's description", example = "Very Dry Hot")
  private String becSubZoneDescription;

  @Column(name = "VARIANT_NAME", length = 20)
  @Schema(description = "The variant's description", example = "Okanagan")
  private String variantDescription;

  @Column(name = "PHASE_NAME", length = 15)
  @Schema(description = "The phase's description", example = "Steep South")
  private String phaseDescription;

  @Column(name = "NOTES", length = 72)
  @Schema(
      description = "The note for this object",
      example = "Not mapped; combined with AT as ATp polygon")
  private String note;

  @Column(name = "EFFECTIVE_DATE")
  @Schema(description = "BEC zone code's effective date.", type = "string", format = "date")
  private LocalDate effectiveDate;

  @Column(name = "EXPIRY_DATE")
  @Schema(description = "Object's expiry date.", type = "string", format = "date")
  private LocalDate expiryDate;

  @Column(name = "UPDATE_TIMESTAMP")
  @Schema(description = "Object's update timestamp.", type = "string", format = "date")
  private LocalDate updateTimeStamp;

  @Column(name = "UPDATE_USERID")
  @Schema(description = "Object's update user id.")
  private String updateUserId;
}
