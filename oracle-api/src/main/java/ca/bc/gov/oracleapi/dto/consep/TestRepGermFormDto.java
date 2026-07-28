package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** One replicate's totals in an upsert request for CNS_T_TEST_REP_GERM. */
@Schema(description = "Replicate totals submitted when saving daily germ counts")
public record TestRepGermFormDto(
    @NotNull
    @Min(value = 1, message = "replicateNumber must be between 1 and 4")
    @Max(value = 4, message = "replicateNumber must be between 1 and 4")
    @Schema(description = "Replicate number (1-4)", example = "1")
    Integer replicateNumber,

    @NotNull
    @Schema(description = "Total number of seeds in the replicate", example = "100")
    Integer totalNoSeeds,

    @Schema(description = "Final ungerminated normal seed count") Integer finalUngrmNormal,
    @Schema(description = "Final ungerminated shrivelled seed count") Integer finalUngrmShrvl,
    @Schema(description = "Final ungerminated empty seed count") Integer finalUngrmEmpty,
    @Schema(description = "Final ungerminated insect-damaged seed count") Integer finalUngrmInsct,
    @Schema(description = "Final ungerminated mechanically damaged seed count") Integer finalUngrmDamagd,
    @Schema(description = "Final ungerminated rotten seed count") Integer finalUngrmRotten,
    @Schema(description = "Final pre-germinated seed count") Integer finalPregerm,
    @Schema(description = "Indicator if the replicate is accepted", example = "1") Integer repAcceptedInd,
    @Schema(description = "Tolerance override reason") String tolrncOvrrdeDesc
) {}
