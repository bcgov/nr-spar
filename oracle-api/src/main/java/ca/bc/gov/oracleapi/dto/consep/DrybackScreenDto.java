package ca.bc.gov.oracleapi.dto.consep;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/**
 * Response DTO for the G64 Dryback Calculation screen.
 * Contains all required data to populate the screen from a single API call.
 */
@Getter
@Setter
@Schema(
    description = "Data required to populate the G64 Dryback Calculation screen, "
        + "including Request Item Activity (RIA) and current accepted Moisture Content test data"
)
public class DrybackScreenDto {

  @Schema(description = "Primary key of the Request Item Activity", example = "7338")
  private BigDecimal riaSkey;

  @Schema(description = "Request ID", example = "00001234")
  private String requestId;

  @Schema(description = "Item ID within the request", example = "1")
  private String itemId;

  @Schema(description = "Seedlot number", example = "01234")
  private String seedlotNumber;

  @Schema(description = "Family lot number", example = "0123456789012")
  private String familyLotNumber;

  @Schema(description = "Standard activity code", example = "G64")
  private String standardActivityId;

  @Schema(description = "Activity type code", example = "G64")
  private String activityTypeCode;

  @Schema(description = "Actual begin date and time", example = "2025-01-15T08:30:00")
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
  private LocalDateTime actualBeginDateTime;

  @Schema(description = "Actual end date and time", example = "2025-01-15T16:00:00")
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
  private LocalDateTime actualEndDateTime;

  @Schema(description = "Dry weight (StWt400) of the seed sample in grams", example = "400.123")
  private BigDecimal dryWeight;

  @Schema(description = "Prior moisture content percentage", example = "8.5")
  private BigDecimal priorMoist;

  @Schema(description = "Imbibed weight in grams", example = "450.456")
  private BigDecimal imbibedWeight;

  @Schema(description = "Dryback weight in grams", example = "420.789")
  private BigDecimal drybackWeight;

  @Schema(description = "Dryback moisture content percentage (calculated)", example = "5.2")
  private BigDecimal drybackMoist;

  @Schema(description = "Dryback time in minutes", example = "240")
  private Integer drybackTime;

  @Schema(description = "Target 30% moisture content value", example = "0.135")
  private BigDecimal targetThirtyMoist;

  @Schema(description = "Target 35% moisture content value", example = "0.158")
  private BigDecimal targetThirtyFiveMoist;

  @Schema(description = "Stratification end weight in grams", example = "400.000")
  private BigDecimal stratEndWeight;

  @Schema(
      description = "Current accepted Moisture Content (MC) value from the accepted test result, "
          + "or null if no accepted MC test exists for the seedlot",
      example = "8.5"
  )
  private BigDecimal storageMc;

  @Schema(
      description = "Activity comment/notes",
      example = "Sample treated with fungicide"
  )
  private String riaComment;

  @Schema(
      description = "Update timestamp for optimistic locking",
      example = "2025-01-15T16:00:00"
  )
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
  private LocalDateTime updateTimestamp;

  public DrybackScreenDto() {
  }

  /**
   * Constructor for constructor projection in JPQL queries.
   * Maps ActivityEntity and TestResultEntity fields to DrybackScreenDto.
   */
  public DrybackScreenDto(
      BigDecimal riaSkey,
      String requestId,
      String itemId,
      String seedlotNumber,
      String familyLotNumber,
      String standardActivityId,
      String activityTypeCode,
      LocalDateTime actualBeginDateTime,
      LocalDateTime actualEndDateTime,
      BigDecimal dryWeight,
      BigDecimal priorMoist,
      BigDecimal imbibedWeight,
      BigDecimal drybackWeight,
      BigDecimal drybackMoist,
      Integer drybackTime,
      BigDecimal targetThirtyMoist,
      BigDecimal targetThirtyFiveMoist,
      BigDecimal stratEndWeight,
      BigDecimal storageMc,
      String riaComment,
      LocalDateTime updateTimestamp
  ) {
    this.riaSkey = riaSkey;
    this.requestId = requestId;
    this.itemId = itemId;
    this.seedlotNumber = seedlotNumber;
    this.familyLotNumber = familyLotNumber;
    this.standardActivityId = standardActivityId;
    this.activityTypeCode = activityTypeCode;
    this.actualBeginDateTime = actualBeginDateTime;
    this.actualEndDateTime = actualEndDateTime;
    this.dryWeight = dryWeight;
    this.priorMoist = priorMoist;
    this.imbibedWeight = imbibedWeight;
    this.drybackWeight = drybackWeight;
    this.drybackMoist = drybackMoist;
    this.drybackTime = drybackTime;
    this.targetThirtyMoist = targetThirtyMoist;
    this.targetThirtyFiveMoist = targetThirtyFiveMoist;
    this.stratEndWeight = stratEndWeight;
    this.storageMc = storageMc;
    this.riaComment = riaComment;
    this.updateTimestamp = updateTimestamp;
  }
}
