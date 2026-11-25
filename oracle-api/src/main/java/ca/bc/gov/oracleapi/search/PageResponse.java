package ca.bc.gov.oracleapi.search;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import org.springframework.data.domain.Page;

/**
 * Response envelope shared by every paginated endpoint. Same shape as Spring Data's {@code
 * PagedModel}, but owned by us so the JSON contract stays stable.
 *
 * @param <T> item type
 */
@Schema(description = "A page of results with paging metadata")
public record PageResponse<T>(List<T> content, PageMeta page) {

  /** Paging metadata. */
  @Schema(description = "Paging metadata")
  public record PageMeta(
      @Schema(description = "Zero-based page number") int number,
      @Schema(description = "Requested page size") int size,
      @Schema(description = "Total matching records") long totalElements,
      @Schema(description = "Total pages") int totalPages) {}

  /** Builds a response from a Spring Data page. */
  public static <T> PageResponse<T> from(Page<T> page) {
    return new PageResponse<>(
        page.getContent(),
        new PageMeta(
            page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages()));
  }
}
