alter table
  spar.seedlot_source_list
add
  default_source_ind boolean default null;

alter table
  spar.seedlot_source_list
add
  constraint only_one_default_source unique (default_source_ind);

update
  spar.seedlot_source_list
set
  description = 'Custom Seedlot'
where
  seedlot_source_code = 'CUS';

update
  spar.seedlot_source_list
set
  default_source_ind = true
where
  seedlot_source_code = 'TPT';
