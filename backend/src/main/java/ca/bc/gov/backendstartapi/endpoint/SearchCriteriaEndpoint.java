package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.SearchCriteriaDto;
import ca.bc.gov.backendstartapi.entity.SearchCriteriaEntity;
import ca.bc.gov.backendstartapi.security.RoleAccessConfig;
import ca.bc.gov.backendstartapi.service.SearchCriteriaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Resources for managing saved search criteria per user and page. */
@RestController
@RequestMapping("/api/search-criteria")
@Tag(name = "SearchCriteria", description = "Resources for managing saved search criteria")
public class SearchCriteriaEndpoint {

  private final SearchCriteriaService searchCriteriaService;

  SearchCriteriaEndpoint(SearchCriteriaService searchCriteriaService) {
    this.searchCriteriaService = searchCriteriaService;
  }

  /**
   * Returns saved search criteria for the logged-in user and the given page.
   *
   * @param pageId the page identifier
   * @return the criteria entity or 404 if none saved
   */
  @GetMapping(value = "/{pageId}", produces = "application/json")
  @Operation(
      summary = "Get saved search criteria",
      description = "Returns the saved search criteria JSON for the logged-in user and page")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Criteria found",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = SearchCriteriaEntity.class))),
        @ApiResponse(
            responseCode = "404",
            description = "No criteria saved for this user and page",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public ResponseEntity<SearchCriteriaEntity> getCriteria(
      @Parameter(
              name = "pageId",
              in = ParameterIn.PATH,
              description = "The page identifier",
              required = true,
              schema = @Schema(type = "string"))
          @PathVariable
          String pageId) {
    return searchCriteriaService
        .getCriteria(pageId)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  /**
   * Creates or updates search criteria for the logged-in user and the given page. Tries update
   * first; if no row exists, inserts instead.
   *
   * @param pageId the page identifier
   * @param dto the request body containing the criteria JSON
   * @return the persisted criteria entity
   */
  @PutMapping(value = "/{pageId}", consumes = "application/json", produces = "application/json")
  @Operation(
      summary = "Set (upsert) search criteria",
      description =
          "Creates or updates search criteria for the logged-in user and page. "
              + "Tries update first; inserts if no existing row.")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Criteria saved successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = SearchCriteriaEntity.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request body",
            content = @Content(schema = @Schema(implementation = Void.class))),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  @RoleAccessConfig({"SPAR_TSC_ADMIN", "SPAR_MINISTRY_ORCHARD", "SPAR_NONMINISTRY_ORCHARD"})
  public SearchCriteriaEntity setCriteria(
      @Parameter(
              name = "pageId",
              in = ParameterIn.PATH,
              description = "The page identifier",
              required = true,
              schema = @Schema(type = "string"))
          @PathVariable
          String pageId,
      @Valid @RequestBody SearchCriteriaDto dto) {
    return searchCriteriaService.setCriteria(pageId, dto.criteriaJson());
  }
}
