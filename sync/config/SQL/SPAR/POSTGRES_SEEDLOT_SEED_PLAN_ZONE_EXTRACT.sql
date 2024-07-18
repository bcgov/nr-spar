SELECT
  slpz.seedlot_number
, slpz.seed_plan_zone_code
, CASE slpz.primary_ind WHEN TRUE THEN 'Y' ELSE 'N' END  primary_ind
, REPLACE(slpz.entry_userid,'\', '@') as entry_userid
, slpz.entry_timestamp
, slpz.revision_count
 FROM spar.seedlot_seed_plan_zone slpz
WHERE slpz.seedlot_number = %(p_seedlot_number)s
ORDER BY slpz.seedlot_number
       , slpz.primary_ind