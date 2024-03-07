with seedlot_orchards as (
	select 
		so1.seedlot_number,
		so1.orchard_id,
		so2.orchard_id as secondary_orchard_id,
		rank() over (
			partition by so1.seedlot_number
			order by so1.orchard_id
		) orchard_rank
	from spar.seedlot_orchard so1
	left join spar.seedlot_orchard so2
		on so2.seedlot_number = so1.seedlot_number
			and so2.orchard_id != so1.orchard_id
	left join spar.active_orchard_spu a
		on a.orchard_id = so1.orchard_id
			and a.active_ind = true
	)
select so.seedlot_number,
	so.orchard_id,
	so.secondary_orchard_id
from seedlot_orchards so
where so.orchard_rank = 1