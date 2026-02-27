package ca.bc.gov.oracleapi.endpoint.consep;

import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayAssignGerminatorIdDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayAssignGerminatorIdResponseDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayCreateDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayCreateResponseDto;
import ca.bc.gov.oracleapi.response.ApiAuthResponse;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import ca.bc.gov.oracleapi.service.consep.TestResultService;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * This class exposes germinator tray resources API.
 */
@RestController
@RequestMapping("/api/germinator-trays")
@RequiredArgsConstructor
@Validated
@Tag(name = "Germinator Trays", description = "Resource to manage germinator trays.")
public class GerminatorTrayEndpoint {
  private final TestResultService testResultService;

  /**
   * Assigns germinator trays for a batch of activities.
   * One tray is created for every 5 activities per activity type.
   * Returns details of each created tray.
   *
   * @param requests the list of activity details to assign trays
   * @return a list of GerminatorTrayCreateResponseDto, one per created tray
   */
  @PostMapping("")
  @ResponseStatus(HttpStatus.OK)
  @ApiResponse(
      responseCode = "201",
      description = "Successfully assigned trays for the provided activities.",
      content = @Content(schema = @Schema(implementation = GerminatorTrayCreateResponseDto.class))
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
   * @param request the request containing the germinator ID to assign
   * @return a response DTO confirming the assignment
   */
  @PatchMapping("/{germinatorTrayId}/germinator-id")
  @ResponseStatus(HttpStatus.OK)
  @ApiResponse(
      responseCode = "200",
      description = "Successfully assigned germinator ID to the tray.",
      content = @Content(schema = @Schema(implementation = GerminatorTrayAssignGerminatorIdResponseDto.class))
  )
  @ApiAuthResponse
  @RoleAccessConfig({ "SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR" })
  public GerminatorTrayAssignGerminatorIdResponseDto assignGerminatorIdToTray(
      @PathVariable Integer germinatorTrayId,
      @Valid @RequestBody GerminatorTrayAssignGerminatorIdDto request
  ) {
    // Validate that the tray ID in the path matches the one in the request body
    if (!germinatorTrayId.equals(request.germinatorTrayId())) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Germinator tray ID in path does not match the ID in request body"
      );
    }    return testResultService.assignGerminatorIdToTray(request);
  }
}
