package ca.bc.gov.oracleapi.endpoint.consep;

import ca.bc.gov.oracleapi.dto.consep.ActivitySearchRequestDto;
import ca.bc.gov.oracleapi.dto.consep.ActivitySearchResponseDto;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import ca.bc.gov.oracleapi.service.consep.ActivitySearchService;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.data.web.PageableDefault;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;


import java.util.List;

@RestController
@RequestMapping("/api/testing-activities")
@RequiredArgsConstructor
@Validated
@Tag(name = "TestingActivitySearch", description = "Resource to search testing activities.")
public class ActivitySearchEndpoint {
  private final ActivitySearchService activitySearchService;

  @GetMapping("/search")
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
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public List<ActivitySearchResponseDto> searchActivities(
    @Valid @ModelAttribute ActivitySearchRequestDto filter,
    @ParameterObject @PageableDefault(size = 20) Pageable paginationParameters
  ) {
    return activitySearchService.searchActivities(filter, paginationParameters);
  }
}
