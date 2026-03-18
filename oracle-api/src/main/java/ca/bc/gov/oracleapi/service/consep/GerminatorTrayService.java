package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayAssignGerminatorIdResponseDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayContentsDto;
import ca.bc.gov.oracleapi.entity.consep.GerminationTrayContentsEntity;
import ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity;
import ca.bc.gov.oracleapi.repository.consep.GerminationTrayContentsRepository;
import ca.bc.gov.oracleapi.repository.consep.GerminatorTrayRepository;
import java.time.LocalDateTime;
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
        updateTimestamp);
  }
}
