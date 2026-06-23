# Design: Optimistic Locking Conflict Notification for Testing Activities (#2516)

- **Issue:** [#2516](https://github.com/bcgov/nr-spar/issues/2516) — Error message for optimistic locking
- **Branch:** `feat/2516-error-message-for-optimistic-locking`
- **Date:** 2026-06-22
- **Scope:** Full-stack. CONSEP testing activities: **Moisture Content** and **Purity** edit screens.

## Problem

When a user is editing a testing activity (moisture or purity) that another user has
concurrently modified, the current code silently overwrites the other user's changes.
`ActivityService.updateActivityField()` does a blind `findById` + `save` with no
version/timestamp check.

The user needs:

- A notification that the record has been changed by another user.
- The ability to refresh the screen to view the latest data.
- A warning that their current unsaved edits will be discarded.

## Established pattern to mirror

The germination test screen already implements timestamp-based optimistic locking
(issue #2447):

- DTOs carry an `updateTimestamp` (the value read by the client).
- `ActivityRepository.updateGerminationTestActivity(...)` is a `@Modifying` query that
  updates `WHERE riaKey = ? AND updateTimestamp = ?` and returns the affected row count.
- The service throws `409 CONFLICT` when `rows == 0`
  (message: `"Activity was modified by another user; reload and retry"`).

The Seedlot Class A registration screen already implements the conflict **UX** we will
reuse: a Carbon `ActionableNotification` banner (title "Conflict detected", a bulleted
suggestion listing that saving is disabled, that the user should reload, and that unsaved
changes will be lost) plus a "Reload" action button, with saving locked while in the
conflict state.

This design applies the #2447 backend mechanism and the Seedlot UX to the moisture and
purity activity screens.

## Important constraint: per-field autosave

The moisture and purity screens autosave on every field change — each `onChange` on the
date pickers, category combobox, and comment textarea calls
`handleUpdateActivityRecord(...)` which immediately fires a PATCH. There is no explicit
"Save" button for the activity record. Two consequences:

1. After every successful PATCH the server's `updateTimestamp` changes. The frontend
   **must** capture the new timestamp from the PATCH response and store it, otherwise the
   next field edit would send a now-stale timestamp and falsely 409 against itself.
2. On conflict the frontend must **lock further autosaves** until the user reloads, to
   avoid repeated 409s and to honour the "saving disabled" semantics.

## Backend changes (oracle-api)

All paths under `oracle-api/src/main/java/ca/bc/gov/oracleapi/`.

1. **`dto/consep/ActivityFormDto.java`** — add `@NotNull LocalDateTime updateTimestamp`
   (the timestamp the client read; used for the optimistic-lock comparison). Mirrors the
   germination update DTO's timestamp field.

2. **`dto/consep/MoistureContentConesDto.java`** and **`dto/consep/PurityTestDto.java`** —
   add an `updateTimestamp` field (with the same `@JsonFormat` pattern used elsewhere) so
   the GET response hands the client a timestamp to echo back.

3. **`service/consep/MoistureContentService.java`** and
   **`service/consep/PurityTestService.java`** — in the DTO construction, supply
   `activityData.get().getUpdateTimestamp()` for the new field.

4. **`repository/consep/ActivityRepository.java`** — add a `@Modifying` query mirroring
   `updateGerminationTestActivity`, scoped to the moisture/purity fields:

   ```java
   UPDATE ActivityEntity a
      SET a.actualBeginDateTime = :actualBeginDateTime,
          a.actualEndDateTime = :actualEndDateTime,
          a.testCategoryCode = :testCategoryCode,
          a.riaComment = :riaComment,
          a.updateTimestamp = CURRENT_TIMESTAMP
    WHERE a.riaKey = :riaKey
      AND a.updateTimestamp = :expectedUpdateTimestamp
   ```

   Returns the affected row count (0 means the row changed since it was read).

5. **`service/consep/ActivityService.updateActivityField(...)`** — replace the blind
   `findById`/`save` with the locking update:
   - Call the new repository method with `activityFormDto.updateTimestamp()`.
   - If `rows == 0`: if `activityRepository.existsById(riaKey)` → throw
     `409 CONFLICT` ("Activity was modified by another user; reload and retry");
     otherwise throw `404 NOT_FOUND`.
   - On success, re-read and return the updated entity so the response carries the new
     `updateTimestamp` for the frontend to store.

   Note: this removes the previous "create a new activity if none exists" fallback. For
   the moisture/purity edit screens the activity row always exists (it is created when the
   test activity is added), so the fallback was defensive and is replaced by a clear 404.

6. **`endpoint/consep/MoistureContentConesEndpoint.java`** and
   **`endpoint/consep/PurityTestsEndpoint.java`** — add a `409` entry to the PATCH
   `@ApiResponses`.

## Frontend changes (frontend)

All paths under `frontend/src/`.

1. **`types/consep/TestingActivityType.ts`** — add `updateTimestamp?: string` to
   `ActivityRecordType` (inherited by `TestingActivityType`).

2. **Shared conflict UX** — extract a small reusable unit so both screens share identical
   behaviour and the view files stay focused. Preferred shape: a `useActivityConflict`
   hook returning `{ isConflict, setConflict, clearConflict }` plus a presentational
   `ConflictNotification` component (Carbon `ActionableNotification`) under
   `components/CONSEP/`. Exact split to be finalized in the implementation plan.
   - Banner content reuses the Seedlot wording: title "Conflict detected"; bullets:
     "Saving is temporarily disabled to prevent overwriting", "Reload the page to view
     the latest information and continue editing", "Any unsaved changes will be lost";
     action button label "Reload".

3. **`views/CONSEP/TestingActivities/MoistureContent/index.tsx`** and
   **`views/CONSEP/TestingActivities/PurityContent/index.tsx`** — identical wiring in each:
   - On query success, store `updateTimestamp` from the response into `activityRecord`.
   - Include `updateTimestamp` in the PATCH payload (already sent as part of
     `activityRecord` spread).
   - `updateActivityRecordMutation.onSuccess(response)` — write the returned
     `updateTimestamp` back into `activityRecord` state.
   - `updateActivityRecordMutation.onError` — if `err.response?.status === 409`, set the
     conflict state (render the banner, lock autosave); otherwise keep the existing
     generic error alert.
   - `handleUpdateActivityRecord` — early-return (skip the PATCH) while in conflict state.
   - "Reload" action → `testActivityQuery.refetch()`, then clear the conflict state once
     fresh data (and a fresh timestamp) is loaded.

## Error handling

- 409 → conflict banner + autosave lock + reload affordance (the feature's core path).
- 404 → existing not-found navigation (`ROUTES.FOUR_OH_FOUR`) is unaffected.
- Other/transient errors → existing generic inline error alert, unchanged.

## Testing

**Backend**
- `ActivityService.updateActivityField`: timestamp match updates and returns the entity;
  timestamp mismatch on an existing row throws 409; missing row throws 404.
- `ActivityRepository`: the locking update affects 1 row when the timestamp matches and 0
  rows when it does not.
- Endpoint tests assert the 409 status maps through.

**Frontend**
- Moisture and Purity views: a mocked 409 renders the conflict banner and disables further
  autosaves; clicking "Reload" triggers `refetch` and clears the conflict; a successful
  PATCH writes the returned `updateTimestamp` back so a subsequent edit does not falsely
  conflict.

## Risks

- The per-field autosave + timestamp write-back must be correct, or normal editing would
  raise false conflicts. This is the highest-risk area and is covered explicitly by the
  frontend tests above.
- Removing the "create new activity" fallback in `updateActivityField` changes behaviour
  for a non-existent riaKey from silent create to 404. Confirmed acceptable because the
  edit screens only ever operate on an existing activity row.

## Out of scope

- Germination test screen (backend already locked; no frontend screen exists yet).
- Any change to the activity *create* flow.
- Real-time presence/locking ("user X is editing") — this is save-time conflict detection
  only, per the issue's acceptance criteria.
