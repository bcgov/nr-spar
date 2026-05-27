package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.OrchardDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOrchardDto;
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
import java.util.Optional;
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

  private void validateOrchardStep(
      Seedlot seedlot, SeedlotFormSubmissionDto form, List<SeedlotValidationError> errors) {
    SeedlotFormOrchardDto dto = form.seedlotFormOrchardDto();
    if (dto == null) {
      return; // structural @NotNull already reported by @Valid
    }

    // O1-O3: primary orchard
    validateOrchardId(
        seedlot, dto.primaryOrchardId(), "seedlotFormOrchardDto.primaryOrchardId", errors);

    // O4: secondary orchard (same O1-O3 checks, only when present)
    if (dto.secondaryOrchardId() != null) {
      validateOrchardId(
          seedlot,
          dto.secondaryOrchardId(),
          "seedlotFormOrchardDto.secondaryOrchardId",
          errors);
    }

    // O5: female gametic method code must exist
    if (dto.femaleGameticMthdCode() != null
        && !gameticMethodologyRepository.existsById(dto.femaleGameticMthdCode())) {
      errors.add(
          new SeedlotValidationError(
              "seedlotFormOrchardDto.femaleGameticMthdCode",
              "Female gametic method code "
                  + dto.femaleGameticMthdCode()
                  + " is not a valid gametic methodology code."));
    }

    // O5: male gametic method code must exist
    if (dto.maleGameticMthdCode() != null
        && !gameticMethodologyRepository.existsById(dto.maleGameticMthdCode())) {
      errors.add(
          new SeedlotValidationError(
              "seedlotFormOrchardDto.maleGameticMthdCode",
              "Male gametic method code "
                  + dto.maleGameticMthdCode()
                  + " is not a valid gametic methodology code."));
    }

    // O6: pollen contamination method code — validated against gametic methodology repository
    // (no separate lookup table exists for pollen contamination method codes in this schema)
    String pollenMthdCode = dto.pollenContaminationMthdCode();
    if (pollenMthdCode != null
        && !pollenMthdCode.isBlank()
        && !gameticMethodologyRepository.existsById(pollenMthdCode)) {
      errors.add(
          new SeedlotValidationError(
              "seedlotFormOrchardDto.pollenContaminationMthdCode",
              "Pollen contamination method code "
                  + pollenMthdCode
                  + " is not a valid gametic methodology code."));
    }

    // O7: if pollenContaminationInd is true, pollenContaminationPct must be non-null and 0..100
    if (Boolean.TRUE.equals(dto.pollenContaminationInd())) {
      Integer pct = dto.pollenContaminationPct();
      if (pct == null || pct < 0 || pct > 100) {
        errors.add(
            new SeedlotValidationError(
                "seedlotFormOrchardDto.pollenContaminationPct",
                "Pollen contamination percentage must be between 0 and 100 when pollen"
                    + " contamination is indicated."));
      }
    }
  }

  private void validateOrchardId(
      Seedlot seedlot, String orchardId, String fieldId, List<SeedlotValidationError> errors) {
    if (orchardId == null) {
      return;
    }
    Optional<OrchardDto> orchardOpt = oracleApiProvider.findOrchardById(orchardId);
    if (orchardOpt.isEmpty()) {
      errors.add(new SeedlotValidationError(fieldId, "Orchard " + orchardId + " does not exist."));
      return;
    }
    // O2 (HEADLINE): verify the orchard's species matches the seedlot's species
    String orchardVeg = orchardOpt.get().getVegetationCode();
    if (seedlot.getVegetationCode() != null
        && !seedlot.getVegetationCode().equals(orchardVeg)) {
      errors.add(
          new SeedlotValidationError(
              fieldId,
              "Orchard "
                  + orchardId
                  + " (species "
                  + orchardVeg
                  + ") does not belong to the seedlot species "
                  + seedlot.getVegetationCode()
                  + "."));
    }
    // O3: orchard must be active (has an active SPU)
    if (orchardService.findSpuIdByOrchard(orchardId).isEmpty()) {
      errors.add(
          new SeedlotValidationError(fieldId, "Orchard " + orchardId + " is not active."));
    }
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
