package ca.bc.gov.oracleapi.endpoint.consep;

import ca.bc.gov.oracleapi.dto.consep.ActivityCreateDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import ca.bc.gov.oracleapi.service.consep.ActivityService;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * This class exposes activities resources API.
 */
@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
@Validated
@Tag(name = "Activities", description = "Resource to manage activities.")
public class ActivityEndpoint {
  private final ActivityService activityService;

  /**
   * Creates a new testing activity.
   *
   * @param activityCreateDto the DTO with details for the new activity.
   * @return the created ActivityEntity.
   */
  @PostMapping("")
  @ResponseStatus(HttpStatus.CREATED)
  @ApiResponses(value = {
      @ApiResponse(
          responseCode = "201",
          description = "Successfully created the activity.",
          content = @Content(schema = @Schema(implementation = ActivityEntity.class))),
      @ApiResponse(
          responseCode = "400",
          description = "Validation error or request data is invalid.",
          content = @Content(schema = @Schema(hidden = true))),
      @ApiResponse(
          responseCode = "401",
          description = "Access token is missing.",
          content = @Content(schema = @Schema(hidden = true)))
  })
  @RoleAccessConfig({ "SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR" })
  public ActivityEntity createTestingActivity(
      @Valid @RequestBody ActivityCreateDto activityCreateDto
  ) {
    return activityService.createActivity(activityCreateDto);
  }
}
