select 
	s.seedlot_number,
	s.parent_tree_id,
	s.genetic_type_code,
	s.genetic_worth_code,
	s.genetic_quality_value,
	s.estimated_ind,
	s.revision_count
from spar.smp_mix_gen_qlty s