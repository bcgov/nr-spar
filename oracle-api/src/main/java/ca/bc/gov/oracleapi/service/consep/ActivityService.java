package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.ActivityFormDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** The class for Activity Service. */
@Service
@RequiredArgsConstructor
public class ActivityService {

  private final ActivityRepository activityRepository;

  /**
   * Update activity table.
   *
   * @param riaKey the identifier key
   * @param activityFormDto an object with the values to be updated
   */
  @Transactional
  public ActivityEntity updateActivityField(
      @NonNull BigDecimal riaKey,
      @NonNull ActivityFormDto activityFormDto
  ) {
    SparLog.info("Updating activity with riaKey: {}", riaKey);

    ActivityEntity activity = activityRepository.findById(riaKey)
        .orElseGet(() -> {
          SparLog.info("No existing activity found for riaKey: {}. Creating a new one.", riaKey);
          ActivityEntity newActivity = new ActivityEntity();
          newActivity.setRiaKey(riaKey);
          return newActivity;
        });

    activity.setActualBeginDateTime(activityFormDto.actualBeginDateTime());
    activity.setActualEndDateTime(activityFormDto.actualEndDateTime());
    activity.setTestCategoryCode(activityFormDto.testCategoryCode());
    activity.setRiaComment(activityFormDto.riaComment());

    ActivityEntity savedActivity = activityRepository.save(activity);

    SparLog.info("Activity with riaKey: {} saved successfully.", riaKey);

    return savedActivity;
  }

  /**
   * This function validates Activity part of the data to be submitted for testing activities.
   * Throws exception if validation fails.
   *
   * @param activityData activity entity to be validated
   * @throws ResponseStatusException if any validation fails
   */
  public void validateMoistureContentActivityData(ActivityEntity activityData) {
    SparLog.info("Validating activity data");

    if (activityData.getTestCategoryCode() == null) {
      SparLog.error("Activity data validation failed: Test category code is missing");
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Test category code is missing");
    }
    if (activityData.getActualBeginDateTime() == null
        || activityData.getActualBeginDateTime().compareTo(LocalDateTime.now()) < 0) {
      SparLog.error("Activity data validation failed: "
          + "Actual begin date time is missing or in the past");
      throw new ResponseStatusException(
        HttpStatus.BAD_REQUEST,
        "Actual begin date time is missing or in the past");
    }
    if (activityData.getActualEndDateTime() == null
        || activityData.getActualEndDateTime().compareTo(LocalDateTime.now()) < 0) {
      SparLog.error("Activity data validation failed: "
          + "Actual end date time is missing or in the past");
      throw new ResponseStatusException(
        HttpStatus.BAD_REQUEST,
        "Actual end date time is missing or in the past");
    }
  }
}
