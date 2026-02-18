package ca.bc.gov.oracleapi.endpoint.consep;

import ca.bc.gov.oracleapi.dto.consep.ActivityCreateDto;
import ca.bc.gov.oracleapi.dto.consep.ActivitySearchResponseDto;
import ca.bc.gov.oracleapi.dto.consep.AddGermTestValidationResponseDto;
import ca.bc.gov.oracleapi.dto.consep.StandardActivityDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.response.ApiAuthResponse;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import ca.bc.gov.oracleapi.service.consep.ActivityService;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
  public ActivitySearchResponseDto createActivity(
      @Valid @RequestBody ActivityCreateDto activityCreateDto
  ) {
    return activityService.createActivity(activityCreateDto);
  }

  /**
   * Retrieves standard activity IDs and descriptions for seedlot and/or family lot numbers.
   *
   * @param isFamilyLot a boolean indicating if the request is for getting familylot activities
   * @param isSeedlot a boolean indicating if the request is for getting seedlot activities
   * @return a list of StandardActivityDto
   */
  @GetMapping("/ids")
  @ApiResponse(
      responseCode = "200",
      description = "Successfully retrieved the standard activity IDs and descriptions.",
      content = @Content(schema = @Schema(implementation = StandardActivityDto.class))
  )
  @ApiAuthResponse
  @RoleAccessConfig({ "SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR" })
  public List<StandardActivityDto> getStandardActivityIds(
      @RequestParam(name = "isFamilyLot", defaultValue = "true") boolean isFamilyLot,
      @RequestParam(name = "isSeedlot", defaultValue = "true") boolean isSeedlot
  ) {
    return activityService.getStandardActivityIds(isFamilyLot, isSeedlot);
  }

  /**
   * Validates the given activity type code against the current accepted A-rank germ test
   * for the specified seedlot or family lot.
   *
   * @param activityTypeCd the activity type code to validate
   * @param seedlotNumber the seedlot number to check against (optional if familyLotNumber provided)
   * @param familyLotNumber the family lot number to check against
   *                        (optional if seedlotNumber provided)
   * @return an AddGermTestValidationResponseDto indicating whether the activity type
   *         is a germ test and whether it matches the current A-rank germ test activity type code
   */
  @GetMapping("/validate-add-germ-test")
  @ApiResponse(
      responseCode = "200",
      description = "Successfully validated the germ test activity type.",
      content = @Content(schema = @Schema(implementation = AddGermTestValidationResponseDto.class))
  )
  @ApiAuthResponse
  @RoleAccessConfig({ "SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR" })
  public AddGermTestValidationResponseDto validateAddGermTest(
      @RequestParam String activityTypeCd,
      @RequestParam(required = false) String seedlotNumber,
      @RequestParam(required = false) String familyLotNumber
  ) {
    return activityService.validateAddGermTest(activityTypeCd, seedlotNumber, familyLotNumber);
  }
}
