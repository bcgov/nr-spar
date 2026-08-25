-- =============================================================================
-- V50: Seedlot B-class (Natural Stand) schema additions
--
-- Adds:
--   1. B-class columns to spar.seedlot
--   2. spar.seedlot_collection_geometry - collection area polygon (PostGIS)
--   3. Rename seedlot_registration_a_class_save -> seedlot_registration_save
--        (shared wizard-draft table for both A-class and B-class seedlots;
--         seedlot_number is already unique per seedlot and encodes the class)
--   5. B-class columns to spar.seedlot_audit
--   6. Updated seedlot audit trigger
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. New B-class columns on spar.seedlot
-- -----------------------------------------------------------------------------
alter table spar.seedlot
  add column superior_provenance_ind      boolean, -- drop this
  add column org_unit_no                  integer,
  add column collection_location_desc     varchar(30),
  add column provenance_id                integer,
  add column collection_standard_met_ind  boolean,
  add column collection_area_radius       decimal(6,1),
  add column capture_method_code          varchar(30),
  add column seed_plan_zone_code          varchar(3),
  add column collection_seed_plan_zone_ind boolean,
  add column seed_coast_area_code         varchar(3),
  add column collection_bgc_validated_ind boolean,
  add column bec_override_ind             boolean,
  add column bec_override_comment         varchar(2000),
  add column number_trees_from_code       varchar(3),
  add column is_lot_split_ind             boolean;

comment on column spar.seedlot.superior_provenance_ind      is 'True when this is a Superior Provenance seedlot, false for a standard natural stand.';
comment on column spar.seedlot.org_unit_no                  is 'The district org unit responsible for the collection area. Required when bc_source_ind is true.';
comment on column spar.seedlot.collection_location_desc     is 'Text description of the collection location. Used when superior_provenance_ind is false.';
comment on column spar.seedlot.provenance_id                is 'Oracle SUPERIOR_PROVENANCE provenance identifier (stored as integer; no Postgres FK). Required when superior_provenance_ind is true.';
comment on column spar.seedlot.collection_standard_met_ind  is 'True when the CFS Appendix 5 collection standard has been met.';
comment on column spar.seedlot.collection_area_radius       is 'The radius in km of the collection area (0.1–999.9).';
comment on column spar.seedlot.capture_method_code          is 'The method used to capture the collection area geometry (Oracle CORP_CAPTURE_METHOD code, max 28 chars e.g. monoRestitution).';
comment on column spar.seedlot.seed_plan_zone_code          is 'The Seed Planning Zone code for the collection site. Distinct from the AOU SPZ child table rows.';
comment on column spar.seedlot.collection_seed_plan_zone_ind is 'Indicator flag related to the collection Seed Planning Zone.';
comment on column spar.seedlot.seed_coast_area_code         is 'Coastal geographic area code. Required when seed_plan_zone_code = ''M''.';
comment on column spar.seedlot.collection_bgc_validated_ind is 'True when the BEC zone has been validated for the collection area. Must be true to register.';
comment on column spar.seedlot.bec_override_ind             is 'True when the collection polygon spans multiple BEC zones and an override has been accepted.';
comment on column spar.seedlot.bec_override_comment         is 'Explanation comment required when bec_override_ind is true.';
comment on column spar.seedlot.number_trees_from_code       is 'Code indicating the number of trees the seed was collected from.';
comment on column spar.seedlot.is_lot_split_ind             is 'True when this seedlot was created by splitting another lot. Affects CFS validation.';

-- -----------------------------------------------------------------------------
-- 3. Collection area geometry table
--    One row per seedlot; holds the natural-stand collection polygon.
--    PostGIS extension already enabled (V31).
--    Geometry stored in BC Albers (SRID 3005) to match Oracle SDO source.
--    feature_area / feature_perimeter computed via ST_Area / ST_Perimeter on save.
-- -----------------------------------------------------------------------------
create table spar.seedlot_collection_geometry (
  seedlot_number     varchar(5)             not null,
  geometry           geometry(GEOMETRY, 3005),
  feature_class_skey integer,
  feature_area       decimal,
  feature_perimeter  decimal,
  observation_date   timestamp,
  entry_userid       varchar(30)            not null,
  entry_timestamp    timestamp              not null default current_timestamp,
  update_userid      varchar(30)            not null,
  update_timestamp   timestamp              not null default current_timestamp,
  revision_count     integer                not null,
  constraint seedlot_collection_geometry_pk
    primary key (seedlot_number),
  constraint seedlot_collection_geometry_seedlot_fk
    foreign key (seedlot_number) references spar.seedlot(seedlot_number)
);

