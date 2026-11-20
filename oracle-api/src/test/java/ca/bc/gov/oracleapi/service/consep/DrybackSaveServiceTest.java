package ca.bc.gov.oracleapi.service.consep;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.dto.consep.DrybackSaveDto;
import ca.bc.gov.oracleapi.dto.consep.DrybackScreenDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
import ca.bc.gov.oracleapi.service.consep.DrybackScreenService.RevisedDates;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class DrybackSaveServiceTest {

  private static final BigDecimal RIA = new BigDecimal("100");
  private static final LocalDate PLANNED_START = LocalDate.of(2026, 3, 1);
  private static final LocalDate PLANNED_END = LocalDate.of(2026, 3, 10);
  private static final LocalDateTime TS = LocalDateTime.of(2026, 3, 1, 8, 0, 0);

  @Mock
  private ActivityRepository activityRepository;

  @InjectMocks
  private DrybackScreenService service;

  private ActivityEntity stored;

  @BeforeEach
  void setUp() {
    stored = activity(RIA, PLANNED_START, PLANNED_END);
    stored.setActivityTypeCode("G64");
    stored.setRevisedStartDate(PLANNED_START);
    stored.setRevisedEndDate(PLANNED_END);
    stored.setUpdateTimestamp(TS);
  }

  private static ActivityEntity activity(BigDecimal key, LocalDate start, LocalDate end) {
    ActivityEntity a = new ActivityEntity();
    a.setRiaKey(key);
    a.setPlannedStartDate(start);
    a.setPlannedEndDate(end);
    return a;
  }

  private static LocalDateTime at(int month, int day) {
    return LocalDateTime.of(2026, month, day, 9, 30);
  }

  private static DrybackSaveDto dto(LocalDateTime begin, LocalDateTime end) {
    return new DrybackSaveDto(begin, end, new BigDecimal("34.4"), new BigDecimal("26.438"),
        new BigDecimal("25.080"), new BigDecimal("17.812"), 65, new BigDecimal("23.512"),
        new BigDecimal("25.320"), null, "note", TS);
  }

  // ---------- computeRevisedDates: one test per spec branch ----------

  @Test
  void beginChanged_noEnd_shiftsRevisedEndByBeginDelta() {
    RevisedDates d = DrybackScreenService.computeRevisedDates(stored, at(3, 4), null);
    assertThat(d).isEqualTo(
        new RevisedDates(LocalDate.of(2026, 3, 4), LocalDate.of(2026, 3, 13), 3L));
  }

  @Test
  void beginChanged_withEnd_usesActualEnd() {
    RevisedDates d = DrybackScreenService.computeRevisedDates(stored, at(3, 4), at(3, 8));
    assertThat(d).isEqualTo(
        new RevisedDates(LocalDate.of(2026, 3, 4), LocalDate.of(2026, 3, 8), -2L));
  }

  @Test
  void beginUnchanged_endChanged_diffFromPlannedEnd() {
    RevisedDates d = DrybackScreenService.computeRevisedDates(stored, at(3, 1), at(3, 12));
    assertThat(d).isEqualTo(new RevisedDates(PLANNED_START, LocalDate.of(2026, 3, 12), 2L));
  }

  @Test
  void beginUnchanged_endUnchanged_noChange() {
    RevisedDates d = DrybackScreenService.computeRevisedDates(stored, at(3, 1), at(3, 10));
    assertThat(d).isEqualTo(new RevisedDates(PLANNED_START, PLANNED_END, null));
  }

  @Test
  void noPlannedStart_keepsStoredRevisedDates() {
    stored.setPlannedStartDate(null);
    RevisedDates d = DrybackScreenService.computeRevisedDates(stored, at(3, 4), at(3, 12));
    assertThat(d).isEqualTo(new RevisedDates(PLANNED_START, PLANNED_END, null));
  }

  @Test
  void nullRevisedStart_countsAsChanged() {
    stored.setRevisedStartDate(null);
    RevisedDates d = DrybackScreenService.computeRevisedDates(stored, at(3, 1), null);
    assertThat(d).isEqualTo(new RevisedDates(PLANNED_START, PLANNED_END, 0L));
  }

  @Test
  void nullRevisedEnd_endDateSetEvenWhenItIsToday() {
    stored.setRevisedEndDate(null);
    LocalDateTime today = LocalDate.now().atTime(9, 0);
    stored.setRevisedStartDate(PLANNED_START);
    RevisedDates d = DrybackScreenService.computeRevisedDates(stored, at(3, 1), today);
    assertThat(d.end()).isEqualTo(today.toLocalDate());
    assertThat(d.dateDiff()).isNotNull();
  }

  @Test
  void nullPlannedEnd_keepsRevisedEnd_noDiff() {
    stored.setPlannedEndDate(null);
    RevisedDates d = DrybackScreenService.computeRevisedDates(stored, at(3, 4), null);
    assertThat(d).isEqualTo(new RevisedDates(LocalDate.of(2026, 3, 4), PLANNED_END, null));
  }

  // ---------- saveDryback ----------

  private void storedFound() {
    when(activityRepository.findById(RIA)).thenReturn(Optional.of(stored));
  }

  private void refreshFound() {
    when(activityRepository.findDrybackScreenDataByRiaSkey(RIA))
        .thenReturn(Optional.of(new DrybackScreenDto()));
  }

  @Test
  void save_shiftsAllTransitiveDependants_andStopsOnCycle() {
    storedFound();
    refreshFound();
    DrybackSaveDto dto = dto(at(3, 4), null);
    when(activityRepository.updateDrybackActivityWithLock(
        RIA, dto, LocalDate.of(2026, 3, 4), LocalDate.of(2026, 3, 13))).thenReturn(1);
    BigDecimal child = new BigDecimal("200");
    BigDecimal grandChild = new BigDecimal("300");
    when(activityRepository.findDependantRiaKeys(List.of(RIA))).thenReturn(List.of(child));
    when(activityRepository.findDependantRiaKeys(List.of(child))).thenReturn(List.of(grandChild));
    // cycle back to the root and to the child: must terminate
    when(activityRepository.findDependantRiaKeys(List.of(grandChild)))
        .thenReturn(List.of(RIA, child));

    service.saveDryback(RIA, dto);

    verify(activityRepository).shiftRevisedDates(Set.of(child, grandChild), 3L);
  }

  @Test
  void save_noDependants_skipsShift() {
    storedFound();
    refreshFound();
    DrybackSaveDto dto = dto(at(3, 4), null);
    when(activityRepository.updateDrybackActivityWithLock(eq(RIA), eq(dto), any(), any()))
        .thenReturn(1);
    when(activityRepository.findDependantRiaKeys(List.of(RIA))).thenReturn(List.of());

    service.saveDryback(RIA, dto);

    verify(activityRepository, never()).shiftRevisedDates(anyCollection(), anyLong());
  }

  @Test
  void save_unchangedDates_doesNotTouchDependants() {
    storedFound();
    refreshFound();
    DrybackSaveDto dto = dto(at(3, 1), at(3, 10));
    when(activityRepository.updateDrybackActivityWithLock(RIA, dto, PLANNED_START, PLANNED_END))
        .thenReturn(1);

    service.saveDryback(RIA, dto);

    verify(activityRepository, never()).findDependantRiaKeys(anyCollection());
    verify(activityRepository, never()).shiftRevisedDates(anyCollection(), anyLong());
  }

  @Test
  void save_correctBackToPlanned_shiftsDependantsByZero() {
    // An earlier save moved begin to 3/4 and shifted dependants to planned + 3.
    stored.setRevisedStartDate(LocalDate.of(2026, 3, 4));
    stored.setRevisedEndDate(LocalDate.of(2026, 3, 13));
    storedFound();
    refreshFound();
    DrybackSaveDto dto = dto(at(3, 1), null);
    when(activityRepository.updateDrybackActivityWithLock(RIA, dto, PLANNED_START, PLANNED_END))
        .thenReturn(1);
    BigDecimal child = new BigDecimal("200");
    when(activityRepository.findDependantRiaKeys(List.of(RIA))).thenReturn(List.of(child));

    service.saveDryback(RIA, dto);

    verify(activityRepository).shiftRevisedDates(Set.of(child), 0L);
  }

  @Test
  void save_staleTimestamp_returns409_andSkipsDependants() {
    storedFound();
    when(activityRepository.updateDrybackActivityWithLock(eq(RIA), any(), any(), any()))
        .thenReturn(0);

    assertThatThrownBy(() -> service.saveDryback(RIA, dto(at(3, 4), null)))
        .isInstanceOfSatisfying(ResponseStatusException.class,
            e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
    verify(activityRepository, never()).findDependantRiaKeys(anyCollection());
  }

  @Test
  void save_staleTimestamp_returns409_beforeValidation() {
    storedFound();
    DrybackSaveDto staleAndInvalid = new DrybackSaveDto(at(3, 4), at(3, 3), null, null, null,
        null, null, null, null, null, null, TS.minusSeconds(1));

    assertThatThrownBy(() -> service.saveDryback(RIA, staleAndInvalid))
        .isInstanceOfSatisfying(ResponseStatusException.class,
            e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
    verify(activityRepository, never()).updateDrybackActivityWithLock(any(), any(), any(), any());
  }

  @Test
  void save_rejectsClearingSavedBeginDate() {
    stored.setActualBeginDateTime(at(3, 4));
    storedFound();
    assertBadRequest(new DrybackSaveDto(
        null, null, null, null, null, null, null, null, null, null, "note", TS));
  }

  @Test
  void save_missingActivity_returns404() {
    when(activityRepository.findById(RIA)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.saveDryback(RIA, dto(at(3, 4), null)))
        .isInstanceOfSatisfying(ResponseStatusException.class,
            e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));
  }

  private void assertBadRequest(DrybackSaveDto dto) {
    assertThatThrownBy(() -> service.saveDryback(RIA, dto))
        .isInstanceOfSatisfying(ResponseStatusException.class,
            e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
    verify(activityRepository, never()).updateDrybackActivityWithLock(any(), any(), any(), any());
  }

  @Test
  void save_rejectsNonDrybackActivityType() {
    stored.setActivityTypeCode("G10");
    storedFound();
    assertBadRequest(dto(at(3, 4), null));
  }

  @Test
  void save_rejectsDataWithoutStartDate() {
    storedFound();
    assertBadRequest(dto(null, null));
  }

  @Test
  void save_rejectsEndBeforeStart() {
    storedFound();
    assertBadRequest(dto(at(3, 4), at(3, 3)));
  }

  @Test
  void save_rejectsFutureEnd() {
    storedFound();
    assertBadRequest(dto(at(3, 4), LocalDateTime.now().plusDays(1)));
  }

  @Test
  void save_allowsCommentOnlyWithoutStartDate() {
    storedFound();
    refreshFound();
    DrybackSaveDto commentOnly = new DrybackSaveDto(
        null, null, null, null, null, null, null, null, null, null, "note", TS);
    when(activityRepository.updateDrybackActivityWithLock(RIA, commentOnly, PLANNED_START,
        PLANNED_END)).thenReturn(1);

    assertThat(service.saveDryback(RIA, commentOnly)).isNotNull();
  }

  @Test
  void hasData_ignoresCommentAndTimestamp() {
    assertThat(new DrybackSaveDto(null, null, null, null, null, null, null, null, null, null,
        "c", TS).hasData()).isFalse();
    assertThat(dto(null, null).hasData()).isTrue();
  }
}
