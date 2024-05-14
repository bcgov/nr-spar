alter table
  spar.seedlot_seed_plan_zone
add
  seed_plan_zone_id smallint,
add
  genetic_class_code varchar(1),
add
  constraint fk_genetic_class_code foreign key (genetic_class_code) references spar.genetic_class_list(genetic_class_code);

comment on column spar.seedlot_seed_plan_zone.seed_plan_zone_id is 'A unique identifier for a combination of Seed Plan Zone Code, Genetic Class and Vegetation Code';

comment on column spar.seedlot_seed_plan_zone.genetic_class_code is 'A code describing various Genetic Classes.';
