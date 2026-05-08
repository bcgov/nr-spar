package ca.bc.gov.oracleapi.endpoint.consep;

import ca.bc.gov.oracleapi.dto.consep.GerminatorIdAssignResponseDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayContentsDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayCreateDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayCreateResponseDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayDeleteContentDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTraySearchRequestDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTraySearchResponseDto;
import ca.bc.gov.oracleapi.response.ApiAuthResponse;
import ca.bc.gov.oracleapi.response.ValidationExceptionResponse;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import ca.bc.gov.oracleapi.service.consep.GerminatorTrayService;
import ca.bc.gov.oracleapi.service.consep.TestResultService;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** This class exposes germinator tray resources API. */
@RestController
@RequestMapping("/api/germinator-trays")
@RequiredArgsConstructor
@Validated
@Tag(name = "Germinator Trays", description = "Resource to manage germinator trays.")
public class GerminatorTrayEndpoint {
  private final TestResultService testResultService;
  private final GerminatorTrayService germinatorTrayService;

  /**
   * Assigns germinator trays for a batch of activities.
   * One tray is created for every 5 activities per activity type.
   * Returns details of each created tray.
   *
   * @param requests the list of activity details to assign trays
   * @return a list of GerminatorTrayCreateResponseDto, one per created tray
   */
  @PostMapping("")
  @ResponseStatus(HttpStatus.CREATED)
  @ApiResponse(
      responseCode = "201",
      description = "Successfully assigned trays for the provided activities.",
      content = @Content(array = @ArraySchema(schema = @Schema(implementation = GerminatorTrayCreateResponseDto.class)))
  )
  @ApiAuthResponse
  @RoleAccessConfig({ "SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR" })
  public List<GerminatorTrayCreateResponseDto> assignGerminatorTrays(
      @Valid @RequestBody List<@Valid GerminatorTrayCreateDto> requests
  ) {
    return testResultService.assignGerminatorTrays(requests);
  }

  /**
   * Assigns a germinator ID to an existing germinator tray.
   *
   * @param germinatorTrayId the ID of the germinator tray
   * @param germinatorId the germinator ID to assign
   * @return a response DTO confirming the assignment
   */
  @PatchMapping("/{germinatorTrayId}/germinator-id")
  @ResponseStatus(HttpStatus.OK)
  @ApiResponse(
      responseCode = "200",
      description = "Successfully assigned germinator ID to the tray.",
      content =
      @Content(
          schema = @Schema(implementation = GerminatorIdAssignResponseDto.class))
  )
  @ApiAuthResponse
  @RoleAccessConfig({ "SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR" })
  public GerminatorIdAssignResponseDto assignGerminatorIdToTray(
      @PathVariable @Positive Integer germinatorTrayId,
      @RequestParam
      @Pattern(
          regexp = "^$|^\\d$",
          message = "Germinator ID must be a single digit (0-9) or blank"
      )
      String germinatorId
  ) {
    return germinatorTrayService.assignGerminatorIdToTray(
        germinatorTrayId,
        germinatorId
    );
  }

