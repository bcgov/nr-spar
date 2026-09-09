package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Schema(description = "Abnormal germination counts for one daily germ record")
public record DailyAbnormalUpsertRequestDto(
    @Schema(
        description = "update_timestamp of the parent germ_count row as read (optimistic lock)")
    @NotNull LocalDateTime updateTimestamp,
    @NotNull @Valid ReplicateAbnormalDto rep1,
    @NotNull @Valid ReplicateAbnormalDto rep2,
    @NotNull @Valid ReplicateAbnormalDto rep3,
    @NotNull @Valid ReplicateAbnormalDto rep4) {}
