package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/**
 * Paginated response wrapper for activity search results.
 * Contains a list of {@link ActivitySearchResponseDto} records along with
 * pagination metadata such as total elements, total pages, current page, and page size.
 */
@Schema(description = "Paginated response for testing activity search API")
public record ActivitySearchPageResponseDto(
    @Schema(description = "List of testing activities")
    List<ActivitySearchResponseDto> content,

    @Schema(description = "Total number of records matching the filter")
    long totalElements,

    @Schema(description = "Total number of pages")
    int totalPages,

    @Schema(description = "Current page number (0-based index)")
    int pageNumber,

    @Schema(description = "Size of the page")
    int pageSize,

    @Schema(description = "Lot numbers that were requested but not found")
    List<String> missingLotNumbers
) {
}
