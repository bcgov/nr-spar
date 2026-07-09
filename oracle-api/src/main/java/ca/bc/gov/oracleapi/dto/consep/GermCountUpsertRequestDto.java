package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;

/** Body of PUT /api/germ-counts/{riaSkey}: daily germ counts, abnormals, and replicate totals. */
@Schema(description = "Insert/update payload for a test's daily germination counts")
public record GermCountUpsertRequestDto(
    @Schema(description = "update_timestamp of the germ_count row as read (optimistic lock); required on update")
    LocalDateTime updateTimestamp,

    @Valid
    @Schema(description = "Per-day germination counts and abnormals (1-13 days)")
    List<DayGermCountDto> days,

    @Valid
    @Schema(description = "Replicate totals (1-4)")
    List<TestRepGermFormDto> replicates
) {}
