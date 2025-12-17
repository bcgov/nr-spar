package ca.bc.gov.oracleapi.endpoint.consep;

import static ca.bc.gov.oracleapi.ConsepOracleQueryConstants.ALLOWED_SORT_FIELDS;

import ca.bc.gov.oracleapi.dto.consep.ActivitySearchPageResponseDto;
import ca.bc.gov.oracleapi.dto.consep.ActivitySearchRequestDto;
import ca.bc.gov.oracleapi.dto.consep.TestCodeDto;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import ca.bc.gov.oracleapi.service.consep.ActivitySearchService;
import ca.bc.gov.oracleapi.service.consep.TestCodeService;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * This class exposes testing search resources API.
 */
@RestController
@RequestMapping("/api/testing-activities")
@RequiredArgsConstructor
@Validated
@Tag(name = "TestingActivitySearch", description = "Resource to search testing activities.")
public class ActivitySearchEndpoint {
  private final ActivitySearchService activitySearchService;
  private final TestCodeService testCodeService;

  /**
   * Retrieve testing activities based on search criteria, pagination, and sorting options.
   *
   * @param filter The search criteria used to filter testing activities.
   * @param unpaged Whether to return all results without pagination.
   * @param sortBy The field name used to sort the results.
   * @param sortDirection The direction of sorting, either ascending or descending.
   * @param paginationParameters Pagination information including page number and size.
   * @return An {@link ActivitySearchPageResponseDto} containing the matching testing activities.
   */
  @PostMapping("/search")
  @ApiResponses(value = {
      @ApiResponse(
          responseCode = "200",
          description = """
                  Successfully found the testing activity data.
              """),
      @ApiResponse(
          responseCode = "401",
          description = "Access token is missing or invalid",
          content =
          @Content(
              schema = @Schema(implementation = Void.class))),
      @ApiResponse(
          responseCode = "404",
          content =
          @Content(
              schema = @Schema(hidden = true)))
  })
  @RoleAccessConfig({ "SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR" })
  public ActivitySearchPageResponseDto searchTestingActivities(
      @Valid @RequestBody ActivitySearchRequestDto filter,
      @RequestParam(defaultValue = "false") boolean unpaged,
      @RequestParam(required = false) String sortBy,
      @RequestParam(defaultValue = "asc") 
      @Pattern(regexp = "^(asc|desc)$", flags = Pattern.Flag.CASE_INSENSITIVE, 
         message = "sortDirection must be either 'asc' or 'desc'")
      String sortDirection,
      @ParameterObject @PageableDefault(size = 20) Pageable paginationParameters
  ) {
    if (sortBy != null && !sortBy.isBlank() && !ALLOWED_SORT_FIELDS.contains(sortBy)) {
      throw new ResponseStatusException(
        HttpStatus.BAD_REQUEST,
        "Invalid sort field: " + sortBy);
    }
    if (unpaged) {
      paginationParameters = Pageable.unpaged();
    }
    return activitySearchService.searchTestingActivities(
      filter, 
      paginationParameters,
      sortBy,
      sortDirection
    );
  }

  /**
   * Retrieve all valid test activity type codes.
   *
   * @return A list of {@link TestCodeDto} representing test activity type codes.
   */
  @GetMapping("/type-codes")
  @ApiResponses(value = {
    @ApiResponse(
      responseCode = "200",
      description = "Successfully retrieved all valid test activity type codes."
    ),
    @ApiResponse(
      responseCode = "401",
      description = "Access token is missing or invalid",
      content = @Content(schema = @Schema(implementation = Void.class))
    )
  })
  @RoleAccessConfig({ "SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR" })
  public List<TestCodeDto> getTestTypeCodes() {
    return testCodeService.getTestTypeCodes();
  }

  /**
   * Retrieve all valid test category codes.
   *
   * @return A list of {@link TestCodeDto} representing test category codes.
   */
  @GetMapping("/category-codes")
  @ApiResponses(value = {
    @ApiResponse(
      responseCode = "200",
      description = "Successfully retrieved all valid test category codes."
    ),
    @ApiResponse(
      responseCode = "401",
      description = "Access token is missing or invalid",
      content = @Content(schema = @Schema(implementation = Void.class))
    )
  })
  @RoleAccessConfig({ "SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR" })
  public List<TestCodeDto> getTestCategoryCodes() {
    return testCodeService.getTestCategoryCodes();
  }

  /**
   * Retrieve all valid request type codes used for testing activities.
   *
   * @return A list of {@link TestCodeDto} representing request type codes.
   */
  @GetMapping("/request-types")
  @ApiResponses(value = {
      @ApiResponse(
          responseCode = "200",
          description = "Successfully retrieved all valid request types."
      ),
      @ApiResponse(
          responseCode = "401",
          description = "Access token is missing or invalid",
          content = @Content(schema = @Schema(implementation = Void.class))
      )
  })
  @RoleAccessConfig({ "SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR" })
  public List<TestCodeDto> getRequestTypes() {
    return testCodeService.getRequestTypes();
  }
}
