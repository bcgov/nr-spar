package ca.bc.gov.oracleapi.search;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.util.List;

/** Request body shared by every {@code POST /api/{resource}/search} endpoint. */
@Schema(description = "Search request: filter, sort and pagination")
public record SearchRequest(
    @Schema(description = "Optional filter; omit to match everything you can access")
        @Valid
        FilterGroup filter,
    @Schema(description = "Optional sort keys; the resource's default sort is used when empty")
        @Size(max = SearchLimits.MAX_SORT_FIELDS)
        List<@Valid SortOrder> sort,
    @Schema(description = "Zero-based page number", defaultValue = "0")
        @Min(0)
        @Max(SearchLimits.MAX_PAGE_NUMBER)
        Integer page,
    @Schema(description = "Page size", defaultValue = "20", maximum = "100")
        @Min(1)
        @Max(SearchLimits.MAX_PAGE_SIZE)
        Integer size,
    @Schema(
            description =
                "Return every match in one response, ignoring page and size (e.g. for exports)."
                    + " Only on searches that allow it, and only up to that search's row limit;"
                    + " larger results are rejected with 400.",
            defaultValue = "false")
        Boolean unpaged) {

  /** Paged request. */
  public SearchRequest(FilterGroup filter, List<SortOrder> sort, Integer page, Integer size) {
    this(filter, sort, page, size, null);
  }

  public int pageOrDefault() {
    return page == null ? 0 : page;
  }

  public int sizeOrDefault() {
    return size == null ? SearchLimits.DEFAULT_PAGE_SIZE : size;
  }

  public boolean isUnpaged() {
    return Boolean.TRUE.equals(unpaged);
  }
}
