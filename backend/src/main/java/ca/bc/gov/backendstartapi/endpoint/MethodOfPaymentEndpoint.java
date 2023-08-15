package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.MethodOfPaymentDto;
import ca.bc.gov.backendstartapi.entity.MethodOfPaymentEntity;
import ca.bc.gov.backendstartapi.service.MethodOfPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.SchemaProperty;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoints to fetch {@link MethodOfPaymentEntity}. */
@RestController
@RequestMapping(path = "/api/methods-of-payment", produces = MimeTypeUtils.APPLICATION_JSON_VALUE)
@Tag(name = "MethodsOfPayment")
public class MethodOfPaymentEndpoint {

  private MethodOfPaymentService methodOfPaymentService;

  MethodOfPaymentEndpoint(MethodOfPaymentService methodOfPaymentService) {
    this.methodOfPaymentService = methodOfPaymentService;
  }

  /**
   * Get all method of payment.
   *
   * @return A list of {@link MethodOfPaymentEntity}
   */
  @GetMapping(produces = "application/json")
  @PreAuthorize("hasRole('user_read')")
  @Operation(
      summary = "Retrieves all method of payment",
      description = "Returns a list containing all method of payment.")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "An array of objects containing code and description for each value.",
            content =
                @Content(
                    array = @ArraySchema(schema = @Schema(type = "object")),
                    mediaType = "application/json",
                    schemaProperties = {
                      @SchemaProperty(
                          name = "code",
                          schema =
                              @Schema(
                                  type = "string",
                                  description = "This object represents a method of payment code",
                                  example = "ITC")),
                      @SchemaProperty(
                          name = "description",
                          schema =
                              @Schema(
                                  type = "string",
                                  description = "The description of the payment code",
                                  example = "Invoice to Client Address"))
                    })),
        @ApiResponse(
            responseCode = "401",
            description = "Access token is missing or invalid",
            content = @Content(schema = @Schema(implementation = Void.class)))
      })
  public List<MethodOfPaymentDto> getAllMethodOfPayment() {
    return methodOfPaymentService.getAllMethodOfPayment();
  }
}
