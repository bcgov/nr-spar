# Optimistic Locking Conflict Notification (#2516) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When another user has concurrently changed a moisture or purity testing activity, the save fails with a clear conflict notification that lets the user reload the latest data and warns that unsaved edits will be discarded.

**Architecture:** Mirror the germination test optimistic-locking mechanism (#2447): the GET response carries an `updateTimestamp`, the client echoes it back on PATCH, and the backend does a conditional `UPDATE … WHERE updateTimestamp = ?` that returns a 409 when the row changed. The frontend reuses the Seedlot Class A conflict UX (a Carbon `ActionableNotification` banner with a Reload button) and locks the per-field autosave until the user reloads.

**Tech Stack:** Backend — Spring Boot, Spring Data JPA, JUnit 5 + Mockito (oracle-api). Frontend — React 18, TypeScript, TanStack Query 5, Carbon UI, Vitest + Testing Library.

## Global Constraints

- Backend conflict message string, copied verbatim from the germination path: `"Activity was modified by another user; reload and retry"`.
- `updateTimestamp` JSON format on all DTOs: `@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")` (matches `ActivityEntity.updateTimestamp`).
- HTTP semantics: stale-timestamp on an existing row → `409 CONFLICT`; missing row → `404 NOT_FOUND`.
- Frontend conflict banner copy reuses Seedlot wording (title "Conflict detected", Reload button) — see Task 6.
- Backend build/test command: `cd oracle-api && ./mvnw test`. Single class: `./mvnw test -Dtest=ActivityServiceTest`.
- Frontend test command: `cd frontend && npx vitest run <path>`.
- Scope: Moisture Content and Purity screens only. Do not touch the germination or create-activity flows.

---

### Task 1: Backend — thread `updateTimestamp` through DTOs and GET responses

**Files:**
- Modify: `oracle-api/src/main/java/ca/bc/gov/oracleapi/dto/consep/ActivityFormDto.java`
- Modify: `oracle-api/src/main/java/ca/bc/gov/oracleapi/dto/consep/MoistureContentConesDto.java`
- Modify: `oracle-api/src/main/java/ca/bc/gov/oracleapi/dto/consep/PurityTestDto.java`
- Modify: `oracle-api/src/main/java/ca/bc/gov/oracleapi/service/consep/MoistureContentService.java:94-111`
- Modify: `oracle-api/src/main/java/ca/bc/gov/oracleapi/service/consep/PurityTestService.java:102-119`

**Interfaces:**
- Produces: `ActivityFormDto.updateTimestamp()` (`LocalDateTime`, `@NotNull`); `MoistureContentConesDto.updateTimestamp()` and `PurityTestDto.updateTimestamp()` (`LocalDateTime`). Tasks 2 and 3 consume `ActivityFormDto.updateTimestamp()`.

- [ ] **Step 1: Add the field to `ActivityFormDto`**

```java
@Schema(description = "JSON object with the values to be updated in the Activity table")
public record ActivityFormDto(
    @NotNull String testCategoryCode,
    @NotNull LocalDateTime actualBeginDateTime,
    @NotNull LocalDateTime actualEndDateTime,
    String riaComment,
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "The update_timestamp the client read; used for optimistic locking",
        example = "2025-01-18T16:00:00")
    @NotNull LocalDateTime updateTimestamp
) {}
```

Add the import `import com.fasterxml.jackson.annotation.JsonFormat;` to `ActivityFormDto.java`.

- [ ] **Step 2: Add the field to the two GET DTOs**

In `MoistureContentConesDto.java`, insert after the `actualEndDateTime` field and before `standardActivityType`:

```java
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Row update timestamp for optimistic locking", example = "2025-01-18T16:00:00")
    LocalDateTime updateTimestamp,
```

In `PurityTestDto.java`, insert after the `actualEndDateTime` field and before `replicatesList`:

```java
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Row update timestamp for optimistic locking", example = "2025-01-18T16:00:00")
    LocalDateTime updateTimestamp,
```

- [ ] **Step 3: Populate it in the service constructors**

In `MoistureContentService.java`, the `new MoistureContentConesDto(...)` call — insert `activityData.get().getUpdateTimestamp(),` between the `getActualEndDateTime()` argument and the `getStandardActivityId()` argument:

```java
            activityData.get().getActualEndDateTime(),
            activityData.get().getUpdateTimestamp(),
            activityData.get().getStandardActivityId(),
            replicatesList);
```

In `PurityTestService.java`, the `new PurityTestDto(...)` call — insert `activityData.get().getUpdateTimestamp(),` between the `getActualEndDateTime()` argument and `replicatesList`:

```java
            activityData.get().getActualEndDateTime(),
            activityData.get().getUpdateTimestamp(),
            replicatesList,
            debrisList);
```

- [ ] **Step 4: Compile to verify the records and constructors line up**

Run: `cd oracle-api && ./mvnw -q compile`
Expected: BUILD SUCCESS (no constructor-arity errors). Existing tests will not yet compile — that is fixed in Task 3.

- [ ] **Step 5: Commit**

```bash
git add oracle-api/src/main/java/ca/bc/gov/oracleapi/dto/consep/ActivityFormDto.java \
        oracle-api/src/main/java/ca/bc/gov/oracleapi/dto/consep/MoistureContentConesDto.java \
        oracle-api/src/main/java/ca/bc/gov/oracleapi/dto/consep/PurityTestDto.java \
        oracle-api/src/main/java/ca/bc/gov/oracleapi/service/consep/MoistureContentService.java \
        oracle-api/src/main/java/ca/bc/gov/oracleapi/service/consep/PurityTestService.java
git commit -m "feat: #2516 expose activity updateTimestamp on testing activity DTOs"
```

---

### Task 2: Backend — add the optimistic-locking update query

**Files:**
- Modify: `oracle-api/src/main/java/ca/bc/gov/oracleapi/repository/consep/ActivityRepository.java`

**Interfaces:**
- Produces: `int ActivityRepository.updateActivityFieldWithLock(BigDecimal riaKey, LocalDateTime actualBeginDateTime, LocalDateTime actualEndDateTime, String testCategoryCode, String riaComment, LocalDateTime expectedUpdateTimestamp)` — returns rows updated (0 means stale). Consumed by Task 3.

- [ ] **Step 1: Add the `@Modifying` query**

Add this method to `ActivityRepository` (alongside `updateGerminationTestActivity`, which it mirrors):

```java
  /**
   * Update moisture/purity activity dates, category, and comment with optimistic locking
   * (issue #2516).
   *
   * @return rows updated; 0 means the row changed since it was read (409).
   */
  @Modifying
  @Transactional
  @Query("""
      UPDATE ActivityEntity a
         SET a.actualBeginDateTime = :actualBeginDateTime,
             a.actualEndDateTime = :actualEndDateTime,
             a.testCategoryCode = :testCategoryCode,
             a.riaComment = :riaComment,
             a.updateTimestamp = CURRENT_TIMESTAMP
       WHERE a.riaKey = :riaKey
         AND a.updateTimestamp = :expectedUpdateTimestamp
      """)
  int updateActivityFieldWithLock(
      @Param("riaKey") BigDecimal riaKey,
      @Param("actualBeginDateTime") LocalDateTime actualBeginDateTime,
      @Param("actualEndDateTime") LocalDateTime actualEndDateTime,
      @Param("testCategoryCode") String testCategoryCode,
      @Param("riaComment") String riaComment,
      @Param("expectedUpdateTimestamp") LocalDateTime expectedUpdateTimestamp);
```

Ensure the imports `java.time.LocalDateTime`, `org.springframework.data.jpa.repository.Modifying`, `org.springframework.data.jpa.repository.Query`, `org.springframework.data.repository.query.Param`, and `org.springframework.transaction.annotation.Transactional` are present (most are already used by the germination method in this file).

- [ ] **Step 2: Compile**

Run: `cd oracle-api && ./mvnw -q compile`
Expected: BUILD SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add oracle-api/src/main/java/ca/bc/gov/oracleapi/repository/consep/ActivityRepository.java
git commit -m "feat: #2516 add optimistic-locking activity update query"
```

---

### Task 3: Backend — rework `updateActivityField` to enforce the lock

**Files:**
- Modify: `oracle-api/src/main/java/ca/bc/gov/oracleapi/service/consep/ActivityService.java:60-84`
- Modify: `oracle-api/src/test/java/ca/bc/gov/oracleapi/service/consep/ActivityServiceTest.java`

**Interfaces:**
- Consumes: `ActivityRepository.updateActivityFieldWithLock(...)` (Task 2), `ActivityFormDto.updateTimestamp()` (Task 1).
- Produces: `ActivityEntity ActivityService.updateActivityField(BigDecimal, ActivityFormDto)` — returns the reloaded entity (with the new `updateTimestamp`) on success; throws `ResponseStatusException(409)` on stale timestamp of an existing row; `ResponseStatusException(404)` if the row does not exist.

- [ ] **Step 1: Update the existing success test and add conflict/not-found tests**

In `ActivityServiceTest.java`, replace the body of `updateActivity_shouldSucceed()` and add two tests. The success test now drives the locking method:

```java
  @Test
  @DisplayName("Update activity should succeed when timestamp matches")
  void updateActivity_shouldSucceed() {
    LocalDateTime expected = LocalDateTime.parse("2013-09-01T00:00:00");

    ActivityFormDto activityDto = new ActivityFormDto(
        "STD",
        LocalDateTime.parse("2013-08-01T00:00:00"),
        LocalDateTime.parse("2013-09-01T00:00:00"),
        "Updated comment",
        expected
    );

    ActivityEntity reloaded = new ActivityEntity();
    reloaded.setRiaKey(riaKey);
    reloaded.setTestCategoryCode("STD");
    reloaded.setActualBeginDateTime(activityDto.actualBeginDateTime());
    reloaded.setActualEndDateTime(activityDto.actualEndDateTime());
    reloaded.setRiaComment("Updated comment");

    when(activityRepository.updateActivityFieldWithLock(
        eq(riaKey), any(), any(), eq("STD"), eq("Updated comment"), eq(expected)))
        .thenReturn(1);
    when(activityRepository.findById(riaKey)).thenReturn(Optional.of(reloaded));

    ActivityEntity result = activityService.updateActivityField(riaKey, activityDto);

    assertEquals("STD", result.getTestCategoryCode());
    assertEquals("Updated comment", result.getRiaComment());
    verify(activityRepository, times(1)).updateActivityFieldWithLock(
        eq(riaKey), any(), any(), eq("STD"), eq("Updated comment"), eq(expected));
    verify(activityRepository, never()).save(any(ActivityEntity.class));
  }

  @Test
  @DisplayName("Update activity throws 409 when timestamp is stale on an existing row")
  void updateActivity_staleTimestamp_throwsConflict() {
    LocalDateTime stale = LocalDateTime.parse("2013-09-01T00:00:00");
    ActivityFormDto activityDto = new ActivityFormDto(
        "STD",
        LocalDateTime.parse("2013-08-01T00:00:00"),
        LocalDateTime.parse("2013-09-01T00:00:00"),
        "Updated comment",
        stale
    );

    when(activityRepository.updateActivityFieldWithLock(
        any(), any(), any(), any(), any(), any())).thenReturn(0);
    when(activityRepository.existsById(riaKey)).thenReturn(true);

    ResponseStatusException exc = assertThrows(
        ResponseStatusException.class,
        () -> activityService.updateActivityField(riaKey, activityDto));

    assertEquals(HttpStatus.CONFLICT, exc.getStatusCode());
  }

  @Test
  @DisplayName("Update activity throws 404 when the row does not exist")
  void updateActivity_missingRow_throwsNotFound() {
    LocalDateTime ts = LocalDateTime.parse("2013-09-01T00:00:00");
    ActivityFormDto activityDto = new ActivityFormDto(
        "STD",
        LocalDateTime.parse("2013-08-01T00:00:00"),
        LocalDateTime.parse("2013-09-01T00:00:00"),
        "Updated comment",
        ts
    );

    when(activityRepository.updateActivityFieldWithLock(
        any(), any(), any(), any(), any(), any())).thenReturn(0);
    when(activityRepository.existsById(riaKey)).thenReturn(false);

    ResponseStatusException exc = assertThrows(
        ResponseStatusException.class,
        () -> activityService.updateActivityField(riaKey, activityDto));

    assertEquals(HttpStatus.NOT_FOUND, exc.getStatusCode());
  }
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd oracle-api && ./mvnw test -Dtest=ActivityServiceTest`
Expected: FAIL — `updateActivityFieldWithLock` is not yet called by the service; `updateActivity_shouldSucceed` and the two new tests fail (the production method still uses `findById`/`save`).

- [ ] **Step 3: Rework `updateActivityField`**

Replace the method body in `ActivityService.java`:

```java
  /**
   * Update activity table with optimistic locking (issue #2516).
   *
   * @param riaKey the identifier key
   * @param activityFormDto an object with the values to be updated, including the
   *     updateTimestamp the client last read
   * @return the reloaded activity, carrying the new updateTimestamp
   * @throws ResponseStatusException 409 if the row changed since it was read, 404 if absent
   */
  @Transactional
  public ActivityEntity updateActivityField(
      @NonNull BigDecimal riaKey,
      @NonNull ActivityFormDto activityFormDto
  ) {
    SparLog.info("Updating activity with riaKey: {}", riaKey);

    int rows = activityRepository.updateActivityFieldWithLock(
        riaKey,
        activityFormDto.actualBeginDateTime(),
        activityFormDto.actualEndDateTime(),
        activityFormDto.testCategoryCode(),
        activityFormDto.riaComment(),
        activityFormDto.updateTimestamp());

    if (rows == 0) {
      if (activityRepository.existsById(riaKey)) {
        SparLog.warn("Optimistic lock conflict updating activity riaKey: {}", riaKey);
        throw new ResponseStatusException(
            HttpStatus.CONFLICT,
            "Activity was modified by another user; reload and retry");
      }
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Activity not found");
    }

    SparLog.info("Activity with riaKey: {} saved successfully.", riaKey);
    return activityRepository.findById(riaKey).orElseThrow(
        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Activity not found"));
  }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd oracle-api && ./mvnw test -Dtest=ActivityServiceTest`
Expected: PASS (all three update tests green).

- [ ] **Step 5: Commit**

```bash
git add oracle-api/src/main/java/ca/bc/gov/oracleapi/service/consep/ActivityService.java \
        oracle-api/src/test/java/ca/bc/gov/oracleapi/service/consep/ActivityServiceTest.java
git commit -m "feat: #2516 enforce optimistic lock on testing activity update"
```

---

### Task 4: Backend — document 409 on the endpoints and fix endpoint tests

**Files:**
- Modify: `oracle-api/src/main/java/ca/bc/gov/oracleapi/endpoint/consep/MoistureContentConesEndpoint.java:152-157`
- Modify: `oracle-api/src/main/java/ca/bc/gov/oracleapi/endpoint/consep/PurityTestsEndpoint.java:153-158`
- Modify: `oracle-api/src/test/java/ca/bc/gov/oracleapi/endpoint/consep/MoistureContentConesEndpointTest.java:235,274,297`
- Modify: `oracle-api/src/test/java/ca/bc/gov/oracleapi/endpoint/consep/PurityTestsEndpointTest.java:229,268,291`

**Interfaces:**
- Consumes: `ActivityService.updateActivityField` (Task 3), `ActivityFormDto` 5-arg constructor (Task 1).

- [ ] **Step 1: Add the 409 `@ApiResponse`**

In both endpoints' PATCH `@ApiResponses` value array, add after the 404 entry:

```java
          @ApiResponse(responseCode = "409",
              description = "Activity was modified by another user (stale update timestamp)"),
```

- [ ] **Step 2: Fix every `new ActivityFormDto(...)` in the endpoint tests**

Each of the six call sites currently passes 4 args. Add a fifth `LocalDateTime` timestamp argument. Read each call site and append a timestamp matching the test's existing dates, e.g.:

```java
    ActivityFormDto activityFormDto = new ActivityFormDto(
        "STD",
        LocalDateTime.parse("2013-08-01T00:00:00"),
        LocalDateTime.parse("2013-09-01T00:00:00"),
        "Comment",
        LocalDateTime.parse("2013-09-01T00:00:00")
    );
```

Add `import java.time.LocalDateTime;` to each test file if not already imported.

- [ ] **Step 3: Add an endpoint test asserting 409 maps through (one per endpoint)**

In `MoistureContentConesEndpointTest.java`, add a test that mocks the service to throw conflict and asserts the HTTP status. Mirror the existing PATCH test in the same file for the mockMvc/`when(...).thenThrow(...)` style:

```java
  @Test
  @DisplayName("PATCH activity returns 409 on optimistic lock conflict")
  void updateActivityField_conflict_returns409() throws Exception {
    when(moistureContentService /* or activityService, match the field used by existing PATCH tests */
        .updateActivityField(any(), any()))
        .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT,
            "Activity was modified by another user; reload and retry"));

    ActivityFormDto dto = new ActivityFormDto(
        "STD",
        LocalDateTime.parse("2013-08-01T00:00:00"),
        LocalDateTime.parse("2013-09-01T00:00:00"),
        "Comment",
        LocalDateTime.parse("2013-09-01T00:00:00"));

    mockMvc.perform(patch("/api/moisture-content-cone/{riaKey}", 123)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(dto)))
        .andExpect(status().isConflict());
  }
