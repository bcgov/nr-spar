package ca.bc.gov.oracleapi.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/** This class presents a funding source to an agency seedlot owner. */
@Getter
@Setter
@Entity
@Table(name = "SEEDLOT")
@Schema(description = "Represents a partial seedlot object in the database")
public class Seedlot {

  @Id
  @Column(name = "SEEDLOT_NUMBER")
  @Schema(description = "The number of a seedlot", example = "16258")
  private Long seedlotNumber;

  @Column(name = "ORIGINAL_SEED_QTY")
  @Schema(
      description = "The original quantity of seeds in the seedlot",
      example = "1")
  private Long originalSeedQty;
}
