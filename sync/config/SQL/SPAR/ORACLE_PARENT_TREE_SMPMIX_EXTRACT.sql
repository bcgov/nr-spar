WITH CTE_CMPMIX AS (
	SELECT 
		   SEEDLOT_NUMBER, 
		   PARENT_TREE_ID, 
		   GENETIC_TYPE_CODE, 
		   GENETIC_WORTH_CODE, 
		   GENETIC_QUALITY_VALUE, 
		   ESTIMATED_IND, 
		   REVISION_COUNT
	FROM SMP_MIX_GEN_QLTY S
	WHERE 1=1
	-- Granting FK references exist in UPSTREAM to be gathered on DOWNSTREAM
	AND EXISTS (SELECT 1 FROM  SEEDLOT_PARENT_TREE K WHERE K.seedlot_number = S.seedlot_number AND  K.parent_tree_id= S.parent_tree_id AND ROWNUM < 2) 
)
SELECT seedlot_number, 
	   parent_tree_id, 
	   genetic_type_code, 
	   genetic_worth_code, 
	   genetic_quality_value, 
	   revision_count,
	   'LEGACY SPAR' as entry_userid, -- NOT NULL IN DOWNSTREAM
	   'LEGACY SPAR' as update_userid -- NOT NULL IN DOWNSTREAM
FROM CTE_CMPMIX
--WHERE  ROWNUM < 11
ORDER BY seedlot_number