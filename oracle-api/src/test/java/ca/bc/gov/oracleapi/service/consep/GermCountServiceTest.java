package ca.bc.gov.oracleapi.service.consep;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.dto.consep.DayGermCountDto;
import ca.bc.gov.oracleapi.dto.consep.GermCountDto;
import ca.bc.gov.oracleapi.dto.consep.GermCountSlotDto;
import ca.bc.gov.oracleapi.dto.consep.GermCountUpsertRequestDto;
import ca.bc.gov.oracleapi.dto.consep.ReplicateAbnormalDto;
import ca.bc.gov.oracleapi.dto.consep.TestRepGermFormDto;
import ca.bc.gov.oracleapi.entity.consep.DailyAbnormalEntity;
import ca.bc.gov.oracleapi.entity.consep.GermCountEntity;
import ca.bc.gov.oracleapi.entity.consep.TestRepGermEntity;
import ca.bc.gov.oracleapi.mapper.GermCountMapper;
import ca.bc.gov.oracleapi.mapper.TestRepGermFormMapper;
import ca.bc.gov.oracleapi.repository.consep.DailyAbnormalRepository;
import ca.bc.gov.oracleapi.repository.consep.GermCountRepository;
import ca.bc.gov.oracleapi.repository.consep.TestRepGermRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class GermCountServiceTest {

  @Mock
  private GermCountRepository germCountRepository;

  @Mock
  private DailyAbnormalRepository dailyAbnormalRepository;

  @Mock
  private TestRepGermRepository testRepGermRepository;

  @Spy
  private GermCountMapper mapper = Mappers.getMapper(GermCountMapper.class);

  @Spy
  private TestRepGermFormMapper testRepGermFormMapper =
      Mappers.getMapper(TestRepGermFormMapper.class);

  @InjectMocks
  private GermCountService germCountService;

  /*---------------------- getGermCounts ---------------------------------*/

  @Test
  void getGermCounts_shouldReturnMappedDto_whenEntityFound() {
    BigDecimal riaSkey = new BigDecimal("881191");

    GermCountEntity entity = new GermCountEntity();
    entity.setRiaSkey(riaSkey);

    // Slot 1 — populated
    entity.setDailyGermSkey1(new BigDecimal("1001"));
    entity.setCountDt1(LocalDate.of(2026, 4, 1));
    entity.setDayNoOfTest1(1);
    entity.setRep1NoSeedsGerm1(10);
    entity.setRep2NoSeedsGerm1(12);
    entity.setRep3NoSeedsGerm1(11);
    entity.setRep4NoSeedsGerm1(9);
    entity.setCumulativeGerm1(new BigDecimal("0.4200"));

    // Slot 2 — populated
    entity.setDailyGermSkey2(new BigDecimal("1002"));
    entity.setCountDt2(LocalDate.of(2026, 4, 2));
    entity.setDayNoOfTest2(2);
    entity.setRep1NoSeedsGerm2(14);
    entity.setRep2NoSeedsGerm2(15);
    entity.setRep3NoSeedsGerm2(13);
    entity.setRep4NoSeedsGerm2(16);
    entity.setCumulativeGerm2(new BigDecimal("0.5800"));

    // Slots 3–13 left null (sparse data is normal)

    // Audit fields
    entity.setEntryUserid("USER1");
    entity.setEntryTimestamp(LocalDateTime.of(2026, 1, 10, 9, 0));
    entity.setUpdateUserid("USER2");
    entity.setUpdateTimestamp(LocalDateTime.of(2026, 4, 5, 14, 30));

    when(germCountRepository.findById(riaSkey)).thenReturn(Optional.of(entity));

    GermCountDto dto = germCountService.getGermCounts(riaSkey);

    assertNotNull(dto);
    assertEquals(riaSkey, dto.riaSkey());
    assertEquals(2, dto.slots().size());

    GermCountSlotDto slot1 = dto.slots().get(0);
    assertEquals(1, slot1.slotIndex());
    assertEquals(new BigDecimal("1001"), slot1.dailyGermSkey());
    assertEquals(LocalDate.of(2026, 4, 1), slot1.countDt());
    assertEquals(1, slot1.dayNoOfTest());
    assertEquals(10, slot1.rep1NoSeedsGerm());
    assertEquals(12, slot1.rep2NoSeedsGerm());
    assertEquals(11, slot1.rep3NoSeedsGerm());
    assertEquals(9, slot1.rep4NoSeedsGerm());
    assertEquals(new BigDecimal("0.4200"), slot1.cumulativeGerm());

    GermCountSlotDto slot2 = dto.slots().get(1);
    assertEquals(2, slot2.slotIndex());
    assertEquals(new BigDecimal("1002"), slot2.dailyGermSkey());
    assertEquals(LocalDate.of(2026, 4, 2), slot2.countDt());
    assertEquals(2, slot2.dayNoOfTest());
    assertEquals(14, slot2.rep1NoSeedsGerm());
    assertEquals(15, slot2.rep2NoSeedsGerm());
    assertEquals(13, slot2.rep3NoSeedsGerm());
    assertEquals(16, slot2.rep4NoSeedsGerm());
    assertEquals(new BigDecimal("0.5800"), slot2.cumulativeGerm());

    assertEquals("USER1", dto.entryUserid());
    assertEquals(LocalDateTime.of(2026, 1, 10, 9, 0), dto.entryTimestamp());
    assertEquals("USER2", dto.updateUserid());
    assertEquals(LocalDateTime.of(2026, 4, 5, 14, 30), dto.updateTimestamp());

    verify(germCountRepository).findById(riaSkey);
  }

  @Test
  void getGermCounts_shouldReturnEmptySlotList_whenAllSlotsAreNull() {
    BigDecimal riaSkey = new BigDecimal("100001");

    GermCountEntity entity = new GermCountEntity();
    entity.setRiaSkey(riaSkey);

    when(germCountRepository.findById(riaSkey)).thenReturn(Optional.of(entity));

    GermCountDto dto = germCountService.getGermCounts(riaSkey);

    assertNotNull(dto);
    assertEquals(riaSkey, dto.riaSkey());
    assertTrue(dto.slots().isEmpty());

    verify(germCountRepository).findById(riaSkey);
  }

  @Test
  void getGermCounts_shouldThrowNotFound_whenEntityDoesNotExist() {
    BigDecimal riaSkey = new BigDecimal("999999");

    when(germCountRepository.findById(riaSkey)).thenReturn(Optional.empty());

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> germCountService.getGermCounts(riaSkey));

    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    assertEquals("No germ count data found for RIA_SKEY: " + riaSkey, ex.getReason());

    verify(germCountRepository).findById(riaSkey);
  }

  @Test
  void getGermCounts_shouldThrowBadRequest_whenRiaSkeyIsNull() {
    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> germCountService.getGermCounts(null));

    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals("RIA_SKEY cannot be null", ex.getReason());

    verify(germCountRepository, never()).findById(null);
  }

  /*---------------------- upsertGermCounts -------------------------------*/

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

  private void stubChildSaves() {
    lenient().when(dailyAbnormalRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));
    lenient().when(testRepGermRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));
    lenient().when(testRepGermRepository.findById(any())).thenReturn(Optional.empty());
    lenient().when(dailyAbnormalRepository.findById(any())).thenReturn(Optional.empty());
  }

  @Test
  void upsert_insertsNewRow_generatesSkeyOnlyForDatedDays_andComputesCumulative() {
    BigDecimal riaSkey = new BigDecimal("881191");
    stubChildSaves();
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
  void upsert_clearsSlotsAbsentFromRequest_andDeletesTheirAbnormals() {
    BigDecimal riaSkey = new BigDecimal("881191");
    LocalDateTime ts = LocalDateTime.of(2026, 4, 5, 14, 30);

    // Existing row holds three dated days; the request will resend only slot 1.
    GermCountEntity existing = new GermCountEntity();
    existing.setRiaSkey(riaSkey);
    existing.setUpdateTimestamp(ts);
    existing.setDailyGermSkey1(new BigDecimal("3001"));
    existing.setCountDt1(LocalDate.of(2026, 4, 1));
    existing.setRep1NoSeedsGerm1(10);
    existing.setCumulativeGerm1(new BigDecimal("10"));
    existing.setDailyGermSkey2(new BigDecimal("3002"));
    existing.setCountDt2(LocalDate.of(2026, 4, 2));
    existing.setRep1NoSeedsGerm2(20);
    existing.setCumulativeGerm2(new BigDecimal("30"));
    existing.setDailyGermSkey3(new BigDecimal("3003"));
    existing.setCountDt3(LocalDate.of(2026, 4, 3));
    existing.setRep1NoSeedsGerm3(30);
    existing.setCumulativeGerm3(new BigDecimal("60"));

    stubChildSaves();
    when(germCountRepository.existsById(riaSkey)).thenReturn(true);
    when(germCountRepository.touchIfTimestampMatches(riaSkey, ts)).thenReturn(1);
    when(germCountRepository.findById(riaSkey)).thenReturn(Optional.of(existing));
    when(germCountRepository.save(any(GermCountEntity.class)))
        .thenAnswer(inv -> inv.getArgument(0));

    List<DayGermCountDto> days = List.of(day(1, LocalDate.of(2026, 4, 1), 1, 10, 0, 0, 0));

    germCountService.upsertGermCounts(riaSkey, request(ts, days), "USER1");

    ArgumentCaptor<GermCountEntity> captor = ArgumentCaptor.forClass(GermCountEntity.class);
    verify(germCountRepository).save(captor.capture());
    GermCountEntity saved = captor.getValue();

    // Slot 1 keeps its original surrogate key rather than burning a new sequence value.
    assertEquals(new BigDecimal("3001"), saved.getDailyGermSkey1());
    // Slots 2 and 3 were omitted, so every one of their columns is cleared.
    assertNull(saved.getDailyGermSkey2());
    assertNull(saved.getCountDt2());
    assertNull(saved.getRep1NoSeedsGerm2());
    assertNull(saved.getCumulativeGerm2());
    assertNull(saved.getDailyGermSkey3());
    assertNull(saved.getCountDt3());
    assertNull(saved.getRep1NoSeedsGerm3());
    assertNull(saved.getCumulativeGerm3());

    // The abnormal rows the cleared slots owned are removed, slot 1's is kept.
    ArgumentCaptor<List<BigDecimal>> deleted = ArgumentCaptor.forClass(List.class);
    verify(dailyAbnormalRepository).deleteAllById(deleted.capture());
    assertEquals(2, deleted.getValue().size());
    assertTrue(deleted.getValue().containsAll(
        List.of(new BigDecimal("3002"), new BigDecimal("3003"))));
    assertFalse(deleted.getValue().contains(new BigDecimal("3001")));
  }

  @Test
  void upsert_undatedSlotIsBlank_andDoesNotAddToCumulative() {
    BigDecimal riaSkey = new BigDecimal("881191");
    LocalDateTime ts = LocalDateTime.of(2026, 4, 5, 14, 30);

    // Slot 2 already has a surrogate key; the request resubmits it with no count date.
    GermCountEntity existing = new GermCountEntity();
    existing.setRiaSkey(riaSkey);
    existing.setUpdateTimestamp(ts);
    existing.setDailyGermSkey2(new BigDecimal("3002"));
    existing.setCountDt2(LocalDate.of(2026, 4, 2));

    stubChildSaves();
    when(germCountRepository.existsById(riaSkey)).thenReturn(true);
    when(germCountRepository.touchIfTimestampMatches(riaSkey, ts)).thenReturn(1);
    when(germCountRepository.findById(riaSkey)).thenReturn(Optional.of(existing));
    when(germCountRepository.nextDailyGermSkey()).thenReturn(new BigDecimal("4001"));
    when(germCountRepository.save(any(GermCountEntity.class)))
        .thenAnswer(inv -> inv.getArgument(0));

    List<DayGermCountDto> days = new ArrayList<>();
    days.add(day(1, LocalDate.of(2026, 4, 1), 1, 10, 0, 0, 0));
    // no countDt: a blank row the user has not filled in yet
    days.add(new DayGermCountDto(2, null, 2, 5, 0, 0, 0,
        zeroAbnormal(), zeroAbnormal(), zeroAbnormal(), zeroAbnormal()));
    days.add(day(3, LocalDate.of(2026, 4, 3), 3, 7, 0, 0, 0));

    germCountService.upsertGermCounts(riaSkey, request(ts, days), "USER1");

    ArgumentCaptor<GermCountEntity> captor = ArgumentCaptor.forClass(GermCountEntity.class);
    verify(germCountRepository).save(captor.capture());
    GermCountEntity saved = captor.getValue();

    // The undated slot keeps no surrogate key, no counts, and no cumulative value.
    assertNull(saved.getDailyGermSkey2());
    assertNull(saved.getRep1NoSeedsGerm2());
    assertNull(saved.getCumulativeGerm2());
    // Its 5 germinated seeds must not leak into the running total: 10 then 10+7.
    assertEquals(0, saved.getCumulativeGerm1().compareTo(new BigDecimal("10")));
    assertEquals(0, saved.getCumulativeGerm3().compareTo(new BigDecimal("17")));

    // Only the two dated slots get abnormal rows written.
    ArgumentCaptor<List<DailyAbnormalEntity>> abCaptor = ArgumentCaptor.forClass(List.class);
    verify(dailyAbnormalRepository).saveAll(abCaptor.capture());
    assertEquals(2, abCaptor.getValue().size());
  }

  @Test
  void upsert_update_withMatchingTimestamp_succeeds() {
    BigDecimal riaSkey = new BigDecimal("881191");
    LocalDateTime ts = LocalDateTime.of(2026, 4, 5, 14, 30);
    GermCountEntity existing = new GermCountEntity();
    existing.setRiaSkey(riaSkey);
    existing.setUpdateTimestamp(ts);

    stubChildSaves();
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
    List<DayGermCountDto> days = new ArrayList<>();
    days.add(day(1, LocalDate.of(2026, 4, 3), 1, 1, 1, 1, 1));
    days.add(day(2, LocalDate.of(2026, 4, 3), 2, 1, 1, 1, 1)); // not strictly greater

    ResponseStatusException ex = assertThrows(ResponseStatusException.class,
        () -> germCountService.upsertGermCounts(riaSkey, request(null, days), "USER1"));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
  }

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

}
