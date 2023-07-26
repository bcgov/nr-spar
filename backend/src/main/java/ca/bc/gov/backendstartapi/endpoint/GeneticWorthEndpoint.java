package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.GeneticWorthSummaryDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsRequestDto;
import ca.bc.gov.backendstartapi.enums.GeneticWorthEnum;
import ca.bc.gov.backendstartapi.response.DefaultSpringExceptionResponse;
import ca.bc.gov.backendstartapi.response.ValidationExceptionResponse;
import ca.bc.gov.backendstartapi.service.GeneticWorthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoints to fetch {@link GeneticWorthEnum}. */
@RestController
@RequestMapping(path = "/api/genetic-worth", produces = MimeTypeUtils.APPLICATION_JSON_VALUE)
@Tag(
    name = "GeneticWorth",
    description =
        "Resources to run Genetic Worth calculations for the seedlots and its parent trees.")
public class GeneticWorthEndpoint implements DescribedEnumEndpoint<GeneticWorthEnum> {

  private final GeneticWorthService geneticWorthService;

  GeneticWorthEndpoint(GeneticWorthService geneticWorthService) {
    this.geneticWorthService = geneticWorthService;
  }

  @Override
  public Class<GeneticWorthEnum> enumClass() {
    return GeneticWorthEnum.class;
  }

  /**
   * Do the calculations of all Genetic Traits.
   *
   * @param traitsDto A {@link List} of {@link GeneticWorthTraitsRequestDto} with the traits and
   *     values to be calculated.
   * @return A {@link GeneticWorthSummaryDto} containing all calculated values.
   */
  @PostMapping(path = "/calculate-all", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('user_write')")
  @Operation(
      summary = "Do the calculations of all Genetic Traits",
      description =
          """
          This API is responsible for doing all Genetic Worth related calculations
          given an user's input, like Pollen and Cone count, and Genetic values
          for eah trait. This API is used in the 5th step of the Seedlot Registration
          form on SPAR.
          """)
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "A JSON containing all calculated values.",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = GeneticWorthSummaryDto.class))),
        @ApiResponse(
            responseCode = "400",
            description = "The request is missing the Parent Tree Number.",
            content =
                @Content(
                    mediaType = "application/json",
                    schema =
                        @Schema(
                            oneOf = {
                              ValidationExceptionResponse.class,
                              DefaultSpringExceptionResponse.class
                            }))),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  public GeneticWorthSummaryDto geneticTraitsCalculations(
      @Valid @RequestBody List<GeneticWorthTraitsRequestDto> traitsDto) {
    return geneticWorthService.calculateGeneticWorth(traitsDto);
  }
}
