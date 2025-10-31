package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.ConsepOracleQueryConstants;
import ca.bc.gov.oracleapi.entity.consep.ActivitySearchResultEntity;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * This interface enables the activity search result entity
 * from consep to be searched in the database.
 */
public interface ActivitySearchRepository extends
    JpaRepository<ActivitySearchResultEntity, Integer> {

  @Query(value = ConsepOracleQueryConstants.TESTING_ACTIVITY_SEARCH)
  Page<ActivitySearchResultEntity> searchTestingActivities(
      @Param("lotNumbers") List<String> lotNumbers,
      @Param("testType") String testType,
      @Param("activityId") String activityId,
      @Param("germinatorTrayId") Integer germinatorTrayId,
      @Param("seedWithdrawalStartDate") LocalDate seedWithdrawalStartDate,
      @Param("seedWithdrawalEndDate") LocalDate seedWithdrawalEndDate,
      @Param("includeHistoricalTests") Boolean includeHistoricalTests,
      @Param("germTestsOnly") Boolean germTestsOnly,
      @Param("requestId") String requestId,
      @Param("requestType") String requestType,
      @Param("requestYear") Integer requestYear,
      @Param("orchardId") String orchardId,
      @Param("testCategoryCd") String testCategoryCd,
      @Param("testRank") String testRank,
      @Param("species") String species,
      @Param("actualBeginDateFrom") LocalDateTime actualBeginDateFrom,
      @Param("actualBeginDateTo") LocalDateTime actualBeginDateTo,
      @Param("actualEndDateFrom") LocalDateTime actualEndDateFrom,
      @Param("actualEndDateTo") LocalDateTime actualEndDateTo,
      @Param("revisedStartDateFrom") LocalDate revisedStartDateFrom,
      @Param("revisedStartDateTo") LocalDate revisedStartDateTo,
      @Param("revisedEndDateFrom") LocalDate revisedEndDateFrom,
      @Param("revisedEndDateTo") LocalDate revisedEndDateTo,
      @Param("germTrayAssignment") Integer germTrayAssignment,
      @Param("completeStatus") Integer completeStatus,
      @Param("acceptanceStatus") Integer acceptanceStatus,
      @Param("geneticClassCode") String geneticClassCode,
      Pageable pageable
  );
}
