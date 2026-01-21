package ca.bc.gov.oracleapi.service;

import ca.bc.gov.oracleapi.repository.RequestSeedlotRepository;
import ca.bc.gov.oracleapi.repository.RequestVeglotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

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
  @DisplayName("isCommitmentChecked_shouldReturnTrue_whenSeedlotCommitmentIsY")
  void isCommitmentChecked_shouldReturnTrue_whenSeedlotCommitmentIsY() {
    Long requestSkey = 123L;
    String itemId = "1";

    when(requestSeedlotRepository.getCommitment(requestSkey, itemId)).thenReturn("Y");

    boolean result = service.isCommitmentChecked(requestSkey, itemId);

    assertTrue(result);
    verify(requestSeedlotRepository).getCommitment(requestSkey, itemId);
    verifyNoInteractions(requestVeglotRepository);
  }

  @Test
  @DisplayName("isCommitmentChecked_shouldReturnTrue_whenSeedlotCommitmentIsLowercaseY")
  void isCommitmentChecked_shouldReturnTrue_whenSeedlotCommitmentIsLowercaseY() {
    Long requestSkey = 123L;
    String itemId = "1";

    when(requestSeedlotRepository.getCommitment(requestSkey, itemId)).thenReturn("y");

    boolean result = service.isCommitmentChecked(requestSkey, itemId);

    assertTrue(result);
    verify(requestSeedlotRepository).getCommitment(requestSkey, itemId);
    verifyNoInteractions(requestVeglotRepository);
  }

  @Test
  @DisplayName("isCommitmentChecked_shouldReturnFalse_whenSeedlotCommitmentIsN")
  void isCommitmentChecked_shouldReturnFalse_whenSeedlotCommitmentIsN() {
    Long requestSkey = 123L;
    String itemId = "1";

    when(requestSeedlotRepository.getCommitment(requestSkey, itemId)).thenReturn("N");

    boolean result = service.isCommitmentChecked(requestSkey, itemId);

    assertFalse(result);
    verify(requestSeedlotRepository).getCommitment(requestSkey, itemId);
    verifyNoInteractions(requestVeglotRepository);
  }

  @Test
  @DisplayName("isCommitmentChecked_shouldFallbackToVeglot_whenSeedlotCommitmentIsNull_andReturnTrueIfVeglotIsY")
  void isCommitmentChecked_shouldFallbackToVeglot_whenSeedlotCommitmentIsNull_andReturnTrueIfVeglotIsY() {
    Long requestSkey = 456L;
    String itemId = "88";

    when(requestSeedlotRepository.getCommitment(requestSkey, itemId)).thenReturn(null);
    when(requestVeglotRepository.getCommitment(requestSkey, itemId)).thenReturn("Y");

    boolean result = service.isCommitmentChecked(requestSkey, itemId);

    assertTrue(result);
    verify(requestSeedlotRepository).getCommitment(requestSkey, itemId);
    verify(requestVeglotRepository).getCommitment(requestSkey, itemId);
    verifyNoMoreInteractions(requestSeedlotRepository, requestVeglotRepository);
  }

  @Test
  @DisplayName("isCommitmentChecked_shouldReturnFalse_whenBothSeedlotAndVeglotAreNull")
  void isCommitmentChecked_shouldReturnFalse_whenBothSeedlotAndVeglotAreNull() {
    Long requestSkey = 789L;
    String itemId = "99";

    when(requestSeedlotRepository.getCommitment(requestSkey, itemId)).thenReturn(null);
    when(requestVeglotRepository.getCommitment(requestSkey, itemId)).thenReturn(null);

    boolean result = service.isCommitmentChecked(requestSkey, itemId);

    assertFalse(result);
    verify(requestSeedlotRepository).getCommitment(requestSkey, itemId);
    verify(requestVeglotRepository).getCommitment(requestSkey, itemId);
    verifyNoMoreInteractions(requestSeedlotRepository, requestVeglotRepository);
  }
}
