package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Daily germination count data for one test (ria_skey), with per-day observations in a list. */
public record GermCountDto(

    @Schema(description = "Request item activity key", example = "12345")
    BigDecimal riaSkey,

    @Schema(description = "Daily germination count observations, one entry per populated slot (up to 13)")
    List<GermCountSlotDto> slots,

    @Schema(description = "User ID that created the record")
    String entryUserid,

    @Schema(description = "Timestamp when the record was created")
    LocalDateTime entryTimestamp,

    @Schema(description = "User ID that last updated the record")
    String updateUserid,

    @Schema(description = "Timestamp of the last update")
    LocalDateTime updateTimestamp

) {}
