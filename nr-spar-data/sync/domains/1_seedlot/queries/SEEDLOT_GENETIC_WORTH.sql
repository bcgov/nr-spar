select
	s.seedlot_number,
	s.genetic_worth_code,
	s.genetic_quality_value,
	s.entry_userid,
	s.entry_timestamp,
	s.update_userid,
	s.update_timestamp,
    s.revision_count
from spar.seedlot_genetic_worth s