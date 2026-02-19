package ca.bc.gov.oracleapi.endpoint.consep;

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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

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
      responseCode = "200",
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
}
