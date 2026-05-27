# PUT Seedlot A-Class Submission — Backend Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add fail-fast server-side validation to `PUT /api/seedlots/{seedlotNumber}/a-class-submission` so invalid data (wrong orchard species, non-existent forest clients, bad code values, inconsistent cross-field data) is rejected with a structured HTTP 400 **before** any database mutation.

**Architecture:** A new `SeedlotFormValidationService` is invoked first inside `SeedlotService.updateSeedlotWithForm`, before any step save. It collects every error into a `List<SeedlotValidationError>` and, if non-empty, throws `SeedlotSubmissionValidationException`, which a `@ExceptionHandler` renders as the existing `ValidationExceptionResponse` body. Structural `@NotNull` checks are enabled separately by adding `@Valid` to the `@RequestBody` (handled by the existing `MethodArgumentNotValidException` path).

**Tech Stack:** Java 17, Spring Boot, JPA, JUnit 5 + Mockito (`@ExtendWith(SpringExtension.class)`), Maven wrapper. Build/test from the `backend/` directory.

**Spec:** `docs/superpowers/specs/2026-05-27-put-seedlot-submission-validation-design.md`

---

## Scope decisions (resolving spec §5 open questions)

Decisions made so this plan is concrete. Revisit with product if any are wrong:

1. **Severity:** every validation in this plan is **blocking** (HTTP 400).
2. **Owner % rule (OW3):** sum of `originalPctOwned` across owners must equal **100** (tolerance handled with `BigDecimal.compareTo`).
3. **Interim facility code (I2):** **deferred** — no lookup table exists for facility types. This plan keeps only the existing `OTH → description required` rule (relocated into the validation service). Adding a facility-code table is a follow-up.
4. **Parent-tree validation (P1/P2/P3):** **deferred to Phase 2** (see end). Validating each `parentTreeId` against Oracle per submission has unconfirmed cost and data shape; it is isolated from the rest and kept out of this plan.

This plan implements: **X1, X2 (existing), O1–O3, O5, O6, O7, C1–C4, OW1–OW5, I1, I2-partial, I3, E1–E3.**

---

## File structure

| File | Responsibility | Action |
|---|---|---|
| `backend/.../dto/SeedlotValidationError.java` | Immutable record: one field-level validation error | Create |
| `backend/.../exception/SeedlotSubmissionValidationException.java` | Carries `List<SeedlotValidationError>`; rendered as 400 | Create |
| `backend/.../response/ValidationExceptionResponse.java` | Add factory to build from `SeedlotValidationError` list | Modify |
| `backend/.../endpoint/RestExceptionEndpoint.java` | `@ExceptionHandler` for the new exception | Modify |
| `backend/.../service/SeedlotFormValidationService.java` | All validation logic, one private method per step | Create |
| `backend/.../service/SeedlotService.java` | Inject + invoke validation service before step saves | Modify |
| `backend/.../endpoint/SeedlotEndpoint.java` | Add `@Valid` to the `@RequestBody` (`submitSeedlotForm`) | Modify |
| `backend/.../service/SeedlotFormValidationServiceTest.java` | Unit tests, one block per step | Create |

All `backend/...` paths are under `backend/src/main/java/ca/bc/gov/backendstartapi/` (tests under `backend/src/test/java/ca/bc/gov/backendstartapi/`).

**Test command (run from `backend/`):** `./mvnw test -Dtest=<ClassName>` (append `#methodName` for a single test).

---

## Task 1: Enable structural validation (`@Valid`) — X1

**Files:**
- Modify: `backend/.../endpoint/SeedlotEndpoint.java` (`submitSeedlotForm`)
- Test: `backend/.../endpoint/SeedlotEndpointTest.java` (existing) or new integration test

- [ ] **Step 1: Add the failing test**

In the existing `SeedlotEndpoint` web-layer test class, add (mirror the existing MockMvc setup in that file — reuse its `@WebMvcTest`/`MockMvc` and mocked `seedlotService`):

```java
@Test
@DisplayName("submitSeedlotForm returns 400 when required orchard step is null")
void submitSeedlotForm_missingRequiredField_shouldReturn400() throws Exception {
  // Body with seedlotFormOrchardDto = null → violates @NotNull once @Valid is enabled
  String body = """
      { "seedlotFormCollectionDto": null, "seedlotFormOwnershipDtoList": [],
        "seedlotFormInterimDto": null, "seedlotFormOrchardDto": null,
        "seedlotFormParentTreeDtoList": [], "seedlotFormParentTreeSmpDtoList": [],
        "seedlotFormSmpParentOutsideDto": null, "seedlotFormExtractionDto": null }
      """;
  mockMvc
      .perform(
          put("/api/seedlots/63000/a-class-submission")
              .contentType(MediaType.APPLICATION_JSON)
              .content(body)
              .with(csrf()))
      .andExpect(status().isBadRequest());
}
```

> If the existing test file uses a different base path or auth setup, copy it from a sibling test in the same class. Confirm `SeedlotFormSubmissionDto` declares `@NotNull` on its fields (it does); `@Valid` cascades to nested DTOs.

- [ ] **Step 2: Run test, verify it fails**

Run: `./mvnw test -Dtest=SeedlotEndpointTest#submitSeedlotForm_missingRequiredField_shouldReturn400`
Expected: FAIL — currently returns 201/500, not 400, because `@Valid` is absent.

- [ ] **Step 3: Add `@Valid` to the request body**

In `submitSeedlotForm`, change the parameter:

```java
@RequestBody @Valid SeedlotFormSubmissionDto form
```

Add the import if missing: `import jakarta.validation.Valid;`

- [ ] **Step 4: Run test, verify it passes**

Run: `./mvnw test -Dtest=SeedlotEndpointTest#submitSeedlotForm_missingRequiredField_shouldReturn400`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/ca/bc/gov/backendstartapi/endpoint/SeedlotEndpoint.java \
        backend/src/test/java/ca/bc/gov/backendstartapi/endpoint/SeedlotEndpointTest.java
git commit -m "feat(seedlot): enforce @Valid on a-class-submission request body (#716)"
```

---

## Task 2: Structured error type + exception + handler

**Files:**
- Create: `backend/.../dto/SeedlotValidationError.java`
- Create: `backend/.../exception/SeedlotSubmissionValidationException.java`
- Modify: `backend/.../response/ValidationExceptionResponse.java`
- Modify: `backend/.../endpoint/RestExceptionEndpoint.java`
- Test: `backend/.../endpoint/RestExceptionEndpointTest.java` (create if absent)

- [ ] **Step 1: Create the error record**

`backend/.../dto/SeedlotValidationError.java`:

```java
package ca.bc.gov.backendstartapi.dto;

