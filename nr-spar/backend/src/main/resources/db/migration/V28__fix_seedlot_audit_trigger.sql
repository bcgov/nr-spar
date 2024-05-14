alter table spar.seedlot_audit
  add column seed_plan_unit_id         smallint,
  add column bgc_zone_code             varchar(4),
  add column bgc_subzone_code          varchar(3),
  add column variant                   varchar(1),
  add column bec_version_id            smallint,
  add column elevation                 smallint,
  add column latitude_degrees          smallint,
  add column latitude_minutes          smallint,
  add column latitude_seconds          smallint,
  add column longitude_degrees         smallint,
  add column longitude_minutes         smallint,
  add column longitude_seconds         smallint,
  add column collection_elevation      smallint,
  add column collection_elevation_min  smallint,
  add column collection_elevation_max  smallint,
  add column collection_latitude_deg   smallint,
  add column collection_latitude_min   smallint,
  add column collection_latitude_sec   smallint,
  add column collection_latitude_code  varchar(1),
  add column collection_longitude_deg  smallint,
  add column collection_longitude_min  smallint,
  add column collection_longitude_sec  smallint,
  add column collection_longitude_code varchar(1),
  add column elevation_min             smallint,
  add column elevation_max             smallint,
  add column latitude_deg_min          smallint,
  add column latitude_min_min          smallint,
  add column latitude_sec_min          smallint,
  add column latitude_deg_max          smallint,
  add column latitude_min_max          smallint,
  add column latitude_sec_max          smallint,
  add column longitude_deg_min         smallint,
  add column longitude_min_min         smallint,
  add column longitude_sec_min         smallint,
  add column longitude_deg_max         smallint,
  add column longitude_min_max         smallint,
  add column longitude_sec_max         smallint,
  add column smp_mean_bv_growth        decimal(4, 1),
  add column area_of_use_comment       varchar(2000);

comment on column spar.seedlot_audit.seed_plan_unit_id          is 'Referring value for spar.seedlot.seed_plan_unit_id column';
comment on column spar.seedlot_audit.bgc_zone_code              is 'Referring value for spar.seedlot.bgc_zone_code column';
comment on column spar.seedlot_audit.bgc_subzone_code           is 'Referring value for spar.seedlot.bgc_subzone_code column';
comment on column spar.seedlot_audit.variant                    is 'Referring value for spar.seedlot.variant column';
comment on column spar.seedlot_audit.bec_version_id             is 'Referring value for spar.seedlot.bec_version_id column';
comment on column spar.seedlot_audit.elevation                  is 'Referring value for spar.seedlot.elevation column';
comment on column spar.seedlot_audit.latitude_degrees           is 'Referring value for spar.seedlot.latitude_degrees column';
comment on column spar.seedlot_audit.latitude_minutes           is 'Referring value for spar.seedlot.latitude_minutes column';
comment on column spar.seedlot_audit.latitude_seconds           is 'Referring value for spar.seedlot.latitude_seconds column';
comment on column spar.seedlot_audit.longitude_degrees          is 'Referring value for spar.seedlot.longitude_degrees column';
comment on column spar.seedlot_audit.longitude_minutes          is 'Referring value for spar.seedlot.longitude_minutes column';
comment on column spar.seedlot_audit.longitude_seconds          is 'Referring value for spar.seedlot.longitude_seconds column';
comment on column spar.seedlot_audit.collection_elevation       is 'Referring value for spar.seedlot.collection_elevation column';
comment on column spar.seedlot_audit.collection_elevation_min   is 'Referring value for spar.seedlot.collection_elevation_min column';
comment on column spar.seedlot_audit.collection_elevation_max   is 'Referring value for spar.seedlot.collection_elevation_max column';
comment on column spar.seedlot_audit.collection_latitude_deg    is 'Referring value for spar.seedlot.collection_latitude_deg column';
comment on column spar.seedlot_audit.collection_latitude_min    is 'Referring value for spar.seedlot.collection_latitude_min column';
comment on column spar.seedlot_audit.collection_latitude_sec    is 'Referring value for spar.seedlot.collection_latitude_sec column';
comment on column spar.seedlot_audit.collection_latitude_code   is 'Referring value for spar.seedlot.collection_latitude_code column';
comment on column spar.seedlot_audit.collection_longitude_deg   is 'Referring value for spar.seedlot.collection_longitude_deg column';
comment on column spar.seedlot_audit.collection_longitude_min   is 'Referring value for spar.seedlot.collection_longitude_min column';
comment on column spar.seedlot_audit.collection_longitude_sec   is 'Referring value for spar.seedlot.collection_longitude_sec column';
comment on column spar.seedlot_audit.collection_longitude_code  is 'Referring value for spar.seedlot.collection_longitude_code column';
comment on column spar.seedlot_audit.elevation_min              is 'Referring value for spar.seedlot.elevation_min column';
comment on column spar.seedlot_audit.elevation_max              is 'Referring value for spar.seedlot.elevation_max column';
comment on column spar.seedlot_audit.latitude_deg_min           is 'Referring value for spar.seedlot.latitude_deg_min column';
comment on column spar.seedlot_audit.latitude_sec_min           is 'Referring value for spar.seedlot.latitude_sec_min column';
comment on column spar.seedlot_audit.latitude_min_min           is 'Referring value for spar.seedlot.latitude_min_min column';
comment on column spar.seedlot_audit.latitude_deg_max           is 'Referring value for spar.seedlot.latitude_deg_max column';
comment on column spar.seedlot_audit.latitude_min_max           is 'Referring value for spar.seedlot.latitude_min_max column';
comment on column spar.seedlot_audit.latitude_sec_max           is 'Referring value for spar.seedlot.latitude_sec_max column';
comment on column spar.seedlot_audit.longitude_deg_min          is 'Referring value for spar.seedlot.longitude_deg_min column';
comment on column spar.seedlot_audit.longitude_min_min          is 'Referring value for spar.seedlot.longitude_min_min column';
comment on column spar.seedlot_audit.longitude_sec_min          is 'Referring value for spar.seedlot.longitude_sec_min column';
comment on column spar.seedlot_audit.longitude_deg_max          is 'Referring value for spar.seedlot.longitude_deg_max column';
comment on column spar.seedlot_audit.longitude_min_max          is 'Referring value for spar.seedlot.longitude_min_max column';
comment on column spar.seedlot_audit.longitude_sec_max          is 'Referring value for spar.seedlot.longitude_sec_max column';
comment on column spar.seedlot_audit.smp_mean_bv_growth         is 'Referring value for spar.seedlot.smp_mean_bv_growth column';
comment on column spar.seedlot_audit.area_of_use_comment        is 'Referring value for spar.seedlot.area_of_use_comment column';

/*  
-- Function to fix Insert/Update/Delete staments executed on seedlot the table.
-- Should be used in a trigger on the seedlot table
-- trigger statement in the bottom part of this script
*/
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
        INSERT INTO spar.seedlot_audit (spar_audit_code,db_user,audit_revision_version,seedlot_number,seedlot_status_code,applicant_client_number,applicant_locn_code,applicant_email_address,vegetation_code,genetic_class_code,seedlot_source_code,to_be_registrd_ind,bc_source_ind,collection_client_number,collection_locn_code,collection_start_date,collection_end_date,no_of_containers,vol_per_container,clctn_volume,seedlot_comment,interm_strg_client_number,interm_strg_locn_code,interm_strg_st_date,interm_strg_end_date,interm_facility_code,female_gametic_mthd_code,male_gametic_mthd_code,controlled_cross_ind,biotech_processes_ind,pollen_contamination_ind,pollen_contamination_pct,contaminant_pollen_bv,pollen_contamination_mthd_code,total_parent_trees,smp_success_pct,effective_pop_size,smp_parents_outside,non_orchard_pollen_contam_pct,extractory_client_number,extractory_locn_code,extraction_st_date,extraction_end_date,temporary_strg_client_number,temporary_strg_locn_code,temporary_strg_start_date,temporary_strg_end_date,interm_strg_locn,declared_userid,declared_timestamp,entry_userid,entry_timestamp,update_userid,update_timestamp,revision_count)
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
    INSERT INTO spar.seedlot_audit (spar_audit_code,db_user,audit_revision_version,seedlot_number,seedlot_status_code,applicant_client_number,applicant_locn_code,applicant_email_address,vegetation_code,genetic_class_code,seedlot_source_code,to_be_registrd_ind,bc_source_ind,collection_client_number,collection_locn_code,collection_start_date,collection_end_date,no_of_containers,vol_per_container,clctn_volume,seedlot_comment,interm_strg_client_number,interm_strg_locn_code,interm_strg_st_date,interm_strg_end_date,interm_facility_code,female_gametic_mthd_code,male_gametic_mthd_code,controlled_cross_ind,biotech_processes_ind,pollen_contamination_ind,pollen_contamination_pct,contaminant_pollen_bv,pollen_contamination_mthd_code,total_parent_trees,smp_success_pct,effective_pop_size,smp_parents_outside,non_orchard_pollen_contam_pct,extractory_client_number,extractory_locn_code,extraction_st_date,extraction_end_date,temporary_strg_client_number,temporary_strg_locn_code,temporary_strg_start_date,temporary_strg_end_date,interm_strg_locn,declared_userid,declared_timestamp,entry_userid,entry_timestamp,update_userid,update_timestamp,revision_count)               
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
    /*update_userid                  */ OLD.update_userid,
    /*update_timestamp               */ OLD.update_timestamp,
    /*revision_count                 */ OLD.revision_count
    );
        RETURN OLD;
    elsif (TG_OP = 'INSERT') then
        v_new_data := ROW(NEW.*);
        INSERT INTO spar.seedlot_audit (spar_audit_code,db_user,audit_revision_version,seedlot_number,seedlot_status_code,applicant_client_number,applicant_locn_code,applicant_email_address,vegetation_code,genetic_class_code,seedlot_source_code,to_be_registrd_ind,bc_source_ind,collection_client_number,collection_locn_code,collection_start_date,collection_end_date,no_of_containers,vol_per_container,clctn_volume,seedlot_comment,interm_strg_client_number,interm_strg_locn_code,interm_strg_st_date,interm_strg_end_date,interm_facility_code,female_gametic_mthd_code,male_gametic_mthd_code,controlled_cross_ind,biotech_processes_ind,pollen_contamination_ind,pollen_contamination_pct,contaminant_pollen_bv,pollen_contamination_mthd_code,total_parent_trees,smp_success_pct,effective_pop_size,smp_parents_outside,non_orchard_pollen_contam_pct,extractory_client_number,extractory_locn_code,extraction_st_date,extraction_end_date,temporary_strg_client_number,temporary_strg_locn_code,temporary_strg_start_date,temporary_strg_end_date,interm_strg_locn,declared_userid,declared_timestamp,entry_userid,entry_timestamp,update_userid,update_timestamp,revision_count)               
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

-- Drop existing trigger
DROP TRIGGER trg_seedlot_audit_DIU ON spar.seedlot;

-- Trigger to be attached on spar.seedlot table
CREATE TRIGGER trg_seedlot_audit_DIU
 AFTER INSERT OR UPDATE OR DELETE ON spar.seedlot 
 FOR EACH ROW EXECUTE PROCEDURE spar.seedlot_if_modified_func();
