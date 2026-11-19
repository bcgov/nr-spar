package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.DrybackSaveDto;
import ca.bc.gov.oracleapi.dto.consep.DrybackScreenDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Service for the G64 Dryback Calculation screen.
 * Retrieves and manages dryback activity data from the database.
 */
@Service
@RequiredArgsConstructor
public class DrybackScreenService {

  /** Germination test types that have a dryback step (page title: G64, G34 and G44). */
  static final Set<String> DRYBACK_ACTIVITY_TYPES = Set.of("G64", "G34", "G44");

  private final ActivityRepository activityRepository;

  /** Revised dates to store on the activity and the schedule shift for its dependants. */
  record RevisedDates(LocalDate start, LocalDate end, Long dateDiff) {}

  /**
   * Retrieves the dryback screen data for a given Request Item Activity key.
   * Combines Activity record with current accepted Moisture Content test data.
   *
   * @param riaSkey the Request Item Activity SKEY
   * @return DrybackScreenDto containing all required dryback screen data
   * @throws ResponseStatusException 404 if the RIA with the given key does not exist
   */
  public DrybackScreenDto getDrybackScreenData(BigDecimal riaSkey) {
    if (riaSkey == null) {
      SparLog.error("riaSkey parameter is null");
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "riaSkey is required");
    }

    Optional<DrybackScreenDto> drybackScreenData =
        activityRepository.findDrybackScreenDataByRiaSkey(riaSkey);

    if (drybackScreenData.isEmpty()) {
      SparLog.info("Request Item Activity not found with riaSkey: {}", riaSkey);
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Activity not found");
    }

    return drybackScreenData.get();
  }

  /**
   * Saves the Dryback screen values, recalculates the activity's revised dates and shifts
   * every downstream dependent activity by the schedule variance. All in one transaction.
   *
   * @param riaSkey the Request Item Activity SKEY
   * @param dto the values to save, with the update timestamp the client last read
   * @return the refreshed screen data, carrying the new updateTimestamp
   * @throws ResponseStatusException 400 invalid input, 404 not found, 409 changed by another user
   */
  @Transactional
  public DrybackScreenDto saveDryback(BigDecimal riaSkey, DrybackSaveDto dto) {
    ActivityEntity stored = activityRepository.findById(riaSkey)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Activity not found"));
    validate(stored, dto, LocalDateTime.now());

    RevisedDates dates = computeRevisedDates(
        stored, dto.actualBeginDateTime(), dto.actualEndDateTime());

    int rows = activityRepository.updateDrybackActivityWithLock(
        riaSkey, dto, dates.start(), dates.end());
    if (rows == 0) {
      SparLog.warn("Optimistic lock conflict saving dryback riaKey: {}", riaSkey);
      throw new ResponseStatusException(HttpStatus.CONFLICT,
          "Activity was modified by another user; reload and retry");
    }

    if (dates.dateDiff() != null && dates.dateDiff() != 0) {
      shiftDependants(riaSkey, dates.dateDiff());
    }

    SparLog.info("Dryback saved for riaKey: {}, dateDiff: {}", riaSkey, dates.dateDiff());
    return getDrybackScreenData(riaSkey);
  }

  private void validate(ActivityEntity stored, DrybackSaveDto dto, LocalDateTime now) {
    if (!DRYBACK_ACTIVITY_TYPES.contains(stored.getActivityTypeCode())) {
      throw badRequest("Dryback can only be saved for G64, G34 or G44 activities");
    }
    LocalDateTime begin = dto.actualBeginDateTime();
    LocalDateTime end = dto.actualEndDateTime();
    if (begin == null) {
      if (dto.hasData()) {
        throw badRequest("Start date/time is required when any dryback data is entered");
      }
      return;
    }
    if (begin.isAfter(now)) {
      throw badRequest("Start date/time cannot be in the future");
    }
    if (end != null && end.isBefore(begin)) {
      throw badRequest("End date/time cannot be before start date/time");
    }
    if (end != null && end.isAfter(now)) {
      throw badRequest("End date/time cannot be in the future");
    }
  }

  private static ResponseStatusException badRequest(String message) {
    return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
  }

  /**
   * Spec "Save Processing" (Confluence FSADT2 300882212), with deliberate deviations:
   * a null stored revised date counts as changed (the spec's NULL comparison never fires,
   * and its NVL(revised_end, today) skipped an end date of today), and a missing planned end
   * date keeps the stored revised end and yields no dateDiff instead of nulling them.
   */
  static RevisedDates computeRevisedDates(
      ActivityEntity stored, LocalDateTime actualBegin, LocalDateTime actualEnd) {
    LocalDate plannedStart = stored.getPlannedStartDate();
    LocalDate plannedEnd = stored.getPlannedEndDate();
    LocalDate revisedStart = stored.getRevisedStartDate();
    LocalDate revisedEnd = stored.getRevisedEndDate();
    if (plannedStart == null) {
      return new RevisedDates(revisedStart, revisedEnd, null);
    }

    LocalDate begin = actualBegin == null ? null : actualBegin.toLocalDate();
    LocalDate end = actualEnd == null ? null : actualEnd.toLocalDate();

    if (begin != null && !begin.equals(revisedStart)) {
      revisedStart = begin;
      if (end != null) {
        revisedEnd = end;
      } else {
        revisedEnd = plannedEnd == null
            ? revisedEnd
            : plannedEnd.plusDays(ChronoUnit.DAYS.between(plannedStart, begin));
      }
      return new RevisedDates(revisedStart, revisedEnd, daysBetween(plannedEnd, revisedEnd));
    }

    if (end != null && !Objects.equals(end, revisedEnd)) {
      // No actual begin: the spec moves the end date but does not shift dependants.
      Long dateDiff = begin == null ? null : daysBetween(plannedEnd, end);
      return new RevisedDates(revisedStart, end, dateDiff);
    }
    return new RevisedDates(revisedStart, revisedEnd, null);
  }

  private static Long daysBetween(LocalDate from, LocalDate to) {
    return from == null || to == null ? null : ChronoUnit.DAYS.between(from, to);
  }

  /**
   * Moves every transitive dependant (CNS_T_RIA_DEPENDANCY) to planned + dateDiff. Walks the
   * graph level by level in Java because the test database (H2) has no CONNECT BY.
   */
  private void shiftDependants(BigDecimal riaSkey, long dateDiff) {
    Set<BigDecimal> seen = new LinkedHashSet<>(List.of(riaSkey));
    List<BigDecimal> level = List.of(riaSkey);
    while (!level.isEmpty()) {
      level = activityRepository.findDependantRiaKeys(level).stream()
          .filter(seen::add) // skips already visited keys, so a cycle cannot loop forever
          .toList();
    }
    seen.remove(riaSkey);
    if (seen.isEmpty()) {
      return;
    }

    // Scheduling-only bulk UPDATE: a loaded entity would write every column back on flush
    // and could overwrite a concurrent save of the dependant's other fields.
    int rows = activityRepository.shiftRevisedDates(seen, dateDiff);
    SparLog.info("Shifted {} dependent activities of riaKey: {} by {} days",
        rows, riaSkey, dateDiff);
  }
}