/** A single field-level validation error for the seedlot submission form. */
public record SeedlotValidationError(String fieldId, String message) {}
```

- [ ] **Step 2: Create the exception**

`backend/.../exception/SeedlotSubmissionValidationException.java`:

```java
package ca.bc.gov.backendstartapi.exception;

import ca.bc.gov.backendstartapi.dto.SeedlotValidationError;
import java.util.List;
import lombok.Getter;

/** Thrown when the seedlot submission form fails one or more server-side validations. */
@Getter
public class SeedlotSubmissionValidationException extends RuntimeException {

  private final transient List<SeedlotValidationError> errors;

  public SeedlotSubmissionValidationException(List<SeedlotValidationError> errors) {
    super(errors.size() + " field(s) with validation problems!");
    this.errors = errors;
  }
}
```

- [ ] **Step 3: Add a factory to `ValidationExceptionResponse`**

In `ValidationExceptionResponse.java`, make `FieldIssue` constructable from outside and add a static factory. Add this method inside the class (keep the existing `List<FieldError>` constructor untouched):

```java
/** Build a response from seedlot submission validation errors. */
public static ValidationExceptionResponse fromSeedlotErrors(
    java.util.List<ca.bc.gov.backendstartapi.dto.SeedlotValidationError> errors) {
  java.util.List<FieldError> fieldErrors =
      errors.stream()
          .map(e -> new FieldError("seedlotForm", e.fieldId(), e.message()))
          .toList();
  return new ValidationExceptionResponse(fieldErrors);
}
```

> Reuses the existing `List<FieldError>` constructor, so the response shape (`errorMessage` + `fields`) is identical to JSR-303 errors. `FieldError` is `org.springframework.validation.FieldError` (already imported).

- [ ] **Step 4: Add the exception handler**

In `RestExceptionEndpoint.java`, add:

```java
@ExceptionHandler(SeedlotSubmissionValidationException.class)
ResponseEntity<ValidationExceptionResponse> seedlotSubmissionValidation(
    SeedlotSubmissionValidationException ex) {
  return ResponseEntity.status(HttpStatus.BAD_REQUEST)
      .body(ValidationExceptionResponse.fromSeedlotErrors(ex.getErrors()));
}
```

Add imports: `ca.bc.gov.backendstartapi.exception.SeedlotSubmissionValidationException`.

- [ ] **Step 5: Write the failing test for the handler**

`backend/.../endpoint/RestExceptionEndpointTest.java`:

```java
package ca.bc.gov.backendstartapi.endpoint;

import static org.junit.jupiter.api.Assertions.assertEquals;

import ca.bc.gov.backendstartapi.dto.SeedlotValidationError;
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
            List.of(new SeedlotValidationError("seedlotFormOrchardDto.primaryOrchardId", "bad")));

    ResponseEntity<ValidationExceptionResponse> resp = endpoint.seedlotSubmissionValidation(ex);

    assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
    assertEquals(1, resp.getBody().getFields().size());
    assertEquals(
        "seedlotFormOrchardDto.primaryOrchardId", resp.getBody().getFields().get(0).fieldName());
  }
}
```

> If `seedlotSubmissionValidation` / `FieldIssue.fieldName()` are package-private, this test is in the same package so it compiles. If the build complains the handler method is package-private and not visible, make the handler method `public`.

- [ ] **Step 6: Run test, verify pass**

Run: `./mvnw test -Dtest=RestExceptionEndpointTest`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/ca/bc/gov/backendstartapi/dto/SeedlotValidationError.java \
        backend/src/main/java/ca/bc/gov/backendstartapi/exception/SeedlotSubmissionValidationException.java \
        backend/src/main/java/ca/bc/gov/backendstartapi/response/ValidationExceptionResponse.java \
        backend/src/main/java/ca/bc/gov/backendstartapi/endpoint/RestExceptionEndpoint.java \
        backend/src/test/java/ca/bc/gov/backendstartapi/endpoint/RestExceptionEndpointTest.java
git commit -m "feat(seedlot): structured 400 for submission validation errors (#716)"
```

---

## Task 3: Validation service skeleton + wire into the service

**Files:**
- Create: `backend/.../service/SeedlotFormValidationService.java`
- Modify: `backend/.../service/SeedlotService.java`
- Test: `backend/.../service/SeedlotFormValidationServiceTest.java`

- [ ] **Step 1: Create the service skeleton**

`backend/.../service/SeedlotFormValidationService.java`:

```java
package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.SeedlotFormSubmissionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotValidationError;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.SeedlotSubmissionValidationException;
import ca.bc.gov.backendstartapi.provider.OracleApiProvider;
import ca.bc.gov.backendstartapi.repository.ConeCollectionMethodRepository;
import ca.bc.gov.backendstartapi.repository.GameticMethodologyRepository;
import ca.bc.gov.backendstartapi.repository.MethodOfPaymentRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** Server-side validation for the seedlot a-class submission form. */
@Service
@RequiredArgsConstructor
public class SeedlotFormValidationService {

  private final OracleApiProvider oracleApiProvider;
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
    // implemented in Task 4
  }

  private void validateCollectionStep(
      SeedlotFormSubmissionDto form, List<SeedlotValidationError> errors) {
    // implemented in Task 5
  }

  private void validateOwnershipStep(
      SeedlotFormSubmissionDto form, List<SeedlotValidationError> errors) {
    // implemented in Task 6
  }

  private void validateInterimStep(
      SeedlotFormSubmissionDto form, List<SeedlotValidationError> errors) {
    // implemented in Task 7
  }

  private void validateExtractionStep(
      SeedlotFormSubmissionDto form, List<SeedlotValidationError> errors) {
    // implemented in Task 8
  }
}
```

> The empty private methods are filled by Tasks 4–8. They are real (no-op) methods now so the service compiles and can be wired immediately.

- [ ] **Step 2: Wire into `SeedlotService`**

