select
	s.seedlot_number,
	spu.seed_plan_unit_id,
	s.parent_tree_id,
	s.genetic_type_code,
	s.genetic_worth_code,
	s.genetic_quality_value,
	s.estimated_ind,
	s.untested_ind,
	s.revision_count
from spar.seedlot_parent_tree_gen_qlty s
left join spar.seedlot_orchard o
	on o.seedlot_number = s.seedlot_number
left join spar.active_orchard_spu spu
	on spu.orchard_id = o.orchard_id
		and spu.active_ind = true