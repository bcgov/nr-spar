package ca.bc.gov.oracleapi.endpoint.consep;

import ca.bc.gov.oracleapi.dto.consep.TestRepGermDto;
import ca.bc.gov.oracleapi.response.ValidationExceptionResponse;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import ca.bc.gov.oracleapi.service.consep.TestRepGermService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** This class exposes germination test replicate resources API. */
@RestController
@RequestMapping("/api/test-replicates")
@Validated
@Tag(
    name = "TestReplicates",
    description = "Resource to retrieve germination test replicate data.")
public class TestRepGermEndpoint {

  private final TestRepGermService testRepGermService;

  TestRepGermEndpoint(TestRepGermService testRepGermService) {
    this.testRepGermService = testRepGermService;
  }

  /**
   * Retrieve all germination test replicates for a given riaKey,
   * ordered by replicate number.
   *
   * @param riaKey An id for the tables in this request.
   * @return A list of {@link TestRepGermDto}.
   */
  @GetMapping("/{riaKey}")
  @Operation(
      summary = "Get test replicates given a riaKey",
      description = "Retrieve test replicates that are under a riaKey, "
          + "ordered by test_replicate_no.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = """
          Successfully returned test replicates under a riaKey, an empty
          list is returned if nothing is found.
      """),
      @ApiResponse(
          responseCode = "400",
          description = "Invalid input: riaKey must be a positive number",
          content = @Content(schema = @Schema(hidden = true))),
      @ApiResponse(
          responseCode = "401",
          description = "Access token is missing or invalid",
          content =
              @Content(
                  schema = @Schema(implementation = Void.class))),
      @ApiResponse(
          responseCode = "403",
          description = "User does not have the required role",
          content =
              @Content(
                  schema = @Schema(implementation = Void.class)))
  })
  @RoleAccessConfig({"SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR"})
  public List<TestRepGermDto> getTestReplicates(
      @PathVariable
      @Positive(message = "riaKey must be a positive number")
      @Parameter(
          name = "riaKey",
          in = ParameterIn.PATH,
          description = "The ria key.",
          required = true)
      BigDecimal riaKey) {
    return testRepGermService.getTestReplicates(riaKey);
  }

  /**
   * Handles {@link ConstraintViolationException} thrown when validation
   * on controller method parameters (e.g. {@code @PathVariable}) fails,
   * and returns a {@link ValidationExceptionResponse}.
   *
   * Applies only to exceptions raised within {@link TestRepGermEndpoint}.
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
}
