select 
	s.seedlot_number,
	s.parent_tree_id,
	s.cone_count,
	s.pollen_count,
	s.smp_success_pct,
	s.non_orchard_pollen_contam_pct,
	s.revision_count
from spar.seedlot_parent_tree s