comment on table  spar.seedlot_collection_geometry                   is 'Stores the natural-stand collection area polygon for Class B seedlots. Written only on b-class-submission, not during wizard autosave.';
comment on column spar.seedlot_collection_geometry.seedlot_number    is 'The seedlot number. PK and FK to spar.seedlot.';
comment on column spar.seedlot_collection_geometry.geometry          is 'The collection area polygon or multipolygon in BC Albers (SRID 3005).';
comment on column spar.seedlot_collection_geometry.feature_class_skey is 'Constant feature class key carried over from Oracle spr_spatial_utils.';
comment on column spar.seedlot_collection_geometry.feature_area      is 'The computed area of the collection polygon (m²), from ST_Area.';
comment on column spar.seedlot_collection_geometry.feature_perimeter is 'The computed perimeter of the collection polygon (m), from ST_Perimeter.';
comment on column spar.seedlot_collection_geometry.observation_date  is 'The date the geometry was observed or recorded.';
comment on column spar.seedlot_collection_geometry.entry_userid      is 'The userid of the individual that created this record.';
comment on column spar.seedlot_collection_geometry.entry_timestamp   is 'The timestamp this record was created.';
comment on column spar.seedlot_collection_geometry.update_userid     is 'The userid of the individual that last updated this record.';
comment on column spar.seedlot_collection_geometry.update_timestamp  is 'The timestamp this record was last updated.';
comment on column spar.seedlot_collection_geometry.revision_count    is 'Optimistic locking counter. Increment on each update.';

-- Timestamps set by JPA AuditInformation (@PrePersist / @PreUpdate), not DB triggers.
-- V39 dropped trigger_set_entry_timestamp / trigger_set_update_timestamp.

-- -----------------------------------------------------------------------------
-- 4. Rename wizard draft table to a class-neutral name.
--    Both A-class (63xxx) and B-class (53xxx) seedlots share the same draft
--    table
-- -----------------------------------------------------------------------------
alter table spar.seedlot_registration_a_class_save
  rename to seedlot_registration_save;

alter table spar.seedlot_registration_save
  rename constraint registration_form_a_class_pk to registration_form_save_pk;

alter table spar.seedlot_registration_save
  rename constraint registration_form_a_class_seedlot_fk to registration_form_save_seedlot_fk;

comment on table  spar.seedlot_registration_save                 is 'Stores wizard draft progress for in-flight seedlot registrations (both A-class and B-class). Not synced to Oracle. Cleared or retained after successful submission.';
comment on column spar.seedlot_registration_save.seedlot_number  is 'The seedlot number. PK and FK to spar.seedlot. Encodes the genetic class via its numeric range.';
comment on column spar.seedlot_registration_save.all_step_data   is 'JSON blob containing the serialized wizard state for all steps.';
comment on column spar.seedlot_registration_save.progress_status is 'JSON blob containing per-step completion and current-step flags.';
comment on column spar.seedlot_registration_save.revision_count  is 'Optimistic locking counter for autosave conflict detection.';

-- -----------------------------------------------------------------------------
-- 5. Mirror B-class columns on spar.seedlot_audit
-- -----------------------------------------------------------------------------
alter table spar.seedlot_audit
  add column superior_provenance_ind      boolean,
  add column org_unit_no                  integer,
  add column collection_location_desc     varchar(30),
  add column provenance_id                integer,
  add column collection_standard_met_ind  boolean,
  add column collection_area_radius       decimal(6,1),
  add column capture_method_code          varchar(30),
  add column seed_plan_zone_code          varchar(3),
  add column collection_seed_plan_zone_ind boolean,
  add column seed_coast_area_code         varchar(3),
  add column collection_bgc_validated_ind boolean,
  add column bec_override_ind             boolean,
  add column bec_override_comment         varchar(2000),
  add column number_trees_from_code       varchar(3),
  add column is_lot_split_ind             boolean;

