package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.DayGermCountDto;
import ca.bc.gov.oracleapi.dto.consep.GermCountDto;
import ca.bc.gov.oracleapi.dto.consep.GermCountSlotDto;
import ca.bc.gov.oracleapi.dto.consep.GermCountUpsertRequestDto;
import ca.bc.gov.oracleapi.dto.consep.ReplicateAbnormalDto;
import ca.bc.gov.oracleapi.dto.consep.TestRepGermFormDto;
import ca.bc.gov.oracleapi.entity.consep.DailyAbnormalEntity;
import ca.bc.gov.oracleapi.entity.consep.GermCountEntity;
import ca.bc.gov.oracleapi.entity.consep.TestRepGermEntity;
import ca.bc.gov.oracleapi.entity.consep.idclass.ReplicateId;
import ca.bc.gov.oracleapi.mapper.GermCountMapper;
import ca.bc.gov.oracleapi.mapper.TestRepGermFormMapper;
import ca.bc.gov.oracleapi.repository.consep.DailyAbnormalRepository;
import ca.bc.gov.oracleapi.repository.consep.GermCountRepository;
import ca.bc.gov.oracleapi.repository.consep.TestRepGermRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Service for retrieving daily germination count data from consep.cns_t_germ_count. */
@Service
@RequiredArgsConstructor
public class GermCountService {

  /** Number of numbered day slots the CNS_T_GERM_COUNT row carries. */
  static final int MAX_SLOTS = 13;

  private final GermCountRepository germCountRepository;
  private final GermCountMapper mapper;
  private final TestRepGermFormMapper testRepGermFormMapper;
  private final DailyAbnormalRepository dailyAbnormalRepository;
  private final TestRepGermRepository testRepGermRepository;

  @PersistenceContext
  private EntityManager entityManager;

  /**
   * Retrieve the germination count record for the given RIA_SKEY.
   *
   * @param riaSkey the request item activity key
   * @return the germination count DTO for the test
   * @throws ResponseStatusException 400 if riaSkey is null, 404 if no record exists
   */
  public GermCountDto getGermCounts(BigDecimal riaSkey) {
    if (riaSkey == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "RIA_SKEY cannot be null");
    }

    SparLog.info("Retrieving germ count data for RIA_SKEY: {}", riaSkey);

