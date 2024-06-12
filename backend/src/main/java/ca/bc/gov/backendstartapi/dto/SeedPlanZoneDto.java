package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** This class represents a JSON response when requesting SPZ information from a SPU. */
@Getter
@Setter
@NoArgsConstructor
@Schema(description = "represents a JSON response when requesting SPZ information from a SPU.")
public class SeedPlanZoneDto extends CodeDescriptionDto {

  @Schema(
      description = "Determines whether this spz is primary, only one can be true for a seedlot",
      example = "true")
  private boolean isPrimary;

  public SeedPlanZoneDto(String code, String description, Boolean isPrimary) {
    super(code, description);
    this.isPrimary = isPrimary;
  }
}
