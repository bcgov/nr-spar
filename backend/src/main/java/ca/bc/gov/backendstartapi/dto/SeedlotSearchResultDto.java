package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** One row of a seedlot search result; built by {@code SeedlotSearchMapper}. */
@Schema(description = "A seedlot search result row")
public record SeedlotSearchResultDto(
    @Schema(example = "63022") String seedlotNumber,
    @Schema(example = "PND") String statusCode,
    @Schema(example = "Pending") String statusDescription,
    @Schema(example = "A") String geneticClassCode,
    @Schema(example = "FDI") String species,
    @Schema(example = "00012797") String applicantClientNumber,
    @Schema(example = "01") String applicantLocationCode,
    Boolean intendedForCrownLand,
    LocalDate collectionStartDate,
    String declaredUserId,
    LocalDateTime declaredAt,
    LocalDateTime approvedAt,
    LocalDateTime createdAt,
    LocalDateTime updatedAt) {}
