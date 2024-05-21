WITH CTE_SMP_MIX AS (
	SELECT 
		   s.SEEDLOT_NUMBER, 
		   s.PARENT_TREE_ID, 
		   s.AMOUNT_OF_MATERIAL, 
		   s.REVISION_COUNT,
           p.PARENT_TREE_NUMBER
	FROM SMP_MIX s, 
         PARENT_TREE p 
    WHERE s.PARENT_TREE_ID = p.PARENT_TREE_ID
)
SELECT seedlot_number, 
	   parent_tree_id, 
	   parent_tree_number,
	   amount_of_material, 
	   revision_count,
	   'LEGACY SPAR' as entry_userid, -- NOT NULL IN DOWNSTREAM
	   'LEGACY SPAR' as update_userid -- NOT NULL IN DOWNSTREAM
FROM CTE_SMP_MIX
--WHERE  ROWNUM < 11
ORDER BY seedlot_number