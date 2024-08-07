SELECT
  smp.seedlot_number
, smp.parent_tree_id
, smp.amount_of_material
, smp.revision_count
 FROM spar.smp_mix smp
 JOIN spar.seedlot s
   ON s.seedlot_number = smp.seedlot_number
WHERE smp.seedlot_number = %(p_seedlot_number)s
  AND s.seedlot_status_code != 'PND'
ORDER BY smp.seedlot_number
       , smp.parent_tree_id