    var entity = germCountRepository.findById(riaSkey)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "No germ count data found for RIA_SKEY: " + riaSkey));

    SparLog.info("Germ count data found for RIA_SKEY: {}", riaSkey);

    return mapper.toDto(entity);
  }

  /**
   * Insert or update the daily germination counts for one test (AC1, AC2, AC4).
   *
   * <p>This is a full-replacement upsert: the request must carry the complete set of days for the
   * test (not a delta). Every one of the {@value #MAX_SLOTS} slots is rewritten on each call — a
   * slot the request omits, or submits without a count date, is cleared, and any abnormal rows
   * that its surrogate key owned are deleted. Cumulative germination and the rep null-to-zero
   * normalization are therefore computed over the submitted days alone.
   *
   * @param riaSkey       the test key (path)
   * @param request       days + replicates payload
   * @param requestUserId the authenticated user id, for audit columns
   * @return the saved germ count DTO
   */
  @Transactional
  public GermCountDto upsertGermCounts(
      BigDecimal riaSkey, GermCountUpsertRequestDto request, String requestUserId) {
    List<DayGermCountDto> days = new ArrayList<>(request.days());
    days.sort(Comparator.comparingInt(DayGermCountDto::slotIndex));
    validateNoDuplicateSlots(days);
    validateAscendingDates(days);
    // Read before the timestamp guard: the guard stamps update_timestamp, so a request rejected
    // after it would leave the client holding a stale lock value and force a spurious 409.
    GermCountEntity existing = germCountRepository.findById(riaSkey).orElse(null);
    validateSeedTotals(days, request.replicates(), retainedAbnormalTotals(days, existing));

    GermCountEntity entity;
    if (existing != null) {
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
      // The guard above already stamped update_timestamp with the DB clock and cleared the
      // persistence context, so this re-read carries the authoritative new lock value.
      entity = germCountRepository.findById(riaSkey).orElseThrow(() ->
          new ResponseStatusException(
              HttpStatus.CONFLICT, "Record changed since last read; please reselect and retry"));
    } else {
      entity = new GermCountEntity();
      LocalDateTime now = LocalDateTime.now();
      entity.setRiaSkey(riaSkey);
      entity.setEntryUserid(requestUserId);
      entity.setEntryTimestamp(now);
      entity.setUpdateTimestamp(now);
    }

    Set<BigDecimal> skeysBefore = referencedSkeys(entity);
    List<GermCountSlotDto> slots = buildSlotsForSave(days, entity);
    mapper.applySlots(slots, entity);
    entity.setUpdateUserid(requestUserId);
    entity = germCountRepository.save(entity);

    saveAbnormals(days, slots);
    deleteOrphanedAbnormals(skeysBefore, slots);
    saveReplicates(riaSkey, request.replicates());

    SparLog.info("Saved germ counts for RIA_SKEY: {}", riaSkey);

    if (entityManager != null) {
      entityManager.flush();
      entityManager.refresh(entity);
    }

    return mapper.toDto(entity);
  }

  /**
   * Rejects the same slot being submitted twice. The 1-{@value #MAX_SLOTS} range and the
   * not-null constraint are enforced by bean validation on {@link DayGermCountDto}.
   */
  private void validateNoDuplicateSlots(List<DayGermCountDto> days) {
    Set<Integer> seen = new HashSet<>();
    for (DayGermCountDto d : days) {
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
   * Builds the full {@value #MAX_SLOTS}-slot list to persist. Every slot is emitted so the save
   * is a true full replacement: a slot the request omits, or submits without a count date, is
   * emitted blank so its columns are cleared. Dated days keep their existing DAILY_GERM_SKEY or
   * get a freshly sequenced one (AC2), get rep null-to-zero applied for used replicates, and
   * carry the running cumulative germination (AC4). Undated slots contribute nothing to the
   * running total.
   */
  List<GermCountSlotDto> buildSlotsForSave(
      List<DayGermCountDto> sortedDays, GermCountEntity entity) {
    // Not Collectors.toMap: a slot present by count date alone carries a null key, which toMap
    // rejects outright.
    Map<Integer, BigDecimal> existingSkeys = new HashMap<>();
    for (GermCountSlotDto s : mapper.buildSlots(entity)) {
      existingSkeys.put(s.slotIndex(), s.dailyGermSkey());
    }
    Map<Integer, DayGermCountDto> submitted =
        sortedDays.stream()
            .filter(d -> d.countDt() != null)
            .collect(Collectors.toMap(DayGermCountDto::slotIndex, d -> d));

    boolean[] repUsed = new boolean[4];
    for (DayGermCountDto d : submitted.values()) {
      if (d.rep1NoSeedsGerm() != null) repUsed[0] = true;
      if (d.rep2NoSeedsGerm() != null) repUsed[1] = true;
      if (d.rep3NoSeedsGerm() != null) repUsed[2] = true;
      if (d.rep4NoSeedsGerm() != null) repUsed[3] = true;
    }

    List<GermCountSlotDto> slots = new ArrayList<>(MAX_SLOTS);
    long cumulative = 0;
    // Slots are walked in index order; validateAscendingDates guarantees that tracks date order.
    for (int slotIndex = 1; slotIndex <= MAX_SLOTS; slotIndex++) {
      DayGermCountDto d = submitted.get(slotIndex);
      if (d == null) {
        slots.add(blankSlot(slotIndex));
        continue;
      }

      Integer r1 = normalize(d.rep1NoSeedsGerm(), repUsed[0]);
      Integer r2 = normalize(d.rep2NoSeedsGerm(), repUsed[1]);
      Integer r3 = normalize(d.rep3NoSeedsGerm(), repUsed[2]);
      Integer r4 = normalize(d.rep4NoSeedsGerm(), repUsed[3]);
      cumulative += zero(r1) + zero(r2) + zero(r3) + zero(r4);

      // DAILY_GERM_SKEY{n} points at this day's CNS_T_DAILY_ABNORMAL row, so it is
      // only minted when there is an abnormal row to point at. Minting one for every
      // dated day left a dangling reference, and was the only thing that reached for
      // the sequence -- which CONSEP does not have. An existing key is always kept:
      // it still owns the abnormals a previous save recorded.
      BigDecimal skey = existingSkeys.get(slotIndex);
      if (skey == null && hasAnyAbnormal(d)) {
        skey = germCountRepository.nextDailyGermSkey();
      }

      slots.add(new GermCountSlotDto(
          slotIndex, skey, d.countDt(), d.dayNoOfTest(),
          r1, r2, r3, r4, BigDecimal.valueOf(cumulative)));
    }
    return slots;
  }

  /** An empty slot, written to clear every numbered column at that position. */
  private static GermCountSlotDto blankSlot(int slotIndex) {
    return new GermCountSlotDto(slotIndex, null, null, null, null, null, null, null, null);
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

  /**
   * Cross-field check that no replicate has more germinated + abnormal seeds than it holds.
   * Per-field null and range constraints live on the request DTOs.
   */
  private void validateSeedTotals(
      List<DayGermCountDto> days, List<TestRepGermFormDto> replicates, long[] retainedAbnormal) {
    Map<Integer, Integer> totalByRep = new HashMap<>();
    for (TestRepGermFormDto r : replicates) {
      if (totalByRep.put(r.replicateNumber(), r.totalNoSeeds()) != null) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "Duplicate replicateNumber: " + r.replicateNumber());
      }
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
      long used = germ[n] + abn[n] + retainedAbnormal[n];
      if (used > total) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Replicate " + n + ": germinated + abnormal (" + used
                + ") exceeds total seeds (" + total + ")");
      }
    }
  }

  /**
   * Abnormal counts that this save keeps but the request does not carry. This screen never submits
   * abnormals, so without them a day whose abnormals are already on file would be validated as
   * zero and germinated counts could be raised until germinated + abnormal exceeds the replicate
   * total. A day the request omits entirely is not counted: {@code deleteOrphanedAbnormals} drops
   * its row. Indexed 1-4 by replicate number.
   */
  private long[] retainedAbnormalTotals(List<DayGermCountDto> days, GermCountEntity existing) {
    long[] retained = new long[5];
    if (existing == null) {
      return retained;
    }
    Map<Integer, BigDecimal> existingSkeys = new HashMap<>();
    for (GermCountSlotDto s : mapper.buildSlots(existing)) {
      existingSkeys.put(s.slotIndex(), s.dailyGermSkey());
    }

    Set<BigDecimal> skeysToFetch = new HashSet<>();
    for (DayGermCountDto d : days) {
      // A day that submits its own abnormals replaces the stored row; those are already summed.
      if (d.countDt() == null || hasAnyAbnormal(d)) {
        continue;
      }
      BigDecimal skey = existingSkeys.get(d.slotIndex());
      if (skey != null) {
        skeysToFetch.add(skey);
      }
    }

    Map<BigDecimal, DailyAbnormalEntity> rowsBySkey = new HashMap<>();
    for (DailyAbnormalEntity e : dailyAbnormalRepository.findAllById(skeysToFetch)) {
      rowsBySkey.put(e.getDailyGermSkey(), e);
    }

    for (DayGermCountDto d : days) {
      if (d.countDt() == null || hasAnyAbnormal(d)) {
        continue;
      }
      BigDecimal skey = existingSkeys.get(d.slotIndex());
      if (skey == null) {
        continue;
      }
      DailyAbnormalEntity row = rowsBySkey.get(skey);
      if (row == null) {
        continue;
      }
      for (int n = 1; n <= 4; n++) {
        retained[n] += sumPersistedAbnormal(row, n);
      }
    }
    return retained;
  }

  private static long sumPersistedAbnormal(DailyAbnormalEntity e, int rep) {
    return switch (rep) {
      case 1 -> zero(e.getRep1NoAbnrmRe()) + zero(e.getRep1NoAbnrmSr())
          + zero(e.getRep1NoAbnrmSh()) + zero(e.getRep1NoAbnrmRn())
          + zero(e.getRep1NoAbnrmTh()) + zero(e.getRep1NoAbnrmTr())
          + zero(e.getRep1NoAbnrmTw()) + zero(e.getRep1NoAbnrmCm())
          + zero(e.getRep1NoAbnrmWeak()) + zero(e.getRep1NoAbnrmOther())
          + zero(e.getRep1NoAbnrmPrgrm());
      case 2 -> zero(e.getRep2NoAbnrmRe()) + zero(e.getRep2NoAbnrmSr())
          + zero(e.getRep2NoAbnrmSh()) + zero(e.getRep2NoAbnrmRn())
          + zero(e.getRep2NoAbnrmTh()) + zero(e.getRep2NoAbnrmTr())
          + zero(e.getRep2NoAbnrmTw()) + zero(e.getRep2NoAbnrmCm())
          + zero(e.getRep2NoAbnrmWeak()) + zero(e.getRep2NoAbnrmOther())
          + zero(e.getRep2NoAbnrmPrgrm());
      case 3 -> zero(e.getRep3NoAbnrmRe()) + zero(e.getRep3NoAbnrmSr())
          + zero(e.getRep3NoAbnrmSh()) + zero(e.getRep3NoAbnrmRn())
          + zero(e.getRep3NoAbnrmTh()) + zero(e.getRep3NoAbnrmTr())
          + zero(e.getRep3NoAbnrmTw()) + zero(e.getRep3NoAbnrmCm())
          + zero(e.getRep3NoAbnrmWeak()) + zero(e.getRep3NoAbnrmOther())
          + zero(e.getRep3NoAbnrmPrgrm());
      default -> zero(e.getRep4NoAbnrmRe()) + zero(e.getRep4NoAbnrmSr())
          + zero(e.getRep4NoAbnrmSh()) + zero(e.getRep4NoAbnrmRn())
          + zero(e.getRep4NoAbnrmTh()) + zero(e.getRep4NoAbnrmTr())
          + zero(e.getRep4NoAbnrmTw()) + zero(e.getRep4NoAbnrmCm())
          + zero(e.getRep4NoAbnrmWeak()) + zero(e.getRep4NoAbnrmOther())
          + zero(e.getRep4NoAbnrmPrgrm());
    };
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
      DayGermCountDto day = dayBySlot.get(s.slotIndex());
      // Skip days that carry no abnormal DTOs at all (this UI never sends
      // them). Writing an all-null DailyAbnormalEntity here would merge over
      // and NULL out any abnormals an earlier edit recorded for the day. When
      // any rep abnormal DTO IS present we still upsert, preserving prior
      // behaviour for callers that do send abnormals.
      if (!hasAnyAbnormal(day)) {
        continue;
      }
      toSave.add(toAbnormalEntity(s.dailyGermSkey(), day));
    }
    if (!toSave.isEmpty()) {
      dailyAbnormalRepository.saveAll(toSave);
    }
  }

  /** The DAILY_GERM_SKEY values the row referenced before this save. */
  private Set<BigDecimal> referencedSkeys(GermCountEntity entity) {
    return mapper.buildSlots(entity).stream()
        .map(GermCountSlotDto::dailyGermSkey)
        .filter(Objects::nonNull)
        .collect(Collectors.toSet());
  }

  /**
   * Drops abnormal rows whose surrogate key the germ count row no longer points at, so a slot
   * cleared by this full-replacement save does not leave its abnormals behind.
   */
  private void deleteOrphanedAbnormals(
      Set<BigDecimal> skeysBefore, List<GermCountSlotDto> slots) {
    if (skeysBefore.isEmpty()) {
      return;
    }
    Set<BigDecimal> stillReferenced =
        slots.stream()
            .map(GermCountSlotDto::dailyGermSkey)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
    List<BigDecimal> orphaned =
        skeysBefore.stream().filter(skey -> !stillReferenced.contains(skey)).toList();
    if (orphaned.isEmpty()) {
      return;
    }
    SparLog.info("Deleting {} orphaned daily abnormal row(s)", orphaned.size());
    dailyAbnormalRepository.deleteAllById(orphaned);
  }

  /** True when the day carries at least one non-null rep abnormal DTO. */
  private static boolean hasAnyAbnormal(DayGermCountDto d) {
    if (d == null) {
      return false;
    }
    return d.rep1Abnormal() != null || d.rep2Abnormal() != null
        || d.rep3Abnormal() != null || d.rep4Abnormal() != null;
  }

  private DailyAbnormalEntity toAbnormalEntity(BigDecimal skey, DayGermCountDto d) {
    DailyAbnormalEntity e = new DailyAbnormalEntity();
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
      testRepGermFormMapper.updateEntity(r, e);
      toSave.add(e);
    }
    testRepGermRepository.saveAll(toSave);
  }
}
