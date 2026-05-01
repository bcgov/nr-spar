package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.GerminatorIdAssignResponseDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayContentsDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayDeleteContentDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTraySearchRequestDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTraySearchResponseDto;
import ca.bc.gov.oracleapi.entity.consep.GerminationTrayContentsEntity;
import ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
import ca.bc.gov.oracleapi.repository.consep.GerminationTrayContentsRepository;
import ca.bc.gov.oracleapi.repository.consep.GerminatorTrayRepository;
import ca.bc.gov.oracleapi.repository.consep.TestResultRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
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
  private final GerminationTrayContentsRepository germinationTrayContentsRepository;

  /**
   * Assign a germinator ID to an existing germinator tray.
   *
   * @param germinatorTrayId the ID of the germinator tray
   * @param germinatorId     the germinator ID to assign, leave it blank to unassign
   * @return a response DTO confirming the assignment
   * @throws ResponseStatusException if the tray is not found
   */
  public GerminatorIdAssignResponseDto assignGerminatorIdToTray(
      Integer germinatorTrayId,
      String germinatorId
  ) {
    if (germinatorTrayId == null || germinatorId == null) {
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

    String previousId = tray.getGerminatorId();
    if (germinatorId.isBlank()) {
      SparLog.info(
          "Unsetting germinator ID for tray {} (previous value: {})",
          germinatorTrayId,
          previousId
      );
    } else if (previousId == null) {
      SparLog.info(
          "Assigning germinator ID {} to tray {}",
          germinatorId,
          germinatorTrayId
      );
    } else {
      SparLog.info(
          "Updating germinator ID for tray {} from {} to {}",
          germinatorTrayId,
          previousId,
          germinatorId
      );
    }

    if (germinatorId.isBlank()) {
      tray.setGerminatorId(null); // unset
    } else {
      tray.setGerminatorId(germinatorId);
    }
    germinatorTrayRepository.save(tray);

    SparLog.info(
        "Germinator ID for tray {} is now {}",
        germinatorTrayId,
        tray.getGerminatorId()
    );

    return new GerminatorIdAssignResponseDto(
        germinatorTrayId,
        tray.getGerminatorId()
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

    detachTestAndTouchParent(riaSkey, activityUpdateTimestamp, germinatorTrayId);

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
   * Uses optimistic concurrency with one timestamp per tray item; if any DML affects 0 rows,
   * throws and rolls back.
   *
   * @param germinatorTrayId the tray to delete
   * @param contents the tray contents with the current update_timestamp of each parent activity
   * @throws ResponseStatusException 404 if tray not found, 409 with RESELECT_MESSAGE if any
   *         DML affects 0 rows
   */
  @Transactional(rollbackFor = ResponseStatusException.class)
  public void deleteTray(
      Integer germinatorTrayId,
      List<GerminatorTrayDeleteContentDto> contents
  ) {
    if (germinatorTrayId == null || contents == null) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Germinator tray ID and contents are required");
    }

    if (!germinatorTrayRepository.existsById(germinatorTrayId)) {
      throw new ResponseStatusException(
          HttpStatus.NOT_FOUND,
          "Germinator tray not found with ID: " + germinatorTrayId);
    }

    List<BigDecimal> riaKeys = testResultRepository.findRiaKeysByGerminatorTrayId(germinatorTrayId);
    SparLog.info("Deleting tray {} with {} tests", germinatorTrayId, riaKeys.size());
    Map<BigDecimal, LocalDateTime> timestampsByRiaKey = getTimestampsByRiaKey(contents);
    if (!timestampsByRiaKey.keySet().equals(new HashSet<>(riaKeys))) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, RESELECT_MESSAGE);
    }

    for (BigDecimal riaKey : riaKeys) {
      detachTestAndTouchParent(riaKey, timestampsByRiaKey.get(riaKey), germinatorTrayId);
    }

    int deleteRows = germinatorTrayRepository.deleteByGerminatorTrayId(germinatorTrayId);
    if (deleteRows == 0) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, RESELECT_MESSAGE);
    }
    SparLog.info("Tray {} deleted", germinatorTrayId);
  }

  private Map<BigDecimal, LocalDateTime> getTimestampsByRiaKey(
      List<GerminatorTrayDeleteContentDto> contents
  ) {
    Map<BigDecimal, LocalDateTime> timestampsByRiaKey = new HashMap<>();
    for (GerminatorTrayDeleteContentDto content : contents) {
      if (content == null || content.riaSkey() == null || content.updateTimestamp() == null) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "RIA key and activity update timestamp are required for each tray content item");
      }
      if (timestampsByRiaKey.put(content.riaSkey(), content.updateTimestamp()) != null) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Duplicate RIA key in tray contents");
      }
    }
    return timestampsByRiaKey;
  }

  /**
   * Detach one test from its tray and update the parent activity's timestamp (optimistic lock).
   * Throws 409 if either DML affects 0 rows.
   */
  private void detachTestAndTouchParent(
      BigDecimal riaKey,
      LocalDateTime activityUpdateTimestamp,
      Integer germinatorTrayId
  ) {
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

  /**
   * Retrieve the contents of a germinator tray.
   *
   * @param germinatorTrayId the ID of the germinator tray
   * @return the tray contents, or an empty list if the tray exists but has no contents
   * @throws ResponseStatusException if the tray ID is null or the tray does not exist
   */
  public List<GerminatorTrayContentsDto> getTrayContents(Integer germinatorTrayId) {
    if (germinatorTrayId == null) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Germinator tray ID cannot be null");
    }

    if (!germinatorTrayRepository.existsById(germinatorTrayId)) {
      throw new ResponseStatusException(
          HttpStatus.NOT_FOUND, "Germinator tray not found with ID: " + germinatorTrayId);
    }

    return germinationTrayContentsRepository.findByGerminatorTrayId(germinatorTrayId).stream()
        .map(this::toDto)
        .toList();
  }

  private GerminatorTrayContentsDto toDto(Object[] row) {
    var entity = (GerminationTrayContentsEntity) row[0];
    var updateTimestamp = (LocalDateTime) row[1];
    return new GerminatorTrayContentsDto(
        entity.getGerminatorTrayId(),
        entity.getRequestId(),
        entity.getSeedlotNumber(),
        entity.getWarmStratStartDate(),
        entity.getDrybackStartDate(),
        entity.getGerminatorEntry(),
        entity.getStratStartDate(),
        entity.getTestCompleteInd(),
        entity.getAcceptResultInd(),
        entity.getRiaSkey(),
        updateTimestamp);
  }

  private String normalizeBlankToNull(String value) {
    if (value == null) {
      return null;
    }
    String trimmed = value.trim();
    return trimmed.isBlank() ? null : trimmed;
  }

  /**
   * Search for germinator trays matching the given criteria.
   *
   * <p>At least one of {@code seedlotOrFamilyLot} or {@code requestIdOrItem} must be provided. If
   * {@code requestIdOrItem} is 12 characters, the last character is treated as the item ID. If it
   * is 11 characters, it is treated as the request ID only.
   *
   * @param request the search criteria DTO
   * @return a list of matching germinator tray search results, or an empty list if none match
   * @throws ResponseStatusException 400 if both search criteria are blank (open search blocked)
   * @throws ResponseStatusException 400 if requestIdOrItem is not exactly 11 or 12 characters
   */
  public List<GerminatorTraySearchResponseDto> searchGerminatorTrays(
      GerminatorTraySearchRequestDto request) {
    String seedlotOrFamilyLot = normalizeBlankToNull(request.seedlotOrFamilyLot());
    String requestIdOrItem = normalizeBlankToNull(request.requestIdOrItem());

    SparLog.info(
        "Searching germinator trays - seedlotOrFamilyLot: {}, requestIdOrItem: {}",
        seedlotOrFamilyLot,
        requestIdOrItem);

    // Prevent open search
    if (seedlotOrFamilyLot == null && requestIdOrItem == null) {
      SparLog.info("Rejecting open search: both criteria are null or blank");
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "At least one search criterion is required");
    }

    // Request ID / item split (same pattern as existing search logic)
    String requestId = null;
    String itemId = null;
    if (requestIdOrItem != null) {
      int lengthOfIdOrItem = requestIdOrItem.length();
      if (lengthOfIdOrItem != 11 && lengthOfIdOrItem != 12) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "requestId or requestItem must be exactly 11 or 12 characters");
      }
      requestId = requestIdOrItem.substring(0, 11);
      if (lengthOfIdOrItem == 12) {
        itemId = requestIdOrItem.substring(11);
      }
    }

    SparLog.info("Executing tray search - requestId: {}, itemId: {}", requestId, itemId);

    List<GerminatorTraySearchResponseDto> results =
        germinatorTrayRepository.searchGerminatorTrays(seedlotOrFamilyLot, requestId, itemId);

    SparLog.info("Tray search returned {} result(s)", results.size());

    return results;
  }
}
