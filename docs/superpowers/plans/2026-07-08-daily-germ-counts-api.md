# Daily Germ Counts API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `PUT /api/germ-counts/{riaSkey}` to the `oracle-api` service that inserts or updates a germination test's daily counts, per-day abnormals, and replicate totals in one transaction, enforcing acceptance criteria AC1–AC4.

**Architecture:** One transactional service method upserts three CONSEP tables — `CNS_T_GERM_COUNT` (wide row per test), `CNS_T_DAILY_ABNORMAL` (one row per populated day, keyed by generated `DAILY_GERM_SKEY`), and `CNS_T_TEST_REP_GERM` (one row per replicate). The endpoint decides insert vs update by row existence; optimistic locking gates updates via a conditional `@Modifying` query (0 rows affected → 409). Cumulative germination is recomputed server-side.

**Tech Stack:** Java 21, Spring Boot, Spring Data JPA, MapStruct, JUnit 5, Mockito, H2 (tests), Oracle (prod).

## Global Constraints

- Package root: `ca.bc.gov.oracleapi`; CONSEP code under `.../consep` sub-packages.
- Roles for every endpoint: `SPAR_TSC_SUBMITTER`, `SPAR_TSC_SUPERVISOR` (via `@RoleAccessConfig`).
- Logging via `ca.bc.gov.oracleapi.config.SparLog` (not slf4j directly).
- Errors via `org.springframework.web.server.ResponseStatusException` with `HttpStatus`.
- Two test DB setups: (a) most tests use the default H2 (`jdbc:h2:mem:oracledb`, `ddl-auto=create-drop`) from `application.properties`; (b) `@DataJpaTest` repository tests override via `@TestPropertySource` to H2 in **Oracle mode** (`MODE=Oracle;DATABASE_TO_UPPER=false`, `ddl-auto=none`, `spring.sql.init.mode=always`) driven by `src/test/resources/schema.sql`. Oracle-mode H2 supports `DUAL` and `sequence.NEXTVAL`, so the sequence query IS asserted in the repository test; it is mocked in pure-Mockito service tests.
- Slots are numbered 1–13; replicates numbered 1–4.
- Existing `ReplicateAbnormalDto` (11 abnormal categories + `totalSeeds`) is reused for request abnormals; its `totalSeeds` field is IGNORED for abnormals (AC3 `totalNoSeeds` comes from `replicates[]`).

---

## File Structure

**Create:**
- `dto/consep/GermCountUpsertRequestDto.java` — top-level request (updateTimestamp, days[], replicates[]).
- `dto/consep/DayGermCountDto.java` — one day: slotIndex, countDt, dayNoOfTest, rep1-4 seeds germinated, rep1-4 abnormals.
- `dto/consep/TestRepGermFormDto.java` — one replicate's totals for the request body.

**Modify:**
- `mapper/GermCountMapper.java` — extract the 13-slot switch into a reusable `applySlots(List<GermCountSlotDto>, GermCountEntity)`.
- `repository/consep/GermCountRepository.java` — add `touchIfTimestampMatches` (optimistic guard) + `nextDailyGermSkey` (Oracle sequence).
- `service/consep/GermCountService.java` — add the transactional `upsertGermCounts` method + validation + helpers.
- `endpoint/consep/GermCountEndpoint.java` — add `PUT /{riaSkey}`.
- `src/test/resources/schema.sql` — add `CNS_T_GERM_COUNT` and `CNS_T_DAILY_ABNORMAL` H2 DDL.

**Test:**
- `test/.../mapper/GermCountMapperTest.java` (create if absent) or extend service test.
- `test/.../repository/consep/GermCountRepositoryTest.java` (create).
- `test/.../service/consep/GermCountServiceTest.java` (extend — exists).
- `test/.../endpoint/consep/GermCountEndpointTest.java` (extend — exists).

---
(Task breakdown follows.)

### Task 1: Request DTOs

**Files:**
- Create: `oracle-api/src/main/java/ca/bc/gov/oracleapi/dto/consep/GermCountUpsertRequestDto.java`
- Create: `oracle-api/src/main/java/ca/bc/gov/oracleapi/dto/consep/DayGermCountDto.java`
- Create: `oracle-api/src/main/java/ca/bc/gov/oracleapi/dto/consep/TestRepGermFormDto.java`

**Interfaces:**
- Consumes: existing `ReplicateAbnormalDto`.
- Produces: `GermCountUpsertRequestDto(LocalDateTime updateTimestamp, List<DayGermCountDto> days, List<TestRepGermFormDto> replicates)`;
  `DayGermCountDto(int slotIndex, LocalDate countDt, Integer dayNoOfTest, Integer rep1NoSeedsGerm, Integer rep2NoSeedsGerm, Integer rep3NoSeedsGerm, Integer rep4NoSeedsGerm, ReplicateAbnormalDto rep1Abnormal, ReplicateAbnormalDto rep2Abnormal, ReplicateAbnormalDto rep3Abnormal, ReplicateAbnormalDto rep4Abnormal)`;
  `TestRepGermFormDto(Integer replicateNumber, Integer totalNoSeeds, Integer finalUngrmNormal, Integer finalUngrmShrvl, Integer finalUngrmEmpty, Integer finalUngrmInsct, Integer finalUngrmDamagd, Integer finalUngrmRotten, Integer finalPregerm, Integer repAcceptedInd, String tolrncOvrrdeDesc)`.

These are pure data records (no behavior) — no dedicated unit test; they are exercised by the service and endpoint tests in later tasks.

- [ ] **Step 1: Create `TestRepGermFormDto.java`**

```java
package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

/** One replicate's totals in an upsert request for CNS_T_TEST_REP_GERM. */
@Schema(description = "Replicate totals submitted when saving daily germ counts")
public record TestRepGermFormDto(
    @NotNull
    @Schema(description = "Replicate number (1-4)", example = "1")
    Integer replicateNumber,

    @NotNull
    @Schema(description = "Total number of seeds in the replicate", example = "100")
    Integer totalNoSeeds,

    @Schema(description = "Final ungerminated normal seed count") Integer finalUngrmNormal,
    @Schema(description = "Final ungerminated shrivelled seed count") Integer finalUngrmShrvl,
    @Schema(description = "Final ungerminated empty seed count") Integer finalUngrmEmpty,
    @Schema(description = "Final ungerminated insect-damaged seed count") Integer finalUngrmInsct,
    @Schema(description = "Final ungerminated mechanically damaged seed count") Integer finalUngrmDamagd,
    @Schema(description = "Final ungerminated rotten seed count") Integer finalUngrmRotten,
    @Schema(description = "Final pre-germinated seed count") Integer finalPregerm,
    @Schema(description = "Indicator if the replicate is accepted", example = "1") Integer repAcceptedInd,
    @Schema(description = "Tolerance override reason") String tolrncOvrrdeDesc
) {}
```

- [ ] **Step 2: Create `DayGermCountDto.java`**

```java
package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/** One day's germination counts and per-replicate abnormals in an upsert request. */
@Schema(description = "One day of daily germination counts plus that day's abnormals")
public record DayGermCountDto(
    @NotNull
    @Schema(description = "Slot position (1-13), selects which numbered columns to write", example = "1")
    Integer slotIndex,

    @Schema(description = "Date the count was recorded", example = "2026-04-01")
    LocalDate countDt,

    @Schema(description = "Day number within the test", example = "1")
    Integer dayNoOfTest,

    @Schema(description = "Replicate 1 seeds germinated this day", example = "10") Integer rep1NoSeedsGerm,
    @Schema(description = "Replicate 2 seeds germinated this day", example = "12") Integer rep2NoSeedsGerm,
    @Schema(description = "Replicate 3 seeds germinated this day", example = "11") Integer rep3NoSeedsGerm,
    @Schema(description = "Replicate 4 seeds germinated this day", example = "9") Integer rep4NoSeedsGerm,

    @Schema(description = "Replicate 1 abnormals for this day") ReplicateAbnormalDto rep1Abnormal,
    @Schema(description = "Replicate 2 abnormals for this day") ReplicateAbnormalDto rep2Abnormal,
    @Schema(description = "Replicate 3 abnormals for this day") ReplicateAbnormalDto rep3Abnormal,
    @Schema(description = "Replicate 4 abnormals for this day") ReplicateAbnormalDto rep4Abnormal
) {}
```

- [ ] **Step 3: Create `GermCountUpsertRequestDto.java`**

```java
package ca.bc.gov.oracleapi.dto.consep;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;

/** Body of PUT /api/germ-counts/{riaSkey}: daily germ counts, abnormals, and replicate totals. */
@Schema(description = "Insert/update payload for a test's daily germination counts")
public record GermCountUpsertRequestDto(
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "update_timestamp of the germ_count row as read (optimistic lock); required on update")
    LocalDateTime updateTimestamp,

    @Valid
    @Schema(description = "Per-day germination counts and abnormals (1-13 days)")
    List<DayGermCountDto> days,

    @Valid
    @Schema(description = "Replicate totals (1-4)")
    List<TestRepGermFormDto> replicates
) {}
```

- [ ] **Step 4: Compile**

Run: `cd oracle-api && ./mvnw -q compile`
Expected: BUILD SUCCESS.

- [ ] **Step 5: Commit**

```bash
git add oracle-api/src/main/java/ca/bc/gov/oracleapi/dto/consep/GermCountUpsertRequestDto.java oracle-api/src/main/java/ca/bc/gov/oracleapi/dto/consep/DayGermCountDto.java oracle-api/src/main/java/ca/bc/gov/oracleapi/dto/consep/TestRepGermFormDto.java
git commit -m "feat(2443): add request DTOs for daily germ counts upsert"
```

### Task 2: Refactor GermCountMapper to expose reusable slot application

The existing mapper has `applySlots(GermCountDto dto, @MappingTarget GermCountEntity e)` (an `@AfterMapping` with a 13-case switch). The service needs the same switch to write slot columns from computed `GermCountSlotDto`s, so extract the switch into a reusable method and have the `@AfterMapping` delegate. DRY — the switch stays in exactly one place.

