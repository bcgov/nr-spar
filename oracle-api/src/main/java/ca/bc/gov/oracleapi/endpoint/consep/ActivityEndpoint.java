package ca.bc.gov.oracleapi.endpoint.consep;

import ca.bc.gov.oracleapi.dto.consep.ActivityCreateDto;
import ca.bc.gov.oracleapi.dto.consep.ActivityRequestItemDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.response.ApiAuthResponse;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import ca.bc.gov.oracleapi.service.consep.ActivityService;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
  @ApiResponse(
      responseCode = "201",
      description = "Successfully created the activity.",
      content = @Content(schema = @Schema(implementation = ActivityEntity.class))
  )
  @ApiAuthResponse
  @RoleAccessConfig({ "SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR" })
  public ActivityEntity createActivity(
      @Valid @RequestBody ActivityCreateDto activityCreateDto
  ) {
    return activityService.createActivity(activityCreateDto);
  }

  /**
   * Retrieves activities for the given request skey and item id.
   *
   * @param requestSkey the request skey to filter activities
   * @param itemId the item id to filter activities
   * @return a list of ActivityRequestItemDto containing the activity key and description
   */
  @GetMapping("/request/{requestSkey}/item/{itemId}/activities")
  @ApiResponse(
      responseCode = "200",
      description = "Successfully retrieved the activities by requestSkey and itemId."
  )
  @ApiAuthResponse
  @RoleAccessConfig({ "SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR" })
  public List<ActivityRequestItemDto> getActivityByRequestSkeyAndItemId(
      @PathVariable BigDecimal requestSkey,
      @PathVariable String itemId
  ) {
    return activityService.getActivityByRequestSkeyAndItemId(requestSkey, itemId);
  }
}
