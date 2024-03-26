create table if not exists spar.seedlot_audit (
  seedlot_audit_id                serial      not null,
  audit_date                      timestamp   default now() not null,
  spar_audit_code                 varchar(1)  default 'I' not null,
  db_user						  text        not null,
  audit_revision_version		  int         not null default 1,
  seedlot_number                  varchar(5)  not null,
  seedlot_status_code             varchar(3)  not null,
  applicant_client_number         varchar(8),
  applicant_locn_code             varchar(2),
  applicant_email_address         varchar(100),
  vegetation_code                 varchar(8),
  genetic_class_code              varchar(1),
  seedlot_source_code             varchar(3),
  to_be_registrd_ind              boolean,
  bc_source_ind                   boolean,
  collection_client_number        varchar(8),
  collection_locn_code            varchar(2),
  collection_start_date           timestamp,
  collection_end_date             timestamp,
  no_of_containers                decimal(6, 2),
  vol_per_container               decimal(6, 2),
  clctn_volume                    decimal(6, 2),
  seedlot_comment                 varchar(2000),
  interm_strg_client_number       varchar(8),
  interm_strg_locn_code           varchar(2),
  interm_strg_st_date             timestamp,
  interm_strg_end_date            timestamp,
  interm_facility_code            varchar(3),
  female_gametic_mthd_code        varchar(4),
  male_gametic_mthd_code          varchar(4),
  controlled_cross_ind            boolean,
  biotech_processes_ind           boolean,
  pollen_contamination_ind        boolean,
  pollen_contamination_pct        int,
  contaminant_pollen_bv           decimal(4, 1),
  pollen_contamination_mthd_code  varchar(4),
  total_parent_trees              int,
  smp_success_pct                 int,
  effective_pop_size              decimal(5, 1),
  smp_parents_outside             int,
  non_orchard_pollen_contam_pct   int,
  extractory_client_number        varchar(8),
  extractory_locn_code            varchar(2),
  extraction_st_date              timestamp,
  extraction_end_date             timestamp,
  temporary_strg_client_number    varchar(8),
  temporary_strg_locn_code        varchar(2),
  temporary_strg_start_date       timestamp,
  temporary_strg_end_date         timestamp,
  interm_strg_locn                varchar(55),
  declared_userid                 varchar(30),
  declared_timestamp              timestamp,
  entry_userid                    varchar(30) not null,
  entry_timestamp                 timestamp not null,
  update_userid                   varchar(30) not null,
  update_timestamp                timestamp not null,
  revision_count                  int not null,
  constraint seedlot_audit_pk
    primary key(seedlot_audit_id)
);