**Files:**
- Modify: `oracle-api/src/main/java/ca/bc/gov/oracleapi/mapper/GermCountMapper.java`
- Test: `oracle-api/src/test/java/ca/bc/gov/oracleapi/mapper/GermCountMapperTest.java` (create)

**Interfaces:**
- Produces: `void applySlots(java.util.List<GermCountSlotDto> slots, @MappingTarget GermCountEntity e)` — public default method on `GermCountMapper`. Sets the numbered slot columns for each slot's `slotIndex`; throws `IllegalArgumentException` for an index outside 1–13.

- [ ] **Step 1: Write the failing mapper test**

Create `oracle-api/src/test/java/ca/bc/gov/oracleapi/mapper/GermCountMapperTest.java`:

```java
package ca.bc.gov.oracleapi.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import ca.bc.gov.oracleapi.dto.consep.GermCountSlotDto;
import ca.bc.gov.oracleapi.entity.consep.GermCountEntity;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

class GermCountMapperTest {

  private final GermCountMapper mapper = Mappers.getMapper(GermCountMapper.class);

  @Test
  void applySlots_setsNumberedColumns_forGivenSlots() {
    GermCountEntity e = new GermCountEntity();

    mapper.applySlots(
        List.of(
            new GermCountSlotDto(1, new BigDecimal("1001"), LocalDate.of(2026, 4, 1), 1, 10, 12, 11, 9, new BigDecimal("42.0000")),
            new GermCountSlotDto(3, new BigDecimal("1003"), LocalDate.of(2026, 4, 3), 3, 5, 6, 7, 8, new BigDecimal("100.0000"))),
        e);

    assertEquals(new BigDecimal("1001"), e.getDailyGermSkey1());
    assertEquals(LocalDate.of(2026, 4, 1), e.getCountDt1());
    assertEquals(10, e.getRep1NoSeedsGerm1());
    assertEquals(new BigDecimal("42.0000"), e.getCumulativeGerm1());
    assertEquals(new BigDecimal("1003"), e.getDailyGermSkey3());
    assertEquals(8, e.getRep4NoSeedsGerm3());
    assertNull(e.getDailyGermSkey2());
  }

  @Test
  void applySlots_throws_forInvalidIndex() {
    GermCountEntity e = new GermCountEntity();
    List<GermCountSlotDto> bad =
        List.of(new GermCountSlotDto(14, null, null, null, 0, 0, 0, 0, null));
    assertThrows(IllegalArgumentException.class, () -> mapper.applySlots(bad, e));
  }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd oracle-api && ./mvnw -q -Dtest=GermCountMapperTest test`
Expected: FAIL — `applySlots(List, GermCountEntity)` does not exist (compile error).

- [ ] **Step 3: Refactor the mapper**

In `GermCountMapper.java`, replace the existing `@AfterMapping default void applySlots(GermCountDto dto, @MappingTarget GermCountEntity e)` method so the switch lives in a `List`-based method and the `@AfterMapping` delegates to it. The 13-case switch body is unchanged — only the method it lives in changes:

```java
  @AfterMapping
  default void applySlots(GermCountDto dto, @MappingTarget GermCountEntity e) {
    if (dto.slots() == null) {
      return;
    }
    applySlots(dto.slots(), e);
  }

  /**
   * Writes the numbered slot columns on {@code e} for each slot, keyed by its slotIndex.
   *
   * @param slots the slot observations to write (each slotIndex must be 1-13)
   * @param e     the entity to populate
   */
  default void applySlots(java.util.List<GermCountSlotDto> slots, @MappingTarget GermCountEntity e) {
    if (slots == null) {
      return;
    }
    for (GermCountSlotDto s : slots) {
      switch (s.slotIndex()) {
        case 1  -> { e.setDailyGermSkey1(s.dailyGermSkey());  e.setCountDt1(s.countDt());  e.setDayNoOfTest1(s.dayNoOfTest());  e.setRep1NoSeedsGerm1(s.rep1NoSeedsGerm());  e.setRep2NoSeedsGerm1(s.rep2NoSeedsGerm());  e.setRep3NoSeedsGerm1(s.rep3NoSeedsGerm());  e.setRep4NoSeedsGerm1(s.rep4NoSeedsGerm());  e.setCumulativeGerm1(s.cumulativeGerm()); }
        case 2  -> { e.setDailyGermSkey2(s.dailyGermSkey());  e.setCountDt2(s.countDt());  e.setDayNoOfTest2(s.dayNoOfTest());  e.setRep1NoSeedsGerm2(s.rep1NoSeedsGerm());  e.setRep2NoSeedsGerm2(s.rep2NoSeedsGerm());  e.setRep3NoSeedsGerm2(s.rep3NoSeedsGerm());  e.setRep4NoSeedsGerm2(s.rep4NoSeedsGerm());  e.setCumulativeGerm2(s.cumulativeGerm()); }
        case 3  -> { e.setDailyGermSkey3(s.dailyGermSkey());  e.setCountDt3(s.countDt());  e.setDayNoOfTest3(s.dayNoOfTest());  e.setRep1NoSeedsGerm3(s.rep1NoSeedsGerm());  e.setRep2NoSeedsGerm3(s.rep2NoSeedsGerm());  e.setRep3NoSeedsGerm3(s.rep3NoSeedsGerm());  e.setRep4NoSeedsGerm3(s.rep4NoSeedsGerm());  e.setCumulativeGerm3(s.cumulativeGerm()); }
        case 4  -> { e.setDailyGermSkey4(s.dailyGermSkey());  e.setCountDt4(s.countDt());  e.setDayNoOfTest4(s.dayNoOfTest());  e.setRep1NoSeedsGerm4(s.rep1NoSeedsGerm());  e.setRep2NoSeedsGerm4(s.rep2NoSeedsGerm());  e.setRep3NoSeedsGerm4(s.rep3NoSeedsGerm());  e.setRep4NoSeedsGerm4(s.rep4NoSeedsGerm());  e.setCumulativeGerm4(s.cumulativeGerm()); }
        case 5  -> { e.setDailyGermSkey5(s.dailyGermSkey());  e.setCountDt5(s.countDt());  e.setDayNoOfTest5(s.dayNoOfTest());  e.setRep1NoSeedsGerm5(s.rep1NoSeedsGerm());  e.setRep2NoSeedsGerm5(s.rep2NoSeedsGerm());  e.setRep3NoSeedsGerm5(s.rep3NoSeedsGerm());  e.setRep4NoSeedsGerm5(s.rep4NoSeedsGerm());  e.setCumulativeGerm5(s.cumulativeGerm()); }
        case 6  -> { e.setDailyGermSkey6(s.dailyGermSkey());  e.setCountDt6(s.countDt());  e.setDayNoOfTest6(s.dayNoOfTest());  e.setRep1NoSeedsGerm6(s.rep1NoSeedsGerm());  e.setRep2NoSeedsGerm6(s.rep2NoSeedsGerm());  e.setRep3NoSeedsGerm6(s.rep3NoSeedsGerm());  e.setRep4NoSeedsGerm6(s.rep4NoSeedsGerm());  e.setCumulativeGerm6(s.cumulativeGerm()); }
        case 7  -> { e.setDailyGermSkey7(s.dailyGermSkey());  e.setCountDt7(s.countDt());  e.setDayNoOfTest7(s.dayNoOfTest());  e.setRep1NoSeedsGerm7(s.rep1NoSeedsGerm());  e.setRep2NoSeedsGerm7(s.rep2NoSeedsGerm());  e.setRep3NoSeedsGerm7(s.rep3NoSeedsGerm());  e.setRep4NoSeedsGerm7(s.rep4NoSeedsGerm());  e.setCumulativeGerm7(s.cumulativeGerm()); }
        case 8  -> { e.setDailyGermSkey8(s.dailyGermSkey());  e.setCountDt8(s.countDt());  e.setDayNoOfTest8(s.dayNoOfTest());  e.setRep1NoSeedsGerm8(s.rep1NoSeedsGerm());  e.setRep2NoSeedsGerm8(s.rep2NoSeedsGerm());  e.setRep3NoSeedsGerm8(s.rep3NoSeedsGerm());  e.setRep4NoSeedsGerm8(s.rep4NoSeedsGerm());  e.setCumulativeGerm8(s.cumulativeGerm()); }
        case 9  -> { e.setDailyGermSkey9(s.dailyGermSkey());  e.setCountDt9(s.countDt());  e.setDayNoOfTest9(s.dayNoOfTest());  e.setRep1NoSeedsGerm9(s.rep1NoSeedsGerm());  e.setRep2NoSeedsGerm9(s.rep2NoSeedsGerm());  e.setRep3NoSeedsGerm9(s.rep3NoSeedsGerm());  e.setRep4NoSeedsGerm9(s.rep4NoSeedsGerm());  e.setCumulativeGerm9(s.cumulativeGerm()); }
        case 10 -> { e.setDailyGermSkey10(s.dailyGermSkey()); e.setCountDt10(s.countDt()); e.setDayNoOfTest10(s.dayNoOfTest()); e.setRep1NoSeedsGerm10(s.rep1NoSeedsGerm()); e.setRep2NoSeedsGerm10(s.rep2NoSeedsGerm()); e.setRep3NoSeedsGerm10(s.rep3NoSeedsGerm()); e.setRep4NoSeedsGerm10(s.rep4NoSeedsGerm()); e.setCumulativeGerm10(s.cumulativeGerm()); }
        case 11 -> { e.setDailyGermSkey11(s.dailyGermSkey()); e.setCountDt11(s.countDt()); e.setDayNoOfTest11(s.dayNoOfTest()); e.setRep1NoSeedsGerm11(s.rep1NoSeedsGerm()); e.setRep2NoSeedsGerm11(s.rep2NoSeedsGerm()); e.setRep3NoSeedsGerm11(s.rep3NoSeedsGerm()); e.setRep4NoSeedsGerm11(s.rep4NoSeedsGerm()); e.setCumulativeGerm11(s.cumulativeGerm()); }
        case 12 -> { e.setDailyGermSkey12(s.dailyGermSkey()); e.setCountDt12(s.countDt()); e.setDayNoOfTest12(s.dayNoOfTest()); e.setRep1NoSeedsGerm12(s.rep1NoSeedsGerm()); e.setRep2NoSeedsGerm12(s.rep2NoSeedsGerm()); e.setRep3NoSeedsGerm12(s.rep3NoSeedsGerm()); e.setRep4NoSeedsGerm12(s.rep4NoSeedsGerm()); e.setCumulativeGerm12(s.cumulativeGerm()); }
        case 13 -> { e.setDailyGermSkey13(s.dailyGermSkey()); e.setCountDt13(s.countDt()); e.setDayNoOfTest13(s.dayNoOfTest()); e.setRep1NoSeedsGerm13(s.rep1NoSeedsGerm()); e.setRep2NoSeedsGerm13(s.rep2NoSeedsGerm()); e.setRep3NoSeedsGerm13(s.rep3NoSeedsGerm()); e.setRep4NoSeedsGerm13(s.rep4NoSeedsGerm()); e.setCumulativeGerm13(s.cumulativeGerm()); }
        default -> throw new IllegalArgumentException("Invalid slot index: " + s.slotIndex());
      }
    }
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd oracle-api && ./mvnw -q -Dtest=GermCountMapperTest,GermCountServiceTest test`
Expected: PASS (existing service test still green — the `@AfterMapping` behavior is unchanged).

