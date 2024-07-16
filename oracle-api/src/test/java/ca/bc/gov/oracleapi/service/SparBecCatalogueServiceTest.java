package ca.bc.gov.oracleapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.dto.SparBecZoneDescriptionDto;
import ca.bc.gov.oracleapi.entity.SparBecCatalogueEntity;
import ca.bc.gov.oracleapi.repository.SparBecCatalogueRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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

  private SparBecZoneDescriptionDto mockSparBecZoneDesc(String code, String desc) {
    return new SparBecZoneDescriptionDto() {
      @Override
      public String getBecZoneCode() {
        return code;
      }

      @Override
      public String getBecZoneName() {
        return desc;
      }

      @Override
      public LocalDateTime getBacZoneUpdateTimestamp() {
        return LocalDateTime.now();
      }
    };
  }

  @Test
  @DisplayName("Get a description of a BEC zone, success")
  void getBecZoneDescription_shouldSucceed() {
    String becZoneCode = "ICH";
    String becZoneDescription = "Interior Cedar -- Hemlock";
    SparBecCatalogueEntity becCatEntity = new SparBecCatalogueEntity();
    becCatEntity.setBecCode(becZoneCode);
    becCatEntity.setBecZoneDescription(becZoneDescription);

    List<SparBecZoneDescriptionDto> zones = new ArrayList<>();
    zones.add(mockSparBecZoneDesc(becZoneCode, becZoneDescription));

    when(sparBecCatalogueRepository.findAllBecZonesByCodeIn(List.of(becZoneCode)))
        .thenReturn(zones);

    List<String> becZones = new ArrayList<>(List.of(becZoneCode));
    Map<String, String> retVal = sparBecCatalogueService.getBecDescriptionsByCode(becZones);

    assertNotNull(retVal);
    assertEquals(1, retVal.size());
    assertTrue(retVal.containsKey(becZoneCode));
    assertEquals(becZoneDescription, retVal.get(becZoneCode));
  }

  @Test
  @DisplayName("Get a description of a null BEC zone code should return null")
  void getDescriptionWithNull() {
    assertTrue(sparBecCatalogueService.getBecDescriptionsByCode(List.of()).isEmpty());
  }

  @Test
  @DisplayName("Get a description of a BEC zone should return null if entity not found")
  void getDescriptionReturnNull__ifNotFound() {
    when(sparBecCatalogueRepository.findAllBecZonesByCodeIn(any())).thenReturn(List.of());
    assertTrue(sparBecCatalogueService.getBecDescriptionsByCode(List.of("ICH")).isEmpty());
  }
}
