package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.ActivityCreateDto;
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
  public void validateActivityData(ActivityEntity activityData) {
    SparLog.info("Validating activity data");

    if (activityData.getTestCategoryCode() == null) {
      SparLog.error("Activity data validation failed: Test category code is missing");
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Test category code is missing");
    }

    if (activityData.getActualBeginDateTime() == null
        || activityData.getActualBeginDateTime().compareTo(LocalDateTime.now()) > 0) {
      SparLog.error("Activity data validation failed: "
          + "Actual begin date time is missing or in the future");
      throw new ResponseStatusException(
        HttpStatus.BAD_REQUEST,
        "Actual begin date time is missing or in the future");
    }

    if (activityData.getActualEndDateTime() == null
        || activityData.getActualEndDateTime().compareTo(LocalDateTime.now()) > 0) {
      SparLog.error("Activity data validation failed: "
          + "Actual end date time is missing or in the future");
      throw new ResponseStatusException(
        HttpStatus.BAD_REQUEST,
        "Actual end date time is missing or in the future");
    }
  }

  /**
   * Creates a new ActivityEntity from ActivityCreateDto and saves it to the database.
   *
   * @param activityCreateDto The DTO containing activity data to be created.
   * @return The saved ActivityEntity.
   */
  @Transactional
  public ActivityEntity createActivity(ActivityCreateDto activityCreateDto) {
    SparLog.info("Create a new activity");

    if (activityCreateDto.plannedStartDate().isAfter(activityCreateDto.plannedEndDate())) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Planned start date must be before planned end date."
      );
    }

    boolean hasSeedlot = activityCreateDto.seedlotNumber() != null
        && !activityCreateDto.seedlotNumber().isBlank();
    boolean hasFamilyLot = activityCreateDto.familyLotNumber() != null
        && !activityCreateDto.familyLotNumber().isBlank();
    if (!(hasSeedlot || hasFamilyLot)) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Either seedlotNumber or familyLotNumber must be provided."
      );
    }

    String requestId = activityCreateDto.requestId();
    String testCategoryCd = activityCreateDto.testCategoryCd();

    if (requestId != null && requestId.length() >= 4) {
      String first4 = requestId.substring(0, 4);
      if (first4.chars().allMatch(Character::isDigit)) { // Seedling request
        if (!"STD".equals(testCategoryCd)) {
          throw new ResponseStatusException(
              HttpStatus.BAD_REQUEST,
              "TEST_CATEGORY_CD must be 'STD' because Request ID is a Seedling Request"
          );
        }
      }
    }

    ActivityEntity newActivityEntity = new ActivityEntity();

    // Map fields from dto to entity
    newActivityEntity.setRiaKey(activityCreateDto.riaKey());
    newActivityEntity.setStandardActivityId(activityCreateDto.standardActivityId());
    newActivityEntity.setActivityTypeCode(activityCreateDto.activityTypeCd());
    newActivityEntity.setTestCategoryCode(activityCreateDto.testCategoryCd());
    newActivityEntity.setAssociatedRiaKey(activityCreateDto.associatedRiaKey());
    newActivityEntity.setPlannedStartDate(activityCreateDto.plannedStartDate());
    newActivityEntity.setPlannedEndDate(activityCreateDto.plannedEndDate());
    newActivityEntity.setRevisedStartDate(activityCreateDto.revisedStartDate());
    newActivityEntity.setRevisedEndDate(activityCreateDto.revisedEndDate());
    newActivityEntity.setActivityDuration(activityCreateDto.activityDuration());
    newActivityEntity.setActivityTimeUnit(activityCreateDto.activityTimeUnit());
    newActivityEntity.setSignificantStatusIndicator(activityCreateDto.significantStatusIndicator());
    newActivityEntity.setProcessCommitIndicator(activityCreateDto.processCommitIndicator());
    newActivityEntity.setProcessResultIndicator(activityCreateDto.processResultIndicator());
    newActivityEntity.setTestResultIndicator(activityCreateDto.testResultIndicator());
    newActivityEntity.setRequestSkey(activityCreateDto.requestSkey());
    newActivityEntity.setRequestId(activityCreateDto.requestId());
    newActivityEntity.setItemId(activityCreateDto.itemId());
    newActivityEntity.setVegetationState(activityCreateDto.vegetationState());
    newActivityEntity.setSeedlotNumber(activityCreateDto.seedlotNumber());
    newActivityEntity.setFamilyLotNumber(activityCreateDto.familyLotNumber());

    ActivityEntity savedActivityEntity = activityRepository.save(newActivityEntity);
    SparLog.info("Activity with riaKey: {} saved successfully.", savedActivityEntity.getRiaKey());

    // If processCommitIndicator == -1, clear that flag for others in the same request/item
    if (activityCreateDto.processCommitIndicator() != null
        && activityCreateDto.processCommitIndicator() == -1
    ) {
      activityRepository.clearExistingProcessCommitment(
          savedActivityEntity.getRequestSkey(),
          savedActivityEntity.getItemId(),
          savedActivityEntity.getRiaKey()
      );
      SparLog.info("Process commitment of activity with riaKey: {} were updated successfully.",
          savedActivityEntity.getRiaKey());
    }

    return savedActivityEntity;
  }
}
