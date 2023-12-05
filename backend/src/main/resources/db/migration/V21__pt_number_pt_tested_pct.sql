-- All tables in the script need to be recreated as there is no other way to add columns in a specific position. Once a table is being used by the application, it will only be possible to add columns at the end of the table.
-- Moving tested_parent_tree_cont_pct column from seedlot table to seedlot_genetic_worth table.
alter table spar.seedlot drop column tested_parent_tree_cont_pct;
alter table spar.seedlot drop column coancestry;

alter table spar.seedlot rename column storage_client_number to temporary_strg_client_number;
alter table spar.seedlot rename column storage_locn_code to temporary_strg_locn_code;
alter table spar.seedlot rename column temporary_storage_start_date to temporary_strg_start_date;
alter table spar.seedlot rename column temporary_storage_end_date to temporary_strg_end_date;

alter table spar.seedlot add column interm_strg_locn varchar(55);
comment on column spar.seedlot.interm_strg_locn is 'The location where the tree seed was stored during interim storage. Can be used if users did not enter a registered client data.';

drop table spar.seedlot_genetic_worth;

create table spar.seedlot_genetic_worth (
  seedlot_number                 varchar(5) not null,
  genetic_worth_code             varchar(3) not null,
  genetic_quality_value          decimal(4, 1) not null,
  tested_parent_tree_cont_pct    decimal(6, 2),
  entry_userid                   varchar(30) not null, 
  entry_timestamp                timestamp not null, 
  update_userid                  varchar(30) not null, 
  update_timestamp               timestamp not null, 
  revision_count                 int not null,
  constraint seedlot_genetic_worth_pk 
    primary key(seedlot_number, genetic_worth_code),
  constraint seedlot_genet_worth_seedlot_fk 
    foreign key(seedlot_number) references spar.seedlot(seedlot_number)
);

comment on table spar.seedlot_genetic_worth is 'A subclassification of Genetic Quality for "A" class Seedlots.';
comment on column spar.seedlot_genetic_worth.seedlot_number is 'The unique number (key) assigned to a quantity of seed of a particular species and quality from a given location collected at a given time.';
comment on column spar.seedlot_genetic_worth.genetic_worth_code is 'A code which represents a subclassification of Genetic Quality for "A" class seedlots.';
comment on column spar.seedlot_genetic_worth.genetic_quality_value is 'The rating for a subclassification of Genetic Quality for "A" class seedlots.';
comment on column spar.seedlot_genetic_worth.tested_parent_tree_cont_pct is 'Percentage of parent trees that were tested for the trait and contributed to the seedlot';
comment on column spar.seedlot_genetic_worth.entry_userid is 'The userid of the individual that entered the Seedlot Genetic Worth.';
comment on column spar.seedlot_genetic_worth.entry_timestamp is 'The time and date a Seedlot Genetic Worth was entered onto the system.';
comment on column spar.seedlot_genetic_worth.update_userid is 'The userid of the individual that changed the Seedlot Genetic Worth.';
comment on column spar.seedlot_genetic_worth.update_timestamp is 'The time and date a Seedlot Genetic Worth was last updated on the system.';
comment on column spar.seedlot_genetic_worth.revision_count is 'A counter used to ensure data integrity. This item should be incremented during each update.';

-- Adding parent_tree_number to seedlot_parent_tree table. Need to recreate the tables that references seedlot_parent_tree (seedlot_parent_tree_smp_mix and seedlot_parent_tree_gen_qlty).
drop table spar.seedlot_parent_tree_smp_mix;
drop table spar.seedlot_parent_tree_gen_qlty;
drop table spar.seedlot_parent_tree;

create table spar.seedlot_parent_tree (
  seedlot_number                varchar(5) not null,
  parent_tree_id                int not null,
  parent_tree_number            varchar(5) not null,
  cone_count                    decimal(20, 10) not null,
  pollen_count                  decimal(20, 10) not null,
  smp_success_pct               int,
  non_orchard_pollen_contam_pct int,
  total_genetic_worth_contrib   decimal(15, 11),
  entry_userid                  varchar(30) not null,
  entry_timestamp               timestamp not null,
  update_userid                 varchar(30) not null,
  update_timestamp              timestamp not null,
  revision_count                int not null,
  constraint seedlot_parent_tree_pk 
    primary key(seedlot_number, parent_tree_id),
  constraint seedlot_parent_tree_seedlot_fk 
    foreign key(seedlot_number) references spar.seedlot(seedlot_number)
);

