/*
* For entry timestamps
*/
create or replace function trigger_set_entry_timestamp() returns TRIGGER as $$
begin
new.entry_timestamp = now();
return new;
end;
$$ language plpgsql;

create trigger set_entry_timestamp
before insert on spar.seedlot
for each row
execute procedure trigger_set_entry_timestamp();

create trigger set_entry_timestamp
before insert on spar.seedlot_collection_method
for each row
execute procedure trigger_set_entry_timestamp();

create trigger set_entry_timestamp
before insert on spar.seedlot_genetic_worth
for each row
execute procedure trigger_set_entry_timestamp();

create trigger set_entry_timestamp
before insert on spar.seedlot_orchard
for each row
execute procedure trigger_set_entry_timestamp();

create trigger set_entry_timestamp
before insert on spar.seedlot_owner_quantity
for each row
execute procedure trigger_set_entry_timestamp();

create trigger set_entry_timestamp
before insert on spar.seedlot_parent_tree
for each row
execute procedure trigger_set_entry_timestamp();

create trigger set_entry_timestamp
before insert on spar.seedlot_parent_tree_gen_qlty
for each row
execute procedure trigger_set_entry_timestamp();

create trigger set_entry_timestamp
before insert on spar.seedlot_parent_tree_smp_mix
for each row
execute procedure trigger_set_entry_timestamp();

create trigger set_entry_timestamp
before insert on spar.smp_mix
for each row
execute procedure trigger_set_entry_timestamp();

create trigger set_entry_timestamp
before insert on spar.smp_mix_gen_qlty
for each row
execute procedure trigger_set_entry_timestamp();

/*
* For update timestamps
* Alter table with column update_timestamp to use default current_timestamp instead of not null
* Tables that end with '_list' does not need to be altered as they are done in V16
*/
create or replace function trigger_set_update_timestamp() returns TRIGGER as $$
begin
new.update_timestamp = now();
return new;
end;
$$ language plpgsql;

create trigger set_update_timestamp
before update on spar.cone_collection_method_list
for each row
execute procedure trigger_set_update_timestamp();

create trigger set_update_timestamp
before update on spar.gametic_methodology_list
for each row
execute procedure trigger_set_update_timestamp();

create trigger set_update_timestamp
before update on spar.genetic_class_list
for each row
execute procedure trigger_set_update_timestamp();

create trigger set_update_timestamp
before update on spar.genetic_worth_list
for each row
execute procedure trigger_set_update_timestamp();

create trigger set_update_timestamp
before update on spar.method_of_payment_list
for each row
execute procedure trigger_set_update_timestamp();

alter table
  spar.seedlot
alter column
  update_timestamp set default current_timestamp;

create trigger set_update_timestamp
before update on spar.seedlot
for each row
execute procedure trigger_set_update_timestamp();

alter table
  spar.seedlot_collection_method
alter column
  update_timestamp set default current_timestamp;

create trigger set_update_timestamp
before update on spar.seedlot_collection_method
for each row
execute procedure trigger_set_update_timestamp();

alter table
  spar.seedlot_genetic_worth
alter column
  update_timestamp set default current_timestamp;

create trigger set_update_timestamp
before update on spar.seedlot_genetic_worth
for each row
execute procedure trigger_set_update_timestamp();

alter table
  spar.seedlot_orchard
alter column
  update_timestamp set default current_timestamp;

create trigger set_update_timestamp
before update on spar.seedlot_orchard
for each row
execute procedure trigger_set_update_timestamp();

alter table
  spar.seedlot_owner_quantity
alter column
  update_timestamp set default current_timestamp;

create trigger set_update_timestamp
before update on spar.seedlot_owner_quantity
for each row
execute procedure trigger_set_update_timestamp();

alter table
  spar.seedlot_parent_tree
alter column
  update_timestamp set default current_timestamp;

create trigger set_update_timestamp
before update on spar.seedlot_parent_tree
for each row
execute procedure trigger_set_update_timestamp();

alter table
  spar.seedlot_parent_tree_gen_qlty
alter column
  update_timestamp set default current_timestamp;

create trigger set_update_timestamp
before update on spar.seedlot_parent_tree_gen_qlty
for each row
execute procedure trigger_set_update_timestamp();

alter table
  spar.seedlot_parent_tree_smp_mix
alter column
  update_timestamp set default current_timestamp;

create trigger set_update_timestamp
before update on spar.seedlot_parent_tree_smp_mix
for each row
execute procedure trigger_set_update_timestamp();

create trigger set_update_timestamp
before update on spar.seedlot_source_list
for each row
execute procedure trigger_set_update_timestamp();

create trigger set_update_timestamp
before update on spar.seedlot_status_list
for each row
execute procedure trigger_set_update_timestamp();

alter table
  spar.smp_mix
alter column
  update_timestamp set default current_timestamp;

create trigger set_update_timestamp
before update on spar.smp_mix
for each row
execute procedure trigger_set_update_timestamp();

alter table
  spar.smp_mix_gen_qlty
alter column
  update_timestamp set default current_timestamp;

create trigger set_update_timestamp
before update on spar.smp_mix_gen_qlty
for each row
execute procedure trigger_set_update_timestamp();