- [ ] **Step 5: Commit**

```bash
git add oracle-api/src/main/java/ca/bc/gov/oracleapi/mapper/GermCountMapper.java oracle-api/src/test/java/ca/bc/gov/oracleapi/mapper/GermCountMapperTest.java
git commit -m "refactor(2443): expose reusable applySlots(List) on GermCountMapper"
```

### Task 3: Repository methods + test schema

Add the optimistic-lock guard and the sequence-nextval query to `GermCountRepository`, and the two missing tables + the sequence to `schema.sql` so the `@DataJpaTest` (Oracle-mode) repository test can exercise them. `DailyAbnormalRepository` and `TestRepGermRepository` already extend `JpaRepository` (used later via `save`/`saveAll`), so no new methods there.

**Files:**
- Modify: `oracle-api/src/main/java/ca/bc/gov/oracleapi/repository/consep/GermCountRepository.java`
- Modify: `oracle-api/src/test/resources/schema.sql`
- Test: `oracle-api/src/test/java/ca/bc/gov/oracleapi/repository/consep/GermCountRepositoryTest.java` (create)

**Interfaces:**
- Produces on `GermCountRepository`:
  - `int touchIfTimestampMatches(BigDecimal riaSkey, LocalDateTime updateTimestamp)` — `@Modifying(clearAutomatically = true, flushAutomatically = true)`; returns rows updated (0 → caller throws 409).
  - `BigDecimal nextDailyGermSkey()` — native, `SELECT CONSEP.CNS_SEQ_COUNTER.NEXTVAL FROM DUAL`.

- [ ] **Step 1: Add the two tables + sequence to `schema.sql`**

Append to `oracle-api/src/test/resources/schema.sql`:

```sql
CREATE SEQUENCE IF NOT EXISTS CONSEP.CNS_SEQ_COUNTER START WITH 1000 INCREMENT BY 1;

CREATE TABLE CONSEP.CNS_T_GERM_COUNT (
    RIA_SKEY DECIMAL(10, 0) PRIMARY KEY,
    DAILY_GERM_SKEY1 DECIMAL(10,0), COUNT_DT1 DATE, DAY_NO_OF_TEST1 DECIMAL(5,0), REP1_NO_SEEDS_GERM1 DECIMAL(5,0), REP2_NO_SEEDS_GERM1 DECIMAL(5,0), REP3_NO_SEEDS_GERM1 DECIMAL(5,0), REP4_NO_SEEDS_GERM1 DECIMAL(5,0), CUMULATIVE_GERM1 DECIMAL(7,4),
    DAILY_GERM_SKEY2 DECIMAL(10,0), COUNT_DT2 DATE, DAY_NO_OF_TEST2 DECIMAL(5,0), REP1_NO_SEEDS_GERM2 DECIMAL(5,0), REP2_NO_SEEDS_GERM2 DECIMAL(5,0), REP3_NO_SEEDS_GERM2 DECIMAL(5,0), REP4_NO_SEEDS_GERM2 DECIMAL(5,0), CUMULATIVE_GERM2 DECIMAL(7,4),
    DAILY_GERM_SKEY3 DECIMAL(10,0), COUNT_DT3 DATE, DAY_NO_OF_TEST3 DECIMAL(5,0), REP1_NO_SEEDS_GERM3 DECIMAL(5,0), REP2_NO_SEEDS_GERM3 DECIMAL(5,0), REP3_NO_SEEDS_GERM3 DECIMAL(5,0), REP4_NO_SEEDS_GERM3 DECIMAL(5,0), CUMULATIVE_GERM3 DECIMAL(7,4),
    DAILY_GERM_SKEY4 DECIMAL(10,0), COUNT_DT4 DATE, DAY_NO_OF_TEST4 DECIMAL(5,0), REP1_NO_SEEDS_GERM4 DECIMAL(5,0), REP2_NO_SEEDS_GERM4 DECIMAL(5,0), REP3_NO_SEEDS_GERM4 DECIMAL(5,0), REP4_NO_SEEDS_GERM4 DECIMAL(5,0), CUMULATIVE_GERM4 DECIMAL(7,4),
    DAILY_GERM_SKEY5 DECIMAL(10,0), COUNT_DT5 DATE, DAY_NO_OF_TEST5 DECIMAL(5,0), REP1_NO_SEEDS_GERM5 DECIMAL(5,0), REP2_NO_SEEDS_GERM5 DECIMAL(5,0), REP3_NO_SEEDS_GERM5 DECIMAL(5,0), REP4_NO_SEEDS_GERM5 DECIMAL(5,0), CUMULATIVE_GERM5 DECIMAL(7,4),
    DAILY_GERM_SKEY6 DECIMAL(10,0), COUNT_DT6 DATE, DAY_NO_OF_TEST6 DECIMAL(5,0), REP1_NO_SEEDS_GERM6 DECIMAL(5,0), REP2_NO_SEEDS_GERM6 DECIMAL(5,0), REP3_NO_SEEDS_GERM6 DECIMAL(5,0), REP4_NO_SEEDS_GERM6 DECIMAL(5,0), CUMULATIVE_GERM6 DECIMAL(7,4),
    DAILY_GERM_SKEY7 DECIMAL(10,0), COUNT_DT7 DATE, DAY_NO_OF_TEST7 DECIMAL(5,0), REP1_NO_SEEDS_GERM7 DECIMAL(5,0), REP2_NO_SEEDS_GERM7 DECIMAL(5,0), REP3_NO_SEEDS_GERM7 DECIMAL(5,0), REP4_NO_SEEDS_GERM7 DECIMAL(5,0), CUMULATIVE_GERM7 DECIMAL(7,4),
    DAILY_GERM_SKEY8 DECIMAL(10,0), COUNT_DT8 DATE, DAY_NO_OF_TEST8 DECIMAL(5,0), REP1_NO_SEEDS_GERM8 DECIMAL(5,0), REP2_NO_SEEDS_GERM8 DECIMAL(5,0), REP3_NO_SEEDS_GERM8 DECIMAL(5,0), REP4_NO_SEEDS_GERM8 DECIMAL(5,0), CUMULATIVE_GERM8 DECIMAL(7,4),
    DAILY_GERM_SKEY9 DECIMAL(10,0), COUNT_DT9 DATE, DAY_NO_OF_TEST9 DECIMAL(5,0), REP1_NO_SEEDS_GERM9 DECIMAL(5,0), REP2_NO_SEEDS_GERM9 DECIMAL(5,0), REP3_NO_SEEDS_GERM9 DECIMAL(5,0), REP4_NO_SEEDS_GERM9 DECIMAL(5,0), CUMULATIVE_GERM9 DECIMAL(7,4),
    DAILY_GERM_SKEY10 DECIMAL(10,0), COUNT_DT10 DATE, DAY_NO_OF_TEST10 DECIMAL(5,0), REP1_NO_SEEDS_GERM10 DECIMAL(5,0), REP2_NO_SEEDS_GERM10 DECIMAL(5,0), REP3_NO_SEEDS_GERM10 DECIMAL(5,0), REP4_NO_SEEDS_GERM10 DECIMAL(5,0), CUMULATIVE_GERM10 DECIMAL(7,4),
    DAILY_GERM_SKEY11 DECIMAL(10,0), COUNT_DT11 DATE, DAY_NO_OF_TEST11 DECIMAL(5,0), REP1_NO_SEEDS_GERM11 DECIMAL(5,0), REP2_NO_SEEDS_GERM11 DECIMAL(5,0), REP3_NO_SEEDS_GERM11 DECIMAL(5,0), REP4_NO_SEEDS_GERM11 DECIMAL(5,0), CUMULATIVE_GERM11 DECIMAL(7,4),
    DAILY_GERM_SKEY12 DECIMAL(10,0), COUNT_DT12 DATE, DAY_NO_OF_TEST12 DECIMAL(5,0), REP1_NO_SEEDS_GERM12 DECIMAL(5,0), REP2_NO_SEEDS_GERM12 DECIMAL(5,0), REP3_NO_SEEDS_GERM12 DECIMAL(5,0), REP4_NO_SEEDS_GERM12 DECIMAL(5,0), CUMULATIVE_GERM12 DECIMAL(7,4),
    DAILY_GERM_SKEY13 DECIMAL(10,0), COUNT_DT13 DATE, DAY_NO_OF_TEST13 DECIMAL(5,0), REP1_NO_SEEDS_GERM13 DECIMAL(5,0), REP2_NO_SEEDS_GERM13 DECIMAL(5,0), REP3_NO_SEEDS_GERM13 DECIMAL(5,0), REP4_NO_SEEDS_GERM13 DECIMAL(5,0), CUMULATIVE_GERM13 DECIMAL(7,4),
    ENTRY_USERID VARCHAR(30), ENTRY_TIMESTAMP TIMESTAMP, UPDATE_USERID VARCHAR(30), UPDATE_TIMESTAMP TIMESTAMP
);

CREATE TABLE CONSEP.CNS_T_DAILY_ABNORMAL (
    DAILY_GERM_SKEY DECIMAL(10, 0) PRIMARY KEY,
    RP1_NO_ABNRM_RE DECIMAL(5,0), RP1_NO_ABNRM_SR DECIMAL(5,0), RP1_NO_ABNRM_SH DECIMAL(5,0), RP1_NO_ABNRM_RN DECIMAL(5,0), RP1_NO_ABNRM_TH DECIMAL(5,0), RP1_NO_ABNRM_TR DECIMAL(5,0), RP1_NO_ABNRM_TW DECIMAL(5,0), RP1_NO_ABNRM_CM DECIMAL(5,0), RP1_NO_ABNRM_WEAK DECIMAL(5,0), RP1_NO_ABNRM_OTHER DECIMAL(5,0), RP1_NO_ABNRM_PRGRM DECIMAL(5,0),
    RP2_NO_ABNRM_RE DECIMAL(5,0), RP2_NO_ABNRM_SR DECIMAL(5,0), RP2_NO_ABNRM_SH DECIMAL(5,0), RP2_NO_ABNRM_RN DECIMAL(5,0), RP2_NO_ABNRM_TH DECIMAL(5,0), RP2_NO_ABNRM_TR DECIMAL(5,0), RP2_NO_ABNRM_TW DECIMAL(5,0), RP2_NO_ABNRM_CM DECIMAL(5,0), RP2_NO_ABNRM_WEAK DECIMAL(5,0), RP2_NO_ABNRM_OTHER DECIMAL(5,0), RP2_NO_ABNRM_PRGRM DECIMAL(5,0),
    RP3_NO_ABNRM_RE DECIMAL(5,0), RP3_NO_ABNRM_SR DECIMAL(5,0), RP3_NO_ABNRM_SH DECIMAL(5,0), RP3_NO_ABNRM_RN DECIMAL(5,0), RP3_NO_ABNRM_TH DECIMAL(5,0), RP3_NO_ABNRM_TR DECIMAL(5,0), RP3_NO_ABNRM_TW DECIMAL(5,0), RP3_NO_ABNRM_CM DECIMAL(5,0), RP3_NO_ABNRM_WEAK DECIMAL(5,0), RP3_NO_ABNRM_OTHER DECIMAL(5,0), RP3_NO_ABNRM_PRGRM DECIMAL(5,0),
    RP4_NO_ABNRM_RE DECIMAL(5,0), RP4_NO_ABNRM_SR DECIMAL(5,0), RP4_NO_ABNRM_SH DECIMAL(5,0), RP4_NO_ABNRM_RN DECIMAL(5,0), RP4_NO_ABNRM_TH DECIMAL(5,0), RP4_NO_ABNRM_TR DECIMAL(5,0), RP4_NO_ABNRM_TW DECIMAL(5,0), RP4_NO_ABNRM_CM DECIMAL(5,0), RP4_NO_ABNRM_WEAK DECIMAL(5,0), RP4_NO_ABNRM_OTHER DECIMAL(5,0), RP4_NO_ABNRM_PRGRM DECIMAL(5,0)
);
```