comment on table spar.seedlot_parent_tree is 'The contribution of Parent Trees (with their cone and pollen quantity of each Parent Tree) to an Orchard Seedlot (Genetic Class = "A")';
comment on column spar.seedlot_parent_tree.seedlot_number is 'The unique number (key) assigned to a quantity of seed of a particular species and quality from a given location collected at a given time.';
comment on column spar.seedlot_parent_tree.parent_tree_id is 'A unique identifier for each Parent Tree.';
comment on column spar.seedlot_parent_tree.parent_tree_number is 'The original registration number given to a Parent Tree in conjunction with a Species Code.';
comment on column spar.seedlot_parent_tree.cone_count is 'The number of cones counted or estimated from each Parent Tree for a Seedlot.';
comment on column spar.seedlot_parent_tree.pollen_count is 'The amount of pollen counted or estimated for each Parent Tree in the Seedlot.';
comment on column spar.seedlot_parent_tree.smp_success_pct is 'The estimated success (percent) of the supplemental mass pollination mix on the Parent Trees in the Orchard.';
comment on column spar.seedlot_parent_tree.non_orchard_pollen_contam_pct is 'Non-orchard pollen contamination (%).';
comment on column spar.seedlot_parent_tree.total_genetic_worth_contrib is 'Total Parent (seed) genetic worth contribution to seedlot';
comment on column spar.seedlot_parent_tree.entry_userid is 'The userid of the individual that entered the Seedlot Parent Tree.';
comment on column spar.seedlot_parent_tree.entry_timestamp is 'The time and date a Seedlot Parent Tree was entered onto the system.';
comment on column spar.seedlot_parent_tree.update_userid is 'The userid of the individual that changed the Seedlot Parent Tree.';
comment on column spar.seedlot_parent_tree.update_timestamp is 'The time and date a Seedlot Parent Tree was last updated on the system.';
comment on column spar.seedlot_parent_tree.revision_count is 'A counter used to ensure data integrity. This item should be incremented during each update.';


create table spar.seedlot_parent_tree_gen_qlty (
  seedlot_number        varchar(5) not null,
  parent_tree_id        int not null,
  genetic_type_code     varchar(2) not null,
  genetic_worth_code    varchar(3) not null,
  genetic_quality_value decimal(4, 1) not null,
  estimated_ind         boolean, 
  untested_ind          boolean, 
  entry_userid          varchar(30) not null,
  entry_timestamp       timestamp not null,
  update_userid         varchar(30) not null,
  update_timestamp      timestamp not null,
  revision_count        int,
  constraint seedlot_parent_tree_gen_qlt_pk 
    primary key(seedlot_number, parent_tree_id, genetic_type_code, genetic_worth_code),
  constraint sl_ptree_genqly_sl_ptree_fk 
    foreign key(seedlot_number, parent_tree_id) references spar.seedlot_parent_tree(seedlot_number, parent_tree_id)
);

comment on table spar.seedlot_parent_tree_gen_qlty is 'The Genetic Worth value(s) for an Orchard Seedlot (Genetic Class = "A") calculated from the Genetic Quality (Breeding Values) of the Parent Trees contributing to the Seedlot.';
comment on column spar.seedlot_parent_tree_gen_qlty.seedlot_number is 'The unique number (key) assigned to a quantity of seed of a particular species and quality from a given location collected at a given time.';
comment on column spar.seedlot_parent_tree_gen_qlty.parent_tree_id is 'A unique identifier for each Parent Tree.';
comment on column spar.seedlot_parent_tree_gen_qlty.genetic_type_code is 'Describes the comparative measure of genetic value for a specific genetic trait of a Parent Tree.  Examples are BV (Breeding Value) and CV (Clonal Value).';
comment on column spar.seedlot_parent_tree_gen_qlty.genetic_worth_code is 'A code describing various Genetic Worths.';
comment on column spar.seedlot_parent_tree_gen_qlty.genetic_quality_value is 'The Genetic Quality value based on the test assessment for a Parent Tree from a test no. and series.';
comment on column spar.seedlot_parent_tree_gen_qlty.estimated_ind is 'Indicates whether or not the test result was estimated. A Genetic Quality value of 2.0 is estimated for Untested Parent Trees (i.e. Parent Trees without an Area of Use) or for Tested Parent Trees (i.e. Parent Trees with an Area of Use) without a Genetic.';
comment on column spar.seedlot_parent_tree_gen_qlty.untested_ind is 'Indicates whether or not the test result was estimated for an untested Parent Tree.';
comment on column spar.seedlot_parent_tree_gen_qlty.entry_userid is 'The userid of the individual that entered the Seedlot Parent Tree Genetic Quality.';
comment on column spar.seedlot_parent_tree_gen_qlty.entry_timestamp is 'The time and date a Seedlot Parent Tree Genetic Quality was entered onto the system.';
comment on column spar.seedlot_parent_tree_gen_qlty.update_userid is 'The userid of the individual that changed the Seedlot Parent Tree Genetic Quality.';
comment on column spar.seedlot_parent_tree_gen_qlty.update_timestamp is 'The time and date a Seedlot Parent Tree Genetic Quality was last updated on the system.';
comment on column spar.seedlot_parent_tree_gen_qlty.revision_count is 'A counter used to ensure data integrity. This item should be incremented during each update.';

