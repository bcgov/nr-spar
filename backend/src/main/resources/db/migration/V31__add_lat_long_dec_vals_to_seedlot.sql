/* Update Seedlot table */
alter table spar.seedlot add column mean_geom geometry(POINTZ, 4326);

comment on column spar.seedlot.mean_geom is 'The 3D mean geom of parent trees.';

/* Update Seedlot Audit table */
alter table spar.seedlot_audit add column mean_geom geometry(POINTZ, 4326);

comment on column spar.seedlot_audit.mean_geom is 'Referring value for spar.seedlot.mean_geom column';

/* Update trigger */

CREATE EXTENSION IF NOT EXISTS postgis;

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
        INSERT INTO spar.seedlot_audit (spar_audit_code,db_user,audit_revision_version,seedlot_number,seedlot_status_code,applicant_client_number,applicant_locn_code,applicant_email_address,vegetation_code,genetic_class_code,seedlot_source_code,to_be_registrd_ind,bc_source_ind,collection_client_number,collection_locn_code,collection_start_date,collection_end_date,no_of_containers,vol_per_container,clctn_volume,seedlot_comment,interm_strg_client_number,interm_strg_locn_code,interm_strg_st_date,interm_strg_end_date,interm_facility_code,female_gametic_mthd_code,male_gametic_mthd_code,controlled_cross_ind,biotech_processes_ind,pollen_contamination_ind,pollen_contamination_pct,contaminant_pollen_bv,pollen_contamination_mthd_code,total_parent_trees,smp_success_pct,effective_pop_size,smp_parents_outside,non_orchard_pollen_contam_pct,extractory_client_number,extractory_locn_code,extraction_st_date,extraction_end_date,temporary_strg_client_number,temporary_strg_locn_code,temporary_strg_start_date,temporary_strg_end_date,interm_strg_locn,declared_userid,declared_timestamp,entry_userid,entry_timestamp,seed_plan_unit_id,bgc_zone_code,bgc_subzone_code,variant,bec_version_id,elevation,latitude_degrees,latitude_minutes,latitude_seconds,longitude_degrees,longitude_minutes,longitude_seconds,collection_elevation,collection_elevation_min,collection_elevation_max,collection_latitude_deg,collection_latitude_min,collection_latitude_sec,collection_latitude_code,collection_longitude_deg,collection_longitude_min,collection_longitude_sec,collection_longitude_code,elevation_min,elevation_max,latitude_deg_min,latitude_min_min,latitude_sec_min,latitude_deg_max,latitude_min_max,latitude_sec_max,longitude_deg_min,longitude_min_min,longitude_sec_min,longitude_deg_max,longitude_min_max,longitude_sec_max,smp_mean_bv_growth,area_of_use_comment,approved_timestamp,approved_userid,update_userid,update_timestamp,revision_count)
    VALUES(
    /*spar_audit_code                */ 'U',
    /*db_user                 	     */ session_user::TEXT,
    /*audit_revision_version  	     */ coalesce(v_auditrevision,1),
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

    /*seed_plan_unit_id              */ NEW.seed_plan_unit_id,
    /*bgc_zone_code                  */ NEW.bgc_zone_code,
    /*bgc_subzone_code               */ NEW.bgc_subzone_code,
    /*variant                        */ NEW.variant,
    /*bec_version_id                 */ NEW.bec_version_id,
    /*elevation                      */ NEW.elevation,
    /*latitude_degrees               */ NEW.latitude_degrees,
    /*latitude_minutes               */ NEW.latitude_minutes,
    /*latitude_seconds               */ NEW.latitude_seconds,
    /*longitude_degrees              */ NEW.longitude_degrees,
    /*longitude_minutes              */ NEW.longitude_minutes,
    /*longitude_seconds              */ NEW.longitude_seconds,
    /*collection_elevation           */ NEW.collection_elevation,
    /*collection_elevation_min       */ NEW.collection_elevation_min,
    /*collection_elevation_max       */ NEW.collection_elevation_max,
    /*collection_latitude_deg        */ NEW.collection_latitude_deg,
    /*collection_latitude_min        */ NEW.collection_latitude_min,
    /*collection_latitude_sec        */ NEW.collection_latitude_sec,
    /*collection_latitude_code       */ NEW.collection_latitude_code,
    /*collection_longitude_deg       */ NEW.collection_longitude_deg,
    /*collection_longitude_min       */ NEW.collection_longitude_min,
    /*collection_longitude_sec       */ NEW.collection_longitude_sec,
    /*collection_longitude_code      */ NEW.collection_longitude_code,
    /*elevation_min                  */ NEW.elevation_min,
    /*elevation_max                  */ NEW.elevation_max,
    /*latitude_deg_min               */ NEW.latitude_deg_min,
    /*latitude_min_min               */ NEW.latitude_min_min,
    /*latitude_sec_min               */ NEW.latitude_sec_min,
    /*latitude_deg_max               */ NEW.latitude_deg_max,
    /*latitude_min_max               */ NEW.latitude_min_max,
    /*latitude_sec_max               */ NEW.latitude_sec_max,
    /*longitude_deg_min              */ NEW.longitude_deg_min,
    /*longitude_min_min              */ NEW.longitude_min_min,
    /*longitude_sec_min              */ NEW.longitude_sec_min,
    /*longitude_deg_max              */ NEW.longitude_deg_max,
    /*longitude_min_max              */ NEW.longitude_min_max,
    /*longitude_sec_max              */ NEW.longitude_sec_max,
    /*smp_mean_bv_growth             */ NEW.smp_mean_bv_growth,
    /*area_of_use_comment            */ NEW.area_of_use_comment,
    /*approved_timestamp             */ NEW.approved_timestamp,
    /*approved_userid                */ NEW.approved_userid,
    /*mean_geom                  */ NEW.mean_geom,

    /*update_userid                  */ NEW.update_userid,
    /*update_timestamp               */ NEW.update_timestamp,
    /*revision_count                 */ NEW.revision_count
    );
        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        v_old_data := ROW(OLD.*);
    /* insert into spar.logged_actions (schema_name,table_name,user_name,action,original_data,query)
        values (TG_TABLE_SCHEMA::TEXT,TG_TABLE_NAME::TEXT,session_user::TEXT,substring(TG_OP,1,1),v_old_data, current_query());*/
    /* AUDIT REVISION number used to order the statements executed in the row */
    v_auditrevision := (SELECT MAX(COALESCE(audit_revision_version,1))+1 FROM spar.seedlot_audit WHERE seedlot_number = NEW.seedlot_number) ;
    INSERT INTO spar.seedlot_audit (spar_audit_code,db_user,audit_revision_version,seedlot_number,seedlot_status_code,applicant_client_number,applicant_locn_code,applicant_email_address,vegetation_code,genetic_class_code,seedlot_source_code,to_be_registrd_ind,bc_source_ind,collection_client_number,collection_locn_code,collection_start_date,collection_end_date,no_of_containers,vol_per_container,clctn_volume,seedlot_comment,interm_strg_client_number,interm_strg_locn_code,interm_strg_st_date,interm_strg_end_date,interm_facility_code,female_gametic_mthd_code,male_gametic_mthd_code,controlled_cross_ind,biotech_processes_ind,pollen_contamination_ind,pollen_contamination_pct,contaminant_pollen_bv,pollen_contamination_mthd_code,total_parent_trees,smp_success_pct,effective_pop_size,smp_parents_outside,non_orchard_pollen_contam_pct,extractory_client_number,extractory_locn_code,extraction_st_date,extraction_end_date,temporary_strg_client_number,temporary_strg_locn_code,temporary_strg_start_date,temporary_strg_end_date,interm_strg_locn,declared_userid,declared_timestamp,entry_userid,entry_timestamp,seed_plan_unit_id,bgc_zone_code,bgc_subzone_code,variant,bec_version_id,elevation,latitude_degrees,latitude_minutes,latitude_seconds,longitude_degrees,longitude_minutes,longitude_seconds,collection_elevation,collection_elevation_min,collection_elevation_max,collection_latitude_deg,collection_latitude_min,collection_latitude_sec,collection_latitude_code,collection_longitude_deg,collection_longitude_min,collection_longitude_sec,collection_longitude_code,elevation_min,elevation_max,latitude_deg_min,latitude_min_min,latitude_sec_min,latitude_deg_max,latitude_min_max,latitude_sec_max,longitude_deg_min,longitude_min_min,longitude_sec_min,longitude_deg_max,longitude_min_max,longitude_sec_max,smp_mean_bv_growth,area_of_use_comment,approved_timestamp,approved_userid,update_userid,update_timestamp,revision_count)
    VALUES(
    /*spar_audit_code                */ 'D',
    /*db_user                 	     */ session_user::TEXT,
    /*audit_revision_version  	     */ coalesce(v_auditrevision,1),
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

	  /*seed_plan_unit_id              */ OLD.seed_plan_unit_id,
    /*bgc_zone_code                  */ OLD.bgc_zone_code,
    /*bgc_subzone_code               */ OLD.bgc_subzone_code,
    /*variant                        */ OLD.variant,
    /*bec_version_id                 */ OLD.bec_version_id,
    /*elevation                      */ OLD.elevation,
    /*latitude_degrees               */ OLD.latitude_degrees,
    /*latitude_minutes               */ OLD.latitude_minutes,
    /*latitude_seconds               */ OLD.latitude_seconds,
    /*longitude_degrees              */ OLD.longitude_degrees,
    /*longitude_minutes              */ OLD.longitude_minutes,
    /*longitude_seconds              */ OLD.longitude_seconds,
    /*collection_elevation           */ OLD.collection_elevation,
    /*collection_elevation_min       */ OLD.collection_elevation_min,
    /*collection_elevation_max       */ OLD.collection_elevation_max,
    /*collection_latitude_deg        */ OLD.collection_latitude_deg,
    /*collection_latitude_min        */ OLD.collection_latitude_min,
    /*collection_latitude_sec        */ OLD.collection_latitude_sec,
    /*collection_latitude_code       */ OLD.collection_latitude_code,
    /*collection_longitude_deg       */ OLD.collection_longitude_deg,
    /*collection_longitude_min       */ OLD.collection_longitude_min,
    /*collection_longitude_sec       */ OLD.collection_longitude_sec,
    /*collection_longitude_code      */ OLD.collection_longitude_code,
    /*elevation_min                  */ OLD.elevation_min,
    /*elevation_max                  */ OLD.elevation_max,
    /*latitude_deg_min               */ OLD.latitude_deg_min,
    /*latitude_min_min               */ OLD.latitude_min_min,
    /*latitude_sec_min               */ OLD.latitude_sec_min,
    /*latitude_deg_max               */ OLD.latitude_deg_max,
    /*latitude_min_max               */ OLD.latitude_min_max,
    /*latitude_sec_max               */ OLD.latitude_sec_max,
    /*longitude_deg_min              */ OLD.longitude_deg_min,
    /*longitude_min_min              */ OLD.longitude_min_min,
    /*longitude_sec_min              */ OLD.longitude_sec_min,
    /*longitude_deg_max              */ OLD.longitude_deg_max,
    /*longitude_min_max              */ OLD.longitude_min_max,
    /*longitude_sec_max              */ OLD.longitude_sec_max,
    /*smp_mean_bv_growth             */ OLD.smp_mean_bv_growth,
    /*area_of_use_comment            */ OLD.area_of_use_comment,
    /*approved_timestamp             */ OLD.approved_timestamp,
    /*approved_userid                */ OLD.approved_userid,
    /*mean_geom                      */ OLD.mean_geom,

    /*update_userid                  */ OLD.update_userid,
    /*update_timestamp               */ OLD.update_timestamp,
    /*revision_count                 */ OLD.revision_count
    );
        RETURN OLD;
    elsif (TG_OP = 'INSERT') then
        v_new_data := ROW(NEW.*);
        INSERT INTO spar.seedlot_audit (spar_audit_code,db_user,audit_revision_version,seedlot_number,seedlot_status_code,applicant_client_number,applicant_locn_code,applicant_email_address,vegetation_code,genetic_class_code,seedlot_source_code,to_be_registrd_ind,bc_source_ind,collection_client_number,collection_locn_code,collection_start_date,collection_end_date,no_of_containers,vol_per_container,clctn_volume,seedlot_comment,interm_strg_client_number,interm_strg_locn_code,interm_strg_st_date,interm_strg_end_date,interm_facility_code,female_gametic_mthd_code,male_gametic_mthd_code,controlled_cross_ind,biotech_processes_ind,pollen_contamination_ind,pollen_contamination_pct,contaminant_pollen_bv,pollen_contamination_mthd_code,total_parent_trees,smp_success_pct,effective_pop_size,smp_parents_outside,non_orchard_pollen_contam_pct,extractory_client_number,extractory_locn_code,extraction_st_date,extraction_end_date,temporary_strg_client_number,temporary_strg_locn_code,temporary_strg_start_date,temporary_strg_end_date,interm_strg_locn,declared_userid,declared_timestamp,entry_userid,entry_timestamp,seed_plan_unit_id,bgc_zone_code,bgc_subzone_code,variant,bec_version_id,elevation,latitude_degrees,latitude_minutes,latitude_seconds,longitude_degrees,longitude_minutes,longitude_seconds,collection_elevation,collection_elevation_min,collection_elevation_max,collection_latitude_deg,collection_latitude_min,collection_latitude_sec,collection_latitude_code,collection_longitude_deg,collection_longitude_min,collection_longitude_sec,collection_longitude_code,elevation_min,elevation_max,latitude_deg_min,latitude_min_min,latitude_sec_min,latitude_deg_max,latitude_min_max,latitude_sec_max,longitude_deg_min,longitude_min_min,longitude_sec_min,longitude_deg_max,longitude_min_max,longitude_sec_max,smp_mean_bv_growth,area_of_use_comment,approved_timestamp,approved_userid,update_userid,update_timestamp,revision_count)
    VALUES(
    /*spar_audit_code                */ 'I',
    /*db_user                 	     */ session_user::TEXT,
    /*audit_revision_version  	     */ 1, -- 1st row version
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

	  /*seed_plan_unit_id              */ NEW.seed_plan_unit_id,
    /*bgc_zone_code                  */ NEW.bgc_zone_code,
    /*bgc_subzone_code               */ NEW.bgc_subzone_code,
    /*variant                        */ NEW.variant,
    /*bec_version_id                 */ NEW.bec_version_id,
    /*elevation                      */ NEW.elevation,
    /*latitude_degrees               */ NEW.latitude_degrees,
    /*latitude_minutes               */ NEW.latitude_minutes,
    /*latitude_seconds               */ NEW.latitude_seconds,
    /*longitude_degrees              */ NEW.longitude_degrees,
    /*longitude_minutes              */ NEW.longitude_minutes,
    /*longitude_seconds              */ NEW.longitude_seconds,
    /*collection_elevation           */ NEW.collection_elevation,
    /*collection_elevation_min       */ NEW.collection_elevation_min,
    /*collection_elevation_max       */ NEW.collection_elevation_max,
    /*collection_latitude_deg        */ NEW.collection_latitude_deg,
    /*collection_latitude_min        */ NEW.collection_latitude_min,
    /*collection_latitude_sec        */ NEW.collection_latitude_sec,
    /*collection_latitude_code       */ NEW.collection_latitude_code,
    /*collection_longitude_deg       */ NEW.collection_longitude_deg,
    /*collection_longitude_min       */ NEW.collection_longitude_min,
    /*collection_longitude_sec       */ NEW.collection_longitude_sec,
    /*collection_longitude_code      */ NEW.collection_longitude_code,
    /*elevation_min                  */ NEW.elevation_min,
    /*elevation_max                  */ NEW.elevation_max,
    /*latitude_deg_min               */ NEW.latitude_deg_min,
    /*latitude_min_min               */ NEW.latitude_min_min,
    /*latitude_sec_min               */ NEW.latitude_sec_min,
    /*latitude_deg_max               */ NEW.latitude_deg_max,
    /*latitude_min_max               */ NEW.latitude_min_max,
    /*latitude_sec_max               */ NEW.latitude_sec_max,
    /*longitude_deg_min              */ NEW.longitude_deg_min,
    /*longitude_min_min              */ NEW.longitude_min_min,
    /*longitude_sec_min              */ NEW.longitude_sec_min,
    /*longitude_deg_max              */ NEW.longitude_deg_max,
    /*longitude_min_max              */ NEW.longitude_min_max,
    /*longitude_sec_max              */ NEW.longitude_sec_max,
    /*smp_mean_bv_growth             */ NEW.smp_mean_bv_growth,
    /*area_of_use_comment            */ NEW.area_of_use_comment,
    /*approved_timestamp             */ NEW.approved_timestamp,
    /*approved_userid                */ NEW.approved_userid,
    /*mean_geom                  */ NEW.mean_geom,

    /*update_userid                  */ NEW.update_userid,
    /*update_timestamp               */ NEW.update_timestamp,
    /*revision_count                 */ NEW.revision_count
    );
        RETURN NEW;
    else
        RAISE WARNING '[AUDIT.IF_MODIFIED_FUNC] - Other action occurred: %, at %',TG_OP,now();
        RETURN NULL;
    end if;

EXCEPTION
    WHEN data_exception then
        --insert into spar.error_catch (erro) VALUES(CONCAT('DATA EXCEPTION ',SQLERRM));
        RAISE WARNING '[AUDIT.IF_MODIFIED_FUNC] - UDF ERROR [DATA EXCEPTION] - SQLSTATE: %, SQLERRM: %',SQLSTATE,SQLERRM;
        RETURN NULL;
    WHEN unique_violation then
      --insert into spar.error_catch (erro) VALUES(CONCAT('UNIQUE EXCEPTION ',SQLERRM));
        RAISE WARNING '[AUDIT.IF_MODIFIED_FUNC] - UDF ERROR [UNIQUE] - SQLSTATE: %, SQLERRM: %',SQLSTATE,SQLERRM;
        RETURN NULL;
    WHEN others then
        --insert into spar.error_catch (erro) VALUES(CONCAT(v_auditrevision, CONCAT('OTHER EXCEPTION ',SQLERRM)));
        RAISE WARNING '[AUDIT.IF_MODIFIED_FUNC] - UDF ERROR [OTHER] - SQLSTATE: %, SQLERRM: %',SQLSTATE,SQLERRM;
        RETURN NULL;
END;
$body$
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, spar;
