SELECT
  smpgq.seedlot_number
, smpgq.parent_tree_id
, smpgq.genetic_type_code
, smpgq.genetic_worth_code
, smpgq.genetic_quality_value
, CASE smpgq.estimated_ind WHEN TRUE THEN 'Y' ELSE 'N' END  estimated_ind
, smpgq.revision_count
 FROM spar.smp_mix_gen_qlty smpgq
 JOIN spar.seedlot s
   ON s.seedlot_number = smpgq.seedlot_number
WHERE smpgq.seedlot_number = %(p_seedlot_number)s
  AND s.seedlot_status_code != 'PND'
ORDER BY smpgq.seedlot_number
       , smpgq.parent_tree_id