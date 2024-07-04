SELECT
  slpz.seedlot_number
, slpz.seed_plan_zone_code
, slpz.primary_ind
, slpz.entry_userid
, slpz.entry_timestamp
, slpz.revision_count
 FROM spar.seedlot_seed_plan_zone slpz
WHERE slpz.seedlot_number = %(p_seedlot_number)s
ORDER BY slpz.seedlot_number
       , slpz.primary_ind