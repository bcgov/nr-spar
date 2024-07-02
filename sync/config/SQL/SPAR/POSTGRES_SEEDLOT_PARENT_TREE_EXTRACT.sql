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
WHERE spt.seedlot_number IN 
           (SELECT sptin.seedlot_number
              FROM spar.seedlot_parent_tree sptin
             WHERE sptin.update_timestamp between %(start_time)s AND %(end_time)s )
ORDER BY spt.seedlot_number
       , spt.parent_tree_id