WITH CTE_SPAR AS (
	SELECT 
		SEEDLOT_NUMBER, 
		ORCHARD_ID ,
		REVISION_COUNT
	FROM SEEDLOT 
	WHERE ORCHARD_ID IS NOT NULL
)
SELECT seedlot_number, 
	   orchard_id,  
	   revision_count,
	   'LEGACY SPAR' as entry_userid, -- NOT NULL IN DOWNSTREAM
	   'LEGACY SPAR' as update_userid -- NOT NULL IN DOWNSTREAM
FROM CTE_SPAR
--WHERE  ROWNUM < 11
ORDER BY seedlot_number