comment on column spar.seedlot_audit.superior_provenance_ind          is 'Referring value for spar.seedlot.superior_provenance_ind column';
comment on column spar.seedlot_audit.org_unit_no                 is 'Referring value for spar.seedlot.org_unit_no column';
comment on column spar.seedlot_audit.collection_location_desc        is 'Referring value for spar.seedlot.collection_location_desc column';
comment on column spar.seedlot_audit.provenance_id               is 'Referring value for spar.seedlot.provenance_id column';
comment on column spar.seedlot_audit.collection_standard_met_ind is 'Referring value for spar.seedlot.collection_standard_met_ind column';
comment on column spar.seedlot_audit.collection_area_radius      is 'Referring value for spar.seedlot.collection_area_radius column';
comment on column spar.seedlot_audit.capture_method_code         is 'Referring value for spar.seedlot.capture_method_code column';
comment on column spar.seedlot_audit.seed_plan_zone_code         is 'Referring value for spar.seedlot.seed_plan_zone_code column';
comment on column spar.seedlot_audit.collection_seed_plan_zone_ind          is 'Referring value for spar.seedlot.collection_seed_plan_zone_ind column';
comment on column spar.seedlot_audit.seed_coast_area_code        is 'Referring value for spar.seedlot.seed_coast_area_code column';
comment on column spar.seedlot_audit.collection_bgc_validated_ind          is 'Referring value for spar.seedlot.collection_bgc_validated_ind column';
comment on column spar.seedlot_audit.bec_override_ind            is 'Referring value for spar.seedlot.bec_override_ind column';
comment on column spar.seedlot_audit.bec_override_comment        is 'Referring value for spar.seedlot.bec_override_comment column';
comment on column spar.seedlot_audit.number_trees_from_code        is 'Referring value for spar.seedlot.number_trees_from_code column';
comment on column spar.seedlot_audit.is_lot_split_ind            is 'Referring value for spar.seedlot.is_lot_split_ind column';

-- -----------------------------------------------------------------------------
-- 6. Update seedlot audit trigger to include B-class columns
--    Follows the V45 pattern: basic seedlot columns + bgc_zone_description
--    + coancestry + new B-class columns appended at end.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION spar.seedlot_if_modified_func() RETURNS trigger AS $body$
DECLARE
    v_old_data TEXT;
    v_new_data TEXT;
  v_auditrevision int;
