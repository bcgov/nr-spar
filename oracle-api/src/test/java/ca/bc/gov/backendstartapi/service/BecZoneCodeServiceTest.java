package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.entity.BecZoneCodeEntity;
import ca.bc.gov.backendstartapi.repository.BecZoneCodeRepository;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;

/** The test class for BEC zone code Service. */
@ExtendWith(MockitoExtension.class)
public class BecZoneCodeServiceTest {

  @Mock BecZoneCodeRepository becZoneCodeRepository;

  @Autowired @InjectMocks private BecZoneCodeService becZoneCodeService;

  @Test
  @DisplayName("Get a description of a BEC zone, success")
  void getBecZoneDescription_shouldSucceed() {
    String becZoneCode = "ICH";
    String becZoneDescription = "Interior Cedar -- Hemlock";
    BecZoneCodeEntity becZone = new BecZoneCodeEntity();
    becZone.setCode(becZoneCode);
    becZone.setDescription(becZoneDescription);

    when(becZoneCodeRepository.findById(becZoneCode)).thenReturn(Optional.of(becZone));

    String retVal = becZoneCodeService.getBecDescriptionByCode(becZoneCode);

    assertEquals(becZoneDescription, retVal);
  }

  @Test
  @DisplayName("Get a description of a null BEC zone code should return null")
  void getDescriptionWithNull() {
    assertEquals(null, becZoneCodeService.getBecDescriptionByCode(null));
  }

  @Test
  @DisplayName("Get a description of a BEC zone should return null if entity not found")
  void getDescriptionReturnNull__ifNotFound() {
    when(becZoneCodeRepository.findById(any())).thenReturn(Optional.empty());
    assertEquals(null, becZoneCodeService.getBecDescriptionByCode("ICH"));
  }
}
