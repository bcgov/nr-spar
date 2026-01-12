package ca.bc.gov.oracleapi.service.consep;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;


import ca.bc.gov.oracleapi.dto.consep.ActivityCreateDto;
import ca.bc.gov.oracleapi.dto.consep.ActivityFormDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * The test class for Moisture Content Service.
 */
@ExtendWith(MockitoExtension.class)
class ActivityServiceTest {

  @Mock
  private ActivityRepository activityRepository;

  @Autowired
  @InjectMocks
  private ActivityService activityService;

  private BigDecimal riaKey;
  private ActivityEntity activityEntity;
  private ActivityCreateDto validActivityCreateDto;

  @BeforeEach
  void setUp() {
    riaKey = new BigDecimal("123");

    activityEntity = new ActivityEntity();
    activityEntity.setTestCategoryCode("TEST");
    activityEntity.setActualBeginDateTime(LocalDateTime.now().minusDays(1));
    activityEntity.setActualEndDateTime(LocalDateTime.now().minusDays(2));
    activityEntity.setRiaComment("Test comment");

    validActivityCreateDto = new ActivityCreateDto(
        new BigDecimal("408623"),
        "ST1",
        "AC1",
        "TC1",
        new BigDecimal("33874"),
        LocalDate.of(2024, 1, 1),
        LocalDate.of(2024, 1, 2),
        null,
        null,
        1,
        "HR",
        1,
        null,
        1,
        1,
        new BigDecimal("33874"),
        "CSP19970005",
        "A",
        "PLI",
        "00098",
        ""
    );
  }

  @Test
  @DisplayName("Update activity should succeed")
  void updateActivity_shouldSucceed() {
    ActivityEntity existingEntity = new ActivityEntity();
    existingEntity.setRiaKey(riaKey);
    existingEntity.setActualBeginDateTime(LocalDateTime.parse("2013-10-01T00:00:00"));
    existingEntity.setActualEndDateTime(LocalDateTime.parse("2013-11-01T00:00:00"));
    existingEntity.setTestCategoryCode("OLD");
    existingEntity.setRiaComment("Old comment");

    when(activityRepository.findById(riaKey)).thenReturn(Optional.of(existingEntity));
    when(activityRepository.save(any(ActivityEntity.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    ActivityFormDto activityDto = new ActivityFormDto(
        "STD",
        LocalDateTime.parse("2013-08-01T00:00:00"),
        LocalDateTime.parse("2013-09-01T00:00:00"),
        "Updated comment"
    );

    ActivityEntity result = activityService.updateActivityField(riaKey, activityDto);

    assertEquals(activityDto.actualBeginDateTime(), result.getActualBeginDateTime());
    assertEquals(activityDto.actualEndDateTime(), result.getActualEndDateTime());
    assertEquals(activityDto.testCategoryCode(), result.getTestCategoryCode());
    assertEquals(activityDto.riaComment(), result.getRiaComment());

    verify(activityRepository, times(1)).findById(riaKey);
    verify(activityRepository, times(1)).save(any(ActivityEntity.class));
  }

  @Test
  void validateActivityData_validData() {
    assertDoesNotThrow(() ->
        activityService.validateActivityData(activityEntity));
  }

  @Test
  void validateActivityData_missingTestCategory() {
    activityEntity.setTestCategoryCode(null);
    assertThrows(ResponseStatusException.class, () ->
        activityService.validateActivityData(activityEntity));
  }

  @Test
  void validateActivityData_pastBeginDate() {
    activityEntity.setActualBeginDateTime(LocalDateTime.now().plusDays(1));
    assertThrows(ResponseStatusException.class, () ->
        activityService.validateActivityData(activityEntity));
  }

  @Test
  void createActivity_shouldSucceed_whenValidData() {
    when(activityRepository.save(any(ActivityEntity.class))).thenAnswer(i -> i.getArgument(0));

    ActivityEntity createdActivityEntity = activityService.createActivity(validActivityCreateDto);

    assertEquals(validActivityCreateDto.riaKey(), createdActivityEntity.getRiaKey());
    assertEquals(validActivityCreateDto.seedlotNumber(), createdActivityEntity.getSeedlotNumber());
    assertEquals(validActivityCreateDto.requestSkey(), createdActivityEntity.getRequestSkey());
    assertEquals(validActivityCreateDto.itemId(), createdActivityEntity.getItemId());
    verify(activityRepository, times(1)).save(any(ActivityEntity.class));
  }

  @Test
  void createActivity_shouldFail_whenStartDateNotBeforeEndDate() {
    ActivityCreateDto invalidDto = new ActivityCreateDto(
        new BigDecimal("408623"),
        "ST1",
        "AC1",
        "TC1",
        new BigDecimal("33874"),
        LocalDate.of(2024, 1, 10),
        LocalDate.of(2024, 1, 2),
        null,
        null,
        1,
        "HR",
        1,
        null,
        1,
        1,
        new BigDecimal("33874"),
        "CSP19970005",
        "A",
        "PLI",
        "00098",
        "");

    ResponseStatusException ex = assertThrows(
        ResponseStatusException.class, () -> activityService.createActivity(invalidDto)
    );
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals("Planned start date must be before planned end date.", ex.getReason());
  }

  @Test
  void createActivity_shouldFail_whenNoSeedlotOrFamilyLot() {
    ActivityCreateDto invalidDto = new ActivityCreateDto(
        new BigDecimal("408623"),
        "ST1",
        "AC1",
        "TC1",
        new BigDecimal("33874"),
        LocalDate.of(2024, 1, 1),
        LocalDate.of(2024, 1, 2),
        null,
        null,
        1,
        "HR",
        1,
        null,
        1,
        1,
        new BigDecimal("33874"),
        "CSP19970005",
        "A",
        "PLI",
        "",
        ""
    );

    ResponseStatusException ex = assertThrows(
        ResponseStatusException.class, () -> activityService.createActivity(invalidDto)
    );
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals("Either seedlotNumber or familyLotNumber must be provided.", ex.getReason());
  }
}
