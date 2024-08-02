SELECT
  sgw.seedlot_number
, sgw.genetic_worth_code
, sgw.genetic_quality_value                genetic_worth_rtng                   
, REPLACE(sgw.entry_userid,'\', '@') as entry_userid
, sgw.entry_timestamp
, REPLACE(sgw.update_userid,'\', '@') as update_userid
, sgw.update_timestamp
, sgw.revision_count
 FROM spar.seedlot_genetic_worth sgw
 JOIN spar.seedlot s
   ON s.seedlot_number = sgw.seedlot_number
WHERE sgw.seedlot_number = %(p_seedlot_number)s
  AND s.seedlot_status_code != 'PND'
ORDER BY sgw.seedlot_number
       , sgw.genetic_worth_code
       