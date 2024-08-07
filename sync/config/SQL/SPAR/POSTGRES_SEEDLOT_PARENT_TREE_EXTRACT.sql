SELECT
  spt.seedlot_number
, spt.parent_tree_id
, spt.cone_count
, spt.pollen_count
, spt.smp_success_pct
, spt.non_orchard_pollen_contam_pct
, COALESCE(spt.total_genetic_worth_contrib,0) total_genetic_worth_contrib
, spt.revision_count
 FROM spar.seedlot_parent_tree spt
 JOIN spar.seedlot s
   ON s.seedlot_number = spt.seedlot_number
WHERE spt.seedlot_number = %(p_seedlot_number)s
  AND s.seedlot_status_code != 'PND'
ORDER BY spt.seedlot_number
       , spt.parent_tree_id       