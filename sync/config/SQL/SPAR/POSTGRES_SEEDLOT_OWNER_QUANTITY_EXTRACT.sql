SELECT
 seedlot_number
, owner_client_number      client_number
, owner_locn_code          client_locn_code
, original_pct_owned
, original_pct_rsrvd
, original_pct_srpls
, 0 qty_reserved
, 0 qty_rsrvd_cmtd_pln
, 0 qty_rsrvd_cmtd_apr
, 0 qty_surplus
, 0 qty_srpls_cmtd_pln
, 0 qty_srpls_cmtd_apr
, method_of_payment_code
, spar_fund_srce_code
, revision_count
 FROM spar.seedlot_owner_quantity soq
WHERE soq.seedlot_number IN 
           (SELECT soqin.seedlot_number
              FROM spar.seedlot_owner_quantity soqin
             WHERE soqin.update_timestamp between %(start_time)s AND %(end_time)s )
 FROM spar.seedlot_owner_quantity 
WHERE 
	update_timestamp between %(start_time)s AND %(end_time)s 
ORDER BY seedlot_number
       , owner_client_number
       , owner_locn_code