comment on column spar.seedlot_audit.seedlot_audit_id               is 'Serial Incremental number referring to a unique primary key for this table';
comment on column spar.seedlot_audit.audit_date                     is 'Date when this audit record was created (representing with some precision when the statement was executed)'; 
comment on column spar.seedlot_audit.spar_audit_code                is 'Type of statement executed in spar.seedlot table: I=INSERT, U=UPDATE, D=DELETE. Note that DELETE record represents only the latest data whiped out from the seedlot table';
comment on column spar.seedlot_audit.db_user                 		is 'Postgres database user who executed the statement in spar.seedlot table';
comment on column spar.seedlot_audit.audit_revision_version         is 'Record registered version for audit purposes.';
comment on column spar.seedlot_audit.seedlot_number                 is 'Referring value for spar.seedlot.seedlot_number column';
comment on column spar.seedlot_audit.seedlot_status_code            is 'Referring value for spar.seedlot.seedlot_status_code column';
comment on column spar.seedlot_audit.applicant_client_number        is 'Referring value for spar.seedlot.applicant_client_number column';
comment on column spar.seedlot_audit.applicant_locn_code            is 'Referring value for spar.seedlot.applicant_locn_code column';
comment on column spar.seedlot_audit.applicant_email_address        is 'Referring value for spar.seedlot.applicant_email_address column';
comment on column spar.seedlot_audit.vegetation_code                is 'Referring value for spar.seedlot.vegetation_code column';
comment on column spar.seedlot_audit.genetic_class_code             is 'Referring value for spar.seedlot.genetic_class_code column';
comment on column spar.seedlot_audit.seedlot_source_code            is 'Referring value for spar.seedlot.seedlot_source_code column';
comment on column spar.seedlot_audit.to_be_registrd_ind             is 'Referring value for spar.seedlot.to_be_registrd_ind column';
comment on column spar.seedlot_audit.bc_source_ind                  is 'Referring value for spar.seedlot.bc_source_ind column';
comment on column spar.seedlot_audit.collection_client_number       is 'Referring value for spar.seedlot.collection_client_number column';
comment on column spar.seedlot_audit.collection_locn_code           is 'Referring value for spar.seedlot.collection_locn_code column';
comment on column spar.seedlot_audit.collection_start_date          is 'Referring value for spar.seedlot.collection_start_date column';
comment on column spar.seedlot_audit.collection_end_date            is 'Referring value for spar.seedlot.collection_end_date column';
comment on column spar.seedlot_audit.no_of_containers               is 'Referring value for spar.seedlot.no_of_containers column';
comment on column spar.seedlot_audit.vol_per_container              is 'Referring value for spar.seedlot.vol_per_container column';
comment on column spar.seedlot_audit.clctn_volume                   is 'Referring value for spar.seedlot.clctn_volume column';
comment on column spar.seedlot_audit.seedlot_comment                is 'Referring value for spar.seedlot.seedlot_comment column';
comment on column spar.seedlot_audit.interm_strg_client_number      is 'Referring value for spar.seedlot.interm_strg_client_number column';
comment on column spar.seedlot_audit.interm_strg_locn_code          is 'Referring value for spar.seedlot.interm_strg_locn_code column';
comment on column spar.seedlot_audit.interm_strg_st_date            is 'Referring value for spar.seedlot.interm_strg_st_date column';
comment on column spar.seedlot_audit.interm_strg_end_date           is 'Referring value for spar.seedlot.interm_strg_end_date column';
comment on column spar.seedlot_audit.interm_facility_code           is 'Referring value for spar.seedlot.interm_facility_code column';
comment on column spar.seedlot_audit.female_gametic_mthd_code       is 'Referring value for spar.seedlot.female_gametic_mthd_code column';
comment on column spar.seedlot_audit.male_gametic_mthd_code         is 'Referring value for spar.seedlot.male_gametic_mthd_code column';
comment on column spar.seedlot_audit.controlled_cross_ind           is 'Referring value for spar.seedlot.controlled_cross_ind column';
comment on column spar.seedlot_audit.biotech_processes_ind          is 'Referring value for spar.seedlot.biotech_processes_ind column';
comment on column spar.seedlot_audit.pollen_contamination_ind       is 'Referring value for spar.seedlot.pollen_contamination_ind column';
comment on column spar.seedlot_audit.pollen_contamination_pct       is 'Referring value for spar.seedlot.pollen_contamination_pct column';
comment on column spar.seedlot_audit.contaminant_pollen_bv          is 'Referring value for spar.seedlot.contaminant_pollen_bv column';
comment on column spar.seedlot_audit.pollen_contamination_mthd_code is 'Referring value for spar.seedlot.pollen_contamination_mthd_code column';
comment on column spar.seedlot_audit.total_parent_trees             is 'Referring value for spar.seedlot.total_parent_trees column';
comment on column spar.seedlot_audit.smp_success_pct                is 'Referring value for spar.seedlot.smp_success_pct column';
comment on column spar.seedlot_audit.effective_pop_size             is 'Referring value for spar.seedlot.effective_pop_size column';
comment on column spar.seedlot_audit.smp_parents_outside            is 'Referring value for spar.seedlot.smp_parents_outside column';
comment on column spar.seedlot_audit.non_orchard_pollen_contam_pct  is 'Referring value for spar.seedlot.non_orchard_pollen_contam_pct column';
comment on column spar.seedlot_audit.extractory_client_number       is 'Referring value for spar.seedlot.extractory_client_number column';
comment on column spar.seedlot_audit.extractory_locn_code           is 'Referring value for spar.seedlot.extractory_locn_code column';
comment on column spar.seedlot_audit.extraction_st_date             is 'Referring value for spar.seedlot.extraction_st_date column';
comment on column spar.seedlot_audit.extraction_end_date            is 'Referring value for spar.seedlot.extraction_end_date column';
comment on column spar.seedlot_audit.temporary_strg_client_number   is 'Referring value for spar.seedlot.temporary_strg_client_number column';
comment on column spar.seedlot_audit.temporary_strg_locn_code       is 'Referring value for spar.seedlot.temporary_strg_locn_code column';
comment on column spar.seedlot_audit.temporary_strg_start_date      is 'Referring value for spar.seedlot.temporary_strg_start_date column';
comment on column spar.seedlot_audit.temporary_strg_end_date        is 'Referring value for spar.seedlot.temporary_strg_end_date column';
comment on column spar.seedlot_audit.declared_userid                is 'Referring value for spar.seedlot.declared_userid column';
comment on column spar.seedlot_audit.declared_timestamp             is 'Referring value for spar.seedlot.declared_timestamp column';
comment on column spar.seedlot_audit.entry_userid                   is 'Referring value for spar.seedlot.entry_userid column';
comment on column spar.seedlot_audit.entry_timestamp                is 'Referring value for spar.seedlot.entry_timestamp column';
comment on column spar.seedlot_audit.update_userid                  is 'Referring value for spar.seedlot.update_userid column';
comment on column spar.seedlot_audit.update_timestamp               is 'Referring value for spar.seedlot.update_timestamp column';
comment on column spar.seedlot_audit.revision_count                 is 'Referring value for spar.seedlot.revision_count column';