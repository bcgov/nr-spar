package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.provider.OracleApiProvider;
import ca.bc.gov.backendstartapi.repository.ConeCollectionMethodRepository;
import ca.bc.gov.backendstartapi.repository.GameticMethodologyRepository;
import ca.bc.gov.backendstartapi.repository.MethodOfPaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class SeedlotFormValidationServiceTest {

  @Mock OracleApiProvider oracleApiProvider;

  @Mock OrchardService orchardService;

  @Mock ForestClientService forestClientService;

  @Mock GameticMethodologyRepository gameticMethodologyRepository;

  @Mock ConeCollectionMethodRepository coneCollectionMethodRepository;

  @Mock MethodOfPaymentRepository methodOfPaymentRepository;

  private SeedlotFormValidationService service;

  @BeforeEach
  void setup() {
    service =
        new SeedlotFormValidationService(
            oracleApiProvider,
            orchardService,
            forestClientService,
            gameticMethodologyRepository,
            coneCollectionMethodRepository,
            methodOfPaymentRepository);
  }

  @Test
  @DisplayName("Smoke test: valid form passes validation with no-op step methods")
  void validateSeedlotForm_smoke_shouldPassWithNoErrors() {
    Seedlot seedlot = new Seedlot("63000");
    // All step methods are no-ops; expect no exception to be thrown.
    service.validateSeedlotForm(seedlot, TestSeedlotForms.valid());
  }
}
