package ca.bc.gov.oracleapi;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Contains constant JPQL query definitions used throughout the CONSEP module.
 * This utility class is non-instantiable and serves as a centralized place
 * to store JPQL queries executed by repositories or services interacting
 * with the CONSEP persistence layer.
 * Keeping queries here ensures they are easy to maintain, reuse, and keep
 * repository interfaces clean.
 */

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class ConsepOracleQueryConstants {
  public static final String TESTING_ACTIVITY_SEARCH = """
    SELECT a
    FROM ActivitySearchResultEntity a
    WHERE (:testType IS NULL OR a.activityTypeCd = :testType)
      AND (:activityId IS NULL OR a.activityId = :activityId)
      AND (:lotNumbers IS NULL OR a.seedlotDisplay IN :lotNumbers)
      AND (:seedWithdrawalStartDate IS NULL OR a.seedWithdrawalDate >= :seedWithdrawalStartDate)
      AND (:seedWithdrawalEndDate IS NULL OR a.seedWithdrawalDate <= :seedWithdrawalEndDate)
      AND (:includeHistoricalTests IS NULL OR :includeHistoricalTests = true OR a.requestSkey != 0)
      AND (:germTestsOnly IS NULL OR :germTestsOnly = false OR a.germTestInd = -1)
      AND (:requestId IS NULL OR a.reqId = SUBSTRING(:requestId, 1, 11))
      AND (:requestId IS NULL OR LENGTH(:requestId) < 12 OR a.itemId = SUBSTRING(:requestId, 12, 1))
      AND (:requestType IS NULL OR a.requestTypeSt = :requestType)
      AND (:requestYear IS NULL OR a.requestYr = :requestYear)
      AND (:orchardId IS NULL OR a.orchardId = :orchardId)
      AND (:testCategoryCd IS NULL OR a.testCategoryCd = :testCategoryCd)
      AND (:testRank IS NULL OR a.testRank = :testRank)
      AND (:species IS NULL OR a.species = :species)
      AND (:actualBeginDateFrom IS NULL OR a.actualBeginDtTm >= :actualBeginDateFrom)
      AND (:actualBeginDateTo IS NULL OR a.actualBeginDtTm <= :actualBeginDateTo)
      AND (:actualEndDateFrom IS NULL OR a.actualEndDtTm >= :actualEndDateFrom)
      AND (:actualEndDateTo IS NULL OR a.actualEndDtTm <= :actualEndDateTo)
      AND (:revisedStartDateFrom IS NULL OR a.revisedStartDt >= :revisedStartDateFrom)
      AND (:revisedStartDateTo IS NULL OR a.revisedStartDt <= :revisedStartDateTo)
      AND (:revisedEndDateFrom IS NULL OR a.revisedEndDt >= :revisedEndDateFrom)
      AND (:revisedEndDateTo IS NULL OR a.revisedEndDt <= :revisedEndDateTo)
      AND (:germTrayAssignment IS NULL OR a.assignedTrayId = :germTrayAssignment)
      AND (:completeStatus IS NULL OR a.testCompleteInd = :completeStatus)
      AND (:acceptanceStatus IS NULL OR a.acceptResultInd = :acceptanceStatus)
    ORDER BY a.seedlotSample, a.actualBeginDtTm
    """;
}


