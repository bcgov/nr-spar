package ca.bc.gov.backendstartapi.endpoint;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import ca.bc.gov.backendstartapi.dto.SeedlotValidationError;
import ca.bc.gov.backendstartapi.exception.ReportGenerationException;
import ca.bc.gov.backendstartapi.exception.SeedlotSubmissionValidationException;
import ca.bc.gov.backendstartapi.response.ValidationExceptionResponse;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

class RestExceptionEndpointTest {

  @Test
  void seedlotSubmissionValidation_buildsStructured400() {
    RestExceptionEndpoint endpoint = new RestExceptionEndpoint();
    SeedlotSubmissionValidationException ex =
        new SeedlotSubmissionValidationException(
            List.of(
                new SeedlotValidationError(
                    "seedlotFormOrchardDto.primaryOrchardId", "bad")));

    ResponseEntity<ValidationExceptionResponse> resp = endpoint.seedlotSubmissionValidation(ex);

    assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
    assertNotNull(resp.getBody());
    assertEquals(1, resp.getBody().getFields().size());
    assertEquals(
        "seedlotFormOrchardDto.primaryOrchardId",
        resp.getBody().getFields().get(0).fieldName());
    assertEquals("bad", resp.getBody().getFields().get(0).fieldMessage());
    assertEquals("1 field(s) with validation problems!", resp.getBody().getErrorMessage());
  }

  @Test
  void reportGeneration_returnsGeneric500() {
    RestExceptionEndpoint endpoint = new RestExceptionEndpoint();
    ReportGenerationException ex =
        new ReportGenerationException(
            "Failed to compile Jasper report: /tmp/spar-jasper-SPRR001/secret.jrxml", null);

    ResponseEntity<String> resp = endpoint.reportGeneration(ex);

    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, resp.getStatusCode());
    assertEquals("Unable to generate the report. Please try again later.", resp.getBody());
  }
}
