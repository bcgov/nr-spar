package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.GerminatorIdAssignResponseDto;
import ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity;
import ca.bc.gov.oracleapi.repository.consep.GerminatorTrayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** The class for Germinator Tray service. */
@Service
@RequiredArgsConstructor
public class GerminatorTrayService {

  private final GerminatorTrayRepository germinatorTrayRepository;

  /**
   * Assign a germinator ID to an existing germinator tray.
   *
   * @param germinatorTrayId the ID of the germinator tray
   * @param germinatorId     the germinator ID to assign
   * @return a response DTO confirming the assignment
   * @throws ResponseStatusException if the tray is not found
   */
  public GerminatorIdAssignResponseDto assignGerminatorIdToTray(
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
          "Germinator ID already assigned to tray: " + germinatorTrayId
      );
    }

    tray.setGerminatorId(germinatorId);
    germinatorTrayRepository.save(tray);

    SparLog.info(
        "Successfully assigned germinator ID {} to tray ID {}",
        germinatorId,
        germinatorTrayId
    );

    return new GerminatorIdAssignResponseDto(
        germinatorTrayId,
        germinatorId
    );
  }
}
