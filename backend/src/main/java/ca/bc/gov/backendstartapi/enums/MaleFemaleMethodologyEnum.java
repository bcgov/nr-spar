package ca.bc.gov.backendstartapi.enums;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.ToString;

/** This enumeration represents a method code to determine male/female gametic contribution. */
@Getter
@ToString
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
@Schema(
    description =
        "This object represents a method code to determine male/female gametic contribution.")
public enum MaleFemaleMethodologyEnum {
  F1("F1", "Visual Estimate", false),
  F2("F2", "Measured Cone Volume", false),
  F3("F3", "Cone Weight", false),
  F4("F4", "Cone Number from Weight", false),
  F5("F5", "Cone Number from Standard Volume", false),
  F6("F6", "Sample of Seeds", false),
  F7("F7", "Filled Seeds", false),
  F8("F8", "Ramet Proportion by Clone", true),
  F9("F9", "Ramet Proportion by Age and Expected Production", true),
  M1("M1", "Portion of Ramets in Orchard", false),
  M2("M2", "Pollen Volume Estimate by Partial Survey", false),
  M3("M3", "Pollen Volume Estimate by 100% Survey", false),
  M4("M4", "Ramet Proportion by Clone", true),
  M5("M5", "Ramet Proportion by Age and Expected Production", true);

  private final String code;
  private final String description;
  private final Boolean isPLI;

  MaleFemaleMethodologyEnum(String code, String description, Boolean isPLI) {
    this.code = code;
    this.description = description;
    this.isPLI = isPLI;
  }
}
