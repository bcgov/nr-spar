SELECT
  slpz.seedlot_number
, slpz.seed_plan_zone_code
, CASE slpz.primary_ind WHEN TRUE THEN 'Y' ELSE 'N' END  primary_ind
, REPLACE(slpz.entry_userid,'\', '@') as entry_userid
, slpz.entry_timestamp
, slpz.revision_count
 FROM spar.seedlot_seed_plan_zone slpz
 JOIN spar.seedlot s
   ON s.seedlot_number = slpz.seedlot_number
WHERE slpz.seedlot_number = %(p_seedlot_number)s
  AND s.seedlot_status_code != 'PND'
ORDER BY slpz.seedlot_number
       , slpz.primary_ind