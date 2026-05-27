package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SeedlotFormSubmissionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotValidationError;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.SeedlotSubmissionValidationException;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.repository.ConeCollectionMethodRepository;
import ca.bc.gov.backendstartapi.repository.GameticMethodologyRepository;
import ca.bc.gov.backendstartapi.repository.MethodOfPaymentRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

/** Server-side validation for the seedlot a-class submission form. */
@Service
@RequiredArgsConstructor
public class SeedlotFormValidationService {

  @Qualifier("oracleApi")
  private final Provider oracleApiProvider;
  private final OrchardService orchardService;
  private final ForestClientService forestClientService;
  private final GameticMethodologyRepository gameticMethodologyRepository;
  private final ConeCollectionMethodRepository coneCollectionMethodRepository;
  private final MethodOfPaymentRepository methodOfPaymentRepository;

  /**
   * Validate the whole submission form. Collects ALL errors, then throws once if any exist. Must
   * run before any DB mutation.
   */
  public void validateSeedlotForm(Seedlot seedlot, SeedlotFormSubmissionDto form) {
    SparLog.info("Validating submission form for seedlot {}", seedlot.getId());
    List<SeedlotValidationError> errors = new ArrayList<>();

    validateOrchardStep(seedlot, form, errors);
    validateCollectionStep(form, errors);
    validateOwnershipStep(form, errors);
    validateInterimStep(form, errors);
    validateExtractionStep(form, errors);

    if (!errors.isEmpty()) {
      SparLog.info("Seedlot {} failed validation with {} error(s)", seedlot.getId(), errors.size());
      throw new SeedlotSubmissionValidationException(errors);
    }
  }

  @SuppressWarnings("unused") // TODO(#716): remove @SuppressWarnings once this step is implemented
  private void validateOrchardStep(
      Seedlot seedlot, SeedlotFormSubmissionDto form, List<SeedlotValidationError> errors) {
    // implemented in Task 4
  }

  @SuppressWarnings("unused") // TODO(#716): remove @SuppressWarnings once this step is implemented
  private void validateCollectionStep(
      SeedlotFormSubmissionDto form, List<SeedlotValidationError> errors) {
    // implemented in Task 5
  }

  @SuppressWarnings("unused") // TODO(#716): remove @SuppressWarnings once this step is implemented
  private void validateOwnershipStep(
      SeedlotFormSubmissionDto form, List<SeedlotValidationError> errors) {
    // implemented in Task 6
  }

  @SuppressWarnings("unused") // TODO(#716): remove @SuppressWarnings once this step is implemented
  private void validateInterimStep(
      SeedlotFormSubmissionDto form, List<SeedlotValidationError> errors) {
    // implemented in Task 7
  }

  @SuppressWarnings("unused") // TODO(#716): remove @SuppressWarnings once this step is implemented
  private void validateExtractionStep(
      SeedlotFormSubmissionDto form, List<SeedlotValidationError> errors) {
    // implemented in Task 8
  }
}