```

Read the existing PATCH tests in the file first to match: the exact service field/bean that is mocked, the `mockMvc`/`objectMapper` field names, the URL path constant, and the required static imports (`patch`, `status`). Add the equivalent test to `PurityTestsEndpointTest.java` using the `/api/purity-tests/{riaKey}` path.

- [ ] **Step 4: Run the endpoint tests**

Run: `cd oracle-api && ./mvnw test -Dtest=MoistureContentConesEndpointTest,PurityTestsEndpointTest`
Expected: PASS.

- [ ] **Step 5: Run the full backend suite**

Run: `cd oracle-api && ./mvnw test`
Expected: BUILD SUCCESS (no other call sites of `ActivityFormDto` or `updateActivityField` left broken).

- [ ] **Step 6: Commit**

```bash
git add oracle-api/src/main/java/ca/bc/gov/oracleapi/endpoint/consep/MoistureContentConesEndpoint.java \
        oracle-api/src/main/java/ca/bc/gov/oracleapi/endpoint/consep/PurityTestsEndpoint.java \
        oracle-api/src/test/java/ca/bc/gov/oracleapi/endpoint/consep/MoistureContentConesEndpointTest.java \
        oracle-api/src/test/java/ca/bc/gov/oracleapi/endpoint/consep/PurityTestsEndpointTest.java
