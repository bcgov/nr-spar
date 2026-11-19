-- =============================================================================
-- V52: Drop seedlot.superior_provenance_ind
--
-- B+ (superior provenance) seedlots are retired. Migrated legacy B+ seedlots
-- keep their provenance_id, and a seedlot is B+ exactly when provenance_id is
-- set, so the separate indicator is redundant.
--
--   1. Recreate the seedlot audit trigger function without the column
--      (same as V50 otherwise)
--   2. Drop the column from spar.seedlot and spar.seedlot_audit
--   3. Update column comments that referred to the indicator
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Seedlot audit trigger function without superior_provenance_ind
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
        INSERT INTO spar.seedlot_audit (spar_audit_code,db_user,audit_revision_version,seedlot_number,seedlot_status_code,applicant_client_number,applicant_locn_code,applicant_email_address,vegetation_code,genetic_class_code,seedlot_source_code,to_be_registrd_ind,bc_source_ind,collection_client_number,collection_locn_code,collection_start_date,collection_end_date,no_of_containers,vol_per_container,clctn_volume,seedlot_comment,interm_strg_client_number,interm_strg_locn_code,interm_strg_st_date,interm_strg_end_date,interm_facility_code,female_gametic_mthd_code,male_gametic_mthd_code,controlled_cross_ind,biotech_processes_ind,pollen_contamination_ind,pollen_contamination_pct,contaminant_pollen_bv,pollen_contamination_mthd_code,total_parent_trees,smp_success_pct,effective_pop_size,smp_parents_outside,non_orchard_pollen_contam_pct,extractory_client_number,extractory_locn_code,extraction_st_date,extraction_end_date,temporary_strg_client_number,temporary_strg_locn_code,temporary_strg_start_date,temporary_strg_end_date,interm_strg_locn,declared_userid,declared_timestamp,entry_userid,entry_timestamp,update_userid,update_timestamp,revision_count,bgc_zone_description,coancestry,org_unit_no,collection_location_desc,provenance_id,collection_standard_met_ind,collection_area_radius,capture_method_code,seed_plan_zone_code,collection_seed_plan_zone_ind,seed_coast_area_code,collection_bgc_validated_ind,bec_override_ind,bec_override_comment,number_trees_from_code,is_lot_split_ind)
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
    INSERT INTO spar.seedlot_audit (spar_audit_code,db_user,audit_revision_version,seedlot_number,seedlot_status_code,applicant_client_number,applicant_locn_code,applicant_email_address,vegetation_code,genetic_class_code,seedlot_source_code,to_be_registrd_ind,bc_source_ind,collection_client_number,collection_locn_code,collection_start_date,collection_end_date,no_of_containers,vol_per_container,clctn_volume,seedlot_comment,interm_strg_client_number,interm_strg_locn_code,interm_strg_st_date,interm_strg_end_date,interm_facility_code,female_gametic_mthd_code,male_gametic_mthd_code,controlled_cross_ind,biotech_processes_ind,pollen_contamination_ind,pollen_contamination_pct,contaminant_pollen_bv,pollen_contamination_mthd_code,total_parent_trees,smp_success_pct,effective_pop_size,smp_parents_outside,non_orchard_pollen_contam_pct,extractory_client_number,extractory_locn_code,extraction_st_date,extraction_end_date,temporary_strg_client_number,temporary_strg_locn_code,temporary_strg_start_date,temporary_strg_end_date,interm_strg_locn,declared_userid,declared_timestamp,entry_userid,entry_timestamp,update_userid,update_timestamp,revision_count,bgc_zone_description,coancestry,org_unit_no,collection_location_desc,provenance_id,collection_standard_met_ind,collection_area_radius,capture_method_code,seed_plan_zone_code,collection_seed_plan_zone_ind,seed_coast_area_code,collection_bgc_validated_ind,bec_override_ind,bec_override_comment,number_trees_from_code,is_lot_split_ind)
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
        INSERT INTO spar.seedlot_audit (spar_audit_code,db_user,audit_revision_version,seedlot_number,seedlot_status_code,applicant_client_number,applicant_locn_code,applicant_email_address,vegetation_code,genetic_class_code,seedlot_source_code,to_be_registrd_ind,bc_source_ind,collection_client_number,collection_locn_code,collection_start_date,collection_end_date,no_of_containers,vol_per_container,clctn_volume,seedlot_comment,interm_strg_client_number,interm_strg_locn_code,interm_strg_st_date,interm_strg_end_date,interm_facility_code,female_gametic_mthd_code,male_gametic_mthd_code,controlled_cross_ind,biotech_processes_ind,pollen_contamination_ind,pollen_contamination_pct,contaminant_pollen_bv,pollen_contamination_mthd_code,total_parent_trees,smp_success_pct,effective_pop_size,smp_parents_outside,non_orchard_pollen_contam_pct,extractory_client_number,extractory_locn_code,extraction_st_date,extraction_end_date,temporary_strg_client_number,temporary_strg_locn_code,temporary_strg_start_date,temporary_strg_end_date,interm_strg_locn,declared_userid,declared_timestamp,entry_userid,entry_timestamp,update_userid,update_timestamp,revision_count,bgc_zone_description,coancestry,org_unit_no,collection_location_desc,provenance_id,collection_standard_met_ind,collection_area_radius,capture_method_code,seed_plan_zone_code,collection_seed_plan_zone_ind,seed_coast_area_code,collection_bgc_validated_ind,bec_override_ind,bec_override_comment,number_trees_from_code,is_lot_split_ind)
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

-- -----------------------------------------------------------------------------
-- 2. Drop the column
-- -----------------------------------------------------------------------------
alter table spar.seedlot
  drop column superior_provenance_ind;

alter table spar.seedlot_audit
  drop column superior_provenance_ind;

-- -----------------------------------------------------------------------------
-- 3. Comments
-- -----------------------------------------------------------------------------
comment on column spar.seedlot.collection_location_desc     is 'Text description of the collection location.';
comment on column spar.seedlot.provenance_id                is 'Oracle SUPERIOR_PROVENANCE provenance identifier (stored as integer; no Postgres FK). Set only on migrated legacy B+ (superior provenance) seedlots; a seedlot is B+ exactly when this is set.';