In `SeedlotService.java`: add the field (constructor injection via existing `@RequiredArgsConstructor` / final fields — match the file's pattern):

```java
private final SeedlotFormValidationService seedlotFormValidationService;
```

In `updateSeedlotWithForm`, immediately after `boolean canDelete = ...;` and **before** the `// Step 1 (Collection methods)` block, add:

```java
// Validate the entire form before any mutation; throws 400 with all errors if invalid.
seedlotFormValidationService.validateSeedlotForm(seedlot, form);
```

- [ ] **Step 3: Write the failing test (service is invoked, throws aggregated error)**

`backend/.../service/SeedlotFormValidationServiceTest.java`:

```java
package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.lenient;

import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.SeedlotSubmissionValidationException;
import ca.bc.gov.backendstartapi.provider.OracleApiProvider;
import ca.bc.gov.backendstartapi.repository.ConeCollectionMethodRepository;
import ca.bc.gov.backendstartapi.repository.GameticMethodologyRepository;
import ca.bc.gov.backendstartapi.repository.MethodOfPaymentRepository;
import org.junit.jupiter.api.BeforeEach;
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

  // Placeholder asserting the throw path compiles & runs; real cases added in later tasks.
  @Test
  void validateSeedlotForm_smoke() {
    Seedlot seedlot = new Seedlot("63000");
    // With all step methods empty (no errors yet), this should NOT throw.
    service.validateSeedlotForm(seedlot, TestSeedlotForms.valid());
  }
}
```

> Create a small test fixture helper `TestSeedlotForms` (next step) that builds a complete `SeedlotFormSubmissionDto`. If you prefer, inline the builder in the test class instead — but a shared helper is reused by Tasks 4–8.

- [ ] **Step 4: Create the test fixture helper**

`backend/.../service/TestSeedlotForms.java` (in the test tree). Build a valid `SeedlotFormSubmissionDto` using the real constructors. Inspect `SeedlotFormSubmissionDto.java` for the exact component order and copy the nested DTO constructor calls (e.g. the orchard DTO call mirrors `SeedlotOrchardServiceTest.createFormDto()`: `new SeedlotFormOrchardDto("405","406","F3","M3",false,true,false,22,new BigDecimal("45.6"),"true")`). Provide `valid()` and per-step mutators (`withOrchard(...)`, etc.) as needed by later tasks.

> This step requires reading `SeedlotFormSubmissionDto.java` and each nested DTO to fill real values. That is mechanical construction, not a placeholder — write out the full constructor call.

- [ ] **Step 5: Run, verify pass**

Run: `./mvnw test -Dtest=SeedlotFormValidationServiceTest#validateSeedlotForm_smoke`
Expected: PASS (no errors collected yet → no throw).

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/ca/bc/gov/backendstartapi/service/SeedlotFormValidationService.java \
        backend/src/main/java/ca/bc/gov/backendstartapi/service/SeedlotService.java \
        backend/src/test/java/ca/bc/gov/backendstartapi/service/SeedlotFormValidationServiceTest.java \
        backend/src/test/java/ca/bc/gov/backendstartapi/service/TestSeedlotForms.java
git commit -m "feat(seedlot): add SeedlotFormValidationService skeleton wired pre-mutation (#716)"
```

---

## Task 4: Orchard validation — O1, O2 (species ⭐), O3, O5, O6, O7

**Files:**
- Modify: `backend/.../service/SeedlotFormValidationService.java` (`validateOrchardStep`)
- Test: `backend/.../service/SeedlotFormValidationServiceTest.java`

- [ ] **Step 1: Write the failing tests**

Add to `SeedlotFormValidationServiceTest`:

```java
@Test
void orchard_speciesMismatch_isRejected() {
  Seedlot seedlot = new Seedlot("63000");
  seedlot.setVegetationCode("PLI");
  // Orchard exists but vegCode = "FDC" (mismatch)
  ca.bc.gov.backendstartapi.dto.OrchardDto orchard = new ca.bc.gov.backendstartapi.dto.OrchardDto();
  orchard.setId("405");
  orchard.setVegetationCode("FDC");
  lenient().when(oracleApiProvider.findOrchardById("405")).thenReturn(java.util.Optional.of(orchard));
  lenient()
      .when(orchardService.findSpuIdByOrchard("405"))
      .thenReturn(java.util.Optional.of(new ca.bc.gov.backendstartapi.entity.ActiveOrchardSpuEntity()));
  lenient().when(gameticMethodologyRepository.existsById(org.mockito.ArgumentMatchers.anyString())).thenReturn(true);

  SeedlotSubmissionValidationException ex =
      assertThrows(
          SeedlotSubmissionValidationException.class,
          () -> service.validateSeedlotForm(seedlot, TestSeedlotForms.withOrchardPrimary("405")));

  org.junit.jupiter.api.Assertions.assertTrue(
      ex.getErrors().stream()
          .anyMatch(e -> e.fieldId().equals("seedlotFormOrchardDto.primaryOrchardId")));
}

@Test
void orchard_doesNotExist_isRejected() {
  Seedlot seedlot = new Seedlot("63000");
  seedlot.setVegetationCode("PLI");
  lenient().when(oracleApiProvider.findOrchardById("999")).thenReturn(java.util.Optional.empty());
  lenient().when(gameticMethodologyRepository.existsById(org.mockito.ArgumentMatchers.anyString())).thenReturn(true);

  SeedlotSubmissionValidationException ex =
      assertThrows(
          SeedlotSubmissionValidationException.class,
          () -> service.validateSeedlotForm(seedlot, TestSeedlotForms.withOrchardPrimary("999")));

  org.junit.jupiter.api.Assertions.assertFalse(ex.getErrors().isEmpty());
}

@Test
void orchard_invalidGameticCode_isRejected() {
  Seedlot seedlot = new Seedlot("63000");
  seedlot.setVegetationCode("PLI");
  ca.bc.gov.backendstartapi.dto.OrchardDto orchard = new ca.bc.gov.backendstartapi.dto.OrchardDto();
  orchard.setId("405");
  orchard.setVegetationCode("PLI");
  lenient().when(oracleApiProvider.findOrchardById("405")).thenReturn(java.util.Optional.of(orchard));
  lenient()
      .when(orchardService.findSpuIdByOrchard("405"))
      .thenReturn(java.util.Optional.of(new ca.bc.gov.backendstartapi.entity.ActiveOrchardSpuEntity()));
  lenient().when(gameticMethodologyRepository.existsById("F3")).thenReturn(false); // invalid

  SeedlotSubmissionValidationException ex =
      assertThrows(
          SeedlotSubmissionValidationException.class,
          () -> service.validateSeedlotForm(seedlot, TestSeedlotForms.withOrchardPrimary("405")));

  org.junit.jupiter.api.Assertions.assertFalse(ex.getErrors().isEmpty());
}
```

> `TestSeedlotForms.withOrchardPrimary(id)` returns a valid form whose orchard step uses `id` as primary, `F3`/`M3` gametic codes, `pollenContaminationInd=false`, and otherwise-valid other steps (so only orchard errors surface). Add it to the fixture.

- [ ] **Step 2: Run, verify fail**

Run: `./mvnw test -Dtest=SeedlotFormValidationServiceTest#orchard_speciesMismatch_isRejected+orchard_doesNotExist_isRejected+orchard_invalidGameticCode_isRejected`
Expected: FAIL — `validateOrchardStep` is currently a no-op, so nothing throws.

- [ ] **Step 3: Implement `validateOrchardStep`**

Replace the no-op body in `SeedlotFormValidationService`:

```java
private void validateOrchardStep(
    Seedlot seedlot, SeedlotFormSubmissionDto form, List<SeedlotValidationError> errors) {
  var dto = form.seedlotFormOrchardDto();
  if (dto == null) {
    return; // structural @NotNull already reported by @Valid
  }

  validateOrchardId(seedlot, dto.primaryOrchardId(), "seedlotFormOrchardDto.primaryOrchardId", errors);
  if (dto.secondaryOrchardId() != null) {
    validateOrchardId(
        seedlot, dto.secondaryOrchardId(), "seedlotFormOrchardDto.secondaryOrchardId", errors);
  }

  // O5 gametic codes
  if (dto.femaleGameticMthdCode() != null
      && !gameticMethodologyRepository.existsById(dto.femaleGameticMthdCode())) {
    errors.add(
        new SeedlotValidationError(
            "seedlotFormOrchardDto.femaleGameticMthdCode",
            "Invalid female gametic methodology code: " + dto.femaleGameticMthdCode()));
  }
  if (dto.maleGameticMthdCode() != null
      && !gameticMethodologyRepository.existsById(dto.maleGameticMthdCode())) {
    errors.add(
        new SeedlotValidationError(
            "seedlotFormOrchardDto.maleGameticMthdCode",
            "Invalid male gametic methodology code: " + dto.maleGameticMthdCode()));
  }
  // O6 pollen contamination method code (optional)
  if (dto.pollenContaminationMthdCode() != null
      && !dto.pollenContaminationMthdCode().isBlank()
      && !gameticMethodologyRepository.existsById(dto.pollenContaminationMthdCode())) {
    errors.add(
        new SeedlotValidationError(
            "seedlotFormOrchardDto.pollenContaminationMthdCode",
            "Invalid pollen contamination method code: " + dto.pollenContaminationMthdCode()));
  }
  // O7 pollen contamination consistency
  if (Boolean.TRUE.equals(dto.pollenContaminationInd())) {
    if (dto.pollenContaminationPct() == null
        || dto.pollenContaminationPct() < 0
        || dto.pollenContaminationPct() > 100) {
      errors.add(
          new SeedlotValidationError(
              "seedlotFormOrchardDto.pollenContaminationPct",
              "Pollen contamination percentage must be 0–100 when contamination is present."));
    }
  }
}

private void validateOrchardId(
    Seedlot seedlot, String orchardId, String fieldId, List<SeedlotValidationError> errors) {
  // O1 exists
  var orchardOpt = oracleApiProvider.findOrchardById(orchardId);
  if (orchardOpt.isEmpty()) {
    errors.add(new SeedlotValidationError(fieldId, "Orchard " + orchardId + " does not exist."));
    return;
  }
  // O2 species match (the headline check)
  String orchardVeg = orchardOpt.get().getVegetationCode();
  if (seedlot.getVegetationCode() != null && !seedlot.getVegetationCode().equals(orchardVeg)) {
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
  // O3 active / not retired
  if (orchardService.findSpuIdByOrchard(orchardId).isEmpty()) {
    errors.add(
        new SeedlotValidationError(fieldId, "Orchard " + orchardId + " is not active."));
  }
}
```

Add imports as needed: `ca.bc.gov.backendstartapi.dto.OrchardDto` is not directly referenced here (we use `var`), so no new import is strictly required beyond existing ones.

- [ ] **Step 4: Run, verify pass**

Run: `./mvnw test -Dtest=SeedlotFormValidationServiceTest`
Expected: PASS (all orchard tests + smoke).

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/ca/bc/gov/backendstartapi/service/SeedlotFormValidationService.java \
        backend/src/test/java/ca/bc/gov/backendstartapi/service/SeedlotFormValidationServiceTest.java \
        backend/src/test/java/ca/bc/gov/backendstartapi/service/TestSeedlotForms.java
git commit -m "feat(seedlot): validate orchard existence, species match, active, gametic codes (#716)"
```

---

## Task 5: Collection validation — C1–C4

**Files:**
- Modify: `backend/.../service/SeedlotFormValidationService.java` (`validateCollectionStep` + a shared forest-client helper)
- Test: `backend/.../service/SeedlotFormValidationServiceTest.java`

- [ ] **Step 1: Write the failing tests**

```java
@Test
void collection_endDateBeforeStart_isRejected() {
  Seedlot seedlot = validSeedlot();
  stubValidOrchard(); // helper (see step 3 of Task 4 stubs) so only collection errors surface
  stubValidForestClient();
  lenient().when(coneCollectionMethodRepository.existsById(org.mockito.ArgumentMatchers.anyInt())).thenReturn(true);

  var form = TestSeedlotForms.withCollectionDates(
      java.time.LocalDate.of(2024, 5, 10), java.time.LocalDate.of(2024, 5, 1)); // end < start

  SeedlotSubmissionValidationException ex =
      assertThrows(SeedlotSubmissionValidationException.class,
          () -> service.validateSeedlotForm(seedlot, form));
  org.junit.jupiter.api.Assertions.assertTrue(
      ex.getErrors().stream().anyMatch(e -> e.fieldId().startsWith("seedlotFormCollectionDto")));
}

@Test
void collection_invalidConeMethodCode_isRejected() {
  Seedlot seedlot = validSeedlot();
  stubValidOrchard();
  stubValidForestClient();
  lenient().when(coneCollectionMethodRepository.existsById(99)).thenReturn(false);

  var form = TestSeedlotForms.withConeCollectionMethodCodes(java.util.List.of(99));
  SeedlotSubmissionValidationException ex =
      assertThrows(SeedlotSubmissionValidationException.class,
          () -> service.validateSeedlotForm(seedlot, form));
  org.junit.jupiter.api.Assertions.assertFalse(ex.getErrors().isEmpty());
}
```

> Add test helpers `validSeedlot()` (sets vegCode + returns a `Seedlot`), `stubValidOrchard()`, `stubValidForestClient()` to the test class to keep cases focused. `stubValidForestClient()` stubs `forestClientService.fetchSingleClientLocation(anyString(), anyString())` to return a non-null `ForestClientLocationDto`.

- [ ] **Step 2: Run, verify fail**

Run: `./mvnw test -Dtest=SeedlotFormValidationServiceTest#collection_endDateBeforeStart_isRejected+collection_invalidConeMethodCode_isRejected`
Expected: FAIL.

- [ ] **Step 3: Implement the forest-client helper + `validateCollectionStep`**

Add the shared helper to `SeedlotFormValidationService`:

```java
/**
 * Validate a forest client + location pair exists. A 4xx from the upstream API is a user
 * validation error; other failures (5xx/network) propagate unchanged.
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
  } catch (org.springframework.web.server.ResponseStatusException e) {
    if (e.getStatusCode().is4xxClientError()) {
      errors.add(
          new SeedlotValidationError(
              fieldId,
              "Client " + clientNumber + " / location " + locationCode + " does not exist."));
    } else {
      throw e;
    }
  }
}
```

Implement `validateCollectionStep`:

```java
private void validateCollectionStep(
    SeedlotFormSubmissionDto form, List<SeedlotValidationError> errors) {
  var dto = form.seedlotFormCollectionDto();
  if (dto == null) {
    return;
  }
  validateClientLocation(
      dto.collectionClientNumber(),
      dto.collectionLocnCode(),
      "seedlotFormCollectionDto.collectionClientNumber",
      errors);

  // C2 cone collection method codes
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

  // C3 date order
  if (dto.collectionStartDate() != null
      && dto.collectionEndDate() != null
      && dto.collectionEndDate().isBefore(dto.collectionStartDate())) {
    errors.add(
        new SeedlotValidationError(
            "seedlotFormCollectionDto.collectionEndDate",
            "Collection end date must not be before the start date."));
  }

  // C4 positive quantities
  requirePositive(dto.noOfContainers(), "seedlotFormCollectionDto.noOfContainers", errors);
  requirePositive(dto.volPerContainer(), "seedlotFormCollectionDto.volPerContainer", errors);
  requirePositive(dto.clctnVolume(), "seedlotFormCollectionDto.clctnVolume", errors);
}

private void requirePositive(
    java.math.BigDecimal value, String fieldId, List<SeedlotValidationError> errors) {
  if (value != null && value.signum() <= 0) {
    errors.add(new SeedlotValidationError(fieldId, "Value must be greater than zero."));
  }
}
```

- [ ] **Step 4: Run, verify pass**

Run: `./mvnw test -Dtest=SeedlotFormValidationServiceTest`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/ca/bc/gov/backendstartapi/service/SeedlotFormValidationService.java \
        backend/src/test/java/ca/bc/gov/backendstartapi/service/SeedlotFormValidationServiceTest.java \
        backend/src/test/java/ca/bc/gov/backendstartapi/service/TestSeedlotForms.java
git commit -m "feat(seedlot): validate collection step client/location, cone codes, dates, volumes (#716)"
```

---

## Task 6: Ownership validation — OW1–OW5

**Files:**
- Modify: `backend/.../service/SeedlotFormValidationService.java` (`validateOwnershipStep`)
- Test: `backend/.../service/SeedlotFormValidationServiceTest.java`

- [ ] **Step 1: Write the failing tests**

```java
@Test
void owners_percentDoesNotSumTo100_isRejected() {
  Seedlot seedlot = validSeedlot();
  stubValidOrchard();
  stubValidForestClient();
  lenient().when(methodOfPaymentRepository.existsById(org.mockito.ArgumentMatchers.anyString())).thenReturn(true);
  lenient().when(coneCollectionMethodRepository.existsById(org.mockito.ArgumentMatchers.anyInt())).thenReturn(true);

  // two owners 60 + 30 = 90 (≠ 100)
  var form = TestSeedlotForms.withOwners(
      TestSeedlotForms.owner("00012797", "00", new java.math.BigDecimal("60")),
      TestSeedlotForms.owner("00012797", "01", new java.math.BigDecimal("30")));

  SeedlotSubmissionValidationException ex =
      assertThrows(SeedlotSubmissionValidationException.class,
          () -> service.validateSeedlotForm(seedlot, form));
  org.junit.jupiter.api.Assertions.assertTrue(
      ex.getErrors().stream().anyMatch(e -> e.fieldId().startsWith("seedlotFormOwnershipDtoList")));
}

@Test
void owners_reservedPlusSurplusExceedsOwned_isRejected() {
  Seedlot seedlot = validSeedlot();
  stubValidOrchard();
  stubValidForestClient();
  lenient().when(methodOfPaymentRepository.existsById(org.mockito.ArgumentMatchers.anyString())).thenReturn(true);
  lenient().when(coneCollectionMethodRepository.existsById(org.mockito.ArgumentMatchers.anyInt())).thenReturn(true);

  // one owner owns 100, reserves 80 + surplus 30 = 110 > 100
  var owner = TestSeedlotForms.ownerFull(
      "00012797", "00", new java.math.BigDecimal("100"),
      new java.math.BigDecimal("80"), new java.math.BigDecimal("30"));
  var form = TestSeedlotForms.withOwners(owner);

  SeedlotSubmissionValidationException ex =
      assertThrows(SeedlotSubmissionValidationException.class,
          () -> service.validateSeedlotForm(seedlot, form));
  org.junit.jupiter.api.Assertions.assertFalse(ex.getErrors().isEmpty());
}
```

> Add `owner(...)`, `ownerFull(...)`, `withOwners(...)` fixture builders constructing `SeedlotFormOwnershipDto` with real values (`ownerClientNumber, ownerLocnCode, originalPctOwned, originalPctRsrvd, originalPctSrpls, methodOfPaymentCode, sparFundSrceCode`). `owner(...)` defaults reserved/surplus to 0 and uses a valid payment code (e.g. `"ITC"` — confirm a real code or just rely on the mocked `existsById==true`).

- [ ] **Step 2: Run, verify fail**

Run: `./mvnw test -Dtest=SeedlotFormValidationServiceTest#owners_percentDoesNotSumTo100_isRejected+owners_reservedPlusSurplusExceedsOwned_isRejected`
Expected: FAIL.

- [ ] **Step 3: Implement `validateOwnershipStep`**

```java
private void validateOwnershipStep(
    SeedlotFormSubmissionDto form, List<SeedlotValidationError> errors) {
  var owners = form.seedlotFormOwnershipDtoList();
  if (owners == null || owners.isEmpty()) {
    return;
  }

  java.math.BigDecimal totalOwned = java.math.BigDecimal.ZERO;
  java.util.Set<String> seenPairs = new java.util.HashSet<>();

  for (int i = 0; i < owners.size(); i++) {
    var o = owners.get(i);
    String base = "seedlotFormOwnershipDtoList[" + i + "]";

    // OW1 client/location
    validateClientLocation(
        o.ownerClientNumber(), o.ownerLocnCode(), base + ".ownerClientNumber", errors);

    // OW2 payment code
    if (o.methodOfPaymentCode() != null
        && !methodOfPaymentRepository.existsById(o.methodOfPaymentCode())) {
      errors.add(
          new SeedlotValidationError(
              base + ".methodOfPaymentCode",
              "Invalid method of payment code: " + o.methodOfPaymentCode()));
    }

    // OW5 duplicate pair
    if (o.ownerClientNumber() != null && o.ownerLocnCode() != null) {
      String key = o.ownerClientNumber() + "|" + o.ownerLocnCode();
      if (!seenPairs.add(key)) {
        errors.add(
            new SeedlotValidationError(
                base + ".ownerClientNumber", "Duplicate owner client/location: " + key));
      }
    }

    // OW4 reserved + surplus <= owned, each within 0–100
    java.math.BigDecimal owned = nz(o.originalPctOwned());
    java.math.BigDecimal rsrvd = nz(o.originalPctRsrvd());
    java.math.BigDecimal srpls = nz(o.originalPctSrpls());
    if (rsrvd.add(srpls).compareTo(owned) > 0) {
      errors.add(
          new SeedlotValidationError(
              base + ".originalPctRsrvd",
              "Reserved + surplus percentage cannot exceed the owned percentage."));
    }
    totalOwned = totalOwned.add(owned);
  }

  // OW3 owned sums to 100
  if (totalOwned.compareTo(new java.math.BigDecimal("100")) != 0) {
    errors.add(
        new SeedlotValidationError(
            "seedlotFormOwnershipDtoList",
            "Total owned percentage across owners must equal 100, was " + totalOwned + "."));
  }
}

private java.math.BigDecimal nz(java.math.BigDecimal v) {
  return v == null ? java.math.BigDecimal.ZERO : v;
}
```

- [ ] **Step 4: Run, verify pass**

Run: `./mvnw test -Dtest=SeedlotFormValidationServiceTest`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/ca/bc/gov/backendstartapi/service/SeedlotFormValidationService.java \
        backend/src/test/java/ca/bc/gov/backendstartapi/service/SeedlotFormValidationServiceTest.java \
        backend/src/test/java/ca/bc/gov/backendstartapi/service/TestSeedlotForms.java
git commit -m "feat(seedlot): validate owners client/location, payment code, percentages (#716)"
```

---

## Task 7: Interim validation — I1, I2-partial, I3

**Files:**
- Modify: `backend/.../service/SeedlotFormValidationService.java` (`validateInterimStep`)
- Test: `backend/.../service/SeedlotFormValidationServiceTest.java`

- [ ] **Step 1: Write the failing tests**

```java
@Test
void interim_otherFacilityWithoutDescription_isRejected() {
  Seedlot seedlot = validSeedlot();
  stubValidOrchard();
  stubValidForestClient();
  lenient().when(coneCollectionMethodRepository.existsById(org.mockito.ArgumentMatchers.anyInt())).thenReturn(true);
  lenient().when(methodOfPaymentRepository.existsById(org.mockito.ArgumentMatchers.anyString())).thenReturn(true);

  var form = TestSeedlotForms.withInterimFacility("OTH", null); // OTH but no description
  SeedlotSubmissionValidationException ex =
      assertThrows(SeedlotSubmissionValidationException.class,
          () -> service.validateSeedlotForm(seedlot, form));
  org.junit.jupiter.api.Assertions.assertTrue(
      ex.getErrors().stream().anyMatch(e -> e.fieldId().startsWith("seedlotFormInterimDto")));
}

@Test
void interim_endDateBeforeStart_isRejected() {
  Seedlot seedlot = validSeedlot();
  stubValidOrchard();
  stubValidForestClient();
  lenient().when(coneCollectionMethodRepository.existsById(org.mockito.ArgumentMatchers.anyInt())).thenReturn(true);
  lenient().when(methodOfPaymentRepository.existsById(org.mockito.ArgumentMatchers.anyString())).thenReturn(true);

  var form = TestSeedlotForms.withInterimDates(
      java.time.LocalDate.of(2024, 6, 10), java.time.LocalDate.of(2024, 6, 1));
  SeedlotSubmissionValidationException ex =
      assertThrows(SeedlotSubmissionValidationException.class,
          () -> service.validateSeedlotForm(seedlot, form));
  org.junit.jupiter.api.Assertions.assertFalse(ex.getErrors().isEmpty());
}
```

- [ ] **Step 2: Run, verify fail**

Run: `./mvnw test -Dtest=SeedlotFormValidationServiceTest#interim_otherFacilityWithoutDescription_isRejected+interim_endDateBeforeStart_isRejected`
Expected: FAIL.

- [ ] **Step 3: Implement `validateInterimStep`**

```java
private void validateInterimStep(
    SeedlotFormSubmissionDto form, List<SeedlotValidationError> errors) {
  var dto = form.seedlotFormInterimDto();
  if (dto == null) {
    return;
  }
  // I1 client/location
  validateClientLocation(
      dto.intermStrgClientNumber(),
      dto.intermStrgLocnCode(),
      "seedlotFormInterimDto.intermStrgClientNumber",
      errors);

  // I2 (partial) OTH requires description. No facility-code lookup table exists yet (deferred).
  if ("OTH".equals(dto.intermFacilityCode())
      && (dto.intermOtherFacilityDesc() == null || dto.intermOtherFacilityDesc().isEmpty())) {
    errors.add(
        new SeedlotValidationError(
            "seedlotFormInterimDto.intermOtherFacilityDesc",
            "A storage facility description is required when the facility type is 'Other'."));
  }

  // I3 date order
  if (dto.intermStrgStDate() != null
      && dto.intermStrgEndDate() != null
      && dto.intermStrgEndDate().isBefore(dto.intermStrgStDate())) {
    errors.add(
        new SeedlotValidationError(
            "seedlotFormInterimDto.intermStrgEndDate",
            "Interim storage end date must not be before the start date."));
  }
}
```

> The duplicate `OTH` check still present in `SeedlotService.saveSeedlotFormStep3` is now redundant defense-in-depth; leave it. Do not remove it in this plan.

- [ ] **Step 4: Run, verify pass**

Run: `./mvnw test -Dtest=SeedlotFormValidationServiceTest`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/ca/bc/gov/backendstartapi/service/SeedlotFormValidationService.java \
        backend/src/test/java/ca/bc/gov/backendstartapi/service/SeedlotFormValidationServiceTest.java \
        backend/src/test/java/ca/bc/gov/backendstartapi/service/TestSeedlotForms.java
git commit -m "feat(seedlot): validate interim step client/location, OTH description, dates (#716)"
```

---

## Task 8: Extraction validation — E1, E2, E3

**Files:**
- Modify: `backend/.../service/SeedlotFormValidationService.java` (`validateExtractionStep`)
- Test: `backend/.../service/SeedlotFormValidationServiceTest.java`

- [ ] **Step 1: Write the failing tests**

```java
@Test
void extraction_storageClientMissing_isRejected() {
  Seedlot seedlot = validSeedlot();
  stubValidOrchard();
  lenient().when(coneCollectionMethodRepository.existsById(org.mockito.ArgumentMatchers.anyInt())).thenReturn(true);
  lenient().when(methodOfPaymentRepository.existsById(org.mockito.ArgumentMatchers.anyString())).thenReturn(true);
  // storage client/location not found → 404 from forest client API
  lenient()
      .when(forestClientService.fetchSingleClientLocation("00000000", "00"))
      .thenThrow(new org.springframework.web.server.ResponseStatusException(
          org.springframework.http.HttpStatus.NOT_FOUND, "not found"));
  // every other client/location valid
  lenient()
      .when(forestClientService.fetchSingleClientLocation(
          org.mockito.ArgumentMatchers.argThat(c -> !"00000000".equals(c)),
          org.mockito.ArgumentMatchers.anyString()))
      .thenReturn(new ca.bc.gov.backendstartapi.dto.ForestClientLocationDto(
          /* fill with real constructor args, see fixture */ null));

  var form = TestSeedlotForms.withStorageClient("00000000", "00");
  SeedlotSubmissionValidationException ex =
      assertThrows(SeedlotSubmissionValidationException.class,
          () -> service.validateSeedlotForm(seedlot, form));
  org.junit.jupiter.api.Assertions.assertTrue(
      ex.getErrors().stream().anyMatch(e -> e.fieldId().startsWith("seedlotFormExtractionDto")));
}
```

> Inspect `ForestClientLocationDto.java` for its real constructor/record components and build a valid instance in the fixture (`TestSeedlotForms.validLocation()`); reuse it in `stubValidForestClient()`.

- [ ] **Step 2: Run, verify fail**

Run: `./mvnw test -Dtest=SeedlotFormValidationServiceTest#extraction_storageClientMissing_isRejected`
Expected: FAIL.

- [ ] **Step 3: Implement `validateExtractionStep`**

```java
private void validateExtractionStep(
    SeedlotFormSubmissionDto form, List<SeedlotValidationError> errors) {
  var dto = form.seedlotFormExtractionDto();
  if (dto == null) {
    return;
  }
  // E1 extractory client/location
  validateClientLocation(
      dto.extractoryClientNumber(),
      dto.extractoryLocnCode(),
      "seedlotFormExtractionDto.extractoryClientNumber",
      errors);
  // E2 storage client/location
  validateClientLocation(
      dto.storageClientNumber(),
      dto.storageLocnCode(),
      "seedlotFormExtractionDto.storageClientNumber",
      errors);
  // E3 date order
  if (dto.extractionStDate() != null
      && dto.extractionEndDate() != null
      && dto.extractionEndDate().isBefore(dto.extractionStDate())) {
    errors.add(
        new SeedlotValidationError(
            "seedlotFormExtractionDto.extractionEndDate",
            "Extraction end date must not be before the start date."));
  }
  if (dto.temporaryStrgStartDate() != null
      && dto.temporaryStrgEndDate() != null
      && dto.temporaryStrgEndDate().isBefore(dto.temporaryStrgStartDate())) {
    errors.add(
        new SeedlotValidationError(
            "seedlotFormExtractionDto.temporaryStrgEndDate",
            "Temporary storage end date must not be before the start date."));
  }
}
```

- [ ] **Step 4: Run, verify pass**

Run: `./mvnw test -Dtest=SeedlotFormValidationServiceTest`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/ca/bc/gov/backendstartapi/service/SeedlotFormValidationService.java \
        backend/src/test/java/ca/bc/gov/backendstartapi/service/SeedlotFormValidationServiceTest.java \
        backend/src/test/java/ca/bc/gov/backendstartapi/service/TestSeedlotForms.java
git commit -m "feat(seedlot): validate extraction step client/location and dates (#716)"
```

---

## Task 9: Aggregation + no-mutation integration tests

**Files:**
- Test: `backend/.../service/SeedlotFormValidationServiceTest.java`
- Test: `backend/.../service/SeedlotServiceTest.java` (existing)

- [ ] **Step 1: Aggregation test — all errors returned at once**

In `SeedlotFormValidationServiceTest`, add a test that supplies a form invalid in **two** steps (e.g. orchard species mismatch + collection end-before-start) and asserts `ex.getErrors().size() >= 2` with field IDs from both steps. Stub other collaborators valid.

```java
@Test
void validate_collectsErrorsAcrossMultipleSteps() {
  Seedlot seedlot = validSeedlot(); // vegCode "PLI"
  // orchard mismatch
  ca.bc.gov.backendstartapi.dto.OrchardDto orchard = new ca.bc.gov.backendstartapi.dto.OrchardDto();
  orchard.setId("405");
  orchard.setVegetationCode("FDC");
  lenient().when(oracleApiProvider.findOrchardById("405")).thenReturn(java.util.Optional.of(orchard));
  lenient().when(orchardService.findSpuIdByOrchard("405"))
      .thenReturn(java.util.Optional.of(new ca.bc.gov.backendstartapi.entity.ActiveOrchardSpuEntity()));
  lenient().when(gameticMethodologyRepository.existsById(org.mockito.ArgumentMatchers.anyString())).thenReturn(true);
  stubValidForestClient();
  lenient().when(coneCollectionMethodRepository.existsById(org.mockito.ArgumentMatchers.anyInt())).thenReturn(true);
  lenient().when(methodOfPaymentRepository.existsById(org.mockito.ArgumentMatchers.anyString())).thenReturn(true);

  var form = TestSeedlotForms.withOrchardAndCollectionDates(
      "405", java.time.LocalDate.of(2024, 5, 10), java.time.LocalDate.of(2024, 5, 1));

  SeedlotSubmissionValidationException ex =
      assertThrows(SeedlotSubmissionValidationException.class,
          () -> service.validateSeedlotForm(seedlot, form));
  org.junit.jupiter.api.Assertions.assertTrue(ex.getErrors().size() >= 2);
}
```

- [ ] **Step 2: No-mutation test in `SeedlotServiceTest`**

Add a test proving that when `seedlotFormValidationService.validateSeedlotForm(...)` throws, `updateSeedlotWithForm` does **not** call `seedlotRepository.save(...)` nor the step services. Mirror the existing `SeedlotServiceTest` mocking style; add `@Mock SeedlotFormValidationService seedlotFormValidationService` and include it in the service construction.

```java
@Test
void updateSeedlotWithForm_invalid_doesNotPersist() {
  // arrange: seedlot exists
  Seedlot seedlot = new Seedlot("63000");
  // set a status entity so getSeedlotStatus().getSeedlotStatusCode() works — copy the
  // existing pattern from other SeedlotServiceTest cases that build a Seedlot with status.
  when(seedlotRepository.findById("63000")).thenReturn(java.util.Optional.of(seedlot));
  doThrow(new SeedlotSubmissionValidationException(
              java.util.List.of(new SeedlotValidationError("x", "bad"))))
      .when(seedlotFormValidationService)
      .validateSeedlotForm(org.mockito.ArgumentMatchers.eq(seedlot), org.mockito.ArgumentMatchers.any());

  assertThrows(
      SeedlotSubmissionValidationException.class,
      () -> seedlotService.updateSeedlotWithForm("63000", someForm, false, true, "SUB"));

  verify(seedlotRepository, never()).save(org.mockito.ArgumentMatchers.any());
}
```

> Copy `someForm`, the status setup, and the full mock list from existing passing `SeedlotServiceTest` cases. The key assertions are the throw and `verify(...never()).save(...)`.

- [ ] **Step 3: Run the full suite**

Run: `./mvnw test -Dtest=SeedlotFormValidationServiceTest+SeedlotServiceTest+RestExceptionEndpointTest+SeedlotEndpointTest`
Expected: PASS.

- [ ] **Step 4: Run the whole backend test suite (regression)**

Run: `./mvnw test`
Expected: BUILD SUCCESS — no existing tests broken by the new pre-mutation validation. If any existing `updateSeedlotWithForm` test now fails because the new `@Mock`/bean isn't supplied, add the validation-service mock (stubbed to do nothing) to that test.

- [ ] **Step 5: Commit**

```bash
git add backend/src/test/java/ca/bc/gov/backendstartapi/service/SeedlotFormValidationServiceTest.java \
        backend/src/test/java/ca/bc/gov/backendstartapi/service/SeedlotServiceTest.java
git commit -m "test(seedlot): aggregate-all-errors + no-persist-on-invalid coverage (#716)"
```

---

## Phase 2 / Follow-ups (NOT in this plan — documented for the ticket)

These are intentionally deferred; each needs a decision or further investigation before implementing:

1. **Parent-tree validation (P1/P2/P3):** validate each `parentTreeId`/`parentTreeNumber` is valid for the selected orchard (Oracle lookup), genetic-worth codes are valid, and counts/proportions are in range. Deferred due to per-submission Oracle cost and the unconfirmed shape of the orchard's valid-parent-tree data. Investigate `OrchardService.findParentTreeGeneticQualityData` / `OracleApiProvider.findOrchardParentTreeGeneticQualityData` as the source.
2. **Interim facility-code table (full I2):** no lookup table exists for storage facility types. Decide between adding a code table + repository or validating against a legacy/Oracle list, then validate `intermFacilityCode` like the other code fields.
3. **Caching the orchard fetch:** `validateOrchardStep` calls `findOrchardById`, and `setBecValues` calls it again later. Optional optimization: store the fetched `OrchardDto` in `SeedlotSaveInMemoryDto` and reuse.
4. **TSC review path:** `updateSeedlotWithForm` is also called from the review form (`isFromRegularForm=false`). Confirm whether the same validations should apply to the review/override path or only the regular submission.

---

## Self-review notes

- **Spec coverage:** X1 (Task 1), structured 400 / error contract §4 (Task 2), service architecture §3 (Task 3), O1–O3/O5–O7 (Task 4), C1–C4 (Task 5), OW1–OW5 (Task 6), I1/I2-partial/I3 (Task 7), E1–E3 (Task 8), aggregate-all + no-mutation §6 (Task 9). Deferred items (P-series, full I2) explicitly listed in Phase 2 with rationale, matching spec §5.
- **X2/X3** (seedlot existence, status conflict) are already implemented in `updateSeedlotWithForm` (`SeedlotNotFoundException`, `canDelete`) and need no new task.
- **Known fill-ins for the implementer (mechanical, not placeholders):** the exact constructor arg lists for `SeedlotFormSubmissionDto`, `SeedlotFormOwnershipDto`, `ForestClientLocationDto`, and the existing `SeedlotServiceTest` status/mock setup must be copied from the real files when writing `TestSeedlotForms` and the no-mutation test. Each task notes exactly which file to read.
