create table spar.seedlot_registration_a_class_save (
  seedlot_number varchar(5) not null,
  all_step_data jsonb not null,
  progress_status jsonb not null,
  entry_userid varchar(30) not null,
  entry_timestamp timestamp default current_timestamp,
  update_userid varchar(30) not null,
  update_timestamp timestamp default current_timestamp,
  revision_count int not null,
  constraint registration_form_a_class_pk primary key(seedlot_number),
  constraint registration_form_a_class_seedlot_fk foreign key(seedlot_number) references spar.seedlot(seedlot_number)
);

create trigger set_entry_timestamp before
insert
  on spar.seedlot_registration_a_class_save for each row execute procedure trigger_set_entry_timestamp();

create trigger set_update_timestamp before
update
  on spar.seedlot_registration_a_class_save for each row execute procedure trigger_set_update_timestamp();
