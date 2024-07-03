SELECT
  spt.seedlot_number
, spt.parent_tree_id
, spt.cone_count
, spt.pollen_count
, spt.smp_success_pct
, spt.non_orchard_pollen_contam_pct
, spt.total_genetic_worth_contrib
, spt.revision_count
 FROM spar.seedlot_parent_tree spt
WHERE spt.seedlot_number = %(p_seedlot_number)s
ORDER BY spt.seedlot_number
       , spt.parent_tree_id