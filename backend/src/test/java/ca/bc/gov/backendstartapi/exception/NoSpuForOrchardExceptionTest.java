package ca.bc.gov.backendstartapi.exception;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(SpringExtension.class)
class NoSpuForOrchardExceptionTest {

  @Test
  @DisplayName("isStatusNotFoundTest")
  void isStatusNotFoundTest() {
    ResponseStatusException statusException = new NoSpuForOrchardException();

    Assertions.assertEquals(HttpStatus.NOT_FOUND, statusException.getStatusCode());
    Assertions.assertEquals(
        "404 NOT_FOUND \"No active SPU for the given Orchard ID!\"",
        statusException.getMessage());
  }
}
