WITH CTE_SMP AS (
	SELECT DISTINCT
		   SEEDLOT_NUMBER,  
		   GENETIC_WORTH_CODE, 
		   GENETIC_QUALITY_VALUE, 
		   REVISION_COUNT
	FROM SMP_MIX_GEN_QLTY 
)
SELECT seedlot_number, 
	   genetic_worth_code, 
	   genetic_quality_value, 
	   revision_count,
	   'LEGACY SPAR' as entry_userid, -- NOT NULL IN DOWNSTREAM
	   'LEGACY SPAR' as update_userid -- NOT NULL IN DOWNSTREAM
FROM CTE_SMP
--WHERE  ROWNUM < 11
ORDER BY seedlot_number