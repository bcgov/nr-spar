package ca.bc.gov.backendstartapi.enums;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * This enumeration represents a ForestClient
 * location code expired/trusted status.
 */
@Schema(description = "This object represents a ForestClient\n" //
    + " * location code expired/trusted status.")
public enum ForestClientExpiredEnum implements DescribedEnum {
  Y("Yes"),
  N("No");

  @Schema(description = "Description of the status", example = "Yes")
  private final String description;

  ForestClientExpiredEnum(String description) {
    this.description = description;
  }

  @Override
  public String description() {
    return description;
  }
}
