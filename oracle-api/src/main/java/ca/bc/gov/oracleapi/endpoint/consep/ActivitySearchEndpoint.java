package ca.bc.gov.oracleapi.endpoint.consep;

import ca.bc.gov.oracleapi.dto.consep.ActivitySearchResponseDto;
import ca.bc.gov.oracleapi.search.PageResponse;
import ca.bc.gov.oracleapi.search.SearchLimits;
import ca.bc.gov.oracleapi.search.SearchRequest;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import ca.bc.gov.oracleapi.service.consep.ActivitySearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ProblemDetail;
import org.springframework.util.MimeTypeUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Standard paginated search over CONSEP testing activities. */
@RestController
@RequestMapping(path = "/api/testing-activities", produces = MimeTypeUtils.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Validated
@Tag(name = "TestingActivitySearch", description = "Resource to search testing activities.")
public class ActivitySearchEndpoint {

  private final ActivitySearchService activitySearchService;

  /**
   * Searches testing activities.
   *
   * @param request filter, sort and paging
   * @return one page of results
   */
  @PostMapping(path = "/search", consumes = MimeTypeUtils.APPLICATION_JSON_VALUE)
  @Operation(
      summary = "Search testing activities",
      description =
          """
          Standard search over the CNS17 view. Field names match the response attributes, e.g.
          seedlotDisplay, activityTypeCd, activityId, species, reqId, itemId, requestSkey,
          germTestInd, assignedTrayInd, testCompleteInd, acceptResultInd, geneticClassCode,
          seedWithdrawalDate, actualBeginDtTm, actualEndDtTm, revisedStartDt, revisedEndDt.
          Page size defaults to 20 (max 100); default sort is seedlotSample, actualBeginDtTm.
          """,
      responses = {
        @ApiResponse(responseCode = "200", description = "A page of matching testing activities"),
        @ApiResponse(
            responseCode = "400",
            description = "Unknown field, disallowed operator or invalid value",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  @RoleAccessConfig({"SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR"})
  public PageResponse<ActivitySearchResponseDto> search(@Valid @RequestBody SearchRequest request) {
    return activitySearchService.search(request);
  }

  /**
   * Returns which of the given lot numbers have no testing activities.
   *
   * @param lotNumbers lot numbers to check
   * @return the lot numbers that were not found, upper-cased
   */
  @PostMapping(path = "/missing-lot-numbers", consumes = MimeTypeUtils.APPLICATION_JSON_VALUE)
  @Operation(
      summary = "Find lot numbers without testing activities",
      description = "Used to warn users about lot numbers that matched nothing.")
  @RoleAccessConfig({"SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR"})
  public List<String> findMissingLotNumbers(
      @RequestBody
          @NotNull
          @Size(max = SearchLimits.MAX_IN_VALUES)
          List<String> lotNumbers) {
    return activitySearchService.findMissingLotNumbers(lotNumbers);
  }
}
