/**
 * seedlot_genetic_worth
 */
alter table
  spar.seedlot_genetic_worth
alter column
  entry_timestamp
set
  default current_timestamp;

create trigger set_entry_timestamp before
insert
  on spar.seedlot_genetic_worth for each row execute procedure trigger_set_entry_timestamp();

alter table
  spar.seedlot_genetic_worth
alter column
  update_timestamp
set
  default current_timestamp;

create trigger set_update_timestamp before
update
  on spar.seedlot_genetic_worth for each row execute procedure trigger_set_update_timestamp();

/**
 * seedlot_parent_tree
 */
alter table
  spar.seedlot_parent_tree
alter column
  entry_timestamp
set
  default current_timestamp;

create trigger set_entry_timestamp before
insert
  on spar.seedlot_parent_tree for each row execute procedure trigger_set_entry_timestamp();

alter table
  spar.seedlot_parent_tree
alter column
  update_timestamp
set
  default current_timestamp;

create trigger set_update_timestamp before
update
  on spar.seedlot_parent_tree for each row execute procedure trigger_set_update_timestamp();

/**
 * seedlot_parent_tree_gen_qlty
 */
alter table
  spar.seedlot_parent_tree_gen_qlty
alter column
  entry_timestamp
set
  default current_timestamp;

create trigger set_entry_timestamp before
insert
  on spar.seedlot_parent_tree_gen_qlty for each row execute procedure trigger_set_entry_timestamp();

alter table
  spar.seedlot_parent_tree_gen_qlty
alter column
  update_timestamp
set
  default current_timestamp;

create trigger set_update_timestamp before
update
  on spar.seedlot_parent_tree_gen_qlty for each row execute procedure trigger_set_update_timestamp();

/**
 * seedlot_parent_tree_smp_mix
 */
alter table
  spar.seedlot_parent_tree_smp_mix
alter column
  entry_timestamp
set
  default current_timestamp;

create trigger set_entry_timestamp before
insert
  on spar.seedlot_parent_tree_smp_mix for each row execute procedure trigger_set_entry_timestamp();

alter table
  spar.seedlot_parent_tree_smp_mix
alter column
  update_timestamp
set
  default current_timestamp;

create trigger set_update_timestamp before
update
  on spar.seedlot_parent_tree_smp_mix for each row execute procedure trigger_set_update_timestamp();

/**
 * smp_mix
 */
alter table
  spar.smp_mix
alter column
  entry_timestamp
set
  default current_timestamp;

create trigger set_entry_timestamp before
insert
  on spar.smp_mix for each row execute procedure trigger_set_entry_timestamp();

alter table
  spar.smp_mix
alter column
  update_timestamp
set
  default current_timestamp;

create trigger set_update_timestamp before
update
  on spar.smp_mix for each row execute procedure trigger_set_update_timestamp();

/**
 * smp_mix_gen_qlty
 */
alter table
  spar.smp_mix_gen_qlty
alter column
  entry_timestamp
set
  default current_timestamp;

create trigger set_entry_timestamp before
insert
  on spar.smp_mix_gen_qlty for each row execute procedure trigger_set_entry_timestamp();

alter table
  spar.smp_mix_gen_qlty
alter column
  update_timestamp
set
  default current_timestamp;

create trigger set_update_timestamp before
update
  on spar.smp_mix_gen_qlty for each row execute procedure trigger_set_update_timestamp();

/**
 * seedlot_smp_mix
 */
alter table
  spar.seedlot_smp_mix
alter column
  entry_timestamp
set
  default current_timestamp;

create trigger set_entry_timestamp before
insert
  on spar.seedlot_smp_mix for each row execute procedure trigger_set_entry_timestamp();

alter table
  spar.seedlot_smp_mix
alter column
  update_timestamp
set
  default current_timestamp;

create trigger set_update_timestamp before
update
  on spar.seedlot_smp_mix for each row execute procedure trigger_set_update_timestamp();

/**
 * seedlot_seed_plan_zone
 */
alter table
  spar.seedlot_seed_plan_zone
alter column
  entry_timestamp
set
  default current_timestamp;

create trigger set_entry_timestamp before
insert
  on spar.seedlot_seed_plan_zone for each row execute procedure trigger_set_entry_timestamp();

alter table
  spar.seedlot_seed_plan_zone
alter column
  update_timestamp
set
  default current_timestamp;

create trigger set_update_timestamp before
update
  on spar.seedlot_seed_plan_zone for each row execute procedure trigger_set_update_timestamp();
