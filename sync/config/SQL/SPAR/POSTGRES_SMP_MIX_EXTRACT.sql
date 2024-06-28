SELECT
  smp.seedlot_number
, smp.parent_tree_id
, smp.amount_of_material
, smp.revision_count
 FROM spar.smp_mix smp
WHERE smp.seedlot_number IN 
           (SELECT smpin.seedlot_number
              FROM spar.smp_mix smpin
             WHERE smpin.update_timestamp between %(start_time)s AND %(end_time)s )
ORDER BY smp.seedlot_number
       , smp.parent_tree_id