package ca.bc.gov.oracleapi.endpoint;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.TransferLimitDto;
import ca.bc.gov.oracleapi.repository.TransferLimitRepository;
import ca.bc.gov.oracleapi.security.RoleAccessConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import java.util.List;
import java.util.Locale;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Resources for seed transfer limits (Oracle TRANSFER_LIMIT). */
@RestController
@RequestMapping(path = "/api/transfer-limits", produces = "application/json")
@Validated
@Tag(name = "transferLimits", description = "Seed transfer limits (Oracle TRANSFER_LIMIT).")
public class TransferLimitEndpoint {

  private final TransferLimitRepository transferLimitRepository;

  TransferLimitEndpoint(TransferLimitRepository transferLimitRepository) {
    this.transferLimitRepository = transferLimitRepository;
  }

  /**
   * Searches transfer limits. Every criterion is optional.
   *
   * @return matching transfer limits, possibly empty
   */
  @GetMapping
  @Operation(
      summary = "Search transfer limits",
      description =
          """
          Returns transfer limits matching every criterion given. A null vegetation code, superior
          provenance flag or seed plan zone on a row means the row applies to every value;
          set `includeNullMatches` to also return those rows when filtering on that column.
          Rows with values sort before rows with nulls.""")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Matching transfer limits (may be empty).",
            content =
                @Content(
                    array =
                        @ArraySchema(schema = @Schema(implementation = TransferLimitDto.class)))),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid search criteria",
            content = @Content(schema = @Schema(hidden = true))),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(hidden = true)))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public List<TransferLimitDto> search(
      @RequestParam(name = "vegetationCode", required = false)
          @Parameter(in = ParameterIn.QUERY, description = "Species vegetation code.", example = "FDC")
          String vegetationCode,
      @RequestParam(name = "geneticClassCode", required = false)
          @Parameter(in = ParameterIn.QUERY, description = "Genetic class code.", example = "B")
          @Pattern(regexp = "[AaBb]", message = "must be A or B")
          String geneticClassCode,
      @RequestParam(name = "superiorProvenance", required = false)
          @Parameter(
              in = ParameterIn.QUERY,
              description = "Superior provenance (B+) rows.",
              example = "false")
          Boolean superiorProvenance,
      @RequestParam(name = "coastInteriorCode", required = false)
          @Parameter(
              in = ParameterIn.QUERY,
              description = "Coast (C) or interior (I).",
              example = "C")
          @Pattern(regexp = "[CcIi]", message = "must be C or I")
          String coastInteriorCode,
      @RequestParam(name = "seedPlanZoneCode", required = false)
          @Parameter(in = ParameterIn.QUERY, description = "Seed plan zone code.", example = "M")
          String seedPlanZoneCode,
      @RequestParam(name = "latitudeDeg", required = false)
          @Parameter(
              in = ParameterIn.QUERY,
              description = "Latitude in whole degrees; matches rows whose site band contains it.",
              example = "49")
          @Min(0)
          @Max(90)
          Integer latitudeDeg,
      @RequestParam(name = "includeNullMatches", defaultValue = "false")
          @Parameter(
              in = ParameterIn.QUERY,
              description =
                  "Also match rows whose vegetation code, superior provenance flag or seed"
                      + " plan zone is null when filtering on that column.",
              example = "false")
          boolean includeNullMatches) {
    SparLog.info(
        "Searching transfer limits: vegetationCode {}, geneticClassCode {},"
            + " superiorProvenance {}, coastInteriorCode {}, seedPlanZoneCode {},"
            + " latitudeDeg {}, includeNullMatches {}",
        vegetationCode,
        geneticClassCode,
        superiorProvenance,
        coastInteriorCode,
        seedPlanZoneCode,
        latitudeDeg,
        includeNullMatches);

    List<TransferLimitDto> results =
        transferLimitRepository
            .search(
                upper(vegetationCode),
                upper(geneticClassCode),
                superiorProvenance,
                upper(coastInteriorCode),
                upper(seedPlanZoneCode),
                latitudeDeg,
                includeNullMatches)
            .stream()
            .map(TransferLimitDto::from)
            .toList();
    SparLog.info("{} transfer limits found", results.size());

    return results;
  }

  private static String upper(String value) {
    return value == null || value.isBlank() ? null : value.toUpperCase(Locale.ROOT);
  }
}