- [ ] **Step 2: Write the failing repository test**

Create `oracle-api/src/test/java/ca/bc/gov/oracleapi/repository/consep/GermCountRepositoryTest.java`:

```java
package ca.bc.gov.oracleapi.repository.consep;

import static org.assertj.core.api.Assertions.assertThat;

import ca.bc.gov.oracleapi.entity.consep.GermCountEntity;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.TestPropertySource;

@DataJpaTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;"
    + "MODE=Oracle;"
    + "DATABASE_TO_UPPER=false;"
    + "DB_CLOSE_DELAY=-1;"
    + "INIT=CREATE SCHEMA IF NOT EXISTS CONSEP",
    "spring.jpa.hibernate.ddl-auto=none",
    "spring.sql.init.mode=always"
})
class GermCountRepositoryTest {

  @Autowired
  private GermCountRepository germCountRepository;

  @Autowired
  private TestEntityManager entityManager;

  private GermCountEntity persistRow(BigDecimal riaSkey, LocalDateTime updateTs) {
    GermCountEntity e = new GermCountEntity();
    e.setRiaSkey(riaSkey);
    e.setUpdateTimestamp(updateTs);
    entityManager.persist(e);
    entityManager.flush();
    entityManager.clear();
    return e;
  }

  @Test
  void nextDailyGermSkey_returnsIncreasingValues() {
    BigDecimal first = germCountRepository.nextDailyGermSkey();
    BigDecimal second = germCountRepository.nextDailyGermSkey();
    assertThat(first).isNotNull();
    assertThat(second).isGreaterThan(first);
  }

  @Test
  void touchIfTimestampMatches_updatesOneRow_whenTimestampMatches() {
    LocalDateTime ts = LocalDateTime.of(2026, 4, 5, 14, 30, 0);
    persistRow(BigDecimal.valueOf(881191), ts);

    int rows = germCountRepository.touchIfTimestampMatches(BigDecimal.valueOf(881191), ts);

    assertThat(rows).isEqualTo(1);
  }

  @Test
  void touchIfTimestampMatches_updatesNoRows_whenTimestampStale() {
    LocalDateTime ts = LocalDateTime.of(2026, 4, 5, 14, 30, 0);
    persistRow(BigDecimal.valueOf(881191), ts);

    int rows = germCountRepository.touchIfTimestampMatches(
        BigDecimal.valueOf(881191), ts.minusHours(1));

    assertThat(rows).isZero();
  }
}
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd oracle-api && ./mvnw -q -Dtest=GermCountRepositoryTest test`
Expected: FAIL — `nextDailyGermSkey` / `touchIfTimestampMatches` do not exist (compile error).

- [ ] **Step 4: Add the repository methods**

In `GermCountRepository.java`, add imports and the two methods to the interface body:

```java
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
```

```java
  /**
   * Optimistic-lock guard for updates: bumps update_timestamp only if it still matches
   * the value the caller read. Returns 0 when the row changed since (caller throws 409).
   */
  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Transactional
  @Query("""
      UPDATE GermCountEntity g
         SET g.updateTimestamp = CURRENT_TIMESTAMP
       WHERE g.riaSkey = :riaSkey
         AND g.updateTimestamp = :updateTimestamp
      """)
  int touchIfTimestampMatches(
      @Param("riaSkey") BigDecimal riaSkey,
      @Param("updateTimestamp") LocalDateTime updateTimestamp);

  /**
   * Next surrogate key for a daily germ slot / abnormal row (Oracle sequence).
   */
  @Query(value = "SELECT CONSEP.CNS_SEQ_COUNTER.NEXTVAL FROM DUAL", nativeQuery = true)
  BigDecimal nextDailyGermSkey();
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd oracle-api && ./mvnw -q -Dtest=GermCountRepositoryTest test`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add oracle-api/src/main/java/ca/bc/gov/oracleapi/repository/consep/GermCountRepository.java oracle-api/src/test/resources/schema.sql oracle-api/src/test/java/ca/bc/gov/oracleapi/repository/consep/GermCountRepositoryTest.java
git commit -m "feat(2443): add optimistic-lock guard + sequence query to GermCountRepository"
```

### Task 4: Service — germ_count upsert core (AC1, AC2, AC4 + date/empty validation)

Add the transactional `upsertGermCounts` method covering: insert/update decision, optimistic lock (AC1), `DAILY_GERM_SKEY` generation (AC2), cumulative recompute (AC4), rep null→0 normalization, ascending-date and non-empty validation, and persisting `CNS_T_GERM_COUNT`. Abnormals, replicates, and AC3 are added in Task 5.

**Files:**
- Modify: `oracle-api/src/main/java/ca/bc/gov/oracleapi/service/consep/GermCountService.java`
- Test: `oracle-api/src/test/java/ca/bc/gov/oracleapi/service/consep/GermCountServiceTest.java` (extend)

**Interfaces:**
- Consumes: `GermCountRepository.existsById`, `findById`, `touchIfTimestampMatches`, `nextDailyGermSkey`, `save`; `GermCountMapper.buildSlots(GermCountEntity)`, `applySlots(List<GermCountSlotDto>, GermCountEntity)`, `toDto`.
- Produces: `GermCountDto upsertGermCounts(BigDecimal riaSkey, GermCountUpsertRequestDto request, String requestUserId)` — `@Transactional(rollbackFor = ResponseStatusException.class)`. Also a package-private helper `List<GermCountSlotDto> buildSlotsForSave(List<DayGermCountDto> sortedDays, GermCountEntity entity)` used by Task 5's persistence too.

- [ ] **Step 1: Write failing service tests**

Add these fields/imports and tests to `GermCountServiceTest.java` (keep the existing `getGermCounts` tests). Add a `@Captor`-free style using `ArgumentCaptor`:

```java
// add imports
import ca.bc.gov.oracleapi.dto.consep.DayGermCountDto;
import ca.bc.gov.oracleapi.dto.consep.GermCountUpsertRequestDto;
import ca.bc.gov.oracleapi.dto.consep.ReplicateAbnormalDto;
import ca.bc.gov.oracleapi.dto.consep.TestRepGermFormDto;
import ca.bc.gov.oracleapi.repository.consep.DailyAbnormalRepository;
import ca.bc.gov.oracleapi.repository.consep.TestRepGermRepository;
import java.util.ArrayList;
import java.util.List;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;

