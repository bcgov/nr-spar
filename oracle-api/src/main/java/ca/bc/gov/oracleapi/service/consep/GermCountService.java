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
import ca.bc.gov.oracleapi.repository.consep.DailyAbnormalRepository;
import ca.bc.gov.oracleapi.repository.consep.GermCountRepository;
import ca.bc.gov.oracleapi.repository.consep.TestRepGermRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
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

  private final GermCountRepository germCountRepository;
  private final GermCountMapper mapper;
  private final DailyAbnormalRepository dailyAbnormalRepository;
  private final TestRepGermRepository testRepGermRepository;

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
   * test (not a delta). Cumulative germination and the rep null-to-zero normalization are
   * computed only from the submitted days, so callers must resend the full day grid on update.
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
    validateAbnormalRanges(days);
    validateSeedTotals(days, request.replicates());

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

    saveAbnormals(days, slots);
    saveReplicates(riaSkey, request.replicates());

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
    // Days are processed in slotIndex order; validateAscendingDates guarantees this tracks dayNoOfTest/date order.
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
}
