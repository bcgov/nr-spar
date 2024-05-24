WITH CTE_SPAR AS (
	SELECT 
		SEEDLOT_NUMBER ,
		CLIENT_NUMBER AS OWNER_CLIENT_NUMBER,
		CLIENT_LOCN_CODE AS OWNER_LOCN_CODE ,
		ORIGINAL_PCT_OWNED,
		ORIGINAL_PCT_RSRVD,
		ORIGINAL_PCT_SRPLS,
		METHOD_OF_PAYMENT_CODE,
		SPAR_FUND_SRCE_CODE,
		REVISION_COUNT		
	FROM SEEDLOT_OWNER_QUANTITY 
)
SELECT seedlot_number, 
	   owner_client_number,  
	   owner_locn_code,  
	   original_pct_owned,  
	   original_pct_rsrvd,  
	   original_pct_srpls,  
	   method_of_payment_code,  
	   spar_fund_srce_code,  
	   revision_count,
	   'LEGACY SPAR' as entry_userid, -- NOT NULL IN DOWNSTREAM
	   'LEGACY SPAR' as update_userid -- NOT NULL IN DOWNSTREAM
FROM CTE_SPAR
--WHERE  ROWNUM < 11
ORDER BY seedlot_number


