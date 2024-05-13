with cone_collection_method as (
	select scm.seedlot_number,
		case when r.cone_collection_method_rank is null then '7' else scm.cone_collection_method_code end as cone_collection_method_code,
		r.cone_collection_method_rank,
		rank() over (
			partition by scm.seedlot_number
			order by r.cone_collection_method_rank
		) seedlot_cone_colletion_rank
	from spar.seedlot_collection_method scm
	left join (
		select 
			3 as cone_collection_method_code, 
			1 as cone_collection_method_rank
		union 
		select 
			6 as cone_collection_method_code, 
			2 as cone_collection_method_rank
		union 
		select 
			4 as cone_collection_method_code, 
			3 as cone_collection_method_rank
		union 
		select 
			1 as cone_collection_method_code, 
			5 as cone_collection_method_rank
		union 
		select 
			2 as cone_collection_method_code, 
			6 as cone_collection_method_rank
		union 
		select 
			5 as cone_collection_method_code, 
			7 as cone_collection_method_rank
		union 
		select 
			7 as cone_collection_method_code, 
			8 as cone_collection_method_rank
		union 
		select 
			8 as cone_collection_method_code, 
			9 as cone_collection_method_rank
		) r 
		on r.cone_collection_method_code = scm.cone_collection_method_code
	)
select c1.seedlot_number,
	'0' || c1.cone_collection_method_code as cone_collection_method_code,
	'0' || c2.cone_collection_method_code as cone_collection_method2_code	
from cone_collection_method c1
left join cone_collection_method c2
	on c2.seedlot_number = c1.seedlot_number
		and c2.seedlot_cone_colletion_rank = 2
where c1.seedlot_cone_colletion_rank = 1