# CONSEP API – Insert / Update Daily Germ Counts (issue #2443)

- **Date:** 2026-07-08
- **Ticket:** [bcgov/nr-spar#2443](https://github.com/bcgov/nr-spar/issues/2443) – "CONSEP API – Insert / Update Daily Germ Counts"
- **Reference doc:** Confluence "Germination Testing" (FSADT2), Database transactions section
- **Module:** `oracle-api`
- **Type:** back-end

## 1. Purpose

Provide a single back-end endpoint to create or update the daily germination counts
for one germination test (keyed by `RIA_SKEY`). A test records, for up to 13 days and
up to 4 replicates, how many seeds germinated each day, plus each day's abnormal-seed
counts. This endpoint persists that data across three CONSEP tables in one transaction
and enforces the four acceptance criteria.

## 2. Scope

### In scope
- One transactional upsert writing three tables:
  - `CONSEP.CNS_T_GERM_COUNT` — one wide row per test (`RIA_SKEY`), slots 1–13.
  - `CONSEP.CNS_T_DAILY_ABNORMAL` — one row per populated day, keyed by `DAILY_GERM_SKEY`.
  - `CONSEP.CNS_T_TEST_REP_GERM` — one row per replicate (1–4).
- The four acceptance criteria (AC1–AC4, see §5).

### Out of scope (explicitly)
- **Test header + activity update** (the "Update (test and activity)" SQL, rank /
  `original_test_ind` / `current_test_ind` computation, tolerance, germinator
  assignment). This belongs to **issue #2447** (confirmed by `GerminationTestUpdateFormDto`).
- **Clearing a day** (turning a populated day back to empty, and removing / recycling
  its `DAILY_GERM_SKEY` and abnormal row). Separate ticket. This endpoint only
  **inserts or modifies**; it never deletes rows or nulls out a slot.
- **`countDt` vs `actual_begin_dt_tm`** comparison (that date lives in the activity
  table, #2447 territory). This endpoint validates only that day dates strictly increase.

## 3. API contract

### Endpoint
`PUT /api/germ-counts/{riaSkey}`

- Roles: `SPAR_TSC_SUBMITTER`, `SPAR_TSC_SUPERVISOR` (matches existing `GET /{riaSkey}`).
- Insert vs update is decided server-side by whether a `CNS_T_GERM_COUNT` row exists
  for `riaSkey`.

### Request body

Organized by **day** and **replicate**, because `DAILY_GERM_SKEY` (the abnormal table's
PK) does not exist yet at request time — abnormals are associated to a day by
`slotIndex`, not by skey.

```jsonc
{
  "updateTimestamp": "2026-07-01T09:00:00",   // optimistic lock; required if the row exists, ignored on insert

  "days": [
    {
      "slotIndex": 1,                          // 1–13, selects which numbered columns to write
      "countDt": "2026-04-01",
      "dayNoOfTest": 1,
      "seedsGerm": { "rep1": 10, "rep2": 12, "rep3": 11, "rep4": 9 },
      "abnormals": {
        "rep1": { "re":0,"sr":0,"sh":0,"rot":0,"thh":0,"thr":0,"tw":0,"cm":0,"weak":0,"other":0,"prgrm":0 },
        "rep2": { ... }, "rep3": { ... }, "rep4": { ... }
      }
    }
    // up to 13 days
  ],

  "replicates": [
    { "replicateNumber": 1, "totalNoSeeds": 100,
      "finalUngrmNormal": 0, "finalUngrmShrvl": 0, "finalUngrmEmpty": 0,
      "finalUngrmInsct": 0, "finalUngrmDamagd": 0, "finalUngrmRotten": 0,
      "finalPregerm": 0, "repAcceptedInd": 1, "tolrncOvrrdeDesc": null }
    // reps 2, 3, 4
  ]
}
```

Notes:
- `cumulativeGerm` is **not** in the request — the server recomputes it (AC4).
- Each day's `abnormals.repN` reuses the existing `ReplicateAbnormalDto` (11 abnormal
  categories already defined). The `re/sr/sh/rot/thh/thr/tw/cm/weak/other/prgrm` keys map to
  `ReplicateAbnormalDto`'s named fields.
- A single top-level `updateTimestamp` is the optimistic lock, over the `CNS_T_GERM_COUNT`
  row (not a per-table timestamp).
- New request DTOs are needed: a top-level record + a per-day record. The existing
  `GermCountSlotDto` and `DailyAbnormalResponseDto` are response shapes (keyed by skey)
  and are not reused for the request body.

### Response
The saved record, reusing `GermCountDto` (optionally extended to include abnormals /
replicates as a combined response DTO). `200 OK` on success.

### Status codes
- `200` success
- `400` validation failure (see §5): field ranges, non-increasing dates, AC3 overflow,
  empty `days`/`replicates`, existing row but missing `updateTimestamp`
- `401` / `403` auth
- `409` optimistic-lock conflict (AC1)

## 4. Save flow (single `@Transactional`)

1. **Decide insert/update:** `germCountRepository.findById(riaSkey)`.
2. **Optimistic lock (update only, AC1):** compare stored `update_timestamp` with request
   `updateTimestamp`. Implemented with a `@Modifying` `UPDATE ... WHERE ria_skey = ? AND
   update_timestamp = ?` whose affected-row count is checked (0 rows → `409`), following
   the `GerminatorTrayService` pattern to avoid read-modify-write races. A row that
   exists but a request with a null `updateTimestamp` → `400`.
3. **Business validation (§5)** — all pass before any write.
4. **Generate `DAILY_GERM_SKEYN` (AC2):** for each `days[]` entry, if `countDt != null`
   and the slot's current skey is null, fetch one sequence value; days with an existing
   skey keep it; slots with no date stay null. Sequence value via a new native query
   `SELECT CONSEP.CNS_SEQ_COUNTER.NEXTVAL FROM DUAL` (exact sequence name to be confirmed
   against the real Oracle schema during implementation; test DB gets an equivalent H2
   sequence in `schema.sql`), one call per slot that needs a key.
5. **Recompute `cumulativeGerm` (AC4):** ordered by `dayNoOfTest`,
   `cumulative_germ(n) = Σ over days 1..n of (rep1+rep2+rep3+rep4 seedsGerm)`; overwrite.
6. **Persist (FK order):**
   1. `CNS_T_GERM_COUNT` (via `GermCountMapper`, reusing existing slot mapping).
   2. `CNS_T_DAILY_ABNORMAL` — create/update the row for each populated day's generated
      skey (`DailyAbnormalEntity`; `findByDailyGermSkey` detects existence).
   3. `CNS_T_TEST_REP_GERM` — upsert per `replicateNumber` (`TestRepGermEntity` + `ReplicateId`).
7. **Audit fields:** insert sets `entry_userid`/`entry_timestamp`/`update_userid`/
   `update_timestamp`; update refreshes `update_userid`/`update_timestamp`. Userid from
   security context; timestamp from DB time.

## 5. Validation rules (acceptance criteria)

**AC1 — Optimistic locking (update only).** `update_timestamp` mismatch → `409 Conflict`.
Existing row with missing `updateTimestamp` → `400`. (Flow §4.2.)

**AC2 — `DAILY_GERM_SKEYN` auto-generated** only when `count_dtN != null` and the slot's
key is null. (Flow §4.4.)

**AC3 — Per-replicate seed totals.** For each replicate (1–4), independently:

```
Σ(repX_no_seeds_germ over days 1..13) + Σ(that rep's 11 abnormal categories over all days)
    ≤ totalNoSeeds (of that rep, from request replicates[])
```

Overflow → `400`, message names the offending replicate.

**AC4 — Cumulative germination** recomputed server-side and overwritten; request value is
not trusted. (Flow §4.5.)

**Field-level:**
- Each abnormal count in range 0–999 (11 categories × 4 reps); out of range → `400`.
- `repX_no_seeds_germ`: if a rep has any day populated, null days are stored as 0.
- `countDt`: each populated day's date must be strictly greater than the previous
  populated day's date; otherwise `400`. (No comparison to begin date — #2447.)
- Empty `days` or empty `replicates` → `400` (nothing to persist). *(Assumption, not
  objected to during design; revisit if the FE needs to save replicates without days.)*

## 6. Deliverables

New / changed files under `oracle-api/src/main/java/ca/bc/gov/oracleapi`:

1. **DTOs** (`dto/consep`): combined request DTO (top-level with `updateTimestamp`,
   `days[]`, `replicates[]`) + per-day request DTO; reuse `ReplicateAbnormalDto`.
   Optional combined response DTO.
2. **`endpoint/consep/GermCountEndpoint`**: add `PUT /{riaSkey}`.
3. **`service/consep/GermCountService`**: add the transactional upsert method + validation.
4. **`repository/consep/GermCountRepository`**: `@Modifying` optimistic-lock UPDATE + a
   sequence-nextval query. `DailyAbnormalRepository` / `TestRepGermRepository`: saving
   support (mostly `saveAll`, largely already present).
5. **Mappers**: reuse `GermCountMapper`; add abnormal/replicate mapping if needed.
6. **Tests + `schema.sql`**: see §7.

## 7. Testing

Follows existing CONSEP test layout (`endpoint/consep`, `service/consep`,
`repository/consep`).

- **Service unit tests** (primary; cover all ACs):
  - insert → all three tables written; `DAILY_GERM_SKEY` generated only for days with a
    `countDt` (AC2).
  - update with matching `updateTimestamp` → success; mismatch → `409` (AC1); existing
    row with missing timestamp → `400`.
  - AC3: `Σ germ + Σ abnormal` exactly equal to / exceeding `totalNoSeeds` — boundary
    passes, overflow → `400` naming the rep.
  - AC4: multi-day data, assert each `cumulativeGerm` = running sum; a wrong cumulative in
    the request is overwritten.
  - Field-level: abnormal out of range (>999 / <0) → `400`; `repX` null day stored as 0;
    non-increasing dates → `400`; empty `days`/`replicates` → `400`.
- **Repository tests**: sequence-nextval query, `findByDailyGermSkey`, germ_count upsert.
  Requires adding `CNS_T_GERM_COUNT` and `CNS_T_DAILY_ABNORMAL` H2 DDL + an equivalent
  sequence to `oracle-api/src/test/resources/schema.sql` (only `CNS_T_TEST_REP_GERM`
  exists there today).
- **Endpoint tests**: PUT route, role auth (401/403), request-body validation (400),
  200/409 status codes, mocked service.

## 8. Open items to confirm during implementation

- Exact Oracle sequence name for `DAILY_GERM_SKEY` (doc uses `cns_seq_counter.NEXTVAL`;
  not referenced anywhere in the repo yet).
- Whether `CNS_T_GERM_COUNT` / `CNS_T_DAILY_ABNORMAL` have DB triggers that already
  populate audit columns or the skey (affects whether we set them explicitly).
