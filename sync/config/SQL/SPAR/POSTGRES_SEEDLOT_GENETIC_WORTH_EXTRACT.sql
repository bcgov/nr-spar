SELECT
  seedlot_number
, genetic_worth_code
, genetic_quality_value                genetic_worth_rtng                   
, entry_userid
, entry_timestamp
, update_userid
, update_timestamp
, revision_count
 FROM spar.seedlot_genetic_worth sgw
WHERE sgw.seedlot_number = %(p_seedlot_number)s
ORDER BY seedlot_number
       , genetic_worth_code