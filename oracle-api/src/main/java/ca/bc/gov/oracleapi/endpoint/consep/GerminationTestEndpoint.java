package ca.bc.gov.oracleapi.endpoint.consep;

import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import ca.bc.gov.oracleapi.dto.consep.DailyAbnormalResponseDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayContentsDto;
import ca.bc.gov.oracleapi.response.ApiAuthResponse;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import ca.bc.gov.oracleapi.service.consep.TestResultService;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/germinator-tests")
@RequiredArgsConstructor
@Validated
@Tag(name = "Germination Test", description = "Resource to manage germination tests.")
public class GerminationTestEndpoint {
  private final TestResultService testResultService;
  
  @GetMapping("/daily-abnormals/{dailyGermSkey}")
  @ResponseStatus(HttpStatus.OK)
  @ApiResponse(
      responseCode = "200",
      description = "Daily abnormal germination counts for the specified daily germ record.",
      content = @Content(array = @ArraySchema(schema = @Schema(implementation = DailyAbnormalResponseDto.class))))
  @ApiAuthResponse
  @RoleAccessConfig({"SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR"})
  public DailyAbnormalResponseDto getDailyAbnormalCounts(@PathVariable @Positive BigDecimal dailyGermSkey) {
    return testResultService.getDailyAbnormalCounts(dailyGermSkey);
  }
}
