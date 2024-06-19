package ca.bc.gov.backendstartapi.dto.oracle;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** This class represents a JSON response when requesting SPU information with a SPU ID. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "A dto object that contains info of a seed plan unit and related data.")
public class SpuDto {

  @Schema(description = "The ID", example = "57")
  private Integer seedPlanUnitId;

  @Schema(description = "Primary indicator, usage in Spar 2 unclear", example = "true")
  private boolean primaryInd;

  @Schema(description = "Seed Plan Zone Id", example = "346")
  private Integer seedPlanZoneId;

  @Schema(description = "Elevation Band", example = "LOW")
  private String elevationBand;

  @Schema(description = "Maximum Elevation", example = "300")
  private Integer elevationMax;

  @Schema(description = "Minimum Elevation", example = "3")
  private Integer elevationMin;

  @Schema(description = "Creation Date", example = "2005-03-22 00:00:00.000")
  private LocalDate createDate;

  @Schema(description = "Latitude Band", example = "SOUTH")
  private String latitudeBand;

  @Schema(description = "Minimum Latitude Degrees", example = "32")
  private Integer latitudeDegreesMin;

  @Schema(description = "Minimum Latitude Minutes", example = "2")
  private Integer latitudeMinutesMin;

  @Schema(description = "Maximum Latitude Degrees", example = "42")
  private Integer latitudeDegreesMax;

  @Schema(description = "Maximum Latitude Minutes", example = "23")
  private Integer latitudeMinutesMax;

  @Schema(description = "The Seed Plan Zone code", example = "M")
  private String seedPlanZoneCode;
}
