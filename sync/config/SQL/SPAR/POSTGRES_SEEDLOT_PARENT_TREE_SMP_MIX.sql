SELECT
  smp.seedlot_number
, smp.parent_tree_id
, smp.genetic_type_code
, smp.genetic_worth_code
, smp.genetic_quality_value    smp_mix_value      
, smp.revision_count
 FROM spar.seedlot_parent_tree_smp_mix smp
 JOIN spar.seedlot s
   ON s.seedlot_number = smp.seedlot_number
WHERE smp.seedlot_number = %(p_seedlot_number)s
  AND s.seedlot_status_code != 'PND'
ORDER BY smp.seedlot_number
       , smp.parent_tree_id       
