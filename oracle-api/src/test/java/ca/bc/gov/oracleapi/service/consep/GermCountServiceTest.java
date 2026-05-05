package ca.bc.gov.oracleapi.service.consep;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.dto.consep.GermCountDto;
import ca.bc.gov.oracleapi.entity.consep.GermCountEntity;
import ca.bc.gov.oracleapi.repository.consep.GermCountRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class GermCountServiceTest {

  @Mock
  private GermCountRepository germCountRepository;

  @InjectMocks
  private GermCountService germCountService;

  /*---------------------- getGermCounts ---------------------------------*/

  @Test
  void getGermCounts_shouldReturnMappedDto_whenEntityFound() {
    BigDecimal riaSkey = new BigDecimal("881191");

    GermCountEntity entity = new GermCountEntity();
    entity.setRiaSkey(riaSkey);

    // Slot 1 — populated
    entity.setDailyGermSkey1(new BigDecimal("1001"));
    entity.setCountDt1(LocalDate.of(2026, 4, 1));
    entity.setDayNoOfTest1(1);
    entity.setRep1NoSeedsGerm1(10);
    entity.setRep2NoSeedsGerm1(12);
    entity.setRep3NoSeedsGerm1(11);
    entity.setRep4NoSeedsGerm1(9);
    entity.setCumulativeGerm1(new BigDecimal("0.4200"));

    // Slot 2 — populated
    entity.setDailyGermSkey2(new BigDecimal("1002"));
    entity.setCountDt2(LocalDate.of(2026, 4, 2));
    entity.setDayNoOfTest2(2);
    entity.setRep1NoSeedsGerm2(14);
    entity.setRep2NoSeedsGerm2(15);
    entity.setRep3NoSeedsGerm2(13);
    entity.setRep4NoSeedsGerm2(16);
    entity.setCumulativeGerm2(new BigDecimal("0.5800"));

    // Slots 3–13 left null (sparse data is normal)

    // Audit fields
    entity.setEntryUserid("USER1");
    entity.setEntryTimestamp(LocalDateTime.of(2026, 1, 10, 9, 0));
    entity.setUpdateUserid("USER2");
    entity.setUpdateTimestamp(LocalDateTime.of(2026, 4, 5, 14, 30));

    when(germCountRepository.findById(riaSkey)).thenReturn(Optional.of(entity));

    GermCountDto dto = germCountService.getGermCounts(riaSkey);

    assertNotNull(dto);
    assertEquals(riaSkey, dto.riaSkey());

    assertEquals(new BigDecimal("1001"), dto.dailyGermSkey1());
    assertEquals(LocalDate.of(2026, 4, 1), dto.countDt1());
    assertEquals(1, dto.dayNoOfTest1());
    assertEquals(10, dto.rep1NoSeedsGerm1());
    assertEquals(12, dto.rep2NoSeedsGerm1());
    assertEquals(11, dto.rep3NoSeedsGerm1());
    assertEquals(9, dto.rep4NoSeedsGerm1());
    assertEquals(new BigDecimal("0.4200"), dto.cumulativeGerm1());

    assertEquals(new BigDecimal("1002"), dto.dailyGermSkey2());
    assertEquals(LocalDate.of(2026, 4, 2), dto.countDt2());
    assertEquals(2, dto.dayNoOfTest2());
    assertEquals(14, dto.rep1NoSeedsGerm2());
    assertEquals(15, dto.rep2NoSeedsGerm2());
    assertEquals(13, dto.rep3NoSeedsGerm2());
    assertEquals(16, dto.rep4NoSeedsGerm2());
    assertEquals(new BigDecimal("0.5800"), dto.cumulativeGerm2());

    // Remaining slots should be null
    assertNull(dto.dailyGermSkey3());
    assertNull(dto.countDt3());
    assertNull(dto.dailyGermSkey13());

    // Audit fields
    assertEquals("USER1", dto.entryUserid());
    assertEquals(LocalDateTime.of(2026, 1, 10, 9, 0), dto.entryTimestamp());
    assertEquals("USER2", dto.updateUserid());
    assertEquals(LocalDateTime.of(2026, 4, 5, 14, 30), dto.updateTimestamp());

    verify(germCountRepository).findById(riaSkey);
  }

  @Test
  void getGermCounts_shouldReturnDto_whenAllSlotsAreNull() {
    BigDecimal riaSkey = new BigDecimal("100001");

    GermCountEntity entity = new GermCountEntity();
    entity.setRiaSkey(riaSkey);

    when(germCountRepository.findById(riaSkey)).thenReturn(Optional.of(entity));

    GermCountDto dto = germCountService.getGermCounts(riaSkey);

    assertNotNull(dto);
    assertEquals(riaSkey, dto.riaSkey());
    assertNull(dto.dailyGermSkey1());
    assertNull(dto.countDt1());
    assertNull(dto.cumulativeGerm1());
    assertNull(dto.dailyGermSkey13());
    assertNull(dto.entryUserid());
    assertNull(dto.updateTimestamp());

    verify(germCountRepository).findById(riaSkey);
  }

  @Test
  void getGermCounts_shouldThrowNotFound_whenEntityDoesNotExist() {
    BigDecimal riaSkey = new BigDecimal("999999");

    when(germCountRepository.findById(riaSkey)).thenReturn(Optional.empty());

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> germCountService.getGermCounts(riaSkey));

    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    assertEquals("No germ count data found for RIA_SKEY: " + riaSkey, ex.getReason());

    verify(germCountRepository).findById(riaSkey);
  }

  @Test
  void getGermCounts_shouldThrowBadRequest_whenRiaSkeyIsNull() {
    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> germCountService.getGermCounts(null));

    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals("RIA_SKEY cannot be null", ex.getReason());

    verify(germCountRepository, never()).findById(null);
  }
}
