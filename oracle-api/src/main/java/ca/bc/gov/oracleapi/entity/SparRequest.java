package ca.bc.gov.oracleapi.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/** Represents a partial spar request object, holding the species of a request. */
@Getter
@Setter
@Entity
@Table(name = "SPAR_REQUEST")
@Schema(description = "Represents a partial spar request object in the database")
public class SparRequest {

  @Id
  @Column(name = "REQUEST_SKEY")
  @Schema(description = "The key of a request", example = "16258")
  private Long requestSkey;

  @Column(name = "VEGETATION_CODE")
  @Schema(description = "The species (vegetation code) of the request", example = "PLI")
  private String vegetationCode;
}
