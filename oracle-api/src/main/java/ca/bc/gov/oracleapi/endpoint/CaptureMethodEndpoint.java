package ca.bc.gov.oracleapi.endpoint;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.CodeDescriptionDto;
import ca.bc.gov.oracleapi.repository.CaptureMethodRepository;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** This class exposes capture method code table resources API. */
@RestController
@RequestMapping("/api/capture-methods")
@Tag(name = "captureMethods", description = "Resource to retrieve Capture Method codes")
public class CaptureMethodEndpoint {

  private final CaptureMethodRepository captureMethodRepository;

  CaptureMethodEndpoint(CaptureMethodRepository captureMethodRepository) {
    this.captureMethodRepository = captureMethodRepository;
  }

  /**
   * Retrieve all valid capture methods.
   *
   * @return A list of {@link CodeDescriptionDto} with all found result.
   */
  @GetMapping(produces = "application/json")
  @Operation(
      summary = "Retrieve non-expired capture methods",
      description =
          "Retrieve all valid (non expired) capture methods based on effectiveDate "
              + "and expiryDate, where 'today >= effectiveDate' and 'today < expiryDate'.")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Returns a list containing all valid (non expired) capture methods",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = CodeDescriptionDto.class))),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema()))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public List<CodeDescriptionDto> getAllValidCaptureMethods() {
    SparLog.info("Fetching all valid capture methods");

    List<CodeDescriptionDto> resultList = captureMethodRepository.findAllValid();
    SparLog.info("{} valid capture methods found.", resultList.size());

    return resultList;
  }
}
