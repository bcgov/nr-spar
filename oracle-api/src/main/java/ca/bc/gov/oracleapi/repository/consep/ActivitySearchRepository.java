package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.ConsepOracleQueryConstants;
import ca.bc.gov.oracleapi.entity.consep.ActivitySearchResultEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;


public interface ActivitySearchRepository extends JpaRepository<ActivitySearchResultEntity, Integer> {
  @Query(value = ConsepOracleQueryConstants.ACTIVITY_SEARCH, nativeQuery = true)
  List<ActivitySearchResultEntity> searchActivities(
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
    @Param("actualBeginDateFrom") LocalDate actualBeginDateFrom,
    @Param("actualBeginDateTo") LocalDate actualBeginDateTo,
    @Param("actualEndDateFrom") LocalDate actualEndDateFrom,
    @Param("actualEndDateTo") LocalDate actualEndDateTo,
    @Param("revisedStartDateFrom") LocalDate revisedStartDateFrom,
    @Param("revisedStartDateTo") LocalDate revisedStartDateTo,
    @Param("revisedEndDateFrom") LocalDate revisedEndDateFrom,
    @Param("revisedEndDateTo") LocalDate revisedEndDateTo,
    @Param("germTrayAssignment") Integer germTrayAssignment,
    @Param("completeStatus") Integer completeStatus,
    @Param("acceptanceStatus") Integer acceptanceStatus,
    @Param("seedlotClass") String seedlotClass,
    @Param("offset") long offset,
    @Param("size") long size
  );
}
