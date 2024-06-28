SELECT
  smpgq.seedlot_number
, smpgq.parent_tree_id
, smpgq.genetic_type_code
, smpgq.genetic_worth_code
, smpgq.genetic_quality_value
, smpgq.estimated_ind
, smpgq.revision_count
 FROM spar.smp_mix_gen_qlty smpgq
WHERE smpgq.seedlot_number IN 
           (SELECT smpgqin.seedlot_number
              FROM spar.smp_mix_gen_qlty smpgqin
             WHERE smpgqin.update_timestamp between %(start_time)s AND %(end_time)s )
ORDER BY smpgq.seedlot_number
       , smpgq.parent_tree_id