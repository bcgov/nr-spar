package ca.bc.gov.oracleapi.entity;

import ca.bc.gov.oracleapi.entity.idclass.RequestLotId;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "REQUEST_VEGLOT")
@IdClass(RequestLotId.class)
@Schema(description = "Represents a partial request veglot object in the database")
public class RequestVeglot {

  @Id
  @Column(name = "REQUEST_SKEY")
  @Schema(description = "The key of a request", example = "16258")
  private Long requestSkey;

  @Id
  @Column(name = "ITEM_ID")
  @Schema(
      description = "The item ID associated with the request",
      example = "A")
  private String itemId;

  @Column(name = "COMMITMENT_IND")
  @Schema(
      description = "The commitment indicator associated with the request",
      example = "Y")
  private String commitmentInd;
}