// add mocks to the test class
@Mock private DailyAbnormalRepository dailyAbnormalRepository;
@Mock private TestRepGermRepository testRepGermRepository;
```

Add a null-safe abnormal builder and request helpers plus the tests:

```java
  private static ReplicateAbnormalDto zeroAbnormal() {
    return new ReplicateAbnormalDto(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null);
  }

  private static DayGermCountDto day(int slot, LocalDate dt, int dayNo,
      Integer r1, Integer r2, Integer r3, Integer r4) {
    return new DayGermCountDto(slot, dt, dayNo, r1, r2, r3, r4,
        zeroAbnormal(), zeroAbnormal(), zeroAbnormal(), zeroAbnormal());
  }

  private static TestRepGermFormDto rep(int n, int total) {
    return new TestRepGermFormDto(n, total, 0, 0, 0, 0, 0, 0, 0, 1, null);
  }

  private static GermCountUpsertRequestDto request(
      LocalDateTime updateTs, List<DayGermCountDto> days) {
    return new GermCountUpsertRequestDto(
        updateTs, days,
        List.of(rep(1, 100), rep(2, 100), rep(3, 100), rep(4, 100)));
  }

  @Test
  void upsert_insertsNewRow_generatesSkeyOnlyForDatedDays_andComputesCumulative() {
    BigDecimal riaSkey = new BigDecimal("881191");
    when(germCountRepository.existsById(riaSkey)).thenReturn(false);
    when(germCountRepository.nextDailyGermSkey())
        .thenReturn(new BigDecimal("2001"), new BigDecimal("2002"));
    when(germCountRepository.save(any(GermCountEntity.class)))
        .thenAnswer(inv -> inv.getArgument(0));

    List<DayGermCountDto> days = new ArrayList<>();
    days.add(day(1, LocalDate.of(2026, 4, 1), 1, 10, 12, 11, 9));
    days.add(day(2, LocalDate.of(2026, 4, 3), 2, 5, 6, 7, 8));

    germCountService.upsertGermCounts(riaSkey, request(null, days), "USER1");

    ArgumentCaptor<GermCountEntity> captor = ArgumentCaptor.forClass(GermCountEntity.class);
    verify(germCountRepository).save(captor.capture());
    GermCountEntity saved = captor.getValue();

    assertEquals(new BigDecimal("2001"), saved.getDailyGermSkey1());
    assertEquals(new BigDecimal("2002"), saved.getDailyGermSkey2());
    // cumulative: day1 = 10+12+11+9 = 42; day2 = 42 + (5+6+7+8=26) = 68
    assertEquals(0, saved.getCumulativeGerm1().compareTo(new BigDecimal("42")));
    assertEquals(0, saved.getCumulativeGerm2().compareTo(new BigDecimal("68")));
    assertEquals("USER1", saved.getEntryUserid());
    assertEquals("USER1", saved.getUpdateUserid());
  }

  @Test
  void upsert_update_withMatchingTimestamp_succeeds() {
    BigDecimal riaSkey = new BigDecimal("881191");
    LocalDateTime ts = LocalDateTime.of(2026, 4, 5, 14, 30);
    GermCountEntity existing = new GermCountEntity();
    existing.setRiaSkey(riaSkey);
    existing.setUpdateTimestamp(ts);

    when(germCountRepository.existsById(riaSkey)).thenReturn(true);
    when(germCountRepository.touchIfTimestampMatches(riaSkey, ts)).thenReturn(1);
    when(germCountRepository.findById(riaSkey)).thenReturn(Optional.of(existing));
    when(germCountRepository.nextDailyGermSkey()).thenReturn(new BigDecimal("2001"));
    when(germCountRepository.save(any(GermCountEntity.class)))
        .thenAnswer(inv -> inv.getArgument(0));

    List<DayGermCountDto> days = List.of(day(1, LocalDate.of(2026, 4, 1), 1, 10, 12, 11, 9));

    germCountService.upsertGermCounts(riaSkey, request(ts, days), "USER2");

    verify(germCountRepository).touchIfTimestampMatches(riaSkey, ts);
    verify(germCountRepository).save(any(GermCountEntity.class));
  }

  @Test
  void upsert_update_withStaleTimestamp_throwsConflict() {
    BigDecimal riaSkey = new BigDecimal("881191");
    LocalDateTime ts = LocalDateTime.of(2026, 4, 5, 14, 30);
    when(germCountRepository.existsById(riaSkey)).thenReturn(true);
    when(germCountRepository.touchIfTimestampMatches(riaSkey, ts)).thenReturn(0);

    List<DayGermCountDto> days = List.of(day(1, LocalDate.of(2026, 4, 1), 1, 1, 1, 1, 1));

    ResponseStatusException ex = assertThrows(ResponseStatusException.class,
        () -> germCountService.upsertGermCounts(riaSkey, request(ts, days), "USER2"));
    assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    verify(germCountRepository, never()).save(any());
  }

  @Test
  void upsert_update_missingTimestamp_throwsBadRequest() {
    BigDecimal riaSkey = new BigDecimal("881191");
    when(germCountRepository.existsById(riaSkey)).thenReturn(true);
    List<DayGermCountDto> days = List.of(day(1, LocalDate.of(2026, 4, 1), 1, 1, 1, 1, 1));

    ResponseStatusException ex = assertThrows(ResponseStatusException.class,
        () -> germCountService.upsertGermCounts(riaSkey, request(null, days), "USER2"));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
  }

  @Test
  void upsert_nonIncreasingDates_throwsBadRequest() {
    BigDecimal riaSkey = new BigDecimal("881191");
    when(germCountRepository.existsById(riaSkey)).thenReturn(false);
    List<DayGermCountDto> days = new ArrayList<>();
    days.add(day(1, LocalDate.of(2026, 4, 3), 1, 1, 1, 1, 1));
    days.add(day(2, LocalDate.of(2026, 4, 3), 2, 1, 1, 1, 1)); // not strictly greater

    ResponseStatusException ex = assertThrows(ResponseStatusException.class,
        () -> germCountService.upsertGermCounts(riaSkey, request(null, days), "USER1"));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
  }

  @Test
  void upsert_emptyDays_throwsBadRequest() {
    BigDecimal riaSkey = new BigDecimal("881191");
    GermCountUpsertRequestDto req = new GermCountUpsertRequestDto(
        null, List.of(), List.of(rep(1, 100)));
    ResponseStatusException ex = assertThrows(ResponseStatusException.class,
        () -> germCountService.upsertGermCounts(riaSkey, req, "USER1"));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
  }
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd oracle-api && ./mvnw -q -Dtest=GermCountServiceTest test`
Expected: FAIL — `upsertGermCounts` does not exist (compile error).

- [ ] **Step 3: Implement the service method**

Add imports to `GermCountService.java`:

```java
import ca.bc.gov.oracleapi.dto.consep.DayGermCountDto;
import ca.bc.gov.oracleapi.dto.consep.GermCountSlotDto;
import ca.bc.gov.oracleapi.dto.consep.GermCountUpsertRequestDto;
import ca.bc.gov.oracleapi.entity.consep.GermCountEntity;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
```

Add the method and helpers to the class body:

```java
  /**
   * Insert or update the daily germination counts for one test (AC1, AC2, AC4).
   *
   * @param riaSkey       the test key (path)
   * @param request       days + replicates payload
   * @param requestUserId the authenticated user id, for audit columns
   * @return the saved germ count DTO
   */
  @Transactional(rollbackFor = ResponseStatusException.class)
  public GermCountDto upsertGermCounts(
      BigDecimal riaSkey, GermCountUpsertRequestDto request, String requestUserId) {
    if (riaSkey == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "RIA_SKEY cannot be null");
    }
    if (request == null || request.days() == null || request.days().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one day is required");
    }
    if (request.replicates() == null || request.replicates().isEmpty()) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "At least one replicate is required");
    }

    List<DayGermCountDto> days = new ArrayList<>(request.days());
    days.sort(Comparator.comparingInt(DayGermCountDto::slotIndex));
    validateSlots(days);
    validateAscendingDates(days);

    LocalDateTime now = LocalDateTime.now();
    GermCountEntity entity;
    if (germCountRepository.existsById(riaSkey)) {
      if (request.updateTimestamp() == null) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "updateTimestamp is required to update an existing record");
      }
      int rows = germCountRepository.touchIfTimestampMatches(riaSkey, request.updateTimestamp());
      if (rows == 0) {
        throw new ResponseStatusException(
            HttpStatus.CONFLICT, "Record changed since last read; please reselect and retry");
      }
      entity = germCountRepository.findById(riaSkey).orElseThrow(() ->
          new ResponseStatusException(
              HttpStatus.CONFLICT, "Record changed since last read; please reselect and retry"));
    } else {
      entity = new GermCountEntity();
      entity.setRiaSkey(riaSkey);
      entity.setEntryUserid(requestUserId);
      entity.setEntryTimestamp(now);
    }

    List<GermCountSlotDto> slots = buildSlotsForSave(days, entity);
    mapper.applySlots(slots, entity);
    entity.setUpdateUserid(requestUserId);
    entity.setUpdateTimestamp(now);
    germCountRepository.save(entity);

    SparLog.info("Saved germ counts for RIA_SKEY: {}", riaSkey);
    return mapper.toDto(entity);
  }

  private void validateSlots(List<DayGermCountDto> days) {
    Set<Integer> seen = new HashSet<>();
    for (DayGermCountDto d : days) {
      if (d.slotIndex() == null || d.slotIndex() < 1 || d.slotIndex() > 13) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "slotIndex must be between 1 and 13");
      }
      if (!seen.add(d.slotIndex())) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "Duplicate slotIndex: " + d.slotIndex());
      }
    }
  }

  private void validateAscendingDates(List<DayGermCountDto> days) {
    LocalDate previous = null;
    for (DayGermCountDto d : days) {
      if (d.countDt() == null) {
        continue;
      }
      if (previous != null && !d.countDt().isAfter(previous)) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Each count date must be greater than the previous count date");
      }
      previous = d.countDt();
    }
  }

  /**
   * Builds the slot list to persist: assigns a new DAILY_GERM_SKEY only for dated days
   * that don't already have one (AC2), applies rep null-to-zero for used replicates,
   * and recomputes cumulative germination as the running sum across days (AC4).
   */
  List<GermCountSlotDto> buildSlotsForSave(
      List<DayGermCountDto> sortedDays, GermCountEntity entity) {
    Map<Integer, BigDecimal> existingSkeys =
        mapper.buildSlots(entity).stream()
            .collect(Collectors.toMap(GermCountSlotDto::slotIndex, GermCountSlotDto::dailyGermSkey));

    boolean[] repUsed = new boolean[4];
    for (DayGermCountDto d : sortedDays) {
      if (d.rep1NoSeedsGerm() != null) repUsed[0] = true;
      if (d.rep2NoSeedsGerm() != null) repUsed[1] = true;
      if (d.rep3NoSeedsGerm() != null) repUsed[2] = true;
      if (d.rep4NoSeedsGerm() != null) repUsed[3] = true;
    }

    List<GermCountSlotDto> slots = new ArrayList<>(sortedDays.size());
    long cumulative = 0;
    for (DayGermCountDto d : sortedDays) {
      Integer r1 = normalize(d.rep1NoSeedsGerm(), repUsed[0]);
      Integer r2 = normalize(d.rep2NoSeedsGerm(), repUsed[1]);
      Integer r3 = normalize(d.rep3NoSeedsGerm(), repUsed[2]);
      Integer r4 = normalize(d.rep4NoSeedsGerm(), repUsed[3]);
      cumulative += zero(r1) + zero(r2) + zero(r3) + zero(r4);

      BigDecimal skey = existingSkeys.get(d.slotIndex());
      if (d.countDt() != null && skey == null) {
        skey = germCountRepository.nextDailyGermSkey();
      }

      slots.add(new GermCountSlotDto(
          d.slotIndex(), skey, d.countDt(), d.dayNoOfTest(),
          r1, r2, r3, r4, BigDecimal.valueOf(cumulative)));
    }
    return slots;
  }

  private static Integer normalize(Integer value, boolean repUsed) {
    if (value != null) {
      return value;
    }
    return repUsed ? 0 : null;
  }

  private static long zero(Integer value) {
    return value == null ? 0L : value;
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd oracle-api && ./mvnw -q -Dtest=GermCountServiceTest test`
Expected: PASS (existing `getGermCounts` tests + the 6 new upsert tests).

- [ ] **Step 5: Commit**

```bash
git add oracle-api/src/main/java/ca/bc/gov/oracleapi/service/consep/GermCountService.java oracle-api/src/test/java/ca/bc/gov/oracleapi/service/consep/GermCountServiceTest.java
git commit -m "feat(2443): germ_count upsert core with optimistic lock, skey gen, cumulative"
```

### Task 5: Service — abnormals + replicates persistence and AC3

Extend `upsertGermCounts` to (before persisting) validate abnormal ranges (0–999) and AC3 (per-replicate `Σgerm + Σabnormal ≤ totalNoSeeds`), and (after saving germ_count) persist `CNS_T_DAILY_ABNORMAL` rows keyed by each dated day's generated skey and upsert `CNS_T_TEST_REP_GERM` rows.

**Files:**
- Modify: `oracle-api/src/main/java/ca/bc/gov/oracleapi/service/consep/GermCountService.java`
- Test: `oracle-api/src/test/java/ca/bc/gov/oracleapi/service/consep/GermCountServiceTest.java` (extend)

**Interfaces:**
- Consumes: `DailyAbnormalRepository.findById`, `saveAll`; `TestRepGermRepository.findById`, `saveAll`; `ReplicateId`.
- Produces: no new public method — extends `upsertGermCounts`. Adds private helpers `validateAbnormalRanges`, `validateSeedTotals`, `saveAbnormals`, `saveReplicates`, `toAbnormalEntity`, `sumAbnormal`.

- [ ] **Step 1: Write failing tests (AC3 + ranges + persistence)**

Add to `GermCountServiceTest.java`. The insert/update happy-path tests from Task 4 must now also stub the two new repositories (they call `saveAll`). Add `lenient()` stubs in a `@BeforeEach` OR add the stubs to each happy-path test; simplest is a helper stubbing both:

```java
  private void stubChildSaves() {
    lenient().when(dailyAbnormalRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));
    lenient().when(testRepGermRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));
    lenient().when(testRepGermRepository.findById(any())).thenReturn(Optional.empty());
    lenient().when(dailyAbnormalRepository.findById(any())).thenReturn(Optional.empty());
  }
