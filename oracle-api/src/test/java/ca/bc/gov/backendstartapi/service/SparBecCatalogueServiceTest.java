package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.entity.SparBecCatalogueEntity;
import ca.bc.gov.backendstartapi.repository.SparBecCatalogueRepository;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;

/** The test class for BEC zone code Service. */
@ExtendWith(MockitoExtension.class)
public class SparBecCatalogueServiceTest {

  @Mock SparBecCatalogueRepository sparBecCatalogueRepository;

  @Autowired @InjectMocks private SparBecCatalogueService sparBecCatalogueService;

  @Test
  @DisplayName("Get a description of a BEC zone, success")
  void getBecZoneDescription_shouldSucceed() {
    String becZoneCode = "ICH";
    String becZoneDescription = "Interior Cedar -- Hemlock";
    SparBecCatalogueEntity becCatEntity = new SparBecCatalogueEntity();
    becCatEntity.setBecCode(becZoneCode);
    becCatEntity.setBecZoneDescription(becZoneDescription);

    when(sparBecCatalogueRepository.findAllByBecCodeOrderByUpdateTimeStampDesc(becZoneCode))
        .thenReturn(List.of(becCatEntity));

    String retVal = sparBecCatalogueService.getBecDescriptionByCode(becZoneCode);

    assertEquals(becZoneDescription, retVal);
  }

  @Test
  @DisplayName("Get a description of a null BEC zone code should return null")
  void getDescriptionWithNull() {
    assertEquals(null, sparBecCatalogueService.getBecDescriptionByCode(null));
  }

  @Test
  @DisplayName("Get a description of a BEC zone should return null if entity not found")
  void getDescriptionReturnNull__ifNotFound() {
    when(sparBecCatalogueRepository.findAllByBecCodeOrderByUpdateTimeStampDesc(any()))
        .thenReturn(List.of());
    assertEquals(null, sparBecCatalogueService.getBecDescriptionByCode("ICH"));
  }
}
