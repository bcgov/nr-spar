package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.ActivityCreateDto;
import ca.bc.gov.oracleapi.dto.consep.ActivityFormDto;
import ca.bc.gov.oracleapi.dto.consep.ActivitySearchResponseDto;
import ca.bc.gov.oracleapi.dto.consep.AddGermTestValidationResponseDto;
import ca.bc.gov.oracleapi.dto.consep.StandardActivityDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.StandardActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.repository.consep.*;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
  private final TestResultRepository testResultRepository;
  private final StandardActivityRepository standardActivityRepository;
  private final TestRegimeRepository testRegimeRepository;
  private final SparRequestRepository sparRequestRepository;

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
  public ActivitySearchResponseDto createActivity(ActivityCreateDto activityCreateDto) {
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
    if (hasSeedlot == hasFamilyLot) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Exactly one of seedlotNumber or familyLotNumber must be provided"
          + " (provide one, but not both or neither)."
      );
    }

    String standardActivityId = activityCreateDto.standardActivityId();
    String testCategoryCd = activityCreateDto.testCategoryCd();
    StandardActivityEntity standardActivity = standardActivityRepository
        .findById(standardActivityId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "StandardActivityId '" + standardActivityId + "' does not exist."
        ));
    boolean isTestActivity = standardActivity.getTestCategoryCd() != null;
    if (isTestActivity) {
      if (testCategoryCd == null || testCategoryCd.isBlank()) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Test category code is required for the selected test activity."
        );
      }
    } else {
      if (testCategoryCd != null && !testCategoryCd.isBlank()) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "The selected activity is not a test activity; test category code should be null."
        );
      }
    }

    BigDecimal requestSkey = activityCreateDto.requestSkey();
    if (isTestActivity && requestSkey != null) {
      String requestTypeSt = sparRequestRepository.findRequestTypeStByRequestSkey(requestSkey);
      if ("SRQ".equals(requestTypeSt)) { // Seedling request
        if (!"STD".equals(testCategoryCd)) {
          throw new ResponseStatusException(
              HttpStatus.BAD_REQUEST,
              "TEST_CATEGORY_CD must be 'STD' because Request ID is a Seedling Request"
          );
        }
      }
    }

    Integer processResultIndicator;
    Integer testResultIndicator;
    if (testCategoryCd == null) {
      processResultIndicator = -1;
      testResultIndicator = 0;
    } else {
      processResultIndicator = 0;
      testResultIndicator = -1;
    }

    ActivityEntity newActivityEntity = new ActivityEntity();

    // Map fields from dto to entity
    newActivityEntity.setStandardActivityId(activityCreateDto.standardActivityId());
    newActivityEntity.setActivityTypeCode(activityCreateDto.activityTypeCd());
    newActivityEntity.setTestCategoryCode(activityCreateDto.testCategoryCd());
    newActivityEntity.setPlannedStartDate(activityCreateDto.plannedStartDate());
    newActivityEntity.setPlannedEndDate(activityCreateDto.plannedEndDate());
    newActivityEntity.setRevisedStartDate(activityCreateDto.revisedStartDate());
    newActivityEntity.setRevisedEndDate(activityCreateDto.revisedEndDate());
    newActivityEntity.setActivityDuration(activityCreateDto.activityDuration());
    newActivityEntity.setActivityTimeUnit(activityCreateDto.activityTimeUnit());
    newActivityEntity.setSignificantStatusIndicator(activityCreateDto.significantStatusIndicator());
    newActivityEntity.setProcessCommitIndicator(activityCreateDto.processCommitIndicator());
    newActivityEntity.setProcessResultIndicator(processResultIndicator);
    newActivityEntity.setTestResultIndicator(testResultIndicator);
    newActivityEntity.setRequestSkey(activityCreateDto.requestSkey());
    newActivityEntity.setRequestId(activityCreateDto.requestId());
    newActivityEntity.setItemId(activityCreateDto.itemId());
    newActivityEntity.setVegetationState(activityCreateDto.vegetationState());
    newActivityEntity.setSeedlotNumber(activityCreateDto.seedlotNumber());
    newActivityEntity.setFamilyLotNumber(activityCreateDto.familyLotNumber());
    newActivityEntity.setUpdateTimestamp(LocalDateTime.now());

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

    // If adding a test type activity
    if (isTestActivity) {
      TestResultEntity testResult = new TestResultEntity();
      testResult.setRiaKey(savedActivityEntity.getRiaKey());
      testResult.setActivityType(savedActivityEntity.getActivityTypeCode());
      testResult.setTestCategory(savedActivityEntity.getTestCategoryCode());
      testResult.setUpdateTimestamp(LocalDateTime.now());
      testResultRepository.save(testResult);
    }

    return mapActivityEntityToSearchResponseDto(savedActivityEntity);
  }

  /**
   * Retrieves all unique standard activity IDs and descriptions
   * used for seedlot and/or family lot contexts.
   *
   * @param isFamilyLot true for familylot
   * @param isSeedlot true for seedlot
   * @return list of StandardActivityDto
   */
  public List<StandardActivityDto> getStandardActivityIds(boolean isFamilyLot, boolean isSeedlot) {
    List<StandardActivityEntity> activities = new ArrayList<>();
    if (isFamilyLot) {
      activities.addAll(standardActivityRepository.findAllFamilyLotActivities());
    }
    if (isSeedlot) {
      activities.addAll(standardActivityRepository.findAll());
    }
    // If neither, return empty
    if (!isFamilyLot && !isSeedlot) {
      return List.of();
    }

    // Remove duplicates by id
    Map<String, StandardActivityEntity> map = new HashMap<>();
    for (StandardActivityEntity a : activities) {
      map.putIfAbsent(a.getStandardActivityId(), a);
    }
    return map.values().stream()
        .sorted(
            Comparator.comparing(StandardActivityEntity::getActivityDesc,
                Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER))
        )
        .map(a -> new StandardActivityDto(
            a.getStandardActivityId(),
            a.getActivityDesc(),
            a.getActivityTypeCd(),
            a.getTestCategoryCd(),
            a.getSignificantStatusIndicator(),
            a.getActivityDuration(),
            a.getActivityTimeUnit()
        ))
        .toList();
  }

  /**
   * Validates whether the given activity type code represents a germ test
   * and whether it matches the current accepted A-rank germ test for the specified seedlot or family lot.
   *
   * @param activityTypeCode the activity type code to validate
   * @param seedlotNumber the seedlot number to check against
   * @param familyLotNumber the family lot number to check against
   * @return an AddGermTestValidationResponseDto containing:
   *         - {@code germTest}: whether the activity type is a germ test
   *         - {@code matchesCurrentTypeCode}: whether it matches the current A-rank germ test
   *         - {@code currentTypeCode}: the current accepted A-rank type code if it does not match, {@code null} otherwise
   * @throws ResponseStatusException with {@code HttpStatus.CONFLICT} if multiple accepted A-rank germ tests exist
   */
  public AddGermTestValidationResponseDto validateAddGermTest(
      String activityTypeCode,
      String seedlotNumber,
      String familyLotNumber
  ) {
    boolean hasSeedlot = seedlotNumber != null && !seedlotNumber.isBlank();
    boolean hasFamilyLot = familyLotNumber != null && !familyLotNumber.isBlank();
    if (hasSeedlot == hasFamilyLot) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Exactly one of seedlotNumber or familyLotNumber must be provided"
      );
    }

    List<String> germTestCodes =
        testRegimeRepository.findAllGermTestActivityTypeCodes();
    boolean isGermTest = germTestCodes.contains(activityTypeCode);
    if (!isGermTest) {
      return new AddGermTestValidationResponseDto(
          false,
          true,
          null
      );
    }

    // Find current accepted A-rank germ test for the seedlot/family lot
    List<String> currentAcceptedCodes =
        activityRepository.findTypeCodeForAcceptedGermTestRankA(
            seedlotNumber,
            familyLotNumber
        );
    if (currentAcceptedCodes.size() > 1) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "Multiple accepted A-rank germ tests exist for this seedlot/family lot"
      );
    }
    if (currentAcceptedCodes.isEmpty()) {
      return new AddGermTestValidationResponseDto(
          true,
          true,
          null
      );
    }
    String currentTypeCode = currentAcceptedCodes.get(0);
    boolean matches = activityTypeCode.equals(currentTypeCode);
    return new AddGermTestValidationResponseDto(
        true,
        matches,
        currentTypeCode
    );
  }

  /**
   * Maps an {@link ActivityEntity} to an {@link ActivitySearchResponseDto} for use
   * in activity search results and table displays.
   *
   * @param e the persisted {@link ActivityEntity} to map
   * @return a populated {@link ActivitySearchResponseDto} suitable for search result displays
   */
  public static ActivitySearchResponseDto mapActivityEntityToSearchResponseDto(ActivityEntity e) {
    return new ActivitySearchResponseDto(
        e.getSeedlotNumber() != null ? e.getSeedlotNumber() : e.getFamilyLotNumber(),
        e.getRequestId() + "-" + e.getItemId(),
        e.getVegetationState(),
        e.getStandardActivityId(),
        null,
        null,
        e.getTestCategoryCode(),
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        e.getSignificantStatusIndicator(),
        null,
        e.getRevisedEndDate() != null ? e.getRevisedEndDate().atStartOfDay() : null,
        null,
        null,
        null,
        e.getRequestSkey() != null ? e.getRequestSkey().intValue() : null,
        e.getRequestId(),
        e.getItemId(),
        null,
        e.getRiaKey().intValue(),
        e.getActivityTypeCode()
    );
  }
}
