package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.exception.SeedlotStatusNotFoundException;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;

/** This class holds methods for handling data for the TSC_Admin role. */
@Service
@RequiredArgsConstructor
public class TscAdminService {

  private final SeedlotRepository seedlotRepository;

  private final SeedlotStatusService seedlotStatusService;

  /**
   * Retrieve a paginated list of seedlot for a given user.
   *
   * @param pageNumber the page number for the paginated search
   * @param pageSize the size of the page
   * @return a list of the user's seedlots
   */
  public Page<Seedlot> getTscAdminSeedlots(int pageNumber, int pageSize) {
    SparLog.info("Retrieving paginated list of seedlots for the TSC Admin role!");
    if (pageSize == 0) {
      SparLog.info("Invalid page size value, using default 10.");
      pageSize = 10;
    }

    SparLog.info("Pagination settings: pageNumber {}, pageSize {}", pageNumber, pageSize);
    Pageable sortedPageable =
        PageRequest.of(
            pageNumber, pageSize, Sort.by(Direction.DESC, "AuditInformation_UpdateTimestamp"));

    Page<Seedlot> seedlotPage = seedlotRepository.findAll(sortedPageable);
    SparLog.info("{} results and {} pages", seedlotPage.getNumber(), seedlotPage.getTotalPages());
    return seedlotPage;
  }

  /**
   * Method for approving or disapproving a {@link Seedlot} registration.
   *
   * @param seedlotNumber The {@link Seedlot} identification.
   * @param approved Boolean option defined if it was approved.
   */
  public Seedlot approveOrDisapproveSeedlot(String seedlotNumber, Boolean approved) {
    SparLog.info("Received Seedlot number {} for approval or disappoval", seedlotNumber);

    Optional<Seedlot> seedlot = seedlotRepository.findById(seedlotNumber);
    if (seedlot.isEmpty()) {
      SparLog.warn("Seedlot number not found!");
      throw new SeedlotNotFoundException();
    }

    Seedlot seedlotEntity = seedlot.get();
    String statucCode = null;

    if (Boolean.TRUE.equals(approved)) {
      SparLog.info("Seedlot number {} approved! Updating it to Approved", seedlotNumber);
      statucCode = "APP";
    } else {
      SparLog.info("Seedlot number {} disapproved! Sending it back to Pending", seedlotNumber);
      statucCode = "PND";
    }

    Optional<SeedlotStatusEntity> seedlotStatus =
        seedlotStatusService.getValidSeedlotStatus(statucCode);
    if (seedlotStatus.isEmpty()) {
      SparLog.warn("Seedlot status {} not found!", statucCode);
      throw new SeedlotStatusNotFoundException();
    }

    seedlotEntity.setSeedlotStatus(seedlotStatus.get());

    Seedlot seedlotSaved = seedlotRepository.saveAndFlush(seedlotEntity);
    SparLog.info("Seedlot number {} approval or disapproval request finished!", seedlotNumber);

    return seedlotSaved;
  }
}
