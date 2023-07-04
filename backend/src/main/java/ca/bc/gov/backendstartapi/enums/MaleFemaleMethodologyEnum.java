package ca.bc.gov.backendstartapi.enums;

import io.swagger.v3.oas.annotations.media.Schema;

/** This enumeration represents a method code to determine male/female gametic contribution. */
@Schema(
    description =
        "This object represents a method code to determine male/female gametic contribution.")
public enum MaleFemaleMethodologyEnum implements DescribedEnum {
  F1("Visual Estimate", false),
  F2("Measured Cone Volume", false),
  F3("Cone Weight", false),
  F4("Cone Number from Weight", false),
  F5("Cone Number from Standard Volume", false),
  F6("Sample of Seeds", false),
  F7("Filled Seeds", false),
  F8("Ramet Proportion by Clone", true),
  F9("Ramet Proportion by Age and Expected Production", true),
  M1("Portion of Ramets in Orchard", false),
  M2("Pollen Volume Estimate by Partial Survey", false),
  M3("Pollen Volume Estimate by 100% Survey", false),
  M4("Ramet Proportion by Clone", true),
  M5("Ramet Proportion by Age and Expected Production", true);

  private final String description;
  private final Boolean isPLI;

  MaleFemaleMethodologyEnum(String description, Boolean isPLI) {
    this.description = description;
    this.isPLI = isPLI;
  }

  @Override
  public String description() {
    return description;
  }

  public Boolean isPLI() {
    return isPLI;
  }
}
