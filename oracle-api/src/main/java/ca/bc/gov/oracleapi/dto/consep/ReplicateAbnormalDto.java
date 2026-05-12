package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * A DTO representing abnormality data for a seed replicate.
 * 
 * This class contains counts of abnormal seeds categorized by the type of abnormality
 * observed during germination testing. Each field represents the number of seeds
 * exhibiting a specific abnormal characteristic.
 * 
 * This is a reusable class for the replicates used in DailyAbnormalResponseDto.
 */
@Schema(description = "This class represents a data object for the replicate abnormality.")
public class ReplicateAbnormalDto {
  @Schema(
      description = "The number of seeds, of the ones germinated, which were "
          + "observed to be abnormal due to a reverse embryo.",
      example = "1")
  Integer AbnormalNumReverseEmbryo;

  @Schema(
      description = "The number of seeds, of the ones germinated, which were "
          + "observed to be abnormal due to a stunted radicle.",
      example = "1")
  Integer AbnormalNumStuntedRadicle;

  @Schema(
      description = "The number of seeds, of the ones germinated, which were "
          + "observed to be abnormal due to a stunted hypocotyl.",
      example = "1")
  Integer AbnormalNumStuntedHypocotyl;

  @Schema(
      description = "The number of seeds, of the ones germinated, which were "
          + "observed to be abnormal due to being rotten.",
      example = "1")
  Integer AbnormalNumRotten;

  @Schema(
      description = "The number of seeds, of the ones germinated, which were "
          + "observed to be abnormal due to a thickened radicle.",
      example = "1")
  Integer AbnormalNumThickenedRadicle;

  @Schema(
      description = "The number of seeds, of the ones germinated, which were "
          + "observed to be abnormal due to being twisted.",
      example = "1")
  Integer AbnormalNumTwisted;

  @Schema(
      description = "The number of seeds, of the ones germinated, which were "
          + "observed to be abnormal due to a megametophyte collar.",
      example = "1")
  Integer AbnormalNumMegametophyteCollar;

  @Schema(
      description = "The number of seeds, of the ones germinated, which were "
          + "observed to be abnormal due to being weak.",
      example = "1")
  Integer AbnormalNumWeak;

  @Schema(
      description = "The number of seeds, of the ones germinated, which were "
          + "observed to be abnormal due to other reasons.",
      example = "1")
  Integer AbnormalNumOther;

  @Schema(
      description = "The number of seeds, of the ones germinated, which were "
          + "observed to be abnormal due to pregermination.",
      example = "1")
  Integer AbnormalNumPregermination;

  @Schema(
      description = "The total number of seeds.",
      example = "100")
  Integer totalSeeds;
}
