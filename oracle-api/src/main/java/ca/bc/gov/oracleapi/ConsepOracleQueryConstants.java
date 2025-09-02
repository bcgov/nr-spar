package ca.bc.gov.oracleapi;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Contains constant SQL query definitions used throughout the CONSEP module of the Oracle API.
 * This utility class is non-instantiable and is used as a centralized place
 * to store native SQL queries executed by repositories or services interacting with
 * the Oracle database.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class ConsepOracleQueryConstants {
  public static final String ACTIVITY_SEARCH = """
        SELECT seedlot_display
          , request_item
          , vegetation_st
          , stndrd_activity_id
          , test_rank
          , current_test_ind
          , test_category_cd
          , germination_pct
          , pv
          , moisture_pct
          , purity_pct
          , seeds_per_gram
          , other_test_result
          , test_complete_ind
          , accept_result_ind
          , significnt_sts_ind
          , seed_withdrawal_date
          , revised_end_dt
          , actual_begin_dt_tm
          , actual_end_dt_tm
          , ria_comment
          , request_skey
          , req_id
          , item_id
          , seedlot_sample
          , ria_skey
        FROM consep.cns17
        WHERE (:testType IS NULL OR activity_type_cd = :testType)
          AND (
            :lotNumbersStr IS NULL OR seedlot_display IN (
              SELECT TRIM(REGEXP_SUBSTR(:lotNumbersStr, '[^,]+', 1, LEVEL))
              FROM dual
              CONNECT BY REGEXP_SUBSTR(:lotNumbersStr, '[^,]+', 1, LEVEL) IS NOT NULL
            )
          )
          AND (:activityId IS NULL OR stndrd_activity_id = :activityId)
          AND (:germinatorTrayId IS NULL OR germinator_tray_id = :germinatorTrayId)
          AND (:seedWithdrawalStartDate IS NULL OR seed_withdrawal_date >= :seedWithdrawalStartDate)
          AND (:seedWithdrawalEndDate IS NULL OR seed_withdrawal_date <= :seedWithdrawalEndDate)
          AND (:includeHistoricalTests IS NULL OR :includeHistoricalTests = 1 OR request_skey != 0)
          AND (:germTestsOnly IS NULL OR :germTestsOnly = 0 OR germ_test_ind = -1)
          AND (:requestId IS NULL OR req_id = SUBSTR(:requestId, 1, 11))
          AND (:requestId IS NULL OR LENGTH(:requestId) < 12 OR item_id = SUBSTR(:requestId, 12, 1))
          AND (:requestType IS NULL OR request_type_st = :requestType)
          AND (:requestYear IS NULL OR request_yr = :requestYear)
          AND (:orchardId IS NULL OR orchard_id = :orchardId)
          AND (:testCategoryCd IS NULL OR test_category_cd = :testCategoryCd)
          AND (:testRank IS NULL OR test_rank = :testRank)
          AND (:species IS NULL OR vegetation_st = :species)
          AND (:actualBeginDateFrom IS NULL OR actual_begin_dt_tm >= :actualBeginDateFrom)
          AND (:actualBeginDateTo IS NULL OR actual_begin_dt_tm <= :actualBeginDateTo)
          AND (:actualEndDateFrom IS NULL OR actual_end_dt_tm >= :actualEndDateFrom)
          AND (:actualEndDateTo IS NULL OR actual_end_dt_tm <= :actualEndDateTo)
          AND (:revisedStartDateFrom IS NULL OR revised_end_dt >= :revisedStartDateFrom)
          AND (:revisedStartDateTo IS NULL OR revised_end_dt <= :revisedStartDateTo)
          AND (:revisedEndDateFrom IS NULL OR revised_end_dt >= :revisedEndDateFrom)
          AND (:revisedEndDateTo IS NULL OR revised_end_dt <= :revisedEndDateTo)
          AND (:germTrayAssignment IS NULL OR assigned_tray_ind = :germTrayAssignment)
          AND (:completeStatus IS NULL OR test_complete_ind = :completeStatus)
          AND (:acceptanceStatus IS NULL OR accept_result_ind = :acceptanceStatus)
        ORDER BY seedlot_sample, actual_begin_dt_tm
        OFFSET :offset ROWS FETCH NEXT :size ROWS ONLY
      """;
}


