SELECT
  smp.seedlot_number
, smp.parent_tree_id
, smp.amount_of_material
, smp.revision_count
 FROM spar.smp_mix smp
WHERE smp.seedlot_number = %(p_seedlot_number)s
ORDER BY smp.seedlot_number
       , smp.parent_tree_id