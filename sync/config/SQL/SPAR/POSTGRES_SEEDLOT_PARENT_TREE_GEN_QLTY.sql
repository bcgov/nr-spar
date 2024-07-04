SELECT
  soqgq.seedlot_number
, soqgq.parent_tree_id
, soqgq.genetic_type_code
, soqgq.genetic_worth_code
, soqgq.genetic_quality_value
, soqgq.estimated_ind
, soqgq.untested_ind
, aos.seed_plan_unit_id
, soqgq.revision_count
 FROM spar.seedlot_parent_tree_gen_qlty soqgq
 LEFT 
 OUTER 
 JOIN  spar.seedlot_orchard so 
   ON     so.seedlot_number = soqgq.seedlot_number
      AND so.primary_ind = true
 LEFT 
 OUTER 
 JOIN  spar.active_orchard_spu aos 
   ON   aos.orchard_id = so.orchard_id
WHERE soqgq.seedlot_number = %(p_seedlot_number)s
ORDER BY soqgq.seedlot_number
       , soqgq.parent_tree_id