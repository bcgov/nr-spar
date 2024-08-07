package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** This class represents a response body when a genetic worth entity is requested */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GeneticWorthDto extends CodeDescriptionDto {
  @Schema(description = "The default breeding value", example = "0.0")
  private BigDecimal defaultBv;

  public GeneticWorthDto(String code, String description, BigDecimal defaultBv) {
    super(code, description);
    this.defaultBv = defaultBv;
  }
}
