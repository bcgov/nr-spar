package ca.bc.gov.oracleapi.dto.consep;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;

/** Body of PUT /api/germ-counts/{riaSkey}: daily germ counts, abnormals, and replicate totals. */
@Schema(description = "Insert/update payload for a test's daily germination counts")
public record GermCountUpsertRequestDto(
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "update_timestamp of the germ_count row as read (optimistic lock); required on update")
    LocalDateTime updateTimestamp,

    @Valid
    @Schema(description = "Per-day germination counts and abnormals (1-13 days)")
    List<DayGermCountDto> days,

    @Valid
    @Schema(description = "Replicate totals (1-4)")
    List<TestRepGermFormDto> replicates
) {}
