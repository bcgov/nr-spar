package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

/**
 * This class represents a germination test replicate from
 * {@link ca.bc.gov.oracleapi.entity.consep.TestRepGermEntity}.
 */
@Schema(description = "This class represents a germination test replicate.")
public record TestRepGermDto(
    @Schema(description = "RIA Key to identify the replicate data", example = "123")
    BigDecimal riaKey,

    @Schema(description = "Number identifying the replicate", example = "1")
    Integer replicateNumber,

    @Schema(description = "Total number of seeds in the replicate", example = "100")
    Integer totalNoSeeds,

    @Schema(description = "Final ungerminated normal seed count")
    Integer finalUngrmNormal,

    @Schema(description = "Final ungerminated shrivelled seed count")
    Integer finalUngrmShrvl,

    @Schema(description = "Final ungerminated empty seed count")
    Integer finalUngrmEmpty,

    @Schema(description = "Final ungerminated insect-damaged seed count")
    Integer finalUngrmInsct,

    @Schema(description = "Final ungerminated mechanically damaged seed count")
    Integer finalUngrmDamagd,

    @Schema(description = "Final ungerminated rotten seed count")
    Integer finalUngrmRotten,

    @Schema(description = "Final pre-germinated seed count")
    Integer finalPregerm,

    @Schema(description = "Indicator if the replicate is accepted", example = "1")
    Integer repAcceptedInd,

    @Schema(description = "Tolerance override reason", example = "ok")
    String tolrncOvrrdeDesc
) {}
