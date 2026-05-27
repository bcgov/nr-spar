package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.OrchardDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormCollectionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormExtractionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOrchardDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormSubmissionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotValidationError;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.SeedlotSubmissionValidationException;
import ca.bc.gov.backendstartapi.provider.Provider;
import ca.bc.gov.backendstartapi.repository.ConeCollectionMethodRepository;
import ca.bc.gov.backendstartapi.repository.GameticMethodologyRepository;
import ca.bc.gov.backendstartapi.repository.MethodOfPaymentRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

    // Note: pollenContaminationMthdCode has no lookup table (no FK; values like "RPM");
    // validation deferred — see #716 spec open questions.

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
        && orchardVeg != null
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

  private void validateCollectionStep(
      SeedlotFormSubmissionDto form, List<SeedlotValidationError> errors) {
    SeedlotFormCollectionDto dto = form.seedlotFormCollectionDto();
    if (dto == null) {
      return;
    }
    // C1: verify collection client + location exist in Forest Client API
    validateClientLocation(
        dto.collectionClientNumber(),
        dto.collectionLocnCode(),
        "seedlotFormCollectionDto.collectionClientNumber",
        errors);
    // C2: each cone collection method code must exist in the reference table
    if (dto.coneCollectionMethodCodes() != null) {
      for (Integer code : dto.coneCollectionMethodCodes()) {
        if (code == null || !coneCollectionMethodRepository.existsById(code)) {
          errors.add(
              new SeedlotValidationError(
                  "seedlotFormCollectionDto.coneCollectionMethodCodes",
                  "Invalid cone collection method code: " + code));
        }
      }
    }
    // C3: end date must not precede start date
    if (dto.collectionStartDate() != null
        && dto.collectionEndDate() != null
        && dto.collectionEndDate().isBefore(dto.collectionStartDate())) {
      errors.add(
          new SeedlotValidationError(
              "seedlotFormCollectionDto.collectionEndDate",
              "Collection end date must not be before the start date."));
    }
    // C4: quantity fields must be positive
    requirePositive(
        dto.noOfContainers(), "seedlotFormCollectionDto.noOfContainers", errors);
    requirePositive(
        dto.volPerContainer(), "seedlotFormCollectionDto.volPerContainer", errors);
    requirePositive(
        dto.clctnVolume(), "seedlotFormCollectionDto.clctnVolume", errors);
  }

  /**
   * Validates that a forest client + location pair exists. Only a 404 (NOT_FOUND) response from the
   * upstream forest-client API is treated as a user validation error ("does not exist"). ALL other
   * outcomes propagate unchanged: other 4xx responses (e.g. 400/401/403/409, which indicate a SPAR
   * programming or configuration error), 5xx responses, and raw network failures (e.g.
   * ResourceAccessException, which is not a ResponseStatusException and is therefore not caught
   * here).
   */
  private void validateClientLocation(
      String clientNumber,
      String locationCode,
      String fieldId,
      List<SeedlotValidationError> errors) {
    if (clientNumber == null || locationCode == null) {
      return; // structural check handled by @Valid
    }
    try {
      forestClientService.fetchSingleClientLocation(clientNumber, locationCode);
    } catch (ResponseStatusException e) {
      if (e.getStatusCode().value() == HttpStatus.NOT_FOUND.value()) {
        errors.add(
            new SeedlotValidationError(
                fieldId,
                "Client " + clientNumber + " / location " + locationCode + " does not exist."));
      } else {
        throw e;
      }
    }
  }

  private void requirePositive(
      BigDecimal value, String fieldId, List<SeedlotValidationError> errors) {
    if (value != null && value.signum() <= 0) {
      errors.add(new SeedlotValidationError(fieldId, "Value must be greater than zero."));
    }
  }

  private BigDecimal nz(BigDecimal v) {
    return v == null ? BigDecimal.ZERO : v;
  }

  private void validateOwnershipStep(
      SeedlotFormSubmissionDto form, List<SeedlotValidationError> errors) {
    var owners = form.seedlotFormOwnershipDtoList();
    if (owners == null || owners.isEmpty()) {
      return;
    }

    BigDecimal totalOwned = BigDecimal.ZERO;
    Set<String> seenPairs = new HashSet<>();

    for (int i = 0; i < owners.size(); i++) {
      var o = owners.get(i);
      String base = "seedlotFormOwnershipDtoList[" + i + "]";

      // OW1: client/location must exist in Forest Client API
      validateClientLocation(
          o.ownerClientNumber(), o.ownerLocnCode(), base + ".ownerClientNumber", errors);

      // OW2: method of payment code must exist in reference table
      if (o.methodOfPaymentCode() != null
          && !methodOfPaymentRepository.existsById(o.methodOfPaymentCode())) {
        errors.add(
            new SeedlotValidationError(
                base + ".methodOfPaymentCode",
                "Invalid method of payment code: " + o.methodOfPaymentCode()));
      }

      // OW5: duplicate owner client+location pair
      if (o.ownerClientNumber() != null && o.ownerLocnCode() != null) {
        String key = o.ownerClientNumber() + "|" + o.ownerLocnCode();
        if (!seenPairs.add(key)) {
          errors.add(
              new SeedlotValidationError(
                  base + ".ownerClientNumber", "Duplicate owner client/location: " + key));
        }
      }

      // OW4: reserved + surplus must not exceed owned
      BigDecimal owned = nz(o.originalPctOwned());
      BigDecimal rsrvd = nz(o.originalPctRsrvd());
      BigDecimal srpls = nz(o.originalPctSrpls());
      if (rsrvd.add(srpls).compareTo(owned) > 0) {
        errors.add(
            new SeedlotValidationError(
                base + ".originalPctRsrvd",
                "Reserved + surplus percentage cannot exceed the owned percentage."));
      }
      totalOwned = totalOwned.add(owned);
    }

    // OW3: sum of all owned percentages must equal 100
    if (totalOwned.compareTo(new BigDecimal("100")) != 0) {
      errors.add(
          new SeedlotValidationError(
              "seedlotFormOwnershipDtoList",
              "Total owned percentage across owners must equal 100, was " + totalOwned + "."));
    }
  }

  private void validateInterimStep(
      SeedlotFormSubmissionDto form, List<SeedlotValidationError> errors) {
    var dto = form.seedlotFormInterimDto();
    if (dto == null) {
      return;
    }
    // I1: verify interim storage client + location exist in Forest Client API
    validateClientLocation(
        dto.intermStrgClientNumber(),
        dto.intermStrgLocnCode(),
        "seedlotFormInterimDto.intermStrgClientNumber",
        errors);
    // I2 (partial): OTH facility type requires a description.
    // Full facility-code validation (checking intermFacilityCode against a lookup table) is
    // intentionally deferred — no intermFacilityCode reference table exists in the database
    // yet (#716).
    if ("OTH".equals(dto.intermFacilityCode())
        && (dto.intermOtherFacilityDesc() == null || dto.intermOtherFacilityDesc().isBlank())) {
      errors.add(
          new SeedlotValidationError(
              "seedlotFormInterimDto.intermOtherFacilityDesc",
              "A storage facility description is required when the facility type is 'Other'."));
    }
    // I3: end date must not precede start date
    if (dto.intermStrgStDate() != null
        && dto.intermStrgEndDate() != null
        && dto.intermStrgEndDate().isBefore(dto.intermStrgStDate())) {
      errors.add(
          new SeedlotValidationError(
              "seedlotFormInterimDto.intermStrgEndDate",
              "Interim storage end date must not be before the start date."));
    }
  }

  private void validateExtractionStep(
      SeedlotFormSubmissionDto form, List<SeedlotValidationError> errors) {
    SeedlotFormExtractionDto dto = form.seedlotFormExtractionDto();
    if (dto == null) {
      return;
    }
    // E1: verify extractory client + location exist in Forest Client API
    validateClientLocation(
        dto.extractoryClientNumber(),
        dto.extractoryLocnCode(),
        "seedlotFormExtractionDto.extractoryClientNumber",
        errors);
    // E2: verify storage client + location exist in Forest Client API
    validateClientLocation(
        dto.storageClientNumber(),
        dto.storageLocnCode(),
        "seedlotFormExtractionDto.storageClientNumber",
        errors);
    // E3: extraction end date must not precede start date
    if (dto.extractionStDate() != null
        && dto.extractionEndDate() != null
        && dto.extractionEndDate().isBefore(dto.extractionStDate())) {
      errors.add(
          new SeedlotValidationError(
              "seedlotFormExtractionDto.extractionEndDate",
              "Extraction end date must not be before the start date."));
    }
    // E3: temporary storage end date must not precede start date
    if (dto.temporaryStrgStartDate() != null
        && dto.temporaryStrgEndDate() != null
        && dto.temporaryStrgEndDate().isBefore(dto.temporaryStrgStartDate())) {
      errors.add(
          new SeedlotValidationError(
              "seedlotFormExtractionDto.temporaryStrgEndDate",
              "Temporary storage end date must not be before the start date."));
    }
  }
}
