WITH CTE_SPAR AS (
	SELECT  DISTINCT
		SEEDLOT_NUMBER, 
		GENETIC_WORTH_CODE,
		GENETIC_QUALITY_VALUE,
		0 AS TESTED_PARENT_TREE_CONT_PCT , -- TODO: PLACEHOLDER WHILE CALCULATION IS DEFINED
		ESTIMATED_IND, --- EXISTS IN ORACLE, BUT NOT REFERENCED IN POSTGRES. WHY?
		REVISION_COUNT
	FROM smp_mix_gen_qlty 
)
SELECT seedlot_number, 
	   genetic_worth_code,  
	   genetic_quality_value,  
	   tested_parent_tree_cont_pct,  
	   revision_count,
	   'LEGACY SPAR' as entry_userid, -- NOT NULL IN DOWNSTREAM
	   'LEGACY SPAR' as update_userid -- NOT NULL IN DOWNSTREAM
FROM CTE_SPAR
--WHERE  ROWNUM < 11
ORDER BY seedlot_number