```

Call `stubChildSaves();` at the start of the two happy-path tests from Task 4
(`upsert_insertsNewRow_...` and `upsert_update_withMatchingTimestamp_succeeds`). Then add:

```java
  @Test
  void upsert_persistsAbnormalsForDatedDays_andReplicates() {
    BigDecimal riaSkey = new BigDecimal("881191");
    stubChildSaves();
    when(germCountRepository.existsById(riaSkey)).thenReturn(false);
    when(germCountRepository.nextDailyGermSkey()).thenReturn(new BigDecimal("2001"));
    when(germCountRepository.save(any(GermCountEntity.class)))
        .thenAnswer(inv -> inv.getArgument(0));

    List<DayGermCountDto> days = List.of(day(1, LocalDate.of(2026, 4, 1), 1, 10, 12, 11, 9));

    germCountService.upsertGermCounts(riaSkey, request(null, days), "USER1");

    ArgumentCaptor<List<DailyAbnormalEntity>> abCaptor = ArgumentCaptor.forClass(List.class);
    verify(dailyAbnormalRepository).saveAll(abCaptor.capture());
    assertEquals(1, abCaptor.getValue().size());
    assertEquals(new BigDecimal("2001"), abCaptor.getValue().get(0).getDailyGermSkey());

    ArgumentCaptor<List<TestRepGermEntity>> repCaptor = ArgumentCaptor.forClass(List.class);
    verify(testRepGermRepository).saveAll(repCaptor.capture());
    assertEquals(4, repCaptor.getValue().size());
  }

  @Test
  void upsert_seedTotalOverflow_throwsBadRequest_namingReplicate() {
    BigDecimal riaSkey = new BigDecimal("881191");
    // rep1: 60 germ + 50 abnormal = 110 > 100 total
    ReplicateAbnormalDto rep1Ab =
        new ReplicateAbnormalDto(50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null);
    DayGermCountDto d = new DayGermCountDto(
        1, LocalDate.of(2026, 4, 1), 1, 60, 1, 1, 1,
        rep1Ab, zeroAbnormal(), zeroAbnormal(), zeroAbnormal());
    GermCountUpsertRequestDto req = new GermCountUpsertRequestDto(
        null, List.of(d), List.of(rep(1, 100), rep(2, 100), rep(3, 100), rep(4, 100)));

    ResponseStatusException ex = assertThrows(ResponseStatusException.class,
        () -> germCountService.upsertGermCounts(riaSkey, req, "USER1"));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertTrue(ex.getReason().contains("Replicate 1"));
    verify(germCountRepository, never()).save(any());
  }

  @Test
  void upsert_seedTotalExactlyEqual_passes() {
    BigDecimal riaSkey = new BigDecimal("881191");
    stubChildSaves();
    when(germCountRepository.existsById(riaSkey)).thenReturn(false);
    when(germCountRepository.nextDailyGermSkey()).thenReturn(new BigDecimal("2001"));
    when(germCountRepository.save(any(GermCountEntity.class)))
        .thenAnswer(inv -> inv.getArgument(0));
    // rep1: 90 germ + 10 abnormal = 100 == total
    ReplicateAbnormalDto rep1Ab =
        new ReplicateAbnormalDto(10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null);
    DayGermCountDto d = new DayGermCountDto(
        1, LocalDate.of(2026, 4, 1), 1, 90, 0, 0, 0,
        rep1Ab, zeroAbnormal(), zeroAbnormal(), zeroAbnormal());
    GermCountUpsertRequestDto req = new GermCountUpsertRequestDto(
        null, List.of(d), List.of(rep(1, 100), rep(2, 100), rep(3, 100), rep(4, 100)));

    germCountService.upsertGermCounts(riaSkey, req, "USER1");

    verify(germCountRepository).save(any());
  }

  @Test
  void upsert_abnormalOutOfRange_throwsBadRequest() {
    BigDecimal riaSkey = new BigDecimal("881191");
    ReplicateAbnormalDto bad =
        new ReplicateAbnormalDto(1000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null);
    DayGermCountDto d = new DayGermCountDto(
        1, LocalDate.of(2026, 4, 1), 1, 1, 1, 1, 1,
        bad, zeroAbnormal(), zeroAbnormal(), zeroAbnormal());
    GermCountUpsertRequestDto req = new GermCountUpsertRequestDto(
        null, List.of(d), List.of(rep(1, 100), rep(2, 100), rep(3, 100), rep(4, 100)));

    ResponseStatusException ex = assertThrows(ResponseStatusException.class,
        () -> germCountService.upsertGermCounts(riaSkey, req, "USER1"));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
  }
```

Add imports to the test:

```java
import ca.bc.gov.oracleapi.entity.consep.DailyAbnormalEntity;
import ca.bc.gov.oracleapi.entity.consep.TestRepGermEntity;
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd oracle-api && ./mvnw -q -Dtest=GermCountServiceTest test`
Expected: FAIL — AC3/range not enforced; `dailyAbnormalRepository`/`testRepGermRepository` unused (compile/verify failures).

- [ ] **Step 3: Add repository fields, validation calls, and persistence**

Add fields to `GermCountService` (final, injected by `@RequiredArgsConstructor`):

```java
  private final DailyAbnormalRepository dailyAbnormalRepository;
  private final TestRepGermRepository testRepGermRepository;
