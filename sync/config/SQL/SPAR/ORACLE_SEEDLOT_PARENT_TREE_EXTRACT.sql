WITH CTE_PTREE AS (
	SELECT 
		s.seedlot_number ,
		s.parent_tree_id ,
		p.parent_tree_number ,
		s.cone_count ,
		s.pollen_count ,
		s.smp_success_pct ,
		s.non_orchard_pollen_contam_pct ,
		s.total_genetic_worth_contrib ,
		s.revision_count
	FROM SEEDLOT_PARENT_TREE S, PARENT_TREE P 
	WHERE S.parent_tree_id = p.parent_tree_id
)
SELECT seedlot_number, 
	   parent_tree_id, 
	   parent_tree_number,
	   cone_count, 
	   pollen_count, 
	   smp_success_pct, 
	   non_orchard_pollen_contam_pct, 
	   total_genetic_worth_contrib, 
	   revision_count,
	   'LEGACY SPAR' as entry_userid, -- NOT NULL IN DOWNSTREAM
	   'LEGACY SPAR' as update_userid -- NOT NULL IN DOWNSTREAM
FROM CTE_PTREE
--WHERE  ROWNUM < 11
ORDER BY seedlot_number