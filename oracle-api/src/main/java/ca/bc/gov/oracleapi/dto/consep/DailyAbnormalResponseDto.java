package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

/**
 * A DTO containing daily abnormal germination counts for one daily germ record.
 * 
 * <p>Includes the daily germ surrogate key and abnormal-count data grouped by
 * replicate (rep1 to rep4) using {@link ReplicateAbnormalDto}.
 * 
 * <p>This DTO is a response shape only. Business validation (for example:
 * non-negative counts and per-replicate total-seed checks) is handled in the
 * service layer.
*/
@Schema(description = "Daily abnormal response")
public record DailyAbnormalResponseDto(
    @NotNull
    @Schema(description = "A surrogate access key for DAILY_GERM table.", example = "12345")
    Long dailyGermSkey,

    ReplicateAbnormalDto rep1,

    ReplicateAbnormalDto rep2,

    ReplicateAbnormalDto rep3,

    ReplicateAbnormalDto rep4
) {}