  /**
   * Removes a test from a germinator tray. The test is detached (germinator_tray_id set to null)
   * and the parent activity's update_timestamp is updated. If the tray has no tests left, the tray
   * is deleted. Uses optimistic concurrency; if data was updated by another user, returns 409.
   *
   * @param germinatorTrayId        the tray from which to remove the test
   * @param riaSkey                 the request item activity key (RIA_SKEY) of the test to remove
   * @param activityUpdateTimestamp the current update_timestamp of the parent activity (optimistic lock)
   */
  @DeleteMapping("/{germinatorTrayId}/tests/{riaSkey}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @ApiResponse(responseCode = "204", description = "Test removed from tray (tray deleted if empty).")
  @ApiResponse(responseCode = "409", description = "Data updated by another user; reselect and retry.")
  @ApiAuthResponse
  @RoleAccessConfig({ "SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR" })
  public void deleteTestFromTray(
      @PathVariable Integer germinatorTrayId,
      @PathVariable BigDecimal riaSkey,
      @RequestParam @DateTimeFormat(iso = ISO.DATE_TIME) LocalDateTime activityUpdateTimestamp
  ) {
    germinatorTrayService.deleteTestFromTray(
        germinatorTrayId,
        riaSkey,
        activityUpdateTimestamp
    );
  }

  /**
   * Deletes a germinator tray. All tests on the tray are detached, each parent activity's
   * update_timestamp is updated, then the tray is deleted. Uses optimistic concurrency with the
   * original timestamp for each tray content item; if any DML affects 0 rows, returns 409 and
   * rolls back.
   *
   * @param germinatorTrayId the tray to delete
   * @param contents         the tray contents with the activity timestamps
   */
  @PostMapping("/{germinatorTrayId}/delete")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @ApiResponse(responseCode = "204", description = "Tray deleted.")
  @ApiResponse(responseCode = "404", description = "Tray not found.")
  @ApiResponse(responseCode = "409", description = "Data updated by another user; reselect and retry.")
  @ApiAuthResponse
  @RoleAccessConfig({ "SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR" })
  public void deleteTray(
    @PathVariable Integer germinatorTrayId,
    @Valid @RequestBody List<@Valid GerminatorTrayDeleteContentDto> contents
  ) {
    germinatorTrayService.deleteTray(germinatorTrayId, contents);
  }

  /**
   * Handles {@link ConstraintViolationException} thrown when validation
   * on controller method parameters (e.g. {@code @RequestParam}, {@code @PathVariable})
   * fails, and returns a {@link ValidationExceptionResponse}.
   *
   * Applies only to exceptions raised within {@link GerminatorTrayEndpoint}.
   */
  @ExceptionHandler(ConstraintViolationException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ValidationExceptionResponse handleConstraintViolation(
      ConstraintViolationException ex
  ) {

    List<FieldError> fieldErrors = ex.getConstraintViolations().stream()
        .map(cv -> {
          String path = cv.getPropertyPath().toString();
          String fieldName = path.contains(".")
              ? path.substring(path.lastIndexOf('.') + 1)
              : path;

          return new FieldError(
              cv.getRootBeanClass().getSimpleName(),
              fieldName,
              cv.getMessage()
          );
        })
        .toList();

    return new ValidationExceptionResponse(fieldErrors);
  }

  /**
   * Retrieves the tests associated with a specific germinator tray.
   *
   * @param germinatorTrayId the ID of the germinator tray
   * @return a list of GerminatorTrayContentsDto representing the tests in the tray
   */
  @GetMapping("/{germinatorTrayId}/tests")
  @ResponseStatus(HttpStatus.OK)
  @ApiResponse(
      responseCode = "200",
      description = "Successfully retrieved tests for the germinator tray.",
      content = @Content(array = @ArraySchema(schema = @Schema(implementation = GerminatorTrayContentsDto.class))))
  @ApiAuthResponse
  @RoleAccessConfig({"SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR"})
  public List<GerminatorTrayContentsDto> getTestsByTrayId(@PathVariable @Positive Integer germinatorTrayId) {
    return germinatorTrayService.getTrayContents(germinatorTrayId);
  }

  /** Search germination trays by seedlot/sample and/or request id/item. */
  @PostMapping("/search")
  @ResponseStatus(HttpStatus.OK)
  @ApiResponse(
      responseCode = "200",
      description = "Successfully searched germination trays.",
      content =
        @Content(array = @ArraySchema(schema = @Schema(implementation = GerminatorTraySearchResponseDto.class))))
  @ApiAuthResponse
  @RoleAccessConfig({"SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR"})
  public List<GerminatorTraySearchResponseDto> searchGerminatorTrays(
      @Valid @RequestBody GerminatorTraySearchRequestDto request) {
    return germinatorTrayService.searchGerminatorTrays(request);
  }
}