```

Add imports:

```java
import ca.bc.gov.oracleapi.dto.consep.ReplicateAbnormalDto;
import ca.bc.gov.oracleapi.dto.consep.TestRepGermFormDto;
import ca.bc.gov.oracleapi.entity.consep.DailyAbnormalEntity;
import ca.bc.gov.oracleapi.entity.consep.TestRepGermEntity;
import ca.bc.gov.oracleapi.entity.consep.idclass.ReplicateId;
import ca.bc.gov.oracleapi.repository.consep.DailyAbnormalRepository;
import ca.bc.gov.oracleapi.repository.consep.TestRepGermRepository;
import java.util.HashMap;
```

In `upsertGermCounts`, after `validateAscendingDates(days);` add:

```java
    validateAbnormalRanges(days);
    validateSeedTotals(days, request.replicates());
```

In `upsertGermCounts`, after `germCountRepository.save(entity);` (before the `SparLog.info`/`return`) add:

```java
    saveAbnormals(days, slots);
    saveReplicates(riaSkey, request.replicates());
```

Add the helpers:

```java
  private void validateAbnormalRanges(List<DayGermCountDto> days) {
    for (DayGermCountDto d : days) {
      checkRep(d.rep1Abnormal(), d.slotIndex(), 1);
      checkRep(d.rep2Abnormal(), d.slotIndex(), 2);
      checkRep(d.rep3Abnormal(), d.slotIndex(), 3);
      checkRep(d.rep4Abnormal(), d.slotIndex(), 4);
    }
  }

  private void checkRep(ReplicateAbnormalDto a, int slot, int rep) {
    if (a == null) {
      return;
    }
    Integer[] values = {
        a.abnormalNumReverseEmbryo(), a.abnormalNumStuntedRadicle(),
        a.abnormalNumStuntedHypocotyl(), a.abnormalNumRotten(),
        a.abnormalNumThickenedHypocotyl(), a.abnormalNumThickenedRadicle(),
        a.abnormalNumTwisted(), a.abnormalNumMegametophyteCollar(),
        a.abnormalNumWeak(), a.abnormalNumOther(), a.abnormalNumPregermination()
    };
    for (Integer v : values) {
      if (v != null && (v < 0 || v > 999)) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Abnormal count must be between 0 and 999 (slot " + slot + ", rep " + rep + ")");
      }
    }
  }

  private void validateSeedTotals(
      List<DayGermCountDto> days, List<TestRepGermFormDto> replicates) {
    Map<Integer, Integer> totalByRep = new HashMap<>();
    for (TestRepGermFormDto r : replicates) {
      if (r.replicateNumber() == null) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "replicateNumber is required for each replicate");
      }
      totalByRep.put(r.replicateNumber(), r.totalNoSeeds());
    }
    long[] germ = new long[5];
    long[] abn = new long[5];
    for (DayGermCountDto d : days) {
      germ[1] += zero(d.rep1NoSeedsGerm());
      germ[2] += zero(d.rep2NoSeedsGerm());
      germ[3] += zero(d.rep3NoSeedsGerm());
      germ[4] += zero(d.rep4NoSeedsGerm());
      abn[1] += sumAbnormal(d.rep1Abnormal());
      abn[2] += sumAbnormal(d.rep2Abnormal());
      abn[3] += sumAbnormal(d.rep3Abnormal());
      abn[4] += sumAbnormal(d.rep4Abnormal());
    }
    for (int n = 1; n <= 4; n++) {
      Integer total = totalByRep.get(n);
      if (total == null) {
        continue;
      }
      long used = germ[n] + abn[n];
      if (used > total) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Replicate " + n + ": germinated + abnormal (" + used
                + ") exceeds total seeds (" + total + ")");
      }
    }
  }

  private static long sumAbnormal(ReplicateAbnormalDto a) {
    if (a == null) {
      return 0L;
    }
    return zero(a.abnormalNumReverseEmbryo()) + zero(a.abnormalNumStuntedRadicle())
        + zero(a.abnormalNumStuntedHypocotyl()) + zero(a.abnormalNumRotten())
        + zero(a.abnormalNumThickenedHypocotyl()) + zero(a.abnormalNumThickenedRadicle())
        + zero(a.abnormalNumTwisted()) + zero(a.abnormalNumMegametophyteCollar())
        + zero(a.abnormalNumWeak()) + zero(a.abnormalNumOther())
        + zero(a.abnormalNumPregermination());
  }

  private void saveAbnormals(List<DayGermCountDto> days, List<GermCountSlotDto> slots) {
    Map<Integer, DayGermCountDto> dayBySlot = new HashMap<>();
    for (DayGermCountDto d : days) {
      dayBySlot.put(d.slotIndex(), d);
    }
    List<DailyAbnormalEntity> toSave = new ArrayList<>();
    for (GermCountSlotDto s : slots) {
      if (s.dailyGermSkey() == null) {
        continue;
      }
      toSave.add(toAbnormalEntity(s.dailyGermSkey(), dayBySlot.get(s.slotIndex())));
    }
    if (!toSave.isEmpty()) {
      dailyAbnormalRepository.saveAll(toSave);
    }
  }

  private DailyAbnormalEntity toAbnormalEntity(BigDecimal skey, DayGermCountDto d) {
    DailyAbnormalEntity e =
        dailyAbnormalRepository.findById(skey).orElseGet(DailyAbnormalEntity::new);
    e.setDailyGermSkey(skey);
    setRep1(e, d.rep1Abnormal());
    setRep2(e, d.rep2Abnormal());
    setRep3(e, d.rep3Abnormal());
    setRep4(e, d.rep4Abnormal());
    return e;
  }

  private static void setRep1(DailyAbnormalEntity e, ReplicateAbnormalDto a) {
    if (a == null) {
      return;
    }
    e.setRep1NoAbnrmRe(a.abnormalNumReverseEmbryo());
    e.setRep1NoAbnrmSr(a.abnormalNumStuntedRadicle());
    e.setRep1NoAbnrmSh(a.abnormalNumStuntedHypocotyl());
    e.setRep1NoAbnrmRn(a.abnormalNumRotten());
    e.setRep1NoAbnrmTh(a.abnormalNumThickenedHypocotyl());
    e.setRep1NoAbnrmTr(a.abnormalNumThickenedRadicle());
    e.setRep1NoAbnrmTw(a.abnormalNumTwisted());
    e.setRep1NoAbnrmCm(a.abnormalNumMegametophyteCollar());
    e.setRep1NoAbnrmWeak(a.abnormalNumWeak());
    e.setRep1NoAbnrmOther(a.abnormalNumOther());
    e.setRep1NoAbnrmPrgrm(a.abnormalNumPregermination());
  }

  private static void setRep2(DailyAbnormalEntity e, ReplicateAbnormalDto a) {
    if (a == null) {
      return;
    }
    e.setRep2NoAbnrmRe(a.abnormalNumReverseEmbryo());
    e.setRep2NoAbnrmSr(a.abnormalNumStuntedRadicle());
    e.setRep2NoAbnrmSh(a.abnormalNumStuntedHypocotyl());
    e.setRep2NoAbnrmRn(a.abnormalNumRotten());
    e.setRep2NoAbnrmTh(a.abnormalNumThickenedHypocotyl());
    e.setRep2NoAbnrmTr(a.abnormalNumThickenedRadicle());
    e.setRep2NoAbnrmTw(a.abnormalNumTwisted());
    e.setRep2NoAbnrmCm(a.abnormalNumMegametophyteCollar());
    e.setRep2NoAbnrmWeak(a.abnormalNumWeak());
    e.setRep2NoAbnrmOther(a.abnormalNumOther());
    e.setRep2NoAbnrmPrgrm(a.abnormalNumPregermination());
  }

  private static void setRep3(DailyAbnormalEntity e, ReplicateAbnormalDto a) {
    if (a == null) {
      return;
    }
    e.setRep3NoAbnrmRe(a.abnormalNumReverseEmbryo());
    e.setRep3NoAbnrmSr(a.abnormalNumStuntedRadicle());
    e.setRep3NoAbnrmSh(a.abnormalNumStuntedHypocotyl());
    e.setRep3NoAbnrmRn(a.abnormalNumRotten());
    e.setRep3NoAbnrmTh(a.abnormalNumThickenedHypocotyl());
    e.setRep3NoAbnrmTr(a.abnormalNumThickenedRadicle());
    e.setRep3NoAbnrmTw(a.abnormalNumTwisted());
    e.setRep3NoAbnrmCm(a.abnormalNumMegametophyteCollar());
    e.setRep3NoAbnrmWeak(a.abnormalNumWeak());
    e.setRep3NoAbnrmOther(a.abnormalNumOther());
    e.setRep3NoAbnrmPrgrm(a.abnormalNumPregermination());
  }

  private static void setRep4(DailyAbnormalEntity e, ReplicateAbnormalDto a) {
    if (a == null) {
      return;
    }
    e.setRep4NoAbnrmRe(a.abnormalNumReverseEmbryo());
    e.setRep4NoAbnrmSr(a.abnormalNumStuntedRadicle());
    e.setRep4NoAbnrmSh(a.abnormalNumStuntedHypocotyl());
    e.setRep4NoAbnrmRn(a.abnormalNumRotten());
    e.setRep4NoAbnrmTh(a.abnormalNumThickenedHypocotyl());
    e.setRep4NoAbnrmTr(a.abnormalNumThickenedRadicle());
    e.setRep4NoAbnrmTw(a.abnormalNumTwisted());
    e.setRep4NoAbnrmCm(a.abnormalNumMegametophyteCollar());
    e.setRep4NoAbnrmWeak(a.abnormalNumWeak());
    e.setRep4NoAbnrmOther(a.abnormalNumOther());
    e.setRep4NoAbnrmPrgrm(a.abnormalNumPregermination());
  }

  private void saveReplicates(BigDecimal riaSkey, List<TestRepGermFormDto> replicates) {
    List<TestRepGermEntity> toSave = new ArrayList<>();
    for (TestRepGermFormDto r : replicates) {
      ReplicateId id = new ReplicateId(riaSkey, r.replicateNumber());
      TestRepGermEntity e =
          testRepGermRepository.findById(id).orElseGet(TestRepGermEntity::new);
      e.setId(id);
      e.setTotalNoSeeds(r.totalNoSeeds());
      e.setFinalUngrmNormal(r.finalUngrmNormal());
      e.setFinalUngrmShrvl(r.finalUngrmShrvl());
      e.setFinalUngrmEmpty(r.finalUngrmEmpty());
      e.setFinalUngrmInsct(r.finalUngrmInsct());
      e.setFinalUngrmDamagd(r.finalUngrmDamagd());
      e.setFinalUngrmRotten(r.finalUngrmRotten());
      e.setFinalPregerm(r.finalPregerm());
      e.setRepAcceptedInd(r.repAcceptedInd());
      e.setTolrncOvrrdeDesc(r.tolrncOvrrdeDesc());
      toSave.add(e);
    }
    testRepGermRepository.saveAll(toSave);
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd oracle-api && ./mvnw -q -Dtest=GermCountServiceTest test`
Expected: PASS (all upsert + getGermCounts tests).

- [ ] **Step 5: Commit**

```bash
git add oracle-api/src/main/java/ca/bc/gov/oracleapi/service/consep/GermCountService.java oracle-api/src/test/java/ca/bc/gov/oracleapi/service/consep/GermCountServiceTest.java
git commit -m "feat(2443): persist abnormals + replicates and enforce AC3 seed totals"
```

### Task 6: Endpoint — PUT /api/germ-counts/{riaSkey}

Wire the HTTP endpoint. The authenticated user's name (for audit columns) comes from `java.security.Principal`, which `@WithMockUser(username = ...)` supplies in tests.

**Files:**
- Modify: `oracle-api/src/main/java/ca/bc/gov/oracleapi/endpoint/consep/GermCountEndpoint.java`
- Test: `oracle-api/src/test/java/ca/bc/gov/oracleapi/endpoint/consep/GermCountEndpointTest.java` (extend)

**Interfaces:**
- Consumes: `GermCountService.upsertGermCounts(BigDecimal, GermCountUpsertRequestDto, String)`.
- Produces: `PUT /api/germ-counts/{riaSkey}` returning `GermCountDto` (200); 409 on conflict; 400 on validation; 401/403 on auth.

- [ ] **Step 1: Write failing endpoint tests**

Add to `GermCountEndpointTest.java` (keep existing GET tests):

```java
// add imports
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import java.math.BigDecimal;

  private static final String VALID_BODY = """
      {
        "days": [
          {"slotIndex":1,"countDt":"2026-04-01","dayNoOfTest":1,
           "rep1NoSeedsGerm":10,"rep2NoSeedsGerm":12,"rep3NoSeedsGerm":11,"rep4NoSeedsGerm":9}
        ],
        "replicates": [
          {"replicateNumber":1,"totalNoSeeds":100},
          {"replicateNumber":2,"totalNoSeeds":100},
          {"replicateNumber":3,"totalNoSeeds":100},
          {"replicateNumber":4,"totalNoSeeds":100}
        ]
      }
      """;

  @Test
  void upsert_returns200_whenServiceSucceeds() throws Exception {
    BigDecimal riaSkey = new BigDecimal("881191");
    when(germCountService.upsertGermCounts(eq(riaSkey), any(), any()))
        .thenReturn(buildDto(riaSkey));

    mockMvc
        .perform(put(BASE_URL + "/" + riaSkey)
            .contentType(MediaType.APPLICATION_JSON)
            .content(VALID_BODY))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.riaSkey").value(881191));

    verify(germCountService, times(1)).upsertGermCounts(eq(riaSkey), any(), any());
  }

  @Test
  void upsert_returns409_whenServiceThrowsConflict() throws Exception {
    BigDecimal riaSkey = new BigDecimal("881191");
    when(germCountService.upsertGermCounts(eq(riaSkey), any(), any()))
        .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "conflict"));

    mockMvc
        .perform(put(BASE_URL + "/" + riaSkey)
            .contentType(MediaType.APPLICATION_JSON)
            .content(VALID_BODY))
        .andExpect(status().isConflict());
  }

  @Test
  void upsert_returns400_whenBodyInvalid() throws Exception {
    // days[0] missing required slotIndex -> bean validation 400
    String badBody = """
        {"days":[{"countDt":"2026-04-01","dayNoOfTest":1}],
         "replicates":[{"replicateNumber":1,"totalNoSeeds":100}]}
        """;
    mockMvc
        .perform(put(BASE_URL + "/881191")
            .contentType(MediaType.APPLICATION_JSON)
            .content(badBody))
        .andExpect(status().isBadRequest());
  }

  @Test
  @WithAnonymousUser
  void upsert_returns401_whenAnonymous() throws Exception {
    mockMvc
        .perform(put(BASE_URL + "/881191")
            .contentType(MediaType.APPLICATION_JSON)
            .content(VALID_BODY))
        .andExpect(status().isUnauthorized());
  }
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd oracle-api && ./mvnw -q -Dtest=GermCountEndpointTest test`
Expected: FAIL — no PUT handler (404/405) / method missing.

- [ ] **Step 3: Add the PUT handler**

Add imports to `GermCountEndpoint.java`:

```java
import ca.bc.gov.oracleapi.dto.consep.GermCountUpsertRequestDto;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
```

Add the method to the class body:

```java
  /**
   * Insert or update the daily germination counts for a test (issue #2443).
   *
   * @param riaSkey   the request item activity key
   * @param request   the days + replicates payload
   * @param principal the authenticated user (for audit columns)
   * @return the saved germination count data
   */
  @PutMapping(value = "/{riaSkey}", consumes = "application/json", produces = "application/json")
  @ResponseStatus(HttpStatus.OK)
  @ApiResponse(
      responseCode = "200",
      description = "Daily germination counts saved.",
      content = @Content(schema = @Schema(implementation = GermCountDto.class)))
  @ApiResponse(responseCode = "400", description = "Invalid payload or failed validation.")
  @ApiResponse(responseCode = "409", description = "Record changed since last read (optimistic lock).")
  @ApiAuthResponse
  @RoleAccessConfig({"SPAR_TSC_SUBMITTER", "SPAR_TSC_SUPERVISOR"})
  public GermCountDto upsertGermCounts(
      @PathVariable BigDecimal riaSkey,
      @Valid @RequestBody GermCountUpsertRequestDto request,
      Principal principal) {
    return germCountService.upsertGermCounts(
        riaSkey, request, principal == null ? null : principal.getName());
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd oracle-api && ./mvnw -q -Dtest=GermCountEndpointTest test`
Expected: PASS (GET + PUT tests). If the 401 test instead returns 403, align it with the project's existing anonymous-access expectation (see the existing GET anonymous test in this file) and match that status.

- [ ] **Step 5: Full module verification**

Run: `cd oracle-api && ./mvnw -q test`
Expected: BUILD SUCCESS — entire `oracle-api` test suite green.

- [ ] **Step 6: Commit**

```bash
git add oracle-api/src/main/java/ca/bc/gov/oracleapi/endpoint/consep/GermCountEndpoint.java oracle-api/src/test/java/ca/bc/gov/oracleapi/endpoint/consep/GermCountEndpointTest.java
git commit -m "feat(2443): add PUT /api/germ-counts/{riaSkey} endpoint"
```

---

## Self-Review

**Spec coverage:**
- AC1 (optimistic lock → 409): Task 3 `touchIfTimestampMatches`, Task 4 update branch + `upsert_update_withStaleTimestamp_throwsConflict`, Task 6 409 test. ✓
- AC2 (skey generated only when countDt not null and key null): Task 3 `nextDailyGermSkey`, Task 4 `buildSlotsForSave` + `upsert_insertsNewRow_generatesSkeyOnlyForDatedDays`. ✓
- AC3 (Σgerm + Σabnormal ≤ totalNoSeeds per rep): Task 5 `validateSeedTotals` + overflow/exact-equal tests. ✓
- AC4 (cumulative = running sum): Task 4 `buildSlotsForSave` cumulative + assertion in insert test. ✓
- Three-table write in one transaction: Task 4 (germ_count) + Task 5 (abnormals, replicates), `@Transactional(rollbackFor = ResponseStatusException.class)`. ✓
- Single PUT upsert keyed on riaSkey; insert vs update by existence: Task 4/Task 6. ✓
- Field ranges (abnormal 0–999), rep null→0, ascending dates, empty→400: Task 4 + Task 5 with tests. ✓
- Out of scope (header/activity #2447, clearing a day, begin-date compare): not implemented — correct. ✓

**Placeholder scan:** No TBD/TODO; every code step shows complete code. ✓

**Type consistency:** `upsertGermCounts(BigDecimal, GermCountUpsertRequestDto, String)`, `buildSlotsForSave(List<DayGermCountDto>, GermCountEntity)`, `applySlots(List<GermCountSlotDto>, GermCountEntity)`, `nextDailyGermSkey()`, `touchIfTimestampMatches(BigDecimal, LocalDateTime)` used consistently across tasks. `ReplicateAbnormalDto` accessor names match the existing record. ✓

## Open items (carry into implementation)
- Confirm the real Oracle sequence name (`CONSEP.CNS_SEQ_COUNTER` assumed); adjust the native query + schema.sql if different.
- Confirm no DB trigger already populates audit columns / skey on the real tables (would mean not setting them explicitly).
- If `@WebMvcTest` returns 403 (not 401) for anonymous, match the project's existing convention (see the existing GET anonymous test).
