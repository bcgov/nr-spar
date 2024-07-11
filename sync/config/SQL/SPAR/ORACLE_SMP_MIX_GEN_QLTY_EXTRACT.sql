WITH CTE_SMP AS (
	SELECT 
		   SEEDLOT_NUMBER, 
		   PARENT_TREE_ID, 
		   GENETIC_TYPE_CODE, 
		   GENETIC_WORTH_CODE, 
		   GENETIC_QUALITY_VALUE, 
		   ESTIMATED_IND, 
		   REVISION_COUNT
	FROM SMP_MIX_GEN_QLTY 
)
SELECT seedlot_number, 
	   parent_tree_id, 
	   genetic_type_code, 
	   genetic_worth_code, 
	   genetic_quality_value, 
	   estimated_ind,
	   revision_count,
	   'LEGACY SPAR' as entry_userid, -- NOT NULL IN DOWNSTREAM
	   'LEGACY SPAR' as update_userid -- NOT NULL IN DOWNSTREAM
FROM CTE_SMP
--WHERE  ROWNUM < 11
ORDER BY seedlot_number