create table spar.seedlot_parent_tree_smp_mix (
  seedlot_number        varchar(5) not null,
  parent_tree_id        int not null,
  genetic_type_code     varchar(2) not null,
  genetic_worth_code    varchar(3) not null,
  genetic_quality_value decimal(4, 1) not null,
  entry_userid          varchar(30) not null,
  entry_timestamp       timestamp not null,
  update_userid         varchar(30) not null,
  update_timestamp      timestamp not null,
  revision_count        int not null,
  constraint seedlot_parent_tree_smp_mix_pk 
    primary key(seedlot_number, parent_tree_id, genetic_type_code, genetic_worth_code),
  constraint sl_ptree_smp_mix_sl_ptree_fk 
    foreign key(seedlot_number, parent_tree_id) references spar.seedlot_parent_tree(seedlot_number, parent_tree_id)
);

comment on table spar.seedlot_parent_tree_smp_mix is 'Supplemental Mass Polination for a given Seedlot, Parent Tree, Genetic Type and Genetic worth combination.';
comment on column spar.seedlot_parent_tree_smp_mix.seedlot_number is 'The unique number (key) assigned to a quantity of seed of a particular species and quality from a given location collected at a given time.';
comment on column spar.seedlot_parent_tree_smp_mix.parent_tree_id is 'A unique identifier for each Parent Tree.';
comment on column spar.seedlot_parent_tree_smp_mix.genetic_type_code is 'Describes the comparative measure of genetic value for a specific genetic trait of a Parent Tree. Examples are BV (Breeding Value) and CV (Clonal Value).';;
comment on column spar.seedlot_parent_tree_smp_mix.genetic_worth_code is 'A code describing various Genetic Worths.';;
comment on column spar.seedlot_parent_tree_smp_mix.genetic_quality_value is 'The Genetic Quality value based on the test assessment for a Parent Tree from a test no. and series.';
comment on column spar.seedlot_parent_tree_smp_mix.entry_userid is 'The userid of the individual that entered the Parent Tree SMP mix';
comment on column spar.seedlot_parent_tree_smp_mix.entry_timestamp is 'The time and date a Parent Tree SMP mix was entered onto the system.';
comment on column spar.seedlot_parent_tree_smp_mix.update_userid is 'The userid of the individual that changed the Parent Tree SMP mix.';
comment on column spar.seedlot_parent_tree_smp_mix.update_timestamp is 'The time and date a Parent Tree SMP mix was last updated on the system.';
comment on column spar.seedlot_parent_tree_smp_mix.revision_count is 'A counter used to ensure data integrity. This item should be incremented during each update.';

-- Adding parent_tree_number to seedlot_parent_tree table. Need to recreate the table that references smp_mix (smp_mix_gen_qlty).
drop table spar.smp_mix_gen_qlty;
drop table spar.smp_mix;

create table spar.smp_mix (
  seedlot_number     varchar(5) not null,
  parent_tree_id     int not null,
  parent_tree_number varchar(5) not null,
  amount_of_material int not null,
  proportion         decimal(20,10),
  entry_userid       varchar(30) not null, 
  entry_timestamp    timestamp not null, 
  update_userid      varchar(30) not null, 
  update_timestamp   timestamp not null, 
  revision_count     int not null,
  constraint smp_mix_pk 
    primary key(seedlot_number, parent_tree_id),
  constraint smp_mix_seedlot_fk 
    foreign key(seedlot_number) references spar.seedlot(seedlot_number)
);

comment on table spar.smp_mix is 'A table listing the individual Parent Trees that contributed to the Supplemental Mass Pollination mix of an Orchard Seedlot (Genetic Class = "A").';
comment on column spar.smp_mix.seedlot_number is 'The unique number (key) assigned to a quantity of seed of a particular species and quality from a given location collected at a given time.';
comment on column spar.smp_mix.parent_tree_id is 'A unique identifier for each Parent Tree.';
comment on column spar.smp_mix.parent_tree_number is 'The original registration number given to a Parent Tree in conjunction with a Species Code.';
comment on column spar.smp_mix.amount_of_material is 'The amount of Parent Tree material used for calculating the proportion of mix. Usually a volume recorded in mL.';
comment on column spar.smp_mix.proportion is 'The proportion of each Parent Tree material used for calculating SMP mix.';
comment on column spar.smp_mix.entry_userid is 'The userid of the individual that entered the SMP mix.';
comment on column spar.smp_mix.entry_timestamp is 'The time and date a SMP mix was entered onto the system.';
comment on column spar.smp_mix.update_userid is 'The userid of the individual that changed the SMP mix.';
comment on column spar.smp_mix.update_timestamp is 'The time and date a SMP mix was last updated on the system.';
comment on column spar.smp_mix.revision_count is 'A counter used to ensure data integrity. This item should be incremented during each update.';


create table spar.smp_mix_gen_qlty (
  seedlot_number        varchar(5) not null,
  parent_tree_id        int not null,
  genetic_type_code     varchar(2) not null,
  genetic_worth_code    varchar(3) not null,
  genetic_quality_value decimal(4, 1) not null,
  estimated_ind         boolean, 
  entry_userid          varchar(30) not null,
  entry_timestamp       timestamp not null,
  update_userid         varchar(30) not null,
  update_timestamp      timestamp not null,
  revision_count        int not null,
  constraint smp_mix_gen_qlty_pk 
    primary key(seedlot_number, parent_tree_id, genetic_type_code, genetic_worth_code),
  constraint smp_mix_gen_qlty_smp_mix_pk 
    foreign key(seedlot_number, parent_tree_id) references spar.smp_mix(seedlot_number, parent_tree_id)
);

comment on table spar.smp_mix_gen_qlty is 'The calculated Genetic Worth value(s) for the Supplemental Mass Pollination mix that contributed to an Orchard Seedlot (Genetic Class = "A") the Parent Trees contributing to a Seedlot.';
comment on column spar.smp_mix_gen_qlty.seedlot_number is 'The unique number (key) assigned to a quantity of seed of a particular species and quality from a given location collected at a given time.';
comment on column spar.smp_mix_gen_qlty.parent_tree_id is 'A unique identifier for each Parent Tree.';
comment on column spar.smp_mix_gen_qlty.genetic_type_code is 'Describes the comparative measure of genetic value for a specific genetic trait of a Parent Tree. Examples are BV (Breeding Value) and CV (Clonal Value).';
comment on column spar.smp_mix_gen_qlty.genetic_worth_code is 'A code describing various Genetic Worths.';
comment on column spar.smp_mix_gen_qlty.genetic_quality_value is 'The Genetic Quality value based on the test assessment for a Parent Tree from a test no. and series.';
comment on column spar.smp_mix_gen_qlty.entry_userid is 'The userid of the individual that entered the SMP mix Genetic Quality.';
comment on column spar.smp_mix_gen_qlty.entry_timestamp is 'The time and date a SMP mix Genetic Quality was entered onto the system.';
comment on column spar.smp_mix_gen_qlty.update_userid is 'The userid of the individual that changed the SMP mix Genetic Quality.';
comment on column spar.smp_mix_gen_qlty.update_timestamp is 'The time and date a SMP mix Genetic Quality was last updated on the system.';
comment on column spar.smp_mix_gen_qlty.revision_count is 'A counter used to ensure data integrity. This item should be incremented during each update.';

create table spar.seedlot_smp_mix (
  seedlot_number        varchar(5) not null,
  genetic_worth_code    varchar(3) not null,
  genetic_quality_value decimal(4, 1) not null,
  entry_userid          varchar(30) not null,
  entry_timestamp       timestamp not null,
  update_userid         varchar(30) not null,
  update_timestamp      timestamp not null,
  revision_count        int not null,
  constraint seedlot_smp_mix_pk
    primary key(seedlot_number, genetic_worth_code),
  constraint seedlot_smp_mix_seedlot_fk
    foreign key(seedlot_number) references spar.seedlot(seedlot_number)
);