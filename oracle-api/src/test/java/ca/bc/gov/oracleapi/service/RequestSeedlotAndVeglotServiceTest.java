package ca.bc.gov.oracleapi.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.repository.RequestSeedlotRepository;
import ca.bc.gov.oracleapi.repository.RequestVeglotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RequestSeedlotAndVeglotServiceTest {

  @Mock private RequestSeedlotRepository requestSeedlotRepository;
  @Mock private RequestVeglotRepository requestVeglotRepository;

  private RequestLotService service;

  @BeforeEach
  void setUp() {
    service = new RequestLotService(requestSeedlotRepository, requestVeglotRepository);
  }

  @Test
  @DisplayName("isCommitmentIndicatorYes_shouldReturnTrue_whenSeedlotCommitmentIsYes")
  void isCommitmentIndicatorYes_shouldReturnTrue_whenSeedlotCommitmentIsYes() {
    Long requestSkey = 123L;
    String itemId = "1";

    when(requestSeedlotRepository.existsCommitmentYes(requestSkey, itemId)).thenReturn(true);

    boolean result = service.isCommitmentIndicatorYes(requestSkey, itemId);

    assertTrue(result);
    verify(requestSeedlotRepository).existsCommitmentYes(requestSkey, itemId);
    verifyNoInteractions(requestVeglotRepository);
  }


  @Test
  @DisplayName("isCommitmentIndicatorYes_shouldReturnTrueIfVeglotCommitmentIsYes"
      + "_whenSeedlotCommitmentIsFalse")
  void isCommitmentIndicatorYes_shouldReturnTrueIfVeglotIsYes_whenSeedlotCommitmentIsFalse() {
    Long requestSkey = 456L;
    String itemId = "88";

    when(requestSeedlotRepository.existsCommitmentYes(requestSkey, itemId)).thenReturn(false);
    when(requestVeglotRepository.existsCommitmentYes(requestSkey, itemId)).thenReturn(true);

    boolean result = service.isCommitmentIndicatorYes(requestSkey, itemId);

    assertTrue(result);
    verify(requestSeedlotRepository).existsCommitmentYes(requestSkey, itemId);
    verify(requestVeglotRepository).existsCommitmentYes(requestSkey, itemId);
    verifyNoMoreInteractions(requestSeedlotRepository, requestVeglotRepository);
  }

  @Test
  @DisplayName("isCommitmentIndicatorYes_shouldReturnFalse_whenBothSeedlotAndVeglotAreFalse")
  void isCommitmentIndicatorYes_shouldReturnFalse_whenBothSeedlotAndVeglotAreFalse() {
    Long requestSkey = 789L;
    String itemId = "99";

    when(requestSeedlotRepository.existsCommitmentYes(requestSkey, itemId)).thenReturn(false);
    when(requestVeglotRepository.existsCommitmentYes(requestSkey, itemId)).thenReturn(false);

    boolean result = service.isCommitmentIndicatorYes(requestSkey, itemId);

    assertFalse(result);
    verify(requestSeedlotRepository).existsCommitmentYes(requestSkey, itemId);
    verify(requestVeglotRepository).existsCommitmentYes(requestSkey, itemId);
    verifyNoMoreInteractions(requestSeedlotRepository, requestVeglotRepository);
  }
}
