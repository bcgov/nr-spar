WITH CTE_SPAR AS (SELECT 
                    SEEDLOT_NUMBER, 
                    GENETIC_WORTH_CODE,
                    GENETIC_WORTH_RTNG,
                    ENTRY_USERID,
                    ENTRY_TIMESTAMP,
                    UPDATE_USERID,
                    UPDATE_TIMESTAMP,
                    REVISION_COUNT	
                  FROM seedlot_genetic_worth 
	--WHERE update_timestamp BETWEEN :start_time AND :end_time 
)
SELECT seedlot_number, 
	   genetic_worth_code,  
	   genetic_worth_rtng,  
       entry_userid,
       entry_timestamp,
       update_userid,
       update_timestamp,
       revision_count
FROM CTE_SPAR
ORDER BY seedlot_number