package ca.bc.gov.backendstartapi.service;

import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class TscAdminServiceTest {

  @Mock SeedlotRepository seedlotRepository;

  private TscAdminService tscAdminService;

  @BeforeEach
  void setup() {
    tscAdminService = new TscAdminService(seedlotRepository);
  }

  @Test
  @DisplayName("get Seedlots for the TSC_Admin role")
  void getTscAdminSeedlots_happyPath_shouldSuceed() {
    Integer page = 0;
    Integer size = 10;

    Pageable sortedPageable =
        PageRequest.of(page, size, Sort.by(Direction.DESC, "AuditInformation_UpdateTimestamp"));

    Seedlot seedlot = new Seedlot("63712");
    seedlot.setApplicantClientNumber("00012345");

    Page<Seedlot> seedlotPage = new PageImpl<>(List.of(seedlot));
    when(seedlotRepository.findAll(sortedPageable)).thenReturn(seedlotPage);

    Page<Seedlot> pageResult = tscAdminService.getTscAdminSeedlots(page, size);

    Assertions.assertNotNull(pageResult);
    Assertions.assertEquals("63712", pageResult.getContent().get(0).getId());
    Assertions.assertEquals("00012345", pageResult.getContent().get(0).getApplicantClientNumber());
  }
}