git commit -m "test: #2516 document and verify 409 on testing activity PATCH"
```

---

### Task 5: Frontend — add `updateTimestamp` to the activity type

**Files:**
- Modify: `frontend/src/types/consep/TestingActivityType.ts:32-37`

**Interfaces:**
- Produces: `ActivityRecordType.updateTimestamp?: string` (inherited by `TestingActivityType`). Consumed by Tasks 8 and 9.

- [ ] **Step 1: Add the optional field**

```typescript
export type ActivityRecordType = {
  testCategoryCode?: string;
  riaComment?: string;
  actualBeginDateTime?: string;
  actualEndDateTime?: string;
  updateTimestamp?: string;
};
```

- [ ] **Step 2: Type-check**

Run: `cd frontend && npx tsc --noEmit`
Expected: no new errors from this change.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/types/consep/TestingActivityType.ts
git commit -m "feat: #2516 add updateTimestamp to ActivityRecordType"
```

---

### Task 6: Frontend — `ConflictNotification` presentational component

**Files:**
- Create: `frontend/src/components/CONSEP/ConflictNotification/index.tsx`
- Create: `frontend/src/components/CONSEP/ConflictNotification/constants.ts`
- Create: `frontend/src/__test__/components/ConflictNotification.test.tsx`

**Interfaces:**
- Produces: default-exported `ConflictNotification` React component with props `{ onReload: () => void; className?: string }`. Consumed by Tasks 8 and 9.

