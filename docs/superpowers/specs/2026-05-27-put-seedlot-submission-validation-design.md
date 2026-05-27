# PUT Seedlot A-Class Submission — Backend Validation Design

- **Issue:** [bcgov/nr-spar#716](https://github.com/bcgov/nr-spar/issues/716) — *PUT seedlot form endpoint validation*
- **Endpoint:** `PUT /api/seedlots/{seedlotNumber}/a-class-submission` (formerly `/registration-form`)
- **Branch:** `feat/716-put-seedlot-api`
- **Date:** 2026-05-27
- **Scope of ticket:** investigate what backend validations are needed. This document is the investigation **plus** a concrete implementation design; the implementation itself is tracked in the follow-up plan.

---

## 1. Background

The submission endpoint receives the entire A-class seedlot form (6 steps + applicant/TSC-review data) and persists it across the `seedlot` table and ~8 child tables in a single `@Transactional` call. Today it relies almost entirely on the frontend to send valid data. The ticket calls this out directly:

> "We currently do not check if an orchard actually belongs to a species."

### Current code path

| Layer | File | Notes |
|---|---|---|
| Endpoint | `backend/.../endpoint/SeedlotEndpoint.java` → `submitSeedlotForm` (~L451) | `@RequestBody SeedlotFormSubmissionDto form` — **no `@Valid`** |
| Service | `backend/.../service/SeedlotService.java` → `updateSeedlotWithForm` (~L721) | Orchestrates steps 1–6, then BEC/area-of-use/genetic-worth calc, then `seedlotRepository.save` |
| Step 4 | `backend/.../service/SeedlotOrchardService.java` → `saveSeedlotFormStep4` | Saves orchard IDs verbatim; no existence/species/active check |
| Request DTO | `backend/.../dto/SeedlotFormSubmissionDto.java` + nested step DTOs | `@NotNull`/`@Email` present but never enforced (see below) |

### Root-level finding

Because the `@RequestBody` is **not** annotated `@Valid`, the `@NotNull` / `@Email` constraints already declared on the step DTOs are *never triggered*. The service begins mutating the `Seedlot` aggregate and deleting/re-inserting child rows with no gatekeeping. Invalid input either persists silently or fails late with an opaque error (e.g. `OracleApiProviderException`, `NoSpuForOrchardException`) **after** partial writes within the transaction.

---

## 2. Validation Gap Catalogue

Severity legend: **B** = blocking (reject with 400), **W** = warning/soft (log; do not block unless product decides otherwise). Every item below is currently **absent** on the backend.

### Cross-cutting

| # | Validation | Severity | Reference data |
|---|---|---|---|
| X1 | Apply structural `@NotNull` constraints already declared on DTOs (add `@Valid` to `@RequestBody`) | B | — |
| X2 | `seedlotNumber` path param resolves to an existing `Seedlot` | B | `SeedlotRepository` (already throws `SeedlotNotFoundException`) |
| X3 | Status permits edit (existing `canDelete` logic) — keep, surface as a clear conflict | B | existing |

### Step 4 — Orchard ⭐ (the ticket's named example)

| # | Validation | Severity | Reference data |
|---|---|---|---|
| O1 | `primaryOrchardId` exists in Oracle | B | `OracleApiProvider.findOrchardById` |
| O2 | **Orchard `vegetationCode` == `seedlot.vegetationCode`** (orchard belongs to species) | B | `OrchardDto.vegetationCode` vs `Seedlot.vegetationCode` |
| O3 | Orchard is active / not retired | B | `OrchardService.findSpuIdByOrchard` (active), `ActiveOrchardSpuEntity.retired` |
| O4 | Same checks (O1–O3) for `secondaryOrchardId` when present | B | as above |
| O5 | `femaleGameticMthdCode`, `maleGameticMthdCode` exist in lookup | B | `GameticMethodologyRepository` |
| O6 | `pollenContaminationMthdCode` valid when present | B | `GameticMethodologyRepository` / relevant code table |
| O7 | If `pollenContaminationInd == true`, pct (0–100) and/or BV present & consistent | B | — |

> Note: `findOrchardById` is *already called* inside `setBecValues`, so the orchard `vegetationCode` is fetched anyway — O1/O2 cost no extra round-trip if validation reuses the in-memory result.

### Step 1 — Collection

| # | Validation | Severity | Reference data |
|---|---|---|---|
| C1 | `collectionClientNumber` + `collectionLocnCode` exist together | B | `ForestClientService.fetchSingleClientLocation` |
| C2 | Each `coneCollectionMethodCodes` entry valid | B | `ConeCollectionMethodRepository` |
| C3 | `collectionEndDate >= collectionStartDate`; not in the future | B | — |
| C4 | `noOfContainers`, `volPerContainer`, `clctnVolume` > 0 | B | — |

### Step 2 — Owners

| # | Validation | Severity | Reference data |
|---|---|---|---|
| OW1 | `ownerClientNumber` + `ownerLocnCode` exist together (each owner) | B | `ForestClientService.fetchSingleClientLocation` |
| OW2 | `methodOfPaymentCode` valid (each owner) | B | `MethodOfPaymentRepository` |
| OW3 | Sum of `originalPctOwned` across owners == 100 | B | — |
| OW4 | Per owner: `originalPctRsrvd + originalPctSrpls <= originalPctOwned`; each 0–100 | B | — |
| OW5 | No duplicate owner client+location pairs | B | — |

### Step 3 — Interim storage

| # | Validation | Severity | Reference data |
|---|---|---|---|
| I1 | `intermStrgClientNumber` + `intermStrgLocnCode` exist together | B | `ForestClientService.fetchSingleClientLocation` |
| I2 | `intermFacilityCode` valid; if `OTH` then `intermOtherFacilityDesc` required (latter already checked) | B | **no lookup table exists — see §5** |
| I3 | `intermStrgEndDate >= intermStrgStDate` | B | — |

### Step 5 — Parent trees / SMP

| # | Validation | Severity | Reference data |
|---|---|---|---|
| P1 | Each `parentTreeId` / `parentTreeNumber` valid for the selected orchard | B | Oracle parent-tree data per orchard (`OracleApiProvider.findOrchardParentTreeGeneticQualityData`) |
| P2 | Genetic-worth codes in `parentTreeGeneticQualities` valid | B | `GeneticWorthRepository` |
| P3 | `coneCount`, `pollenCount`, `proportion`, `smpSuccessPct`, pct fields non-negative / within range | B | — |

### Step 6 — Extraction

| # | Validation | Severity | Reference data |
|---|---|---|---|
| E1 | `extractoryClientNumber` + `extractoryLocnCode` exist together | B | `ForestClientService.fetchSingleClientLocation` |
| E2 | `storageClientNumber` + `storageLocnCode` exist together | B | `ForestClientService.fetchSingleClientLocation` |
| E3 | `extractionEndDate >= extractionStDate`; `temporaryStrgEndDate >= temporaryStrgStartDate` | B | — |

---

## 3. Chosen Architecture (Approach A)

A dedicated **`SeedlotFormValidationService`**, invoked **first** inside `updateSeedlotWithForm`, **before any mutation**. It collects *all* validation errors into a list and throws a single exception, so the caller gets every problem at once and the database is never partially written on invalid input.

```
submitSeedlotForm (endpoint, + @Valid on @RequestBody  ← fires X1)
        │
        ▼
updateSeedlotWithForm (SeedlotService)
        │  1. load Seedlot (X2), determine canDelete (X3)
        │  2. ── seedlotFormValidationService.validate(seedlot, form, inMemoryDto) ──┐
        │                                                                            │ collects ALL errors,
        │                                                                            │ throws SeedlotFormValidationException
        │  3. step1..step6 saves (unchanged)                                         │ (now carries List<FieldError>) → 400
        │  4. BEC / area-of-use / genetic-worth calc (unchanged)
        ▼
   seedlotRepository.save
```

### Components

- **`SeedlotFormValidationService`** (new) — one `validate(...)` entry point delegating to a private method per step (`validateCollectionStep`, `validateOwnershipStep`, `validateInterimStep`, `validateOrchardStep`, `validateParentTreeStep`, `validateExtractionStep`, plus cross-cutting). Each appends to a shared `List<SeedlotFormValidationFieldError>`; nothing throws mid-validation.
- **Reused collaborators** (injected): `ForestClientService`, `OracleApiProvider` / `OrchardService`, and the code-table repositories (`GameticMethodologyRepository`, `ConeCollectionMethodRepository`, `MethodOfPaymentRepository`, `GeneticWorthRepository`).
- **`SeedlotFormValidationException`** (extended) — add a constructor taking `List<FieldError>` so the 400 body is structured (it currently only accepts a single `String`). Wire it to the existing `ValidationExceptionResponse` shape so clients get field-level detail.
- **`SeedlotSaveInMemoryDto`** (existing) — cache the orchard `OrchardDto` / SPU fetched during validation so `setBecValues` does not re-query Oracle.

### Why not B or C

- **B (inline per step):** scatters logic, surfaces errors one-at-a-time mid-transaction, harder to unit test.
- **C (`@Valid` / custom annotations only):** cannot perform DB/Oracle reference checks (orchard↔species, client existence) — exactly the checks the ticket is about. We still adopt its cheap part (X1) alongside Approach A.

---

## 4. Error Handling & Contract

- **400 Bad Request** with a structured body listing every failed validation: `{ field, code, message }` per error, mirroring `ValidationExceptionResponse`.
- **404** unchanged for missing seedlot (`SeedlotNotFoundException`).
- **409** unchanged for status/data conflict (`SeedlotConflictDataException`).
- Validation runs **before** any write; on failure the transaction performs no mutations.
- Forest-client / Oracle lookups that fail due to *upstream errors* (network, 5xx) must be distinguished from *validation failures* (not found) — the former should not be reported as a user validation error.

---

## 5. Open Questions / Pre-existing Gaps

1. **Interim facility codes (I2):** there is no lookup entity/table for storage facility types — only the hardcoded `OTH` branch. Options: (a) add a code table + repo, (b) validate against an Oracle/legacy list, (c) keep `OTH`-only for now and defer. **Needs product input.**
2. **Owner percentage rule (OW3):** confirm the business rule is exactly "sum == 100" vs "<= 100" for multi-owner draft states.
3. **Severity confirmation:** all items above are proposed as **blocking**. Product should confirm none should be downgraded to warnings (e.g. dates in the future).
4. **Parent-tree validation cost (P1):** validating every parent tree against Oracle per submission may be expensive; consider batch lookup / caching of the orchard's valid parent-tree set.

---

## 6. Testing Strategy

- Unit-test `SeedlotFormValidationService` per step with table-driven cases (valid + each invalid path), mocking `ForestClientService` / `OracleApiProvider` / repositories.
- A focused test proving the **orchard↔species mismatch** (O2) is rejected — the ticket's headline case.
- Test that *multiple* errors across steps are returned together in one 400.
- Endpoint/integration test proving no DB mutation occurs on invalid input.
- Regression test that valid submissions still succeed unchanged.
