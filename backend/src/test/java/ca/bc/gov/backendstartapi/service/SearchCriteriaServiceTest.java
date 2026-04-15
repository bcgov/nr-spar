package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.entity.SearchCriteriaEntity;
import ca.bc.gov.backendstartapi.repository.SearchCriteriaRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.PlatformTransactionManager;

@ExtendWith(MockitoExtension.class)
class SearchCriteriaServiceTest {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  @Mock
  private SearchCriteriaRepository searchCriteriaRepository;
  @Mock
  private LoggedUserService loggedUserService;
  @Mock
  private PlatformTransactionManager transactionManager;

  @InjectMocks
  private SearchCriteriaService searchCriteriaService;

  @Test
  @DisplayName("setCriteria update path uses repository bulk update")
  void setCriteriaUpdateFirst() throws Exception {
    when(loggedUserService.getLoggedUserId()).thenReturn("user1");
    JsonNode node = MAPPER.readTree("{\"a\":1}");
    when(searchCriteriaRepository.updateCriteriaJsonByUserIdAndPageId(
        eq("user1"), eq("PAGE"), eq(node), any()))
        .thenReturn(1);
    SearchCriteriaEntity persisted = new SearchCriteriaEntity("user1", "PAGE", MAPPER.readTree("{\"a\":2}"));
    when(searchCriteriaRepository.findByUserIdAndPageId("user1", "PAGE"))
        .thenReturn(Optional.of(persisted));

    SearchCriteriaEntity result = searchCriteriaService.setCriteria("PAGE", node);

    verify(searchCriteriaRepository).updateCriteriaJsonByUserIdAndPageId(
        eq("user1"), eq("PAGE"), eq(node), any());
    verify(searchCriteriaRepository, never()).saveAndFlush(any());
    assertSame(persisted, result);
  }

  @Test
  @DisplayName("setCriteria calls saveAndFlush when bulk update affects 0 rows (no existing row)")
  void setCriteriaInsertWhenNoExistingRow() throws Exception {
    when(loggedUserService.getLoggedUserId()).thenReturn("user1");
    JsonNode node = MAPPER.readTree("{\"a\":1}");
    when(searchCriteriaRepository.updateCriteriaJsonByUserIdAndPageId(
            eq("user1"), eq("NEW_PAGE"), eq(node), any()))
        .thenReturn(0);
    SearchCriteriaEntity inserted = new SearchCriteriaEntity("user1", "NEW_PAGE", node);
    when(searchCriteriaRepository.saveAndFlush(any(SearchCriteriaEntity.class)))
        .thenReturn(inserted);

    SearchCriteriaEntity result = searchCriteriaService.setCriteria("NEW_PAGE", node);

    verify(searchCriteriaRepository).saveAndFlush(any(SearchCriteriaEntity.class));
    verify(searchCriteriaRepository, times(1))
        .updateCriteriaJsonByUserIdAndPageId(eq("user1"), eq("NEW_PAGE"), eq(node), any());
    assertSame(inserted, result);
  }

  @Test
  @DisplayName("setCriteria retries bulk update after concurrent-insert PK violation")
  void setCriteriaRetryAfterConcurrentInsert() throws Exception {
    when(loggedUserService.getLoggedUserId()).thenReturn("user1");
    JsonNode node = MAPPER.readTree("{\"x\":1}");
    when(searchCriteriaRepository.updateCriteriaJsonByUserIdAndPageId(
            eq("user1"), eq("RACE_PAGE"), eq(node), any()))
        .thenReturn(0);
    when(searchCriteriaRepository.saveAndFlush(any(SearchCriteriaEntity.class)))
        .thenThrow(new DataIntegrityViolationException("pk"));
    SearchCriteriaEntity afterRetry =
        new SearchCriteriaEntity("user1", "RACE_PAGE", MAPPER.readTree("{\"x\":9}"));
    when(searchCriteriaRepository.findByUserIdAndPageId("user1", "RACE_PAGE"))
        .thenReturn(Optional.of(afterRetry));

    SearchCriteriaEntity result = searchCriteriaService.setCriteria("RACE_PAGE", node);

    verify(searchCriteriaRepository).saveAndFlush(any(SearchCriteriaEntity.class));
    verify(searchCriteriaRepository, times(2))
        .updateCriteriaJsonByUserIdAndPageId(eq("user1"), eq("RACE_PAGE"), eq(node), any());
    assertSame(afterRetry, result);
  }
}