- [ ] **Step 1: Write the failing test**

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConflictNotification from '../../components/CONSEP/ConflictNotification';

describe('ConflictNotification', () => {
  it('renders the conflict title and discard warning', () => {
    render(<ConflictNotification onReload={() => {}} />);
    expect(screen.getByText('Conflict detected')).toBeInTheDocument();
    expect(screen.getByText(/unsaved changes will be lost/i)).toBeInTheDocument();
  });

  it('calls onReload when the Reload button is clicked', async () => {
    const onReload = vi.fn();
    render(<ConflictNotification onReload={onReload} />);
    await userEvent.click(screen.getByRole('button', { name: /reload/i }));
    expect(onReload).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd frontend && npx vitest run src/__test__/components/ConflictNotification.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the constants**

`frontend/src/components/CONSEP/ConflictNotification/constants.ts`:

```typescript
export const conflictText = {
  title: 'Conflict detected',
  reload: 'Reload',
  bullets: [
    'Saving is temporarily disabled to prevent overwriting another user’s changes',
    'Reload to view the latest information and continue editing',
    'Any unsaved changes will be lost'
  ]
};
```

- [ ] **Step 4: Write the component**

`frontend/src/components/CONSEP/ConflictNotification/index.tsx`:

```tsx
import React from 'react';
import { ActionableNotification } from '@carbon/react';
import { conflictText } from './constants';

type ConflictNotificationProps = {
  onReload: () => void;
  className?: string;
};

const ConflictNotification = ({ onReload, className }: ConflictNotificationProps) => (
  <ActionableNotification
    lowContrast
    inline
    kind="warning"
    className={className}
    title={conflictText.title}
    actionButtonLabel={conflictText.reload}
    onActionButtonClick={onReload}
    hideCloseButton
    subtitle={(
      <ul className="conflict-notification-bullets">
        {conflictText.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    )}
  />
);

export default ConflictNotification;
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd frontend && npx vitest run src/__test__/components/ConflictNotification.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/CONSEP/ConflictNotification/ \
        frontend/src/__test__/components/ConflictNotification.test.tsx
git commit -m "feat: #2516 add ConflictNotification component"
```

---

### Task 7: Frontend — `useActivityConflict` hook

**Files:**
- Create: `frontend/src/views/CONSEP/TestingActivities/hooks/useActivityConflict.ts`
- Create: `frontend/src/__test__/views/CONSEP/useActivityConflict.test.tsx`

**Interfaces:**
- Produces: `useActivityConflict()` returning `{ isConflict: boolean; markConflict: () => void; clearConflict: () => void }`. Consumed by Tasks 8 and 9.

- [ ] **Step 1: Write the failing test**

```tsx
import { renderHook, act } from '@testing-library/react';
import { useActivityConflict } from '../../../views/CONSEP/TestingActivities/hooks/useActivityConflict';

describe('useActivityConflict', () => {
  it('starts not in conflict, then marks and clears', () => {
    const { result } = renderHook(() => useActivityConflict());
    expect(result.current.isConflict).toBe(false);

    act(() => result.current.markConflict());
    expect(result.current.isConflict).toBe(true);

    act(() => result.current.clearConflict());
    expect(result.current.isConflict).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd frontend && npx vitest run src/__test__/views/CONSEP/useActivityConflict.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the hook**

`frontend/src/views/CONSEP/TestingActivities/hooks/useActivityConflict.ts`:

```typescript
import { useCallback, useState } from 'react';

export const useActivityConflict = () => {
  const [isConflict, setIsConflict] = useState(false);
  const markConflict = useCallback(() => setIsConflict(true), []);
  const clearConflict = useCallback(() => setIsConflict(false), []);
  return { isConflict, markConflict, clearConflict };
};

export default useActivityConflict;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd frontend && npx vitest run src/__test__/views/CONSEP/useActivityConflict.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/views/CONSEP/TestingActivities/hooks/useActivityConflict.ts \
        frontend/src/__test__/views/CONSEP/useActivityConflict.test.tsx
git commit -m "feat: #2516 add useActivityConflict hook"
```

---

### Task 8: Frontend — wire conflict handling into MoistureContent

**Files:**
- Modify: `frontend/src/views/CONSEP/TestingActivities/MoistureContent/index.tsx`
- Create: `frontend/src/__test__/views/CONSEP/MoistureContentConflict.test.tsx`

**Interfaces:**
- Consumes: `ConflictNotification` (Task 6), `useActivityConflict` (Task 7), `ActivityRecordType.updateTimestamp` (Task 5).

- [ ] **Step 1: Store the timestamp from the GET response**

In the query-hydration `useEffect` (currently builds `activityRecordData` from `testActivityQuery.data`), add `updateTimestamp` to the object:

```typescript
      const activityRecordData = {
        testCategoryCode: testActivityQuery.data.testCategoryCode,
        riaComment: testActivityQuery.data.riaComment,
        actualBeginDateTime: testActivityQuery.data.actualBeginDateTime,
        actualEndDateTime: testActivityQuery.data.actualEndDateTime,
        updateTimestamp: testActivityQuery.data.updateTimestamp
      };
      setActivityRecord(activityRecordData);
```

- [ ] **Step 2: Add the conflict hook and write the new timestamp back on success / detect 409 on error**

Add near the other hooks: `const { isConflict, markConflict, clearConflict } = useActivityConflict();`

Replace `updateActivityRecordMutation` with:

```typescript
  const updateActivityRecordMutation = useMutation({
    mutationFn: (record?: ActivityRecordType) => testingActivitiesAPI(
      'moistureTest',
      'updateActivityRecord',
      { riaKey, record }
    ),
    onSuccess: (response) => {
      const newTimestamp = response?.data?.updateTimestamp;
      if (newTimestamp) {
        setActivityRecord((prev) => (prev ? { ...prev, updateTimestamp: newTimestamp } : prev));
      }
      setAlert({ isSuccess: true, message: 'Activity record updated successfully' });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    },
    onError: (error) => {
      if ((error as AxiosError).response?.status === 409) {
        markConflict();
        return;
      }
      setAlert({
        isSuccess: false,
        message: `Failed to update activity record: ${(error as AxiosError).message}`
      });
    }
  });
```

Note: `updateActivityRecord` returns the raw Axios response (it does not `.then(res => res.data)`), so `response.data.updateTimestamp` is correct here.

- [ ] **Step 3: Lock autosave while in conflict**

At the top of `handleUpdateActivityRecord`, before any validation/mutation:

```typescript
  const handleUpdateActivityRecord = (record: ActivityRecordType) => {
    if (isConflict) {
      return;
    }
    const updatedRecord = { ...activityRecord, ...record };
    // ...existing date-validation and mutate logic unchanged...
  };
```

- [ ] **Step 4: Add a reload handler and render the banner**

Add the handler:

```typescript
  const handleReloadOnConflict = () => {
    testActivityQuery.refetch().then(() => clearConflict());
  };
```

In the JSX, immediately inside `<FlexGrid className="consep-moisture-content">` and before the existing `{alert?.message && ...}` block:

```tsx
      {isConflict && (
        <ConflictNotification
          className="consep-moisture-content-conflict"
          onReload={handleReloadOnConflict}
        />
      )}
```

Add the import: `import ConflictNotification from '../../../../components/CONSEP/ConflictNotification';` and `import useActivityConflict from './hooks/useActivityConflict';` (adjust the relative path: from `MoistureContent/index.tsx` the hook is at `../hooks/useActivityConflict`).

- [ ] **Step 5: Write the conflict view test**

`frontend/src/__test__/views/CONSEP/MoistureContentConflict.test.tsx` — mock the API module so the update rejects with a 409, render, trigger a field change, and assert the banner appears and that a subsequent change does not fire another update:

```tsx
import React from 'react';
import {
  render, screen, fireEvent, waitFor
} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MoistureContent from '../../../views/CONSEP/TestingActivities/MoistureContent';

const updateMock = vi.fn();
vi.mock('../../../api-service/consep/testingActivitiesAPI', () => ({
  default: (_t: string, fn: string, params: any) => {
    if (fn === 'getDataByRiaKey') {
      return Promise.resolve({
        standardActivityType: 'MCC',
        testCategoryCode: 'STD',
        riaComment: '',
        actualBeginDateTime: '2025-01-05T08:00:00',
        actualEndDateTime: '2025-01-18T16:00:00',
        updateTimestamp: '2025-01-18T16:00:00',
        seedlotNumber: '64132',
        replicatesList: []
      });
    }
    if (fn === 'updateActivityRecord') {
      return updateMock(params);
    }
    return Promise.resolve({});
  }
}));

vi.mock('react-router-dom', async (orig) => ({
  ...(await orig<typeof import('react-router-dom')>()),
  useParams: () => ({ riaKey: '123' })
}));

const renderView = () => render(
  <BrowserRouter>
    <QueryClientProvider client={new QueryClient()}>
      <MoistureContent />
    </QueryClientProvider>
  </BrowserRouter>
);

describe('MoistureContent optimistic-lock conflict', () => {
  beforeEach(() => updateMock.mockReset());

  it('shows the conflict banner when an update returns 409', async () => {
    updateMock.mockRejectedValue({ response: { status: 409 }, message: 'Conflict' });
    renderView();

    await screen.findByText('Quick test for lot 64132', { exact: false });

    const comments = await screen.findByLabelText(/comment/i);
    fireEvent.change(comments, { target: { value: 'edit one' } });

    await waitFor(() => expect(screen.getByText('Conflict detected')).toBeInTheDocument());

    updateMock.mockClear();
    fireEvent.change(comments, { target: { value: 'edit two' } });
    await waitFor(() => expect(updateMock).not.toHaveBeenCalled());
  });
});
```

If the title/label matchers do not line up with the rendered DOM, read the component and adjust the queries (the assertions on `'Conflict detected'` and the autosave-lock behaviour must remain). Confirm whether the repo's Vitest setup exposes `vi` globally (see `frontend/vitest` / `setupTests`); if not, add `import { vi } from 'vitest';`.

- [ ] **Step 6: Run the test**

Run: `cd frontend && npx vitest run src/__test__/views/CONSEP/MoistureContentConflict.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/views/CONSEP/TestingActivities/MoistureContent/index.tsx \
        frontend/src/__test__/views/CONSEP/MoistureContentConflict.test.tsx
git commit -m "feat: #2516 handle save conflict in MoistureContent"
```

---

### Task 9: Frontend — wire conflict handling into PurityContent

**Files:**
- Modify: `frontend/src/views/CONSEP/TestingActivities/PurityContent/index.tsx`
- Create: `frontend/src/__test__/views/CONSEP/PurityContentConflict.test.tsx`

**Interfaces:**
- Consumes: `ConflictNotification` (Task 6), `useActivityConflict` (Task 7), `ActivityRecordType.updateTimestamp` (Task 5). Same wiring as Task 8 — repeated in full below because PurityContent is a separate file.

- [ ] **Step 1: Store the timestamp from the GET response**

In the hydration `useEffect`, add `updateTimestamp` to `activityRecordData`:

```typescript
      const activityRecordData = {
        testCategoryCode: testActivityQuery.data.testCategoryCode,
        riaComment: testActivityQuery.data.riaComment,
        actualBeginDateTime: testActivityQuery.data.actualBeginDateTime,
        actualEndDateTime: testActivityQuery.data.actualEndDateTime,
        updateTimestamp: testActivityQuery.data.updateTimestamp
      };
      setActivityRecord(activityRecordData);
```

- [ ] **Step 2: Add the conflict hook and update mutation**

Add `const { isConflict, markConflict, clearConflict } = useActivityConflict();` near the other hooks, then replace `updateActivityRecordMutation`:

```typescript
  const updateActivityRecordMutation = useMutation({
    mutationFn: (record?: ActivityRecordType) => testingActivitiesAPI(
      'purityTest',
      'updateActivityRecord',
      { riaKey, record }
    ),
    onSuccess: (response) => {
      const newTimestamp = response?.data?.updateTimestamp;
      if (newTimestamp) {
        setActivityRecord((prev) => (prev ? { ...prev, updateTimestamp: newTimestamp } : prev));
      }
      setAlert({ isSuccess: true, message: 'Activity record updated successfully' });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    },
    onError: (error) => {
      if ((error as AxiosError).response?.status === 409) {
        markConflict();
        return;
      }
      setAlert({
        isSuccess: false,
        message: `Failed to update activity record: ${(error as AxiosError).message}`
      });
    }
  });
```

- [ ] **Step 3: Lock autosave while in conflict**

At the top of `handleUpdateActivityRecord`:

```typescript
  const handleUpdateActivityRecord = (record: ActivityRecordType) => {
    if (isConflict) {
      return;
    }
    setActivityRecord({
      ...activityRecord,
      ...record
    });
    updateActivityRecordMutation.mutate({
      ...activityRecord,
      ...record
    });
  };
```

- [ ] **Step 4: Add the reload handler and render the banner**

```typescript
  const handleReloadOnConflict = () => {
    testActivityQuery.refetch().then(() => clearConflict());
  };
```

In the JSX, immediately inside `<FlexGrid className="consep-purity-content">` and before the `{alert?.message && ...}` block:

```tsx
      {isConflict && (
        <ConflictNotification
          className="consep-purity-content-conflict"
          onReload={handleReloadOnConflict}
        />
      )}
```

Add imports: `import ConflictNotification from '../../../../components/CONSEP/ConflictNotification';` and `import useActivityConflict from '../hooks/useActivityConflict';`.

- [ ] **Step 5: Write the conflict view test**

`frontend/src/__test__/views/CONSEP/PurityContentConflict.test.tsx` — same structure as the moisture test in Task 8 Step 5, but import `PurityContent`, mock `testingActivitiesAPI` with `'purityTest'`, and return a GET payload shaped for purity (include `debrisList: []` and `replicatesList: []`). Trigger the comment field change, assert `'Conflict detected'` appears, and assert a second edit does not re-call the update mock. Adjust label/title queries to the purity DOM after reading the component.

- [ ] **Step 6: Run the test**

Run: `cd frontend && npx vitest run src/__test__/views/CONSEP/PurityContentConflict.test.tsx`
Expected: PASS.

- [ ] **Step 7: Run lint + the CONSEP test folder**

Run: `cd frontend && npx eslint src/views/CONSEP/TestingActivities/MoistureContent/index.tsx src/views/CONSEP/TestingActivities/PurityContent/index.tsx src/components/CONSEP/ConflictNotification && npx vitest run src/__test__/views/CONSEP src/__test__/components/ConflictNotification.test.tsx`
Expected: lint clean; all tests pass.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/views/CONSEP/TestingActivities/PurityContent/index.tsx \
        frontend/src/__test__/views/CONSEP/PurityContentConflict.test.tsx
git commit -m "feat: #2516 handle save conflict in PurityContent"
```

---

## Self-Review Notes

- **Spec coverage:** Notification (Task 6 banner) ✓; refresh to view recent changes (Tasks 8/9 reload → `refetch`) ✓; warning edits discarded (Task 6 bullet "Any unsaved changes will be lost") ✓; backend 409 mechanism (Tasks 1–4) ✓; per-field autosave timestamp write-back + conflict lock (Tasks 8/9) ✓; reuse Seedlot/germination patterns ✓; moisture + purity only ✓.
- **Open verification points for the implementer** (resolve by reading the named files, not by guessing): (a) the exact service bean mocked by the existing endpoint PATCH tests in Task 4 Step 3; (b) whether `vi` is global in the Vitest setup (Task 8 Step 5); (c) the exact rendered title/label strings used as test queries in Tasks 8–9.
- **Type consistency:** `updateActivityFieldWithLock` signature is identical in Tasks 2 and 3; `useActivityConflict` returns `{ isConflict, markConflict, clearConflict }` in Tasks 7, 8, 9; `ConflictNotification` props `{ onReload, className }` in Tasks 6, 8, 9.
