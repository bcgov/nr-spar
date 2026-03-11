package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayAssignGerminatorIdResponseDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
import ca.bc.gov.oracleapi.repository.consep.GerminatorTrayRepository;
import ca.bc.gov.oracleapi.repository.consep.TestResultRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** The class for Germinator Tray service. */
@Service
@RequiredArgsConstructor
public class GerminatorTrayService {

  /** Message shown when optimistic concurrency check fails (0 rows affected). */
  public static final String RESELECT_MESSAGE =
      "Please reselect. Data updated by another user.";

  private final GerminatorTrayRepository germinatorTrayRepository;
  private final TestResultRepository testResultRepository;
  private final ActivityRepository activityRepository;

  /**
   * Assign a germinator ID to an existing germinator tray.
   *
   * @param germinatorTrayId the ID of the germinator tray
   * @param germinatorId     the germinator ID to assign
   * @return a response DTO confirming the assignment
   * @throws ResponseStatusException if the tray is not found
   */
  public GerminatorTrayAssignGerminatorIdResponseDto assignGerminatorIdToTray(
      Integer germinatorTrayId,
      String germinatorId
  ) {
    if (germinatorTrayId == null || germinatorId == null || germinatorId.isBlank()) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Germinator tray ID and germinator ID cannot be null or blank");
    }

    SparLog.info(
        "Assigning germinator ID {} to germinator tray ID {}",
        germinatorId,
        germinatorTrayId
    );

    GerminatorTrayEntity tray = germinatorTrayRepository.findById(germinatorTrayId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Germinator tray not found with ID: " + germinatorTrayId)
        );

    if (tray.getGerminatorId() != null) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "Germinator ID already assigned to this tray"
      );
    }

    tray.setGerminatorId(germinatorId);
    germinatorTrayRepository.save(tray);

    SparLog.info(
        "Successfully assigned germinator ID {} to tray ID {}",
        germinatorId,
        germinatorTrayId
    );

    return new GerminatorTrayAssignGerminatorIdResponseDto(
        germinatorTrayId,
        germinatorId
    );
  }

  /**
   * Remove a test from its tray: detach test, update parent activity timestamp.
   * If the tray has no tests left after removal, the tray is deleted.
   * Uses optimistic concurrency; if any DML affects 0 rows, throws and rolls back.
   *
   * @param germinatorTrayId         the tray the test is on (for validation and possible tray delete)
   * @param riaSkey                  the request item activity key of the test to remove
   * @param activityUpdateTimestamp  the current update_timestamp of the parent activity (optimistic lock)
   * @throws ResponseStatusException 409 with RESELECT_MESSAGE if any update affects 0 rows
   */
  @Transactional(rollbackFor = ResponseStatusException.class)
  public void deleteTestFromTray(
      Integer germinatorTrayId,
      BigDecimal riaSkey,
      LocalDateTime activityUpdateTimestamp
  ) {
    if (germinatorTrayId == null || riaSkey == null || activityUpdateTimestamp == null) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Germinator tray ID, RIA key, and activity update timestamp are required");
    }

    SparLog.info("Removing test {} from tray {}", riaSkey, germinatorTrayId);

    TestResultEntity testResult = testResultRepository.findById(riaSkey)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Test not found for RIA_SKEY: " + riaSkey));
    if (!germinatorTrayId.equals(testResult.getGerminatorTrayId())) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Test is not on the specified tray");
    }
    SparLog.info("Test {} is on tray {}", riaSkey, germinatorTrayId);

    int detachRows = testResultRepository.detachTestFromTray(riaSkey);
    if (detachRows == 0) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, RESELECT_MESSAGE);
    }
    SparLog.info("Detached test {} from tray {}", riaSkey, germinatorTrayId);

    int parentRows = activityRepository.updateTimestampWhereMatch(riaSkey, activityUpdateTimestamp);
    if (parentRows == 0) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, RESELECT_MESSAGE);
    }
    SparLog.info("Updated activity {} update timestamp", riaSkey);

    int remaining = testResultRepository.countByGerminatorTrayId(germinatorTrayId);
    if (remaining == 0) {
      int deleteRows = germinatorTrayRepository.deleteByGerminatorTrayId(germinatorTrayId);
      if (deleteRows == 0) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, RESELECT_MESSAGE);
      }
      SparLog.info("Tray {} had 0 tests after removal; tray deleted", germinatorTrayId);
    }
  }

  /**
   * Delete a tray: detach all tests, update each parent activity timestamp, then delete the tray.
   * Uses optimistic concurrency; if any DML affects 0 rows, throws and rolls back.
   *
   * @param germinatorTrayId the tray to delete
   * @param activityUpdateTimestamp the current update_timestamp of the parent activity (optimistic lock)
   * @throws ResponseStatusException 404 if tray not found, 409 with RESELECT_MESSAGE if any DML affects 0 rows
   */
  @Transactional(rollbackFor = ResponseStatusException.class)
  public void deleteTray(Integer germinatorTrayId, LocalDateTime activityUpdateTimestamp) {
    if (germinatorTrayId == null) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Germinator tray ID is required");
    }

    if (!germinatorTrayRepository.existsById(germinatorTrayId)) {
      throw new ResponseStatusException(
          HttpStatus.NOT_FOUND,
          "Germinator tray not found with ID: " + germinatorTrayId);
    }

    List<BigDecimal> riaKeys = testResultRepository.findRiaKeysByGerminatorTrayId(germinatorTrayId);
    SparLog.info("Deleting tray {} with {} tests", germinatorTrayId, riaKeys.size());

    for (BigDecimal riaKey : riaKeys) {
      int detachRows = testResultRepository.detachTestFromTray(riaKey);
      if (detachRows == 0) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, RESELECT_MESSAGE);
      }
      SparLog.info("Detached test {} from tray {}", riaKey, germinatorTrayId);

      int parentRows = activityRepository.updateTimestampWhereMatch(riaKey, activityUpdateTimestamp);
      if (parentRows == 0) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, RESELECT_MESSAGE);
      }
      SparLog.info("Updated activity {} update timestamp", riaKey);
    }

    int deleteRows = germinatorTrayRepository.deleteByGerminatorTrayId(germinatorTrayId);
    if (deleteRows == 0) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, RESELECT_MESSAGE);
    }
    SparLog.info("Tray {} deleted", germinatorTrayId);
  }
}
