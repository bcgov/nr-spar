SELECT
 soq.seedlot_number
, soq.owner_client_number      client_number
, soq.owner_locn_code          client_locn_code
, soq.original_pct_owned
, soq.original_pct_rsrvd
, soq.original_pct_srpls
, 0 qty_reserved
, 0 qty_rsrvd_cmtd_pln
, 0 qty_rsrvd_cmtd_apr
, 0 qty_surplus
, 0 qty_srpls_cmtd_pln
, 0 qty_srpls_cmtd_apr
, soq.method_of_payment_code
, soq.spar_fund_srce_code
, soq.revision_count
 FROM spar.seedlot_owner_quantity soq
 JOIN spar.seedlot s
   ON s.seedlot_number = soq.seedlot_number
WHERE soq.seedlot_number = %(p_seedlot_number)s
  AND s.seedlot_status_code != 'PND'
UNION ALL
SELECT drft.seedlot_number
     , CASE WHEN ownerdata->'ownerAgency'->>'isInvalid' = 'false'
             AND ownerdata->'ownerCode'->>'isInvalid' = 'false'
            THEN ownerdata->'ownerAgency'->>'value'
            ELSE NULL
       END AS client_number
     , CASE WHEN ownerdata->'ownerAgency'->>'isInvalid' = 'false'
             AND ownerdata->'ownerCode'->>'isInvalid' = 'false'
            THEN ownerdata->'ownerCode'->>'value'
            ELSE NULL
       END AS client_locn_code
     , CAST(CASE WHEN ownerdata->'ownerPortion'->>'isInvalid' = 'false'
                 THEN ownerdata->'ownerPortion'->>'value'
                 ELSE NULL
             End AS NUMERIC)       as original_pct_owned
     , CAST(CASE WHEN ownerdata->'reservedPerc'->>'isInvalid' = 'false'
                 THEN ownerdata->'reservedPerc'->>'value'
                 ELSE NULL
                  END AS NUMERIC)  as original_pct_rsrvd
     , CAST(CASE WHEN ownerdata->'surplusPerc'->>'isInvalid' = 'false'
                 Then ownerdata->'surplusPerc'->>'value'
                 ELSE NULL
                  END AS NUMERIC)  as original_pct_srpls
     , 0 qty_reserved
     , 0 qty_rsrvd_cmtd_pln
     , 0 qty_rsrvd_cmtd_apr
     , 0 qty_surplus
     , 0 qty_srpls_cmtd_pln
     , 0 qty_srpls_cmtd_apr
     , CAST(NULL AS VARCHAR) AS method_of_payment_code
     , CASE WHEN ownerdata->'fundingSource'->>'isInvalid' = 'false'
            THEN ownerdata->'fundingSource'->'value'->>'code'
            ELSE NULL
       END AS spar_fund_srce_code
     , drft.revision_count
  FROM spar.seedlot_registration_a_class_save drft
  LEFT JOIN spar.seedlot s ON drft.seedlot_number = s.seedlot_number
  , json_array_elements(cast(all_step_data->'ownershipStep' as json)) ownerdata
 WHERE drft.seedlot_number = %(p_seedlot_number)s
   AND s.seedlot_status_code = 'PND'
   AND NOT(drft.all_step_data @? '$.ownershipStep[*].*.isInvalid ? (@ == true)')
   AND ownerdata->'ownerAgency'->>'value' != ''
   AND ownerdata->'ownerCode'->>'value' != ''
   AND ownerdata->'ownerPortion'->>'value' != ''
   AND ownerdata->'reservedPerc'->>'value' != ''
   AND ownerdata->'surplusPerc'->>'value' != ''
ORDER BY 1
       , 2
       , 3