package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.PtValsCalReqDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRequestDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRespondDto;
import ca.bc.gov.backendstartapi.dto.PtCalculationResDto;
import ca.bc.gov.backendstartapi.response.DefaultSpringExceptionResponse;
import ca.bc.gov.backendstartapi.response.ValidationExceptionResponse;
import ca.bc.gov.backendstartapi.service.ParentTreeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** This class exposes resources for handling {@link ParentTreeEntity} records. */
@Tag(name = "Parent Trees", description = "")
@RestController
@RequestMapping("/api/parent-trees")
@RequiredArgsConstructor
public class ParentTreeEndpoint {

  private final ParentTreeService parentTreeService;

  /**
   * Get the mean geospatial data for a list of parent tree in SMP mix.
   *
   * @param ptreeIds The {@link GeospatialRequestDto} list with parent trees and all tab 3 data.
   * @return A List of {@link ParentTreeOrchardDto} containing the result rows.
   */
  @PostMapping("/smp-mix/geospatial-data")
  @Operation(
      summary = "",
      description = "",
      responses = {
        @ApiResponse(responseCode = "200", description = "A record of mean geospatial data"),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Bad request, e.g. No geospatial data found for one of the parent trees.",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  public GeospatialRespondDto getPtGeoSpatialData(
      @io.swagger.v3.oas.annotations.parameters.RequestBody(
              description = "A list of orchard id to fetch lat, long and elevation data.",
              required = true)
          @RequestBody
          List<GeospatialRequestDto> ptreeIdAndProportion) {
    return parentTreeService.calcSmpMixGeospatial(ptreeIdAndProportion);
  }

  /**
   * Do the calculations of all Genetic Traits, given a trait list.
   *
   * @param traitsDto A {@link List} of {@link PtValsCalReqDto} with the traits and
   *     values to be calculated.
   * @return A {@link PtCalculationResDto} containing all calculated values.
   */
  @PostMapping(path = "/calculate", consumes = MediaType.APPLICATION_JSON_VALUE)
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
            description = "A JSON containing all calculated values."),
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
  public PtCalculationResDto geneticTraitsCalculations(
      @io.swagger.v3.oas.annotations.parameters.RequestBody(
              description = "Body containing the traits and values to be used in the calculations",
              required = true)
          @Valid
          @RequestBody
          List<PtValsCalReqDto> traitsDto) {
    return parentTreeService.calculatePtVals(traitsDto);
  }
}
