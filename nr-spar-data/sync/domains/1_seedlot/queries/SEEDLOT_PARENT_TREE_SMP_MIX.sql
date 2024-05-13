select
	s.seedlot_number,
	s.parent_tree_id,
	s.genetic_type_code,
	s.genetic_worth_code,
	s.genetic_quality_value,
	s.revision_count
from spar.seedlot_parent_tree_smp_mix s