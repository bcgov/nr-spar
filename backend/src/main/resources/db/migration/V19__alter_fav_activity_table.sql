alter table
  spar.favourite_activity drop column enabled;

alter table
  spar.favourite_activity
add
  entry_timestamp timestamp default current_timestamp;

alter table
  spar.favourite_activity
add
  update_timestamp timestamp default current_timestamp;

create trigger set_entry_timestamp before
insert
  on spar.favourite_activity for each row execute procedure trigger_set_entry_timestamp();

create trigger set_update_timestamp before
update
  on spar.favourite_activity for each row execute procedure trigger_set_update_timestamp();
