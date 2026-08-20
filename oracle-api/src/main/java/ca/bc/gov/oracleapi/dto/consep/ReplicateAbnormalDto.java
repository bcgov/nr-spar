package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * A DTO representing abnormality data for a seed replicate.
 *
 * <p>This class contains counts of abnormal seeds categorized by the type of abnormality observed
 * during germination testing. Each field represents the number of seeds exhibiting a specific
 * abnormal characteristic.
 *
 * <p>This is a reusable class for the replicates used in DailyAbnormalResponseDto.
 */
@Schema(description = "This class represents a data object for the replicate abnormality.")
public record ReplicateAbnormalDto(
    @Schema(
            description =
                "The number of seeds, of the ones germinated, which were "
                    + "observed to be abnormal due to a reverse embryo.",
            example = "1")
        @Min(value = 0, message = "abnormal count must be between 0 and 999")
        @Max(value = 999, message = "abnormal count must be between 0 and 999")
        Integer abnormalNumReverseEmbryo,
    @Schema(
            description =
                "The number of seeds, of the ones germinated, which were "
                    + "observed to be abnormal due to a stunted radicle.",
            example = "1")
        @Min(value = 0, message = "abnormal count must be between 0 and 999")
        @Max(value = 999, message = "abnormal count must be between 0 and 999")
        Integer abnormalNumStuntedRadicle,
    @Schema(
            description =
                "The number of seeds, of the ones germinated, which were "
                    + "observed to be abnormal due to a stunted hypocotyl.",
            example = "1")
        @Min(value = 0, message = "abnormal count must be between 0 and 999")
        @Max(value = 999, message = "abnormal count must be between 0 and 999")
        Integer abnormalNumStuntedHypocotyl,
    @Schema(
            description =
                "The number of seeds, of the ones germinated, which were "
                    + "observed to be abnormal due to being rotten.",
            example = "1")
        @Min(value = 0, message = "abnormal count must be between 0 and 999")
        @Max(value = 999, message = "abnormal count must be between 0 and 999")
        Integer abnormalNumRotten,

    @Schema(
            description =
                "The number of seeds, of the ones germinated, "
                    + "which were observed to be abnormal due to a thickened hypocotyl.",
            example = "1")
        @Min(value = 0, message = "abnormal count must be between 0 and 999")
        @Max(value = 999, message = "abnormal count must be between 0 and 999")
        Integer abnormalNumThickenedHypocotyl,

    @Schema(
            description =
                "The number of seeds, of the ones germinated, which were "
                    + "observed to be abnormal due to a thickened radicle.",
            example = "1")
        @Min(value = 0, message = "abnormal count must be between 0 and 999")
        @Max(value = 999, message = "abnormal count must be between 0 and 999")
        Integer abnormalNumThickenedRadicle,
    @Schema(
            description =
                "The number of seeds, of the ones germinated, which were "
                    + "observed to be abnormal due to being twisted.",
            example = "1")
        @Min(value = 0, message = "abnormal count must be between 0 and 999")
        @Max(value = 999, message = "abnormal count must be between 0 and 999")
        Integer abnormalNumTwisted,
    @Schema(
            description =
                "The number of seeds, of the ones germinated, which were "
                    + "observed to be abnormal due to a megametophyte collar.",
            example = "1")
        @Min(value = 0, message = "abnormal count must be between 0 and 999")
        @Max(value = 999, message = "abnormal count must be between 0 and 999")
        Integer abnormalNumMegametophyteCollar,
    @Schema(
            description =
                "The number of seeds, of the ones germinated, which were "
                    + "observed to be abnormal due to being weak.",
            example = "1")
        @Min(value = 0, message = "abnormal count must be between 0 and 999")
        @Max(value = 999, message = "abnormal count must be between 0 and 999")
        Integer abnormalNumWeak,
    @Schema(
            description =
                "The number of seeds, of the ones germinated, which were "
                    + "observed to be abnormal due to other reasons.",
            example = "1")
        @Min(value = 0, message = "abnormal count must be between 0 and 999")
        @Max(value = 999, message = "abnormal count must be between 0 and 999")
        Integer abnormalNumOther,
    @Schema(
            description =
                "The number of seeds, of the ones germinated, which were "
                    + "observed to be abnormal due to pregermination.",
            example = "1")
        @Min(value = 0, message = "abnormal count must be between 0 and 999")
        @Max(value = 999, message = "abnormal count must be between 0 and 999")
        Integer abnormalNumPregermination,
    @Schema(description = "The total number of seeds.", example = "100") Integer totalSeeds) {}
