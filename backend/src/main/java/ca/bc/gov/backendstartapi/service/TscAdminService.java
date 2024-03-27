package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
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
}
