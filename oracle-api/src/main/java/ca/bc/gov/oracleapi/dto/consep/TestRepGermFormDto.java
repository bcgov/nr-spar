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

    // The final ungerminated / pre-germinated columns belong to the final-counts screen, not to
    // daily germ counts. They are deliberately absent here: TestRepGermFormMapper leaves unmapped
    // entity columns alone, so a germ-count save can no longer echo back a stale copy the client
    // happened to read earlier and overwrite a newer value (the replicate row has no optimistic
    // lock of its own).
    @Schema(description = "Indicator if the replicate is accepted", example = "1") Integer repAcceptedInd,
    @Schema(description = "Tolerance override reason") String tolrncOvrrdeDesc
) {}
