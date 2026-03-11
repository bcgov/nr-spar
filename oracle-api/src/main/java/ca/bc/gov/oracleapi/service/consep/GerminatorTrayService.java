package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayAssignGerminatorIdResponseDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayContentsDto;
import ca.bc.gov.oracleapi.entity.consep.GerminationTrayContentsEntity;
import ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.repository.consep.GerminationTrayContentsRepository;
import ca.bc.gov.oracleapi.repository.consep.GerminatorTrayRepository;
import ca.bc.gov.oracleapi.repository.consep.TestResultRepository;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** The class for Germinator Tray service. */
@Service
@RequiredArgsConstructor
public class GerminatorTrayService {

  private final GerminatorTrayRepository germinatorTrayRepository;
  private final GerminationTrayContentsRepository germinationTrayContentsRepository;
  private final TestResultRepository testResultRepository;

  /**
   * Assign a germinator ID to an existing germinator tray.
   *
   * @param germinatorTrayId the ID of the germinator tray
   * @param germinatorId the germinator ID to assign
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
          "Germinator tray ID and germinator ID cannot be null or blank"
      );
    }

    SparLog.info(
        "Assigning germinator ID {} to germinator tray ID {}",
        germinatorId,
        germinatorTrayId
    );

    GerminatorTrayEntity tray = germinatorTrayRepository.findById(germinatorTrayId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Germinator tray not found with ID: " + germinatorTrayId
        ));

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

    return new GerminatorTrayAssignGerminatorIdResponseDto(germinatorTrayId, germinatorId);
  }

  public List<GerminatorTrayContentsDto> getTrayContents(Integer germinatorTrayId) {
    if (germinatorTrayId == null) {
      throw new ResponseStatusException(
        HttpStatus.BAD_REQUEST, "Germinator tray ID cannot be null"
      );
    }

    if (!germinatorTrayRepository.existsById(germinatorTrayId)) {
      throw new ResponseStatusException(
        HttpStatus.NOT_FOUND, "Germinator tray not found with ID: " + germinatorTrayId
      );
    }

    return germinationTrayContentsRepository.findByGerminatorTrayId(germinatorTrayId)
        .stream()
        .map(this::toDto)
        .toList();
  }

  private GerminatorTrayContentsDto toDto(GerminationTrayContentsEntity e) {
    return new GerminatorTrayContentsDto(
        e.getGerminatorTrayId(),
        e.getVegetationSt(),
        e.getActivityTypeCd(),
        e.getActualStartDate(),
        e.getDateCreated(),
        e.getRiaSkey(),
        e.getRequestId(),
        e.getRequestSkey(),
        e.getItemId(),
        e.getRequestTypeSt(),
        e.getSeedlotNumber(),
        e.getSoakStartDate(),
        e.getSoakEndDate(),
        e.getSeedWithdrawDate(),
        e.getWarmStratStartDate(),
        e.getDrybackStartDate(),
        e.getGerminatorEntry(),
        e.getStratStartDate(),
        e.getGerminatorId(),
        e.getStandardActivityId(),
        e.getTestCategoryCd()
    );
  }

  public void removeTestFromTray(BigDecimal riaKey) {
    // Validate input
    if (riaKey == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "RIA key cannot be null");
    }

    // Fetch the test result
    TestResultEntity testResult =
        testResultRepository
            .findById(riaKey)
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Test result not found for RIA key: " + riaKey
                    )
            );

    // Verify test is assigned to a tray
    Integer trayId = testResult.getGerminatorTrayId();
    if (trayId == null) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Test is not assigned to a germinator tray");
    }

    // Fetch the tray and store current revision count for optimistic lock
    GerminatorTrayEntity tray =
        germinatorTrayRepository
            .findById(trayId)
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Germinator tray not found with ID: " + trayId
                    )
            );

    Long originalRevisionCount = tray.getRevisionCount();

    SparLog.info(
        "Removing test {} from tray {} (current revision: {})",
        riaKey,
        trayId,
        originalRevisionCount);

    // Count tests on tray (including the one being removed)
    long trayTestCount = testResultRepository.countByGerminatorTrayId(trayId);

    // Clear the test assignment from the tray
    testResultRepository.clearGerminatorTrayAssignment(riaKey);

    // Decision: delete tray if last test, otherwise update revision count
    if (trayTestCount == 1) {
      // Last test on tray - delete the tray with version check
      int rowsDeleted =
          germinatorTrayRepository.deleteByIdAndRevisionCount(trayId, originalRevisionCount);
      if (rowsDeleted == 0) {
        throw new ResponseStatusException(
            HttpStatus.CONFLICT,
            "Germinator tray was modified by another user. Please refresh and try again."
        );
      }
      SparLog.info("Deleted germinator tray {} after removing last test", trayId);
    } else {
      // Multiple tests remain - increment revision count on tray with version check
      int rowsUpdated =
          germinatorTrayRepository.incrementRevisionCountWithVersionCheck(
            trayId,
            originalRevisionCount
          );
      if (rowsUpdated == 0) {
        throw new ResponseStatusException(
            HttpStatus.CONFLICT,
            "Germinator tray was modified by another user. Please refresh and try again."
        );
      }
      SparLog.info(
          "Removed test {} from tray {}. Tests remaining: {}", riaKey, trayId, trayTestCount - 1
      );
    }
  }
}
