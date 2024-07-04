SELECT
  seedlot_number
, parent_tree_id
, genetic_type_code
, genetic_worth_code
, genetic_quality_value    smp_mix_value      
, revision_count
 FROM spar.seedlot_parent_tree_smp_mix
WHERE seedlot_number = %(p_seedlot_number)s
ORDER BY seedlot_number
       , parent_tree_id       
