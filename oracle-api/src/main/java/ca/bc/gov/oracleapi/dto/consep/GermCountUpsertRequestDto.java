package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

/** Body of PUT /api/germ-counts/{riaSkey}: daily germ counts, abnormals, and replicate totals. */
@Schema(description = "Insert/update payload for a test's daily germination counts")
public record GermCountUpsertRequestDto(
    @Schema(description = "update_timestamp of the germ_count row as read (optimistic lock); required on update")
    LocalDateTime updateTimestamp,

    @Valid
    @NotNull(message = "days is required")
    @Size(max = 13, message = "at most 13 days are allowed")
    // Empty is allowed and meaningful: this is a full replacement, so an empty list clears every
    // slot. Rejecting it left the client unable to persist the removal of its last count date.
    @Schema(description = "Per-day germination counts and abnormals (0-13 days)")
    List<DayGermCountDto> days,

    @Valid
    @NotEmpty(message = "at least one replicate is required")
    @Size(max = 4, message = "at most 4 replicates are allowed")
    @Schema(description = "Replicate totals (1-4)")
    List<TestRepGermFormDto> replicates
) {}