BEGIN
    if (TG_OP = 'UPDATE') then
        v_old_data := ROW(OLD.*);
        v_new_data := ROW(NEW.*);
    /* AUDIT REVISION number used to order the statements executed in the row */
    v_auditrevision := (SELECT MAX(COALESCE(audit_revision_version,1))+1 FROM spar.seedlot_audit WHERE seedlot_number = NEW.seedlot_number);
        INSERT INTO spar.seedlot_audit (spar_audit_code,db_user,audit_revision_version,seedlot_number,seedlot_status_code,applicant_client_number,applicant_locn_code,applicant_email_address,vegetation_code,genetic_class_code,seedlot_source_code,to_be_registrd_ind,bc_source_ind,collection_client_number,collection_locn_code,collection_start_date,collection_end_date,no_of_containers,vol_per_container,clctn_volume,seedlot_comment,interm_strg_client_number,interm_strg_locn_code,interm_strg_st_date,interm_strg_end_date,interm_facility_code,female_gametic_mthd_code,male_gametic_mthd_code,controlled_cross_ind,biotech_processes_ind,pollen_contamination_ind,pollen_contamination_pct,contaminant_pollen_bv,pollen_contamination_mthd_code,total_parent_trees,smp_success_pct,effective_pop_size,smp_parents_outside,non_orchard_pollen_contam_pct,extractory_client_number,extractory_locn_code,extraction_st_date,extraction_end_date,temporary_strg_client_number,temporary_strg_locn_code,temporary_strg_start_date,temporary_strg_end_date,interm_strg_locn,declared_userid,declared_timestamp,entry_userid,entry_timestamp,update_userid,update_timestamp,revision_count,bgc_zone_description,coancestry,superior_provenance_ind,org_unit_no,collection_location_desc,provenance_id,collection_standard_met_ind,collection_area_radius,capture_method_code,seed_plan_zone_code,collection_seed_plan_zone_ind,seed_coast_area_code,collection_bgc_validated_ind,bec_override_ind,bec_override_comment,number_trees_from_code,is_lot_split_ind)
    VALUES(
    /*spar_audit_code                */ 'U',
    /*db_user                        */ session_user::TEXT,
    /*audit_revision_version         */ coalesce(v_auditrevision,1),
    /*seedlot_number                 */ NEW.seedlot_number,
    /*seedlot_status_code            */ NEW.seedlot_status_code,
    /*applicant_client_number        */ NEW.applicant_client_number,
    /*applicant_locn_code            */ NEW.applicant_locn_code,
    /*applicant_email_address        */ NEW.applicant_email_address,
    /*vegetation_code                */ NEW.vegetation_code,
    /*genetic_class_code             */ NEW.genetic_class_code,
    /*seedlot_source_code            */ NEW.seedlot_source_code,
    /*to_be_registrd_ind             */ NEW.to_be_registrd_ind,
    /*bc_source_ind                  */ NEW.bc_source_ind,
    /*collection_client_number       */ NEW.collection_client_number,
    /*collection_locn_code           */ NEW.collection_locn_code,
    /*collection_start_date          */ NEW.collection_start_date,
    /*collection_end_date            */ NEW.collection_end_date,
    /*no_of_containers               */ NEW.no_of_containers,
    /*vol_per_container              */ NEW.vol_per_container,
    /*clctn_volume                   */ NEW.clctn_volume,
    /*seedlot_comment                */ NEW.seedlot_comment,
    /*interm_strg_client_number      */ NEW.interm_strg_client_number,
    /*interm_strg_locn_code          */ NEW.interm_strg_locn_code,
    /*interm_strg_st_date            */ NEW.interm_strg_st_date,
    /*interm_strg_end_date           */ NEW.interm_strg_end_date,
    /*interm_facility_code           */ NEW.interm_facility_code,
    /*female_gametic_mthd_code       */ NEW.female_gametic_mthd_code,
    /*male_gametic_mthd_code         */ NEW.male_gametic_mthd_code,
    /*controlled_cross_ind           */ NEW.controlled_cross_ind,
    /*biotech_processes_ind          */ NEW.biotech_processes_ind,
    /*pollen_contamination_ind       */ NEW.pollen_contamination_ind,
    /*pollen_contamination_pct       */ NEW.pollen_contamination_pct,
    /*contaminant_pollen_bv          */ NEW.contaminant_pollen_bv,
    /*pollen_contamination_mthd_code */ NEW.pollen_contamination_mthd_code,
    /*total_parent_trees             */ NEW.total_parent_trees,
    /*smp_success_pct                */ NEW.smp_success_pct,
    /*effective_pop_size             */ NEW.effective_pop_size,
    /*smp_parents_outside            */ NEW.smp_parents_outside,
    /*non_orchard_pollen_contam_pct  */ NEW.non_orchard_pollen_contam_pct,
    /*extractory_client_number       */ NEW.extractory_client_number,
    /*extractory_locn_code           */ NEW.extractory_locn_code,
    /*extraction_st_date             */ NEW.extraction_st_date,
    /*extraction_end_date            */ NEW.extraction_end_date,
    /*temporary_strg_client_number   */ NEW.temporary_strg_client_number,
    /*temporary_strg_locn_code       */ NEW.temporary_strg_locn_code,
    /*temporary_strg_start_date      */ NEW.temporary_strg_start_date,
    /*temporary_strg_end_date        */ NEW.temporary_strg_end_date,
    /*interm_strg_locn               */ NEW.interm_strg_locn,
    /*declared_userid                */ NEW.declared_userid,
    /*declared_timestamp             */ NEW.declared_timestamp,
    /*entry_userid                   */ NEW.entry_userid,
    /*entry_timestamp                */ NEW.entry_timestamp,
    /*update_userid                  */ NEW.update_userid,
    /*update_timestamp               */ NEW.update_timestamp,
    /*revision_count                 */ NEW.revision_count,
    /*bgc_zone_description           */ NEW.bgc_zone_description,
    /*coancestry                     */ NEW.coancestry,
    /*superior_provenance_ind             */ NEW.superior_provenance_ind,
    /*org_unit_no                    */ NEW.org_unit_no,
    /*collection_location_desc           */ NEW.collection_location_desc,
    /*provenance_id                  */ NEW.provenance_id,
    /*collection_standard_met_ind    */ NEW.collection_standard_met_ind,
    /*collection_area_radius         */ NEW.collection_area_radius,
    /*capture_method_code            */ NEW.capture_method_code,
    /*seed_plan_zone_code            */ NEW.seed_plan_zone_code,
    /*collection_seed_plan_zone_ind             */ NEW.collection_seed_plan_zone_ind,
    /*seed_coast_area_code           */ NEW.seed_coast_area_code,
    /*collection_bgc_validated_ind             */ NEW.collection_bgc_validated_ind,
    /*bec_override_ind               */ NEW.bec_override_ind,
    /*bec_override_comment           */ NEW.bec_override_comment,
    /*number_trees_from_code           */ NEW.number_trees_from_code,
    /*is_lot_split_ind               */ NEW.is_lot_split_ind
    );
        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        v_old_data := ROW(OLD.*);
    /* AUDIT REVISION number used to order the statements executed in the row */
    v_auditrevision := (SELECT MAX(COALESCE(audit_revision_version,1))+1 FROM spar.seedlot_audit WHERE seedlot_number = OLD.seedlot_number) ;
    INSERT INTO spar.seedlot_audit (spar_audit_code,db_user,audit_revision_version,seedlot_number,seedlot_status_code,applicant_client_number,applicant_locn_code,applicant_email_address,vegetation_code,genetic_class_code,seedlot_source_code,to_be_registrd_ind,bc_source_ind,collection_client_number,collection_locn_code,collection_start_date,collection_end_date,no_of_containers,vol_per_container,clctn_volume,seedlot_comment,interm_strg_client_number,interm_strg_locn_code,interm_strg_st_date,interm_strg_end_date,interm_facility_code,female_gametic_mthd_code,male_gametic_mthd_code,controlled_cross_ind,biotech_processes_ind,pollen_contamination_ind,pollen_contamination_pct,contaminant_pollen_bv,pollen_contamination_mthd_code,total_parent_trees,smp_success_pct,effective_pop_size,smp_parents_outside,non_orchard_pollen_contam_pct,extractory_client_number,extractory_locn_code,extraction_st_date,extraction_end_date,temporary_strg_client_number,temporary_strg_locn_code,temporary_strg_start_date,temporary_strg_end_date,interm_strg_locn,declared_userid,declared_timestamp,entry_userid,entry_timestamp,update_userid,update_timestamp,revision_count,bgc_zone_description,coancestry,superior_provenance_ind,org_unit_no,collection_location_desc,provenance_id,collection_standard_met_ind,collection_area_radius,capture_method_code,seed_plan_zone_code,collection_seed_plan_zone_ind,seed_coast_area_code,collection_bgc_validated_ind,bec_override_ind,bec_override_comment,number_trees_from_code,is_lot_split_ind)
    VALUES(
    /*spar_audit_code                */ 'D',
    /*db_user                        */ session_user::TEXT,
    /*audit_revision_version         */ coalesce(v_auditrevision,1),
    /*seedlot_number                 */ OLD.seedlot_number,
    /*seedlot_status_code            */ OLD.seedlot_status_code,
    /*applicant_client_number        */ OLD.applicant_client_number,
    /*applicant_locn_code            */ OLD.applicant_locn_code,
    /*applicant_email_address        */ OLD.applicant_email_address,
    /*vegetation_code                */ OLD.vegetation_code,
    /*genetic_class_code             */ OLD.genetic_class_code,
    /*seedlot_source_code            */ OLD.seedlot_source_code,
    /*to_be_registrd_ind             */ OLD.to_be_registrd_ind,
    /*bc_source_ind                  */ OLD.bc_source_ind,
    /*collection_client_number       */ OLD.collection_client_number,
    /*collection_locn_code           */ OLD.collection_locn_code,
    /*collection_start_date          */ OLD.collection_start_date,
    /*collection_end_date            */ OLD.collection_end_date,
    /*no_of_containers               */ OLD.no_of_containers,
    /*vol_per_container              */ OLD.vol_per_container,
    /*clctn_volume                   */ OLD.clctn_volume,
    /*seedlot_comment                */ OLD.seedlot_comment,
    /*interm_strg_client_number      */ OLD.interm_strg_client_number,
    /*interm_strg_locn_code          */ OLD.interm_strg_locn_code,
    /*interm_strg_st_date            */ OLD.interm_strg_st_date,
    /*interm_strg_end_date           */ OLD.interm_strg_end_date,
    /*interm_facility_code           */ OLD.interm_facility_code,
    /*female_gametic_mthd_code       */ OLD.female_gametic_mthd_code,
    /*male_gametic_mthd_code         */ OLD.male_gametic_mthd_code,
    /*controlled_cross_ind           */ OLD.controlled_cross_ind,
    /*biotech_processes_ind          */ OLD.biotech_processes_ind,
    /*pollen_contamination_ind       */ OLD.pollen_contamination_ind,
    /*pollen_contamination_pct       */ OLD.pollen_contamination_pct,
    /*contaminant_pollen_bv          */ OLD.contaminant_pollen_bv,
    /*pollen_contamination_mthd_code */ OLD.pollen_contamination_mthd_code,
    /*total_parent_trees             */ OLD.total_parent_trees,
    /*smp_success_pct                */ OLD.smp_success_pct,
    /*effective_pop_size             */ OLD.effective_pop_size,
    /*smp_parents_outside            */ OLD.smp_parents_outside,
    /*non_orchard_pollen_contam_pct  */ OLD.non_orchard_pollen_contam_pct,
    /*extractory_client_number       */ OLD.extractory_client_number,
    /*extractory_locn_code           */ OLD.extractory_locn_code,
    /*extraction_st_date             */ OLD.extraction_st_date,
    /*extraction_end_date            */ OLD.extraction_end_date,
    /*temporary_strg_client_number   */ OLD.temporary_strg_client_number,
    /*temporary_strg_locn_code       */ OLD.temporary_strg_locn_code,
    /*temporary_strg_start_date      */ OLD.temporary_strg_start_date,
    /*temporary_strg_end_date        */ OLD.temporary_strg_end_date,
    /*interm_strg_locn               */ OLD.interm_strg_locn,
    /*declared_userid                */ OLD.declared_userid,
    /*declared_timestamp             */ OLD.declared_timestamp,
    /*entry_userid                   */ OLD.entry_userid,
    /*entry_timestamp                */ OLD.entry_timestamp,
    /*update_userid                  */ OLD.update_userid,
    /*update_timestamp               */ OLD.update_timestamp,
    /*revision_count                 */ OLD.revision_count,
    /*bgc_zone_description           */ OLD.bgc_zone_description,
    /*coancestry                     */ OLD.coancestry,
    /*superior_provenance_ind             */ OLD.superior_provenance_ind,
    /*org_unit_no                    */ OLD.org_unit_no,
    /*collection_location_desc           */ OLD.collection_location_desc,
    /*provenance_id                  */ OLD.provenance_id,
    /*collection_standard_met_ind    */ OLD.collection_standard_met_ind,
    /*collection_area_radius         */ OLD.collection_area_radius,
    /*capture_method_code            */ OLD.capture_method_code,
    /*seed_plan_zone_code            */ OLD.seed_plan_zone_code,
    /*collection_seed_plan_zone_ind             */ OLD.collection_seed_plan_zone_ind,
    /*seed_coast_area_code           */ OLD.seed_coast_area_code,
    /*collection_bgc_validated_ind             */ OLD.collection_bgc_validated_ind,
    /*bec_override_ind               */ OLD.bec_override_ind,
    /*bec_override_comment           */ OLD.bec_override_comment,
    /*number_trees_from_code           */ OLD.number_trees_from_code,
    /*is_lot_split_ind               */ OLD.is_lot_split_ind
    );
        RETURN OLD;
    elsif (TG_OP = 'INSERT') then
        v_new_data := ROW(NEW.*);
        INSERT INTO spar.seedlot_audit (spar_audit_code,db_user,audit_revision_version,seedlot_number,seedlot_status_code,applicant_client_number,applicant_locn_code,applicant_email_address,vegetation_code,genetic_class_code,seedlot_source_code,to_be_registrd_ind,bc_source_ind,collection_client_number,collection_locn_code,collection_start_date,collection_end_date,no_of_containers,vol_per_container,clctn_volume,seedlot_comment,interm_strg_client_number,interm_strg_locn_code,interm_strg_st_date,interm_strg_end_date,interm_facility_code,female_gametic_mthd_code,male_gametic_mthd_code,controlled_cross_ind,biotech_processes_ind,pollen_contamination_ind,pollen_contamination_pct,contaminant_pollen_bv,pollen_contamination_mthd_code,total_parent_trees,smp_success_pct,effective_pop_size,smp_parents_outside,non_orchard_pollen_contam_pct,extractory_client_number,extractory_locn_code,extraction_st_date,extraction_end_date,temporary_strg_client_number,temporary_strg_locn_code,temporary_strg_start_date,temporary_strg_end_date,interm_strg_locn,declared_userid,declared_timestamp,entry_userid,entry_timestamp,update_userid,update_timestamp,revision_count,bgc_zone_description,coancestry,superior_provenance_ind,org_unit_no,collection_location_desc,provenance_id,collection_standard_met_ind,collection_area_radius,capture_method_code,seed_plan_zone_code,collection_seed_plan_zone_ind,seed_coast_area_code,collection_bgc_validated_ind,bec_override_ind,bec_override_comment,number_trees_from_code,is_lot_split_ind)
    VALUES(
    /*spar_audit_code                */ 'I',
    /*db_user                        */ session_user::TEXT,
    /*audit_revision_version         */ 1,
    /*seedlot_number                 */ NEW.seedlot_number,
    /*seedlot_status_code            */ NEW.seedlot_status_code,
    /*applicant_client_number        */ NEW.applicant_client_number,
    /*applicant_locn_code            */ NEW.applicant_locn_code,
    /*applicant_email_address        */ NEW.applicant_email_address,
    /*vegetation_code                */ NEW.vegetation_code,
    /*genetic_class_code             */ NEW.genetic_class_code,
    /*seedlot_source_code            */ NEW.seedlot_source_code,
    /*to_be_registrd_ind             */ NEW.to_be_registrd_ind,
    /*bc_source_ind                  */ NEW.bc_source_ind,
    /*collection_client_number       */ NEW.collection_client_number,
    /*collection_locn_code           */ NEW.collection_locn_code,
    /*collection_start_date          */ NEW.collection_start_date,
    /*collection_end_date            */ NEW.collection_end_date,
    /*no_of_containers               */ NEW.no_of_containers,
    /*vol_per_container              */ NEW.vol_per_container,
    /*clctn_volume                   */ NEW.clctn_volume,
    /*seedlot_comment                */ NEW.seedlot_comment,
    /*interm_strg_client_number      */ NEW.interm_strg_client_number,
    /*interm_strg_locn_code          */ NEW.interm_strg_locn_code,
    /*interm_strg_st_date            */ NEW.interm_strg_st_date,
    /*interm_strg_end_date           */ NEW.interm_strg_end_date,
    /*interm_facility_code           */ NEW.interm_facility_code,
    /*female_gametic_mthd_code       */ NEW.female_gametic_mthd_code,
    /*male_gametic_mthd_code         */ NEW.male_gametic_mthd_code,
    /*controlled_cross_ind           */ NEW.controlled_cross_ind,
    /*biotech_processes_ind          */ NEW.biotech_processes_ind,
    /*pollen_contamination_ind       */ NEW.pollen_contamination_ind,
    /*pollen_contamination_pct       */ NEW.pollen_contamination_pct,
    /*contaminant_pollen_bv          */ NEW.contaminant_pollen_bv,
    /*pollen_contamination_mthd_code */ NEW.pollen_contamination_mthd_code,
    /*total_parent_trees             */ NEW.total_parent_trees,
    /*smp_success_pct                */ NEW.smp_success_pct,
    /*effective_pop_size             */ NEW.effective_pop_size,
    /*smp_parents_outside            */ NEW.smp_parents_outside,
    /*non_orchard_pollen_contam_pct  */ NEW.non_orchard_pollen_contam_pct,
    /*extractory_client_number       */ NEW.extractory_client_number,
    /*extractory_locn_code           */ NEW.extractory_locn_code,
    /*extraction_st_date             */ NEW.extraction_st_date,
    /*extraction_end_date            */ NEW.extraction_end_date,
    /*temporary_strg_client_number   */ NEW.temporary_strg_client_number,
    /*temporary_strg_locn_code       */ NEW.temporary_strg_locn_code,
    /*temporary_strg_start_date      */ NEW.temporary_strg_start_date,
    /*temporary_strg_end_date        */ NEW.temporary_strg_end_date,
    /*interm_strg_locn               */ NEW.interm_strg_locn,
    /*declared_userid                */ NEW.declared_userid,
    /*declared_timestamp             */ NEW.declared_timestamp,
    /*entry_userid                   */ NEW.entry_userid,
    /*entry_timestamp                */ NEW.entry_timestamp,
    /*update_userid                  */ NEW.update_userid,
    /*update_timestamp               */ NEW.update_timestamp,
    /*revision_count                 */ NEW.revision_count,
    /*bgc_zone_description           */ NEW.bgc_zone_description,
    /*coancestry                     */ NEW.coancestry,
    /*superior_provenance_ind             */ NEW.superior_provenance_ind,
    /*org_unit_no                    */ NEW.org_unit_no,
    /*collection_location_desc           */ NEW.collection_location_desc,
    /*provenance_id                  */ NEW.provenance_id,
    /*collection_standard_met_ind    */ NEW.collection_standard_met_ind,
    /*collection_area_radius         */ NEW.collection_area_radius,
    /*capture_method_code            */ NEW.capture_method_code,
    /*seed_plan_zone_code            */ NEW.seed_plan_zone_code,
    /*collection_seed_plan_zone_ind             */ NEW.collection_seed_plan_zone_ind,
    /*seed_coast_area_code           */ NEW.seed_coast_area_code,
    /*collection_bgc_validated_ind             */ NEW.collection_bgc_validated_ind,
    /*bec_override_ind               */ NEW.bec_override_ind,
    /*bec_override_comment           */ NEW.bec_override_comment,
    /*number_trees_from_code           */ NEW.number_trees_from_code,
    /*is_lot_split_ind               */ NEW.is_lot_split_ind
    );
        RETURN NEW;
    else
        RAISE WARNING '[AUDIT.IF_MODIFIED_FUNC] - Other action occurred: %, at %',TG_OP,now();
        RETURN NULL;
    end if;

EXCEPTION
    WHEN data_exception then
        RAISE WARNING '[AUDIT.IF_MODIFIED_FUNC] - UDF ERROR [DATA EXCEPTION] - SQLSTATE: %, SQLERRM: %',SQLSTATE,SQLERRM;
        RETURN NULL;
    WHEN unique_violation then
        RAISE WARNING '[AUDIT.IF_MODIFIED_FUNC] - UDF ERROR [UNIQUE] - SQLSTATE: %, SQLERRM: %',SQLSTATE,SQLERRM;
        RETURN NULL;
    WHEN others then
        RAISE WARNING '[AUDIT.IF_MODIFIED_FUNC] - UDF ERROR [OTHER] - SQLSTATE: %, SQLERRM: %',SQLSTATE,SQLERRM;
        RETURN NULL;
END;
$body$
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, spar;

DROP TRIGGER trg_seedlot_audit_DIU ON spar.seedlot;

CREATE TRIGGER trg_seedlot_audit_DIU
  AFTER INSERT OR UPDATE OR DELETE ON spar.seedlot
  FOR EACH ROW EXECUTE PROCEDURE spar.seedlot_if_modified_func();
