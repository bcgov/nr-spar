select
	s.seedlot_number,
	s.owner_client_number,
	s.owner_locn_code,
	s.original_pct_owned,
	s.original_pct_rsrvd,
	s.original_pct_srpls,
	s.method_of_payment_code,
	s.spar_fund_srce_code,
	s.revision_count
from spar.seedlot_owner_quantity s