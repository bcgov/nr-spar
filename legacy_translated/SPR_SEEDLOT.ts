import * as spr_seedlot_geometry from './SPR_SEEDLOT_GEOMETRY';
import * as spr_spatial_utils from './SPR_SPATIAL_UTILS';

let g_error_message: string | null; // VARCHAR2(4000);
let g_seed_plan_zone_code: string | null;
let gb_seed_plan_zone_code: string; // VARCHAR2(1);
let g_seed_plan_zone_id: string | null;
let gb_seed_plan_zone_id: string; // VARCHAR2(1);
let g_applicant_client_locn: string | null;
let gb_applicant_client_locn: string; // VARCHAR2(1);
let g_applicant_client_number: string | null;
let gb_applicant_client_number: string; // VARCHAR2(1);
let g_applicant_email_address: string | null;
let gb_applicant_email_address: string; // VARCHAR2(1);
let g_bc_source_ind: string | null;
let gb_bc_source_ind: string; // VARCHAR2(1)
let g_biotech_processes_ind: string | null;
let gb_biotech_processes_ind: string; // VARCHAR2(1)
let g_collection_area_radius: number | null;
let gb_collection_area_radius: string; // VARCHAR2(1)
let g_collection_bgc_ind: string | null;
let gb_collection_bgc_ind: string; // VARCHAR2(1)
let g_collection_spz_ind: string | null;
let gb_collection_spz_ind: string; // VARCHAR2(1)
let g_coll_standard_met_ind: string | null;
let gb_coll_standard_met_ind: string; // VARCHAR2(1)
let g_cone_collection_method2_cd: string | null;
let gb_cone_collection_method2_cd: string; // VARCHAR2(1);
let g_contaminant_pollen_bv: number | null;
let gb_contaminant_pollen_bv: string; // VARCHAR2(1)
let g_controlled_cross_ind: string | null;
let gb_controlled_cross_ind: string; // VARCHAR2(1)
let g_declared_userid: string | null;
let gb_declared_userid: string; // VARCHAR2(1)
let g_declared_timestamp: Date | null;
let gb_declared_timestamp: string; // VARCHAR2(1)
let g_female_gametic_mthd_code: string | null;
let gb_female_gametic_mthd_code: string; // VARCHAR2(1);
let g_latitude_sec_max: number | null;
let gb_latitude_sec_max: string; // VARCHAR2(1)
let g_latitude_sec_min: number | null;
let gb_latitude_sec_min: string; // VARCHAR2(1)
let g_longitude_sec_max: number | null;
let gb_longitude_sec_max: string; // VARCHAR2(1)
let g_longitude_sec_min: number | null;
let gb_longitude_sec_min: string; // VARCHAR2(1)
let g_male_gametic_mthd_code: string | null;
let gb_male_gametic_mthd_code: string; // VARCHAR2(1)
let g_orchard_comment: string | null; // seedlot.orchard_comment%TYPE;
let gb_orchard_comment: string; // VARCHAR2(1)
let g_orchard_contamination_pct: number | null;
let gb_orchard_contamination_pct: string; // VARCHAR2(1);
let g_pollen_contamination_ind: string | null;
let gb_pollen_contamination_ind: string; // VARCHAR2(1);
let g_pollen_contam_mthd_code: string | null;
let gb_pollen_contam_mthd_code: string; // VARCHAR2(1);
let g_pollen_contamination_pct: number | null;
let gb_pollen_contamination_pct: string; // VARCHAR2(1);
let g_provenance_id: number | null;
let gb_provenance_id: string; // VARCHAR2(1)
let g_secondary_orchard_id: string | null;
let gb_secondary_orchard_id: string; // VARCHAR2(1)
let g_seed_plan_unit_id: number | null;
let gb_seed_plan_unit_id: string; // VARCHAR2(1)
let g_seed_store_client_locn: string | null;
let gb_seed_store_client_locn: string; // VARCHAR2(1)
let g_seed_store_client_number: string | null;
let gb_seed_store_client_number: string; // VARCHAR2(1);
let g_seedlot_source_code: string | null;
let gb_seedlot_source_code: string; // VARCHAR2(1)
let g_smp_mean_bv_AD: number | null;
let gb_smp_mean_bv_AD: string; // VARCHAR2(1)
let g_smp_mean_bv_DFS: number | null;
let gb_smp_mean_bv_DFS: string; // VARCHAR2(1)
let g_smp_mean_bv_DFU: number | null;
let gb_smp_mean_bv_DFU: string; // VARCHAR2(1)
let g_smp_mean_bv_DFW: number | null;
let gb_smp_mean_bv_DFW: string; // VARCHAR2(1)
let g_smp_mean_bv_DSB: number | null;
let gb_smp_mean_bv_DSB: string; // VARCHAR2(1)
let g_smp_mean_bv_DSC: number | null;
let gb_smp_mean_bv_DSC: string; // VARCHAR2(1)
let g_smp_mean_bv_DSG: number | null;
let gb_smp_mean_bv_DSG: string; // VARCHAR2(1)
let g_smp_mean_bv_GVO: number | null;
let gb_smp_mean_bv_GVO: string; // VARCHAR2(1)
let g_smp_mean_bv_IWS: number | null;
let gb_smp_mean_bv_IWS: string; // VARCHAR2(1)
let g_smp_mean_bv_WDU: number | null;
let gb_smp_mean_bv_WDU: string; // VARCHAR2(1)
let g_smp_mean_bv_WVE: number | null;
let gb_smp_mean_bv_WVE: string; // VARCHAR2(1)
let g_smp_mean_bv_WWD: number | null;
let gb_smp_mean_bv_WWD: string; // VARCHAR2(1)
let g_smp_parents_outside: number | null;
let gb_smp_parents_outside: string; // VARCHAR2(1)
let g_smp_success_pct: number | null;
let gb_smp_success_pct: string; // VARCHAR2(1)
let g_temporary_storage_end_date: Date | null;
let gb_temporary_storage_end_date: string; // VARCHAR2(1);
let g_temporary_storage_start_dt: Date | null;
let gb_temporary_storage_start_dt: string; // VARCHAR2(1);
let g_total_parent_trees: number | null;
let gb_total_parent_trees: string; // VARCHAR2(1)
let g_latitude_seconds: number | null;
let gb_latitude_seconds: string; // VARCHAR2(1)
let g_longitude_seconds: number | null;
let gb_longitude_seconds: string; // VARCHAR2(1)
let g_collection_lat_sec: number | null;
let gb_collection_lat_sec: string; // VARCHAR2(1)
let g_collection_long_sec: number | null;
let gb_collection_long_sec: string; // VARCHAR2(1)
let g_seedlot_number: string | null;
let gb_seedlot_number: string; // VARCHAR2(1)
let g_seedlot_status_code: string | null;
let gb_seedlot_status_code: string; // VARCHAR2(1)
let g_vegetation_code: string | null;
let gb_vegetation_code: string; // VARCHAR2(1)
let g_genetic_class_code: string | null;
let gb_genetic_class_code: string; // VARCHAR2(1)
let g_collection_source_code: string | null;
let gb_collection_source_code: string; // VARCHAR2(1)
let g_superior_prvnc_ind: string | null;
let gb_superior_prvnc_ind: string; // VARCHAR2(1)
let g_org_unit_no: number | null; // seedlot.org_unit_no%TYPE;
let gb_org_unit_no: string; // VARCHAR2(1)
let g_registered_seed_ind: string | null;
let gb_registered_seed_ind: string; // VARCHAR2(1)
let g_to_be_registrd_ind: string | null;
let gb_to_be_registrd_ind: string; // VARCHAR2(1)
let g_registered_date: Date | null;
let gb_registered_date: string; // VARCHAR2(1)
let g_fs721a_signed_ind: string | null;
let gb_fs721a_signed_ind: string; // VARCHAR2(1)
let g_nad_datum_code: string | null;
let gb_nad_datum_code: string; // VARCHAR2(1)
let g_utm_zone: number | null;
let gb_utm_zone: string; // VARCHAR2(1)
let g_utm_easting: number | null;
let gb_utm_easting: string; // VARCHAR2(1)
let g_utm_northing: number | null;
let gb_utm_northing: string; // VARCHAR2(1)
let g_longitude_degrees: number | null;
let gb_longitude_degrees: string; // VARCHAR2(1)
let g_longitude_minutes: number | null;
let gb_longitude_minutes: string; // VARCHAR2(1)
let g_longitude_deg_min: number | null;
let gb_longitude_deg_min: string; // VARCHAR2(1)
let g_longitude_min_min: number | null;
let gb_longitude_min_min: string; // VARCHAR2(1)
let g_longitude_deg_max: number | null;
let gb_longitude_deg_max: string; // VARCHAR2(1)
let g_longitude_min_max: number | null;
let gb_longitude_min_max: string; // VARCHAR2(1)
let g_latitude_degrees: number | null;
let gb_latitude_degrees: string; // VARCHAR2(1)
let g_latitude_minutes: number | null;
let gb_latitude_minutes: string; // VARCHAR2(1)
let g_latitude_deg_min: number | null;
let gb_latitude_deg_min: string; // VARCHAR2(1)
let g_latitude_min_min: number | null;
let gb_latitude_min_min: string; // VARCHAR2(1)
let g_latitude_deg_max: number | null;
let gb_latitude_deg_max: string; // VARCHAR2(1)
let g_latitude_min_max: number | null;
let gb_latitude_min_max: string; // VARCHAR2(1)
let g_seed_coast_area_code: string | null;
let gb_seed_coast_area_code: string; // VARCHAR2(1)
let g_elevation: number | null;
let gb_elevation: string; // VARCHAR2(1)
let g_elevation_min: number | null;
let gb_elevation_min: string; // VARCHAR2(1)
let g_elevation_max: number | null;
let gb_elevation_max: string; // VARCHAR2(1)
let g_orchard_id: string | null;
let gb_orchard_id: string; // VARCHAR2(1)
let g_collection_locn_desc: string | null;
let gb_collection_locn_desc: string; // VARCHAR2(1)
let g_collection_cli_number: string | null;
let gb_collection_cli_number: string; // VARCHAR2(1)
let g_collection_cli_locn_cd: string | null;
let gb_collection_cli_locn_cd: string; // VARCHAR2(1)
let g_collection_start_date: Date | null;
let gb_collection_start_date: string; // VARCHAR2(1)
let g_collection_end_date: Date | null;
let gb_collection_end_date: string; // VARCHAR2(1)
let g_cone_collection_method_cd: string | null;
let gb_cone_collection_method_cd: string; // VARCHAR2(1);
let g_no_of_containers: number | null;
let gb_no_of_containers: string; // VARCHAR2(1)
let g_clctn_volume: number | null;
let gb_clctn_volume: string; // VARCHAR2(1)
let g_vol_per_container: number | null;
let gb_vol_per_container: string; // VARCHAR2(1)
let g_nmbr_trees_from_code: string | null;
let gb_nmbr_trees_from_code: string; // VARCHAR2(1)
let g_coancestry: number | null;
let gb_coancestry: string; // VARCHAR2(1)
let g_effective_pop_size: number | null;
let gb_effective_pop_size: string; // VARCHAR2(1)
let g_original_seed_qty: number | null;
let gb_original_seed_qty: string; // VARCHAR2(1)
let g_interm_strg_client_number: string | null;
let gb_interm_strg_client_number: string; // VARCHAR2(1);
let g_interm_strg_client_locn: string | null;
let gb_interm_strg_client_locn: string; // VARCHAR2(1);
let g_interm_strg_st_date: Date | null;
let gb_interm_strg_st_date: string; // VARCHAR2(1)
let g_interm_strg_end_date: Date | null;
let gb_interm_strg_end_date: string; // VARCHAR2(1)
let g_interm_facility_code: string | null;
let gb_interm_facility_code: string; // VARCHAR2(1)
let g_extraction_st_date: Date | null;
let gb_extraction_st_date: string; // VARCHAR2(1)
let g_extraction_end_date: Date | null;
let gb_extraction_end_date: string; // VARCHAR2(1)
let g_extraction_volume: number | null;
let gb_extraction_volume: string; // VARCHAR2(1)
let g_extrct_cli_number: string | null;
let gb_extrct_cli_number: string; // VARCHAR2(1)
let g_extrct_cli_locn_cd: string | null;
let gb_extrct_cli_locn_cd: string; // VARCHAR2(1)
let g_stored_cli_number: string | null;
let gb_stored_cli_number: string; // VARCHAR2(1)
let g_stored_cli_locn_cd: string | null;
let gb_stored_cli_locn_cd: string; // VARCHAR2(1)
let g_lngterm_strg_st_date: Date | null;
let gb_lngterm_strg_st_date: string; // VARCHAR2(1)
let g_historical_tsr_date: Date | null;
let gb_historical_tsr_date: string; // VARCHAR2(1)
let g_collection_lat_deg: number | null;
let gb_collection_lat_deg: string; // VARCHAR2(1)
let g_collection_lat_min: number | null;
let gb_collection_lat_min: string; // VARCHAR2(1)
let g_collection_latitude_code: string | null;
let gb_collection_latitude_code: string; // VARCHAR2(1);
let g_collection_long_deg: number | null; // seedlot.collection_long_deg%TYPE;
let gb_collection_long_deg: string; // VARCHAR2(1)
let g_collection_long_min: number | null; // seedlot.collection_long_min%TYPE;
let gb_collection_long_min: string; // VARCHAR2(1)
let g_collection_longitude_code: string | null; // seedlot.collection_longitude_code%TYPE;
let gb_collection_longitude_code: string; // VARCHAR2(1);
let g_collection_elevation: number | null; // seedlot.collection_elevation%TYPE;
let gb_collection_elevation: string; // VARCHAR2(1)
let g_collection_elevation_min: number | null; // seedlot.collection_elevation_min%TYPE;
let gb_collection_elevation_min: string; // VARCHAR2(1);
let g_collection_elevation_max: number | null; // seedlot.collection_elevation_max%TYPE;
let gb_collection_elevation_max: string; // VARCHAR2(1);
let g_entry_timestamp: Date | null; // seedlot.entry_timestamp%TYPE;
let gb_entry_timestamp: string; // VARCHAR2(1)
let g_entry_userid: string | null; // seedlot.entry_userid%TYPE;
let gb_entry_userid: string; // VARCHAR2(1)
let g_update_timestamp: Date | null; // seedlot.update_timestamp%TYPE;
let gb_update_timestamp: string; // VARCHAR2(1)
let g_update_userid: string | null; // seedlot.update_userid%TYPE;
let gb_update_userid: string; // VARCHAR2(1)
let g_approved_timestamp: Date | null; // seedlot.approved_timestamp%TYPE;
let gb_approved_timestamp: string; // VARCHAR2(1)
let g_approved_userid: string | null; // seedlot.approved_userid%TYPE;
let gb_approved_userid: string; // VARCHAR2(1)
let g_revision_count: number | null; // seedlot.revision_count%TYPE;
let gb_revision_count: string; // VARCHAR2(1)
let g_interm_strg_locn: string | null; // seedlot.interm_strg_locn%TYPE;
let gb_interm_strg_locn: string; // VARCHAR2(1)
let g_interm_strg_cmt: string | null; // seedlot.interm_strg_cmt%TYPE;
let gb_interm_strg_cmt: string; // VARCHAR2(1)
let g_ownership_comment: string | null; // seedlot.ownership_comment%TYPE;
let gb_ownership_comment: string; // VARCHAR2(1)
let g_cone_seed_desc: string | null; // seedlot.cone_seed_desc%TYPE;
let gb_cone_seed_desc: string; // VARCHAR2(1)
let g_extraction_comment: string | null; // seedlot.extraction_comment%TYPE;
let gb_extraction_comment: string; // VARCHAR2(1)
let g_seedlot_comment: string | null; // seedlot.seedlot_comment%TYPE;
let gb_seedlot_comment: string; // VARCHAR2(1)
let g_bgc_zone_code: string | null; // seedlot.bgc_zone_code%TYPE;
let gb_bgc_zone_code: string; // VARCHAR2(1)
let g_bgc_subzone_code: string | null; // seedlot.bgc_subzone_code%TYPE;
let gb_bgc_subzone_code: string; // VARCHAR2(1)
let g_variant: string | null; // seedlot.variant%TYPE;
let gb_variant: string; // VARCHAR2(1)
let g_bec_version_id: string | null; // seedlot.bec_version_id%TYPE;
let gb_bec_version_id: string; // VARCHAR2(1)
let g_gw_AD: number | null; // seedlot_genetic_worth.genetic_worth_rtng%TYPE;
let g_gw_DFS: number | null; // seedlot_genetic_worth.genetic_worth_rtng%TYPE;
let g_gw_DFU: number | null; // seedlot_genetic_worth.genetic_worth_rtng%TYPE;
let g_gw_DFW: number | null; // seedlot_genetic_worth.genetic_worth_rtng%TYPE;
let g_gw_DSB: number | null; // seedlot_genetic_worth.genetic_worth_rtng%TYPE;
let g_gw_DSC: number | null; // seedlot_genetic_worth.genetic_worth_rtng%TYPE;
let g_gw_DSG: number | null; // seedlot_genetic_worth.genetic_worth_rtng%TYPE;
let g_gw_GVO: number | null; // seedlot_genetic_worth.genetic_worth_rtng%TYPE;
let g_gw_IWS: number | null; // seedlot_genetic_worth.genetic_worth_rtng%TYPE;
let g_gw_WDU: number | null; // seedlot_genetic_worth.genetic_worth_rtng%TYPE;
let g_gw_WVE: number | null; // seedlot_genetic_worth.genetic_worth_rtng%TYPE;
let g_gw_WWD: number | null; // seedlot_genetic_worth.genetic_worth_rtng%TYPE;
let g_spz_list: string | null; // VARCHAR2(100);
let g_spz_id_list: string | null; // VARCHAR2(100);
let g_tested_parent_trees_pct_AD: number  | null; // NUMBER(3);
let g_tested_parent_trees_pct_DFS: number | null; // NUMBER(3);
let g_tested_parent_trees_pct_DFU: number | null; // NUMBER(3);
let g_tested_parent_trees_pct_DFW: number | null; // NUMBER(3);
let g_tested_parent_trees_pct_DSB: number | null; // NUMBER(3);
let g_tested_parent_trees_pct_DSC: number | null; // NUMBER(3);
let g_tested_parent_trees_pct_DSG: number | null; // NUMBER(3);
let g_tested_parent_trees_pct_GVO: number | null; // NUMBER(3);
let g_tested_parent_trees_pct_IWS: number | null; // NUMBER(3);
let g_tested_parent_trees_pct_WDU: number | null; // NUMBER(3);
let g_tested_parent_trees_pct_WVE: number | null; // NUMBER(3);
let g_tested_parent_trees_pct_WWD: number | null; // NUMBER(3);
let g_tested_parent_trees_pct: number | null; // NUMBER(3);
let g_untested_parent_trees_pct: number | null; // NUMBER(3);
let g_is_lot_split: boolean | null; // BOOLEAN;
//-- Record to hold previous values
let r_previous: any; // seedlot%ROWTYPE;
//-- Record to hold parent tree contribution calculations
  
interface t_pt_calc {
  collection_elevation: number; // seedlot.collection_elevation%TYPE
  collection_elevation_min: number; // seedlot.collection_elevation_min%TYPE
  collection_elevation_max: number; //seedlot.collection_elevation_max%TYPE
  collection_lat_deg: number; // seedlot.collection_lat_deg%TYPE
  collection_lat_min: number; // seedlot.collection_lat_min%TYPE
  collection_lat_sec: number; // seedlot.collection_lat_sec%TYPE
  collection_long_deg: number; // seedlot.collection_long_deg%TYPE
  collection_long_min: number; // seedlot.collection_long_min%TYPE
  collection_long_sec: number; // seedlot.collection_long_sec%TYPE
  smp_mean_bv_AD: number; //  seedlot_parent_tree_smp_mix.smp_mix_value%TYPE
  smp_mean_bv_DFS: number; //  seedlot_parent_tree_smp_mix.smp_mix_value%TYPE
  smp_mean_bv_DFU: number; //  seedlot_parent_tree_smp_mix.smp_mix_value%TYPE
  smp_mean_bv_DFW: number; //  seedlot_parent_tree_smp_mix.smp_mix_value%TYPE
  smp_mean_bv_DSB: number; //  seedlot_parent_tree_smp_mix.smp_mix_value%TYPE
  smp_mean_bv_DSC: number; //  seedlot_parent_tree_smp_mix.smp_mix_value%TYPE
  smp_mean_bv_DSG: number; //  seedlot_parent_tree_smp_mix.smp_mix_value%TYPE
  smp_mean_bv_GVO: number; //  seedlot_parent_tree_smp_mix.smp_mix_value%TYPE
  smp_mean_bv_IWS: number; //  seedlot_parent_tree_smp_mix.smp_mix_value%TYPE
  smp_mean_bv_WDU: number; //  seedlot_parent_tree_smp_mix.smp_mix_value%TYPE
  smp_mean_bv_WVE: number; //  seedlot_parent_tree_smp_mix.smp_mix_value%TYPE
  smp_mean_bv_WWD: number; //  seedlot_parent_tree_smp_mix.smp_mix_value%TYPE
  smp_success_pct: number; // seedlot.smp_success_pct%TYPE
  orchard_contamination_pct: number; // seedlot.orchard_contamination_pct%TYPE
  effective_pop_size: number; // seedlot.effective_pop_size%TYPE
  gw_AD : number; // seedlot_genetic_worth.genetic_worth_rtng%TYPE
  gw_DFS: number; // seedlot_genetic_worth.genetic_worth_rtng%TYPE
  gw_DFU: number; // seedlot_genetic_worth.genetic_worth_rtng%TYPE
  gw_DFW: number; // seedlot_genetic_worth.genetic_worth_rtng%TYPE
  gw_DSB: number; // seedlot_genetic_worth.genetic_worth_rtng%TYPE
  gw_DSC: number; // seedlot_genetic_worth.genetic_worth_rtng%TYPE
  gw_DSG: number; // seedlot_genetic_worth.genetic_worth_rtng%TYPE
  gw_GVO: number; // seedlot_genetic_worth.genetic_worth_rtng%TYPE
  gw_IWS: number; // seedlot_genetic_worth.genetic_worth_rtng%TYPE
  gw_WDU: number; // seedlot_genetic_worth.genetic_worth_rtng%TYPE
  gw_WVE: number; // seedlot_genetic_worth.genetic_worth_rtng%TYPE
  gw_WWD: number; // seedlot_genetic_worth.genetic_worth_rtng%TYPE
  total_parent_trees: number; // seedlot.total_parent_trees%TYPE
  pct_tested_parent_trees_AD : number; // NUMBER(3)
  pct_tested_parent_trees_DFS: number; // NUMBER(3)
  pct_tested_parent_trees_DFU: number; // NUMBER(3)
  pct_tested_parent_trees_DFW: number; // NUMBER(3)
  pct_tested_parent_trees_DSB: number; // NUMBER(3)
  pct_tested_parent_trees_DSC: number; // NUMBER(3)
  pct_tested_parent_trees_DSG: number; // NUMBER(3)
  pct_tested_parent_trees_GVO: number; // NUMBER(3)
  pct_tested_parent_trees_IWS: number; // NUMBER(3)
  pct_tested_parent_trees_WDU: number; // NUMBER(3)
  pct_tested_parent_trees_WVE: number; // NUMBER(3)
  pct_tested_parent_trees_WWD: number; // NUMBER(3)  
  pct_tested_parent_trees: number; // NUMBER(3)
  pct_untested_parent_trees: number; // NUMBER(3));
}

let r_pt_contrib: t_pt_calc | null;
const CONST_CLASS_B_LOTNUM_MIN: string; // CONSTANT VARCHAR2(5) = '53000';
const CONST_CLASS_B_LOTNUM_MAX: string; // CONSTANT VARCHAR2(5) = '59999';
const CONST_CLASS_A_LOTNUM_MIN: string; // CONSTANT VARCHAR2(5) = '63000';
const CONST_CLASS_A_LOTNUM_MAX: string; // CONSTANT VARCHAR2(5) = '69999';
const CONST_CLASS_B_COPY_MIN  : string; // CONSTANT VARCHAR2(5) = '52000';
const CONST_CLASS_B_COPY_MAX  : string; // CONSTANT VARCHAR2(5) = '52999';
const CONST_CLASS_A_COPY_MIN  : string; // CONSTANT VARCHAR2(5) = '62000';
const CONST_CLASS_A_COPY_MAX  : string; // CONSTANT VARCHAR2(5) = '62999';

/*
 * Procedure:  get_previous_seedlot_values
 * Purpose:    Set the previous seedlot values used for validations.
 *             Pass p_force=true to force get of latest values when
 *             they have already been retrieved.
 */
function get_previous_seedlot_values(p_force: boolean = false) {
  // Previous: SELECT * FROM seedlotWHERE seedlot_number = g_seedlot_number;
  // --if (record == empty or caller specified FORCE option
  if (r_previous.seedlot_number == null || p_force) {
    // OPEN c_previous;
    // FETCH c_previous INTO r_previous;
    // CLOSE c_previous;
    // --Don't populate old values into vars if (seedlot was not found
    if (g_seedlot_number == r_previous.seedlot_number) {
      //--Populate vars with previous values (don't get revision_count)
      g_seed_plan_zone_code         = r_previous.seed_plan_zone_code;
      g_applicant_client_locn       = r_previous.applicant_client_locn;
      g_applicant_client_number     = r_previous.applicant_client_number;
      g_applicant_email_address     = r_previous.applicant_email_address;
      g_bc_source_ind               = r_previous.bc_source_ind;
      g_biotech_processes_ind       = r_previous.biotech_processes_ind;
      g_collection_area_radius      = r_previous.collection_area_radius;
      g_collection_bgc_ind          = r_previous.collection_bgc_ind;
      g_collection_spz_ind          = r_previous.collection_seed_plan_zone_ind;
      g_coll_standard_met_ind       = r_previous.collection_standard_met_ind;
      g_cone_collection_method2_cd  = r_previous.cone_collection_method2_code;
      g_contaminant_pollen_bv       = r_previous.contaminant_pollen_bv;
      g_controlled_cross_ind        = r_previous.controlled_cross_ind;
      g_declared_userid             = r_previous.declared_userid;
      g_declared_timestamp          = r_previous.declared_timestamp;
      g_female_gametic_mthd_code    = r_previous.female_gametic_mthd_code;
      g_latitude_sec_max            = r_previous.latitude_sec_max;
      g_latitude_sec_min            = r_previous.latitude_sec_min;
      g_longitude_sec_max           = r_previous.longitude_sec_max;
      g_longitude_sec_min           = r_previous.longitude_sec_min;
      g_male_gametic_mthd_code      = r_previous.male_gametic_mthd_code;
      g_orchard_comment             = r_previous.orchard_comment;
      g_orchard_contamination_pct   = r_previous.orchard_contamination_pct;
      g_pollen_contamination_ind    = r_previous.pollen_contamination_ind;
      g_pollen_contam_mthd_code     = r_previous.pollen_contamination_mthd_code;
      g_pollen_contamination_pct    = r_previous.pollen_contamination_pct;
      g_provenance_id               = r_previous.provenance_id;
      g_secondary_orchard_id        = r_previous.secondary_orchard_id;
      g_seed_plan_unit_id           = r_previous.seed_plan_unit_id;
      g_seed_store_client_locn      = r_previous.seed_store_client_locn;
      g_seed_store_client_number    = r_previous.seed_store_client_number;
      g_seedlot_source_code         = r_previous.seedlot_source_code;
      g_smp_mean_bv_GVO             = r_previous.smp_mean_bv_growth;
      g_smp_parents_outside         = r_previous.smp_parents_outside;
      g_smp_success_pct             = r_previous.smp_success_pct;
      g_temporary_storage_end_date  = r_previous.temporary_storage_end_date;
      g_temporary_storage_start_dt  = r_previous.temporary_storage_start_date;
      g_total_parent_trees          = r_previous.total_parent_trees;
      g_latitude_seconds            = r_previous.latitude_seconds;
      g_longitude_seconds           = r_previous.longitude_seconds;
      g_collection_lat_sec          = r_previous.collection_lat_sec;
      g_collection_long_sec         = r_previous.collection_long_sec;
      g_seedlot_status_code         = r_previous.seedlot_status_code;
      g_vegetation_code             = r_previous.vegetation_code;
      g_genetic_class_code          = r_previous.genetic_class_code;
      g_collection_source_code      = r_previous.collection_source_code;
      g_superior_prvnc_ind          = r_previous.superior_prvnc_ind;
      g_org_unit_no                 = r_previous.org_unit_no;
      g_registered_seed_ind         = r_previous.registered_seed_ind;
      g_to_be_registrd_ind          = r_previous.to_be_registrd_ind;
      g_registered_date             = r_previous.registered_date;
      g_fs721a_signed_ind           = r_previous.fs721a_signed_ind;
      g_nad_datum_code              = r_previous.nad_datum_code;
      g_utm_zone                    = r_previous.utm_zone;
      g_utm_easting                 = r_previous.utm_easting;
      g_utm_northing                = r_previous.utm_northing;
      g_longitude_degrees           = r_previous.longitude_degrees;
      g_longitude_minutes           = r_previous.longitude_minutes;
      g_longitude_deg_min           = r_previous.longitude_deg_min;
      g_longitude_min_min           = r_previous.longitude_min_min;
      g_longitude_deg_max           = r_previous.longitude_deg_max;
      g_longitude_min_max           = r_previous.longitude_min_max;
      g_latitude_degrees            = r_previous.latitude_degrees;
      g_latitude_minutes            = r_previous.latitude_minutes;
      g_latitude_deg_min            = r_previous.latitude_deg_min;
      g_latitude_min_min            = r_previous.latitude_min_min;
      g_latitude_deg_max            = r_previous.latitude_deg_max;
      g_latitude_min_max            = r_previous.latitude_min_max;
      g_seed_coast_area_code        = r_previous.seed_coast_area_code;
      g_elevation                   = r_previous.elevation;
      g_elevation_min               = r_previous.elevation_min;
      g_elevation_max               = r_previous.elevation_max;
      g_orchard_id                  = r_previous.orchard_id;
      g_collection_locn_desc        = r_previous.collection_locn_desc;
      g_collection_cli_number       = r_previous.collection_cli_number;
      g_collection_cli_locn_cd      = r_previous.collection_cli_locn_cd;
      g_collection_start_date       = r_previous.collection_start_date;
      g_collection_end_date         = r_previous.collection_end_date;
      g_cone_collection_method_cd   = r_previous.cone_collection_method_code;
      g_no_of_containers            = r_previous.no_of_containers;
      g_clctn_volume                = r_previous.clctn_volume;
      g_vol_per_container           = r_previous.vol_per_container;
      g_nmbr_trees_from_code        = r_previous.nmbr_trees_from_code;
      g_coancestry                  = r_previous.coancestry;
      g_effective_pop_size          = r_previous.effective_pop_size;
      g_original_seed_qty           = r_previous.original_seed_qty;
      g_interm_strg_client_number   = r_previous.interm_strg_client_number;
      g_interm_strg_client_locn     = r_previous.interm_strg_client_locn;
      g_interm_strg_st_date         = r_previous.interm_strg_st_date;
      g_interm_strg_end_date        = r_previous.interm_strg_end_date;
      g_interm_facility_code        = r_previous.interm_facility_code;
      g_extraction_st_date          = r_previous.extraction_st_date;
      g_extraction_end_date         = r_previous.extraction_end_date;
      g_extraction_volume           = r_previous.extraction_volume;
      g_extrct_cli_number           = r_previous.extrct_cli_number;
      g_extrct_cli_locn_cd          = r_previous.extrct_cli_locn_cd;
      g_stored_cli_number           = r_previous.stored_cli_number;
      g_stored_cli_locn_cd          = r_previous.stored_cli_locn_cd;
      g_lngterm_strg_st_date        = r_previous.lngterm_strg_st_date;
      g_historical_tsr_date         = r_previous.historical_tsr_date;
      g_collection_lat_deg          = r_previous.collection_lat_deg;
      g_collection_lat_min          = r_previous.collection_lat_min;
      g_collection_latitude_code    = r_previous.collection_latitude_code;
      g_collection_long_deg         = r_previous.collection_long_deg;
      g_collection_long_min         = r_previous.collection_long_min;
      g_collection_longitude_code   = r_previous.collection_longitude_code;
      g_collection_elevation        = r_previous.collection_elevation;
      g_collection_elevation_min    = r_previous.collection_elevation_min;
      g_collection_elevation_max    = r_previous.collection_elevation_max;
      g_entry_timestamp             = r_previous.entry_timestamp;
      g_entry_userid                = r_previous.entry_userid;
      g_update_timestamp            = r_previous.update_timestamp;
      g_update_userid               = r_previous.update_userid;
      g_approved_timestamp          = r_previous.approved_timestamp;
      g_approved_userid             = r_previous.approved_userid;
      g_interm_strg_locn            = r_previous.interm_strg_locn;
      g_interm_strg_cmt             = r_previous.interm_strg_cmt;
      g_ownership_comment           = r_previous.ownership_comment;
      g_cone_seed_desc              = r_previous.cone_seed_desc;
      g_extraction_comment          = r_previous.extraction_comment;
      g_seedlot_comment             = r_previous.seedlot_comment;
      g_bgc_zone_code               = r_previous.bgc_zone_code;
      g_bgc_subzone_code            = r_previous.bgc_subzone_code;
      g_variant                     = r_previous.variant;
      g_bec_version_id              = r_previous.bec_version_id;
      // --get spz's
      g_spz_list = get_seedlot_spz_list(g_seedlot_number);
    }
  }
}

/*
 * Procedure:  init
 * Purpose:    Initialize member variables
 */
function init(p_seedlot_number: string | null = null) {
  g_error_message = null;
  g_seed_plan_zone_code = null;
  gb_seed_plan_zone_code = 'N';
  g_seed_plan_zone_id = null;
  gb_seed_plan_zone_id = 'N';
  g_applicant_client_locn = null;
  gb_applicant_client_locn = 'N';
  g_applicant_client_number = null;
  gb_applicant_client_number = 'N';
  g_applicant_email_address = null;
  gb_applicant_email_address = 'N';
  g_bc_source_ind = null;
  gb_bc_source_ind = 'N';
  g_biotech_processes_ind = null;
  gb_biotech_processes_ind = 'N';
  g_collection_area_radius = null;
  gb_collection_area_radius = 'N';
  g_collection_bgc_ind = null;
  gb_collection_bgc_ind = 'N';
  g_collection_spz_ind = null;
  gb_collection_spz_ind = 'N';
  g_coll_standard_met_ind = null;
  gb_coll_standard_met_ind = 'N';
  g_cone_collection_method2_cd = null;
  gb_cone_collection_method2_cd = 'N';
  g_contaminant_pollen_bv = null;
  gb_contaminant_pollen_bv = 'N';
  g_controlled_cross_ind = null;
  gb_controlled_cross_ind = 'N';
  g_declared_userid = null;
  gb_declared_userid = 'N';
  g_declared_timestamp = null;
  gb_declared_timestamp = 'N';
  g_female_gametic_mthd_code = null;
  gb_female_gametic_mthd_code = 'N';
  g_latitude_sec_max = null;
  gb_latitude_sec_max = 'N';
  g_latitude_sec_min = null;
  gb_latitude_sec_min = 'N';
  g_longitude_sec_max = null;
  gb_longitude_sec_max = 'N';
  g_longitude_sec_min = null;
  gb_longitude_sec_min = 'N';
  g_male_gametic_mthd_code = null;
  gb_male_gametic_mthd_code = 'N';
  g_orchard_comment = null;
  gb_orchard_comment = 'N';
  g_orchard_contamination_pct = null;
  gb_orchard_contamination_pct = 'N';
  g_pollen_contamination_ind = null;
  gb_pollen_contamination_ind = 'N';
  g_pollen_contam_mthd_code = null;
  gb_pollen_contam_mthd_code = 'N';
  g_pollen_contamination_pct = null;
  gb_pollen_contamination_pct = 'N';
  g_provenance_id = null;
  gb_provenance_id = 'N';
  g_secondary_orchard_id = null;
  gb_secondary_orchard_id = 'N';
  g_seed_plan_unit_id = null;
  gb_seed_plan_unit_id = 'N';
  g_seed_store_client_locn = null;
  gb_seed_store_client_locn = 'N';
  g_seed_store_client_number = null;
  gb_seed_store_client_number = 'N';
  g_seedlot_source_code = null;
  gb_seedlot_source_code = 'N';
  g_smp_mean_bv_AD = null;
  gb_smp_mean_bv_AD = 'N';
  g_smp_mean_bv_DFS = null;
  gb_smp_mean_bv_DFS = 'N';
  g_smp_mean_bv_DFU = null;
  gb_smp_mean_bv_DFU = 'N';
  g_smp_mean_bv_DFW = null;
  gb_smp_mean_bv_DFW = 'N';
  g_smp_mean_bv_DSB = null;
  gb_smp_mean_bv_DSB = 'N';
  g_smp_mean_bv_DSC = null;
  gb_smp_mean_bv_DSC = 'N';
  g_smp_mean_bv_DSG = null;
  gb_smp_mean_bv_DSG = 'N';
  g_smp_mean_bv_GVO = null;
  gb_smp_mean_bv_GVO = 'N';
  g_smp_mean_bv_IWS = null;
  gb_smp_mean_bv_IWS = 'N';
  g_smp_mean_bv_WDU = null;
  gb_smp_mean_bv_WDU = 'N';
  g_smp_mean_bv_WVE = null;
  gb_smp_mean_bv_WVE = 'N';
  g_smp_mean_bv_WWD = null;
  gb_smp_mean_bv_WWD = 'N';
  g_smp_parents_outside = null;
  gb_smp_parents_outside = 'N';
  g_smp_success_pct = null;
  gb_smp_success_pct = 'N';
  g_temporary_storage_end_date = null;
  gb_temporary_storage_end_date = 'N';
  g_temporary_storage_start_dt = null;
  gb_temporary_storage_start_dt = 'N';
  g_total_parent_trees = null;
  gb_total_parent_trees = 'N';
  g_latitude_seconds = null;
  gb_latitude_seconds = 'N';
  g_longitude_seconds = null;
  gb_longitude_seconds = 'N';
  g_collection_lat_sec = null;
  gb_collection_lat_sec = 'N';
  g_collection_long_sec = null;
  gb_collection_long_sec = 'N';
  g_seedlot_number = null;
  gb_seedlot_number = 'N';
  g_seedlot_status_code = null;
  gb_seedlot_status_code = 'N';
  g_vegetation_code = null;
  gb_vegetation_code = 'N';
  g_genetic_class_code = null;
  gb_genetic_class_code = 'N';
  g_collection_source_code = null;
  gb_collection_source_code = 'N';
  g_superior_prvnc_ind = null;
  gb_superior_prvnc_ind = 'N';
  g_org_unit_no = null;
  gb_org_unit_no = 'N';
  g_registered_seed_ind = null;
  gb_registered_seed_ind = 'N';
  g_to_be_registrd_ind = null;
  gb_to_be_registrd_ind = 'N';
  g_registered_date = null;
  gb_registered_date = 'N';
  g_fs721a_signed_ind = null;
  gb_fs721a_signed_ind = 'N';
  g_nad_datum_code = null;
  gb_nad_datum_code = 'N';
  g_utm_zone = null;
  gb_utm_zone = 'N';
  g_utm_easting = null;
  gb_utm_easting = 'N';
  g_utm_northing = null;
  gb_utm_northing = 'N';
  g_longitude_degrees = null;
  gb_longitude_degrees = 'N';
  g_longitude_minutes = null;
  gb_longitude_minutes = 'N';
  g_longitude_deg_min = null;
  gb_longitude_deg_min = 'N';
  g_longitude_min_min = null;
  gb_longitude_min_min = 'N';
  g_longitude_deg_max = null;
  gb_longitude_deg_max = 'N';
  g_longitude_min_max = null;
  gb_longitude_min_max = 'N';
  g_latitude_degrees = null;
  gb_latitude_degrees = 'N';
  g_latitude_minutes = null;
  gb_latitude_minutes = 'N';
  g_latitude_deg_min = null;
  gb_latitude_deg_min = 'N';
  g_latitude_min_min = null;
  gb_latitude_min_min = 'N';
  g_latitude_deg_max = null;
  gb_latitude_deg_max = 'N';
  g_latitude_min_max = null;
  gb_latitude_min_max = 'N';
  g_seed_coast_area_code = null;
  gb_seed_coast_area_code = 'N';
  g_elevation = null;
  gb_elevation = 'N';
  g_elevation_min = null;
  gb_elevation_min = 'N';
  g_elevation_max = null;
  gb_elevation_max = 'N';
  g_orchard_id = null;
  gb_orchard_id = 'N';
  g_collection_locn_desc = null;
  gb_collection_locn_desc = 'N';
  g_collection_cli_number = null;
  gb_collection_cli_number = 'N';
  g_collection_cli_locn_cd = null;
  gb_collection_cli_locn_cd = 'N';
  g_collection_start_date = null;
  gb_collection_start_date = 'N';
  g_collection_end_date = null;
  gb_collection_end_date = 'N';
  g_cone_collection_method_cd = null;
  gb_cone_collection_method_cd = 'N';
  g_no_of_containers = null;
  gb_no_of_containers = 'N';
  g_clctn_volume = null;
  gb_clctn_volume = 'N';
  g_vol_per_container = null;
  gb_vol_per_container = 'N';
  g_nmbr_trees_from_code = null;
  gb_nmbr_trees_from_code = 'N';
  g_coancestry = null;
  gb_coancestry = 'N';
  g_effective_pop_size = null;
  gb_effective_pop_size = 'N';
  g_original_seed_qty = null;
  gb_original_seed_qty = 'N';
  g_interm_strg_client_number = null;
  gb_interm_strg_client_number = 'N';
  g_interm_strg_client_locn = null;
  gb_interm_strg_client_locn = 'N';
  g_interm_strg_st_date = null;
  gb_interm_strg_st_date = 'N';
  g_interm_strg_end_date = null;
  gb_interm_strg_end_date = 'N';
  g_interm_facility_code = null;
  gb_interm_facility_code = 'N';
  g_extraction_st_date = null;
  gb_extraction_st_date = 'N';
  g_extraction_end_date = null;
  gb_extraction_end_date = 'N';
  g_extraction_volume = null;
  gb_extraction_volume = 'N';
  g_extrct_cli_number = null;
  gb_extrct_cli_number = 'N';
  g_extrct_cli_locn_cd = null;
  gb_extrct_cli_locn_cd = 'N';
  g_stored_cli_number = null;
  gb_stored_cli_number = 'N';
  g_stored_cli_locn_cd = null;
  gb_stored_cli_locn_cd = 'N';
  g_lngterm_strg_st_date = null;
  gb_lngterm_strg_st_date = 'N';
  g_historical_tsr_date = null;
  gb_historical_tsr_date = 'N';
  g_collection_lat_deg = null;
  gb_collection_lat_deg = 'N';
  g_collection_lat_min = null;
  gb_collection_lat_min = 'N';
  g_collection_latitude_code = null;
  gb_collection_latitude_code = 'N';
  g_collection_long_deg = null;
  gb_collection_long_deg = 'N';
  g_collection_long_min = null;
  gb_collection_long_min = 'N';
  g_collection_longitude_code = null;
  gb_collection_longitude_code = 'N';
  g_collection_elevation = null;
  gb_collection_elevation = 'N';
  g_collection_elevation_min = null;
  gb_collection_elevation_min = 'N';
  g_collection_elevation_max = null;
  gb_collection_elevation_max = 'N';
  g_entry_timestamp = null;
  gb_entry_timestamp = 'N';
  g_entry_userid = null;
  gb_entry_userid = 'N';
  g_update_timestamp = null;
  gb_update_timestamp = 'N';
  g_update_userid = null;
  gb_update_userid = 'N';
  g_approved_timestamp = null;
  gb_approved_timestamp = 'N';
  g_approved_userid = null;
  gb_approved_userid = 'N';
  g_revision_count = null;
  gb_revision_count = 'N';
  g_interm_strg_locn = null;
  gb_interm_strg_locn = 'N';
  g_interm_strg_cmt = null;
  gb_interm_strg_cmt = 'N';
  g_ownership_comment = null;
  gb_ownership_comment = 'N';
  g_cone_seed_desc = null;
  gb_cone_seed_desc = 'N';
  g_extraction_comment = null;
  gb_extraction_comment = 'N';
  g_seedlot_comment = null;
  gb_seedlot_comment = 'N';
  g_bgc_zone_code = null;
  gb_bgc_zone_code = 'N';
  g_bgc_subzone_code = null;
  gb_bgc_subzone_code = 'N';
  g_variant = null;
  gb_variant = 'N';
  g_bec_version_id = null;
  gb_bec_version_id = 'N';
  g_gw_AD  = null;
  g_gw_DFS = null;
  g_gw_DFU = null;
  g_gw_DFW = null;
  g_gw_DSB = null;
  g_gw_DSC = null;
  g_gw_DSG = null;
  g_gw_GVO = null;
  g_gw_IWS = null;
  g_gw_WDU = null;
  g_gw_WVE = null;
  g_gw_WWD = null;
  g_spz_list = null;
  g_tested_parent_trees_pct = null;
  g_tested_parent_trees_pct_AD = null;
  g_tested_parent_trees_pct_DFS = null;
  g_tested_parent_trees_pct_DFU = null;
  g_tested_parent_trees_pct_DFW = null;
  g_tested_parent_trees_pct_DSB = null;
  g_tested_parent_trees_pct_DSC = null;
  g_tested_parent_trees_pct_DSG = null;
  g_tested_parent_trees_pct_GVO = null;
  g_tested_parent_trees_pct_IWS = null;
  g_tested_parent_trees_pct_WDU = null;
  g_tested_parent_trees_pct_WVE = null;
  g_tested_parent_trees_pct_WWD = null;
  g_untested_parent_trees_pct = null;
  g_is_lot_split = null;
  // --Record types
  r_previous = null;
  r_pt_contrib = null;
  if (p_seedlot_number != null) {
    g_seedlot_number = p_seedlot_number;
    get_previous_seedlot_values(true);
  }
}

// --***START GETTERS
function error_raised(): boolean {
  return g_error_message != null;
}
function get_error_message(): string | null {
  return g_error_message;
}
function get_seed_plan_zone_code(): string | null { // VARCHAR2;
  return g_seed_plan_zone_code;
}
function get_seed_plan_zone_id(): string | null { // VARCHAR2;
  return g_seed_plan_zone_id;
}
function get_applicant_client_locn(): string | null { // VARCHAR2;
  return g_applicant_client_locn;
}
function get_applicant_client_number(): string | null { // VARCHAR2;
  return g_applicant_client_number;
}
function get_applicant_email_address(): string | null { // VARCHAR2;
  return g_applicant_email_address;
}
function get_bc_source_ind(): string | null { // VARCHAR2;
  return g_bc_source_ind;
}
function get_biotech_processes_ind(): string | null { // VARCHAR2;
  return g_biotech_processes_ind;
}
function get_collection_area_radius(): number | null { // NUMBER
  return g_collection_area_radius;
}
function get_collection_bgc_ind(): string | null { // VARCHAR2;
  return g_collection_bgc_ind;
}
function get_collection_spz_ind(): string | null { // VARCHAR2;
  return g_collection_spz_ind;
}
function get_coll_standard_met_ind(): string | null { // VARCHAR2;
  return g_coll_standard_met_ind;
}
function get_cone_collection_method2_cd(): string | null { // VARCHAR2;
  return g_cone_collection_method2_cd;
}
function get_contaminant_pollen_bv(): number | null { // NUMBER
  return g_contaminant_pollen_bv;
}
function get_controlled_cross_ind(): string | null { // VARCHAR2;
  return g_controlled_cross_ind;
}
function get_declared_userid(): string | null { // VARCHAR2;
  return g_declared_userid;
}
function get_declared_timestamp(): Date | null { // DATE
  return g_declared_timestamp;
}
function get_female_gametic_mthd_code(): string | null { // VARCHAR2;
  return g_female_gametic_mthd_code;
}
function get_latitude_sec_max(): number | null { // NUMBER
  return g_latitude_sec_max;
}
function get_latitude_sec_min(): number | null { // NUMBER
  return g_latitude_sec_min;
}
function get_longitude_sec_max(): number | null { // NUMBER
  return g_longitude_sec_max;
}
function get_longitude_sec_min(): number | null { // NUMBER
  return g_longitude_sec_min;
}
function get_male_gametic_mthd_code(): string | null { // VARCHAR2;
  return g_male_gametic_mthd_code;
}
function get_orchard_comment(): string | null { // VARCHAR2;
  return g_orchard_comment;
}
function get_orchard_contamination_pct(): number | null { // NUMBER
  return g_orchard_contamination_pct;
}
function get_pollen_contamination_ind(): string | null { // VARCHAR2;
  return g_pollen_contamination_ind;
}
function get_pollen_contam_mthd_code(): string | null { // VARCHAR2;
  return g_pollen_contam_mthd_code;
}
function get_pollen_contamination_pct(): number | null { // NUMBER
  return g_pollen_contamination_pct;
}
function get_provenance_id(): number | null { // NUMBER
  return g_provenance_id;
}
function get_secondary_orchard_id(): string | null { // VARCHAR2;
  return g_secondary_orchard_id;
}
function get_seed_plan_unit_id(): number | null { // NUMBER
  return g_seed_plan_unit_id;
}
function get_seed_store_client_locn(): string | null { // VARCHAR2;
  return g_seed_store_client_locn;
}
function get_seed_store_client_number(): string | null { // VARCHAR2;
  return g_seed_store_client_number;
}
function get_seedlot_source_code(): string | null { // VARCHAR2;
  return g_seedlot_source_code;
}
function get_smp_mean_bv_AD(): number | null {
  return g_smp_mean_bv_AD;
}
function get_smp_mean_bv_DFS(): number | null { // VARCHAR2;
  return g_smp_mean_bv_DFS;
}
function get_smp_mean_bv_DFU(): number | null { // VARCHAR2;
  return g_smp_mean_bv_DFU;
}
function get_smp_mean_bv_DFW(): number | null { // VARCHAR2;
  return g_smp_mean_bv_DFW;
}
function get_smp_mean_bv_DSB(): number | null { // VARCHAR2;
  return g_smp_mean_bv_DSB;
}
function get_smp_mean_bv_DSC(): number | null { // VARCHAR2;
  return g_smp_mean_bv_DSC;
}
function get_smp_mean_bv_DSG(): number | null { // VARCHAR2;
  return g_smp_mean_bv_DSG;
}
function get_smp_mean_bv_GVO(): number | null { // VARCHAR2;
  return g_smp_mean_bv_GVO;
}
function get_smp_mean_bv_IWS(): number | null { // VARCHAR2;
  return g_smp_mean_bv_IWS;
}
function get_smp_mean_bv_WDU(): number | null { // VARCHAR2;
  return g_smp_mean_bv_WDU;
}
function get_smp_mean_bv_WVE(): number | null { // VARCHAR2;
  return g_smp_mean_bv_WVE;
}
function get_smp_mean_bv_WWD(): number | null { // VARCHAR2;
  return g_smp_mean_bv_WWD;
}
function get_smp_parents_outside(): number | null { // NUMBER
  return g_smp_parents_outside;
}
function get_smp_success_pct(): number | null { // NUMBER
  return g_smp_success_pct;
}
function get_temporary_storage_end_date(): Date | null { // DATE
  return g_temporary_storage_end_date;
}
function get_temporary_storage_start_dt(): Date | null { // DATE
  return g_temporary_storage_start_dt;
}
function get_total_parent_trees(): number | null { // NUMBER
  return g_total_parent_trees;
}
function get_latitude_seconds(): number | null { // NUMBER
  return g_latitude_seconds;
}
function get_longitude_seconds(): number | null { // NUMBER
  return g_longitude_seconds;
}
function get_collection_lat_sec(): number | null { // NUMBER
  return g_collection_lat_sec;
}
function get_collection_long_sec(): number | null { // NUMBER
  return g_collection_long_sec;
}
function get_seedlot_number(): string | null { // VARCHAR2;
  return g_seedlot_number;
}
function get_seedlot_status_code(): string | null { // VARCHAR2;
  return g_seedlot_status_code;
}
function get_vegetation_code(): string | null { // VARCHAR2;
  return g_vegetation_code;
}
function get_genetic_class_code(): string | null { // VARCHAR2;
  return g_genetic_class_code;
}
function get_collection_source_code(): string | null { // VARCHAR2;
  return g_collection_source_code;
}
function get_superior_prvnc_ind(): string | null { // VARCHAR2;
  return g_superior_prvnc_ind;
}
function get_org_unit_no(): number | null { // NUMBER
  return g_org_unit_no;
}
function get_registered_seed_ind(): string | null { // VARCHAR2;
  return g_registered_seed_ind;
}
function get_to_be_registrd_ind(): string | null  { // VARCHAR2;
  return g_to_be_registrd_ind;
}
function get_registered_date(): Date | null  { // DATE
  return g_registered_date;
}
function get_fs721a_signed_ind(): string | null  { // VARCHAR2;
  return g_fs721a_signed_ind;
}
function get_nad_datum_code(): string | null  { // VARCHAR2;
  return g_nad_datum_code;
}
function get_utm_zone(): number | null  { // NUMBER
  return g_utm_zone;
}
function get_utm_easting(): number | null  { // NUMBER
  return g_utm_easting;
}
function get_utm_northing(): number | null { // NUMBER
  return g_utm_northing;
}
function get_longitude_degrees(): number | null { // NUMBER
  return g_longitude_degrees;
}
function get_longitude_minutes(): number | null { // NUMBER
  return g_longitude_minutes;
}
function get_longitude_deg_min(): number | null { // NUMBER
  return g_longitude_deg_min;
}
function get_longitude_min_min(): number | null { // NUMBER
  return g_longitude_min_min;
}
function get_longitude_deg_max(): number | null { // NUMBER
  return g_longitude_deg_max;
}
function get_longitude_min_max(): number | null { // NUMBER
  return g_longitude_min_max;
}
function get_latitude_degrees(): number | null { // NUMBER
  return g_latitude_degrees;
}
function get_latitude_minutes(): number | null { // NUMBER
  return g_latitude_minutes;
}
function get_latitude_deg_min(): number | null { // NUMBER
  return g_latitude_deg_min;
}
function get_latitude_min_min(): number | null { // NUMBER
  return g_latitude_min_min;
}
function get_latitude_deg_max(): number | null { // NUMBER
  return g_latitude_deg_max;
}
function get_latitude_min_max(): number | null { // NUMBER
  return g_latitude_min_max;
}
function get_seed_coast_area_code(): string | null { // VARCHAR2;
  return g_seed_coast_area_code;
}
function get_elevation(): number | null { // NUMBER
  return g_elevation;
}
function get_elevation_min(): number | null { // NUMBER
  return g_elevation_min;
}
function get_elevation_max(): number | null { // NUMBER
  return g_elevation_max;
}
function get_orchard_id(): string | null { // VARCHAR2;
  return g_orchard_id;
}
function get_collection_locn_desc(): string | null { // VARCHAR2;
  return g_collection_locn_desc;
}
function get_collection_cli_number(): string | null { // VARCHAR2;
  return g_collection_cli_number;
}
function get_collection_cli_locn_cd(): string | null { // VARCHAR2;
  return g_collection_cli_locn_cd;
}
function get_collection_start_date(): Date | null { // DATE
  return g_collection_start_date;
}
function get_collection_end_date(): Date | null { // DATE
  return g_collection_end_date;
}
function get_cone_collection_method_cd(): string | null { // VARCHAR2;
  return g_cone_collection_method_cd;
}
function get_no_of_containers(): number | null { // NUMBER
  return g_no_of_containers;
}
function get_clctn_volume(): number | null { // NUMBER
  return g_clctn_volume;
}
function get_vol_per_container(): number | null { // NUMBER
  return g_vol_per_container;
}
function get_nmbr_trees_from_code(): string | null { // VARCHAR2;
  return g_nmbr_trees_from_code;
}
function get_coancestry(): number | null { // NUMBER
  return g_coancestry;
}
function get_effective_pop_size(): number | null { // NUMBER
  return g_effective_pop_size;
}
function get_original_seed_qty(): number | null { // NUMBER
  return g_original_seed_qty;
}
function get_interm_strg_client_number(): string | null { // VARCHAR2;
  return g_interm_strg_client_number;
}
function get_interm_strg_client_locn(): string | null { // VARCHAR2;
  return g_interm_strg_client_locn;
}
function get_interm_strg_st_date(): Date | null { // DATE
  return g_interm_strg_st_date;
}
function get_interm_strg_end_date(): Date | null { // DATE
  return g_interm_strg_end_date;
}
function get_interm_facility_code(): string | null { // VARCHAR2;
  return g_interm_facility_code;
}
function get_extraction_st_date(): Date | null { // DATE
  return g_extraction_st_date;
}
function get_extraction_end_date(): Date | null { // DATE
  return g_extraction_end_date;
}
function get_extraction_volume(): number | null { // NUMBER
  return g_extraction_volume;
}
function get_extrct_cli_number(): string | null { // VARCHAR2;
  return g_extrct_cli_number;
}
function get_extrct_cli_locn_cd(): string | null { // VARCHAR2;
  return g_extrct_cli_locn_cd;
}
function get_stored_cli_number(): string | null { // VARCHAR2;
  return g_stored_cli_number;
}
function get_stored_cli_locn_cd(): string | null { // VARCHAR2;
  return g_stored_cli_locn_cd;
}
function get_lngterm_strg_st_date(): Date | null { // DATE
  return g_lngterm_strg_st_date;
}
function get_historical_tsr_date(): Date | null { // DATE
  return g_historical_tsr_date;
}
function get_collection_lat_deg(): number | null { // NUMBER
  return g_collection_lat_deg;
}
function get_collection_lat_min(): number | null { // NUMBER
  return g_collection_lat_min;
}
function get_collection_latitude_code(): string | null { // VARCHAR2;
  return g_collection_latitude_code;
}
function get_collection_long_deg(): number | null { // NUMBER
  return g_collection_long_deg;
}
function get_collection_long_min(): number | null { // NUMBER
  return g_collection_long_min;
}
function get_collection_longitude_code(): string | null { // VARCHAR2;
  return g_collection_longitude_code;
}
function get_collection_elevation(): number | null { // NUMBER
  return g_collection_elevation;
}
function get_collection_elevation_min(): number | null { // NUMBER
  return g_collection_elevation_min;
}
function get_collection_elevation_max(): number | null { // NUMBER
  return g_collection_elevation_max;
}
function get_entry_timestamp(): Date | null { // DATE
  return g_entry_timestamp;
}
function get_entry_userid(): string | null { // VARCHAR2;
  return g_entry_userid;
}
function get_update_timestamp(): Date | null { // DATE
  return g_update_timestamp;
}
function get_update_userid(): string | null { // VARCHAR2;
  return g_update_userid;
}
function get_approved_timestamp(): Date | null { // DATE
  return g_approved_timestamp;
}
function get_approved_userid(): string | null { // VARCHAR2;
  return g_approved_userid;
}
function get_revision_count(): number | null { // NUMBER
  return g_revision_count;
}
function get_interm_strg_locn(): string | null { // VARCHAR2;
  return g_interm_strg_locn;
}
function get_interm_strg_cmt(): string | null { // VARCHAR2;
  return g_interm_strg_cmt;
}
function get_ownership_comment(): string | null { // VARCHAR2;
  return g_ownership_comment;
}
function get_cone_seed_desc(): string | null { // VARCHAR2;
  return g_cone_seed_desc;
}
function get_extraction_comment(): string | null { // VARCHAR2;
  return g_extraction_comment;
}
function get_seedlot_comment(): string | null { // VARCHAR2;
  return g_seedlot_comment;
}
function get_bgc_zone_code(): string | null { // VARCHAR2;
  return g_bgc_zone_code;
}
function get_bgc_subzone_code(): string | null { // VARCHAR2;
  return g_bgc_subzone_code;
}
function get_variant(): string | null { // VARCHAR2;
  return g_variant;
}
function get_bec_version_id(): string | null { // VARCHAR2;
  return g_bec_version_id;
}
function get_prev_bgc_zone_code(): string | null { // VARCHAR2;
  return r_previous.bgc_zone_code;
}
function get_prev_bgc_subzone_code(): string | null { // VARCHAR2;
  return r_previous.bgc_subzone_code;
}
function get_prev_variant(): string | null { // VARCHAR2;
  return r_previous.variant;
}
function get_prev_collection_lat_deg(): number { // NUMBER
  return r_previous.collection_lat_deg;
}
function get_prev_collection_lat_min(): number { // NUMBER
  return r_previous.collection_lat_min;
}
function get_prev_collection_lat_sec(): string { // VARCHAR2;
  return r_previous.collection_lat_sec;
}
function get_prev_collection_long_deg(): number { // NUMBER
  return r_previous.collection_long_deg;
}
function get_prev_collection_long_min(): number { // NUMBER
  return r_previous.collection_long_min;
}
function get_prev_collection_long_sec(): string { // VARCHAR2;
  return r_previous.collection_long_sec;
}
function get_gw_AD(): number | null { // NUMBER
  return g_gw_AD;
}
function get_gw_DFS(): number | null { // NUMBER
  return g_gw_DFS;
}
function get_gw_DFU(): number | null { // NUMBER
  return g_gw_DFU;
}
function get_gw_DFW(): number | null { // NUMBER
  return g_gw_DFW;
}
function get_gw_DSB(): number | null { // NUMBER
  return g_gw_DSB;
}
function get_gw_DSC(): number | null { // NUMBER
  return g_gw_DSC;
}
function get_gw_DSG(): number | null { // NUMBER
  return g_gw_DSG;
}
function get_gw_GVO(): number | null { // NUMBER
  return g_gw_GVO;
}
function get_gw_IWS(): number | null { // NUMBER
  return g_gw_IWS;
}
function get_gw_WDU(): number | null { // NUMBER
  return g_gw_WDU;
}
function get_gw_WVE(): number | null { // NUMBER
  return g_gw_WVE;
}
function get_gw_WWD(): number | null { // NUMBER
  return g_gw_WWD;
}
function get_spz_list(): string | null { // VARCHAR2;
  return g_spz_list;
}
function get_spz_id_list(): string | null { // VARCHAR2;
  return g_spz_id_list;
}
function get_tested_parent_trees_pct(): number | null { // NUMBER
  return g_tested_parent_trees_pct;
}
function get_tested_parent_trees_pct_AD(): number | null { // NUMBER
  return g_tested_parent_trees_pct_AD == null ? 0 : g_tested_parent_trees_pct_AD;
}
function get_tested_pt_pct_DFS(): number { // NUMBER
  return g_tested_parent_trees_pct_DFS == null ? 0 : g_tested_parent_trees_pct_DFS;
}
function get_tested_pt_pct_DFU(): number { // NUMBER
  return g_tested_parent_trees_pct_DFU == null? 0 : g_tested_parent_trees_pct_DFU;
}
function get_tested_pt_pct_DFW(): number { // NUMBER
  return g_tested_parent_trees_pct_DFW == null? 0 : g_tested_parent_trees_pct_DFW;
}
function get_tested_pt_pct_DSB(): number { // NUMBER
  return g_tested_parent_trees_pct_DSB == null? 0 : g_tested_parent_trees_pct_DSB;
}
function get_tested_pt_pct_DSC(): number | null { // NUMBER
  return g_tested_parent_trees_pct_DSC = null? 0 : g_tested_parent_trees_pct_DSC;
}
function get_tested_pt_pct_DSG(): number { // NUMBER
  return g_tested_parent_trees_pct_DSG == null? 0 : g_tested_parent_trees_pct_DSG;
}
function get_tested_pt_pct_GVO(): number { // NUMBER
  return g_tested_parent_trees_pct_GVO == null? 0 : g_tested_parent_trees_pct_GVO;
}
function get_tested_pt_pct_IWS(): number { // NUMBER
  return g_tested_parent_trees_pct_IWS == null? 0 : g_tested_parent_trees_pct_IWS;
}
function get_tested_pt_pct_WDU(): number { // NUMBER
  return g_tested_parent_trees_pct_WDU == null? 0 : g_tested_parent_trees_pct_WDU;
}
function get_tested_pt_pct_WVE(): number { // NUMBER
  return g_tested_parent_trees_pct_WVE == null? 0 : g_tested_parent_trees_pct_WVE;
}
function get_tested_pt_pct_WWD(): number { // NUMBER
  return g_tested_parent_trees_pct_WWD == null? 0 : g_tested_parent_trees_pct_WWD;
}
function get_untested_parent_trees_pct(): number | null { // NUMBER
  return g_untested_parent_trees_pct;
}
function get_is_lot_split(): boolean | null { // BOOLEAN
  return g_is_lot_split;
}

//-- Get the current bgc for the seedlot.
function get_new_bgc(p_seedlot_number: string): string {
  let v_planting_site_point: object; // MDSYS.SDO_GEOMETRY;
  let v_bgc_zone_code: string = '';
  let v_bgc_subzone_code: string = '';
  let v_variant: string = '';
  let v_bgc_string: string = '';
  
  // -- We are in trouble if (there's no Geometry entry for the seedlot...
  // -- retrieve && set the seedlot geometry capture method.
  spr_seedlot_geometry.init(p_seedlot_number);
  spr_seedlot_geometry.set_seedlot_number(p_seedlot_number);
  spr_seedlot_geometry.get();
  v_planting_site_point = spr_seedlot_geometry.get_geometry();
  if (v_planting_site_point != null) {
      spr_spatial_utils.get_bec(v_planting_site_point, v_bgc_zone_code, v_bgc_subzone_code, v_variant);
      v_bgc_string = v_bgc_zone_code || ' ' || v_bgc_subzone_code || ' ' || v_variant;
  }
  return v_bgc_string;
}
// -- Get the current spz for the seedlot.
function get_new_spz(p_seedlot_number: string): string {
  let v_planting_site_point: object; // MDSYS.SDO_GEOMETRY;
  let v_vegetation_code: string = '';
  let v_spzb: string = '';

  //-- We are in trouble if (there's no Geometry entry for the seedlot...
  //-- retrieve && set the seedlot geometry capture method.
  spr_seedlot_geometry.init(p_seedlot_number);
  spr_seedlot_geometry.set_seedlot_number(p_seedlot_number);
  spr_seedlot_geometry.get();
  v_planting_site_point = spr_seedlot_geometry.get_geometry;
  //-- Get the vegetation code from the seedlot.
  // SELECT vegetation_code INTO v_vegetation_code FROM seedlot WHERE seedlot_number = p_seedlot_number;
  if (v_planting_site_point != null) {
    v_spzb = spr_spatial_utils.get_spzb(v_planting_site_point, v_vegetation_code);
  }
  return v_spzb;
}

function is_collection_lat_empty(): boolean {
  return g_collection_lat_deg == null && g_collection_lat_min == null && g_collection_lat_sec == null;
}
function is_collection_long_empty(): boolean {
  return g_collection_long_deg == null && g_collection_long_min == null && g_collection_long_sec == null;
}
// -->Area of use can == replaced for these statuses even if (it == specified
function is_area_of_use_status(): boolean {
  const list: string[] = ['INC', 'PND'];
  let g_seedlot_status_code_not_null = g_seedlot_status_code == null? '' : g_seedlot_status_code;
  return (list.includes(g_seedlot_status_code_not_null)) || (list.includes(r_previous.seedlot_status_code));
}
function replace_area_of_use(p_check_value: number | string | null): boolean {
  return is_area_of_use_status() || p_check_value == null;
}
function is_area_of_use_elev_empty(): boolean {
  return g_elevation_min == null&& g_elevation_max == null;
}
function is_area_of_use_lat_min_empty(): boolean {
  return g_latitude_deg_min == null && g_latitude_min_min == null && g_latitude_sec_min == null;
}
function is_area_of_use_lat_max_empty(): boolean {
  return g_latitude_deg_max == null && g_latitude_min_max == null && g_latitude_sec_max == null;
}
function is_area_of_use_lat_empty(): boolean {
  return is_area_of_use_lat_min_empty() && is_area_of_use_lat_max_empty();
}
function is_area_of_use_long_min_empty(): boolean {
  return g_longitude_deg_min == null && g_longitude_min_min == null && g_longitude_sec_min == null;
}
function is_area_of_use_long_max_empty(): boolean {
  return g_longitude_deg_max == null && g_longitude_min_max == null && g_longitude_sec_max == null;
}
function is_area_of_use_long_empty(): boolean {
  return is_area_of_use_long_min_empty() && is_area_of_use_long_max_empty();
}
// -->Lots approved on or after 2005-04-01 must adhere to Chief Forester's St&&ards
function is_lot_under_CFS(): boolean {
  return g_approved_timestamp == null || g_approved_timestamp >= new Date('2005-04-01');
}
// --***END GETTERS
// --***START SETTERS
function set_seed_plan_zone_code(p_value: string) {
  g_seed_plan_zone_code = p_value;
  gb_seed_plan_zone_code = 'Y';
}
function set_seed_plan_zone_id(p_value: string) {
  g_seed_plan_zone_id = p_value;
  gb_seed_plan_zone_id = 'Y';
}
function set_applicant_client_locn(p_value: string) {
  g_applicant_client_locn = p_value;
  gb_applicant_client_locn = 'Y';
}
function set_applicant_client_number(p_value: string) {
  g_applicant_client_number = p_value;
  gb_applicant_client_number = 'Y';
}
function set_applicant_email_address(p_value: string) {
  g_applicant_email_address = p_value;
  gb_applicant_email_address = 'Y';
}
function set_bc_source_ind(p_value: string) {
  g_bc_source_ind = p_value;
  gb_bc_source_ind = 'Y';
}
function set_biotech_processes_ind(p_value: string) {
  g_biotech_processes_ind = p_value;
  gb_biotech_processes_ind = 'Y';
}
function set_collection_area_radius(p_value: number) {
  g_collection_area_radius = p_value;
  gb_collection_area_radius = 'Y';
}
function set_collection_bgc_ind(p_value: string) {
  g_collection_bgc_ind = p_value;
  gb_collection_bgc_ind = 'Y';
}
function set_collection_spz_ind(p_value: string) {
  g_collection_spz_ind = p_value;
  gb_collection_spz_ind = 'Y';
}
function set_coll_standard_met_ind(p_value: string) {
  g_coll_standard_met_ind = p_value;
  gb_coll_standard_met_ind = 'Y';
}
function set_cone_collection_method2_cd(p_value: string) {
  g_cone_collection_method2_cd = p_value;
  gb_cone_collection_method2_cd = 'Y';
}
function set_contaminant_pollen_bv(p_value: number) {
  g_contaminant_pollen_bv = p_value;
  gb_contaminant_pollen_bv = 'Y';
}
function set_controlled_cross_ind(p_value: string) {
  g_controlled_cross_ind = p_value;
  gb_controlled_cross_ind = 'Y';
}
function set_declared_userid(p_value: string) {
  g_declared_userid = p_value;
  gb_declared_userid = 'Y';
}
function set_declared_timestamp(p_value: Date) {
  g_declared_timestamp = p_value;
  gb_declared_timestamp = 'Y';
}
function set_female_gametic_mthd_code(p_value: string) {
  g_female_gametic_mthd_code = p_value;
  gb_female_gametic_mthd_code = 'Y';
}
function set_latitude_sec_max(p_value: number | null) {
  g_latitude_sec_max = p_value;
  gb_latitude_sec_max = 'Y';
}
function set_latitude_sec_min(p_value: number | null) {
  g_latitude_sec_min = p_value;
  gb_latitude_sec_min = 'Y';
}
function set_longitude_sec_max(p_value: number | null) {
  g_longitude_sec_max = p_value;
  gb_longitude_sec_max = 'Y';
}
function set_longitude_sec_min(p_value: number | null) {
  g_longitude_sec_min = p_value;
  gb_longitude_sec_min = 'Y';
}
function set_male_gametic_mthd_code(p_value: string) {
  g_male_gametic_mthd_code = p_value;
  gb_male_gametic_mthd_code = 'Y';
}
function set_orchard_comment(p_value: string) {
  g_orchard_comment = p_value;
  gb_orchard_comment = 'Y';
}
function set_orchard_contamination_pct(p_value: number) {
  g_orchard_contamination_pct = p_value;
  gb_orchard_contamination_pct = 'Y';
}
function set_pollen_contamination_ind(p_value: string) {
  g_pollen_contamination_ind = p_value;
  gb_pollen_contamination_ind = 'Y';
}
function set_pollen_contam_mthd_code(p_value: string) {
  g_pollen_contam_mthd_code = p_value;
  gb_pollen_contam_mthd_code = 'Y';
}
function set_pollen_contamination_pct(p_value: number) {
  g_pollen_contamination_pct = p_value;
  gb_pollen_contamination_pct = 'Y';
}
function set_provenance_id(p_value: number) {
  g_provenance_id = p_value;
  gb_provenance_id = 'Y';
}
function set_secondary_orchard_id(p_value: string) {
  g_secondary_orchard_id = p_value;
  gb_secondary_orchard_id = 'Y';
}
function set_seed_plan_unit_id(p_value: number) {
  g_seed_plan_unit_id = p_value;
  gb_seed_plan_unit_id = 'Y';
}
function set_seed_store_client_locn(p_value: string) {
  g_seed_store_client_locn = p_value;
  gb_seed_store_client_locn = 'Y';
}
function set_seed_store_client_number(p_value: string) {
  g_seed_store_client_number = p_value;
  gb_seed_store_client_number = 'Y';
}
function set_seedlot_source_code(p_value: string) {
  g_seedlot_source_code = p_value;
  gb_seedlot_source_code = 'Y';
}
function set_smp_mean_bv_AD(p_value: number) {
  g_smp_mean_bv_AD = p_value;
  gb_smp_mean_bv_AD = 'Y';
}
function set_smp_mean_bv_DFS(p_value: number) {
  g_smp_mean_bv_DFS = p_value;
  gb_smp_mean_bv_DFS = 'Y';
}
function set_smp_mean_bv_DFU(p_value: number) {
  g_smp_mean_bv_DFU = p_value;
  gb_smp_mean_bv_DFU = 'Y';
}
function set_smp_mean_bv_DFW(p_value: number) {
  g_smp_mean_bv_DFW = p_value;
  gb_smp_mean_bv_DFW = 'Y';
}
function set_smp_mean_bv_DSB(p_value: number) {
  g_smp_mean_bv_DSB = p_value;
  gb_smp_mean_bv_DSB = 'Y';
}
function set_smp_mean_bv_DSC(p_value: number) {
  g_smp_mean_bv_DSC = p_value;
  gb_smp_mean_bv_DSC = 'Y';
}
function set_smp_mean_bv_DSG(p_value: number) {
  g_smp_mean_bv_DSG = p_value;
  gb_smp_mean_bv_DSG = 'Y';
}
function set_smp_mean_bv_GVO(p_value: number) {
  g_smp_mean_bv_GVO = p_value;
  gb_smp_mean_bv_GVO = 'Y';
}
function set_smp_mean_bv_IWS(p_value: number) {
  g_smp_mean_bv_IWS = p_value;
  gb_smp_mean_bv_IWS = 'Y';
}
function set_smp_mean_bv_WDU(p_value: number) {
  g_smp_mean_bv_WDU = p_value;
  gb_smp_mean_bv_WDU = 'Y';
}
function set_smp_mean_bv_WVE(p_value: number) {
  g_smp_mean_bv_WVE = p_value;
  gb_smp_mean_bv_WVE = 'Y';
}
function set_smp_mean_bv_WWD(p_value: number) {
  g_smp_mean_bv_WWD = p_value;
  gb_smp_mean_bv_WWD = 'Y';
}
function set_smp_parents_outside(p_value: number) {
  g_smp_parents_outside = p_value;
  gb_smp_parents_outside = 'Y';
}
function set_smp_success_pct(p_value: number) {
  g_smp_success_pct = p_value;
  gb_smp_success_pct = 'Y';
}
function set_temporary_storage_end_date(p_value: Date) {
  g_temporary_storage_end_date = p_value;
  gb_temporary_storage_end_date = 'Y';
}
function set_temporary_storage_start_dt(p_value: Date) {
  g_temporary_storage_start_dt = p_value;
  gb_temporary_storage_start_dt = 'Y';
}
function set_total_parent_trees(p_value: number) {
  g_total_parent_trees = p_value;
  gb_total_parent_trees = 'Y';
}
function set_latitude_seconds(p_value: number) {
  g_latitude_seconds = p_value;
  gb_latitude_seconds = 'Y';
}
function set_longitude_seconds(p_value: number) {
  g_longitude_seconds = p_value;
  gb_longitude_seconds = 'Y';
}
function set_collection_lat_sec(p_value: number) {
  g_collection_lat_sec = p_value;
  gb_collection_lat_sec = 'Y';
}
function set_collection_long_sec(p_value: number) {
  g_collection_long_sec = p_value;
  gb_collection_long_sec = 'Y';
}
function set_seedlot_number(p_value: string) {
  g_seedlot_number = p_value;
  gb_seedlot_number = 'Y';
}
function set_seedlot_status_code(p_value: string) {
  g_seedlot_status_code = p_value;
  gb_seedlot_status_code = 'Y';
}
function set_vegetation_code(p_value: string) {
  g_vegetation_code = p_value;
  gb_vegetation_code = 'Y';
}
function set_genetic_class_code(p_value: string) {
  g_genetic_class_code = p_value;
  gb_genetic_class_code = 'Y';
}
function set_collection_source_code(p_value: string) {
  g_collection_source_code = p_value;
  gb_collection_source_code = 'Y';
}
function set_superior_prvnc_ind(p_value: string) {
  g_superior_prvnc_ind = p_value;
  gb_superior_prvnc_ind = 'Y';
}
function set_org_unit_no(p_value: number) {
  g_org_unit_no = p_value;
  gb_org_unit_no = 'Y';
}
function set_registered_seed_ind(p_value: string) {
  g_registered_seed_ind = p_value;
  gb_registered_seed_ind = 'Y';
}
function set_to_be_registrd_ind(p_value: string) {
  g_to_be_registrd_ind = p_value;
  gb_to_be_registrd_ind = 'Y';
}
function set_registered_date(p_value: Date) {
  g_registered_date = p_value;
  gb_registered_date = 'Y';
}
function set_fs721a_signed_ind(p_value: string) {
  g_fs721a_signed_ind = p_value;
  gb_fs721a_signed_ind = 'Y';
}
function set_nad_datum_code(p_value: string) {
  g_nad_datum_code = p_value;
  gb_nad_datum_code = 'Y';
}
function set_utm_zone(p_value: number) {
  g_utm_zone = p_value;
  gb_utm_zone = 'Y';
}
function set_utm_easting(p_value: number) {
  g_utm_easting = p_value;
  gb_utm_easting = 'Y';
}
function set_utm_northing(p_value: number) {
  g_utm_northing = p_value;
  gb_utm_northing = 'Y';
}
function set_longitude_degrees(p_value: number) {
  g_longitude_degrees = p_value;
  gb_longitude_degrees = 'Y';
}
function set_longitude_minutes(p_value: number) {
  g_longitude_minutes = p_value;
  gb_longitude_minutes = 'Y';
}
function set_longitude_deg_min(p_value: number | null) {
  g_longitude_deg_min = p_value;
  gb_longitude_deg_min = 'Y';
}
function set_longitude_min_min(p_value: number | null) {
  g_longitude_min_min = p_value;
  gb_longitude_min_min = 'Y';
}
function set_longitude_deg_max(p_value: number | null) {
  g_longitude_deg_max = p_value;
  gb_longitude_deg_max = 'Y';
}
function set_longitude_min_max(p_value: number | null) {
  g_longitude_min_max = p_value;
  gb_longitude_min_max = 'Y';
}
function set_latitude_degrees(p_value: number) {
  g_latitude_degrees = p_value;
  gb_latitude_degrees = 'Y';
}
function set_latitude_minutes(p_value: number) {
  g_latitude_minutes = p_value;
  gb_latitude_minutes = 'Y';
}
function set_latitude_deg_min(p_value: number | null) {
  g_latitude_deg_min = p_value;
  gb_latitude_deg_min = 'Y';
}
function set_latitude_min_min(p_value: number | null) {
  g_latitude_min_min = p_value;
  gb_latitude_min_min = 'Y';
}
function set_latitude_deg_max(p_value: number | null) {
  g_latitude_deg_max = p_value;
  gb_latitude_deg_max = 'Y';
}
function set_latitude_min_max(p_value: number | null) {
  g_latitude_min_max = p_value;
  gb_latitude_min_max = 'Y';
}
function set_seed_coast_area_code(p_value: string) {
  g_seed_coast_area_code = p_value;
  gb_seed_coast_area_code = 'Y';
}
function set_elevation(p_value: number) {
  g_elevation = p_value;
  gb_elevation = 'Y';
}
function set_elevation_min(p_value: number) {
  g_elevation_min = p_value;
  gb_elevation_min = 'Y';
}
function set_elevation_max(p_value: number) {
  g_elevation_max = p_value;
  gb_elevation_max = 'Y';
}
function set_orchard_id(p_value: string) {
  g_orchard_id = p_value;
  gb_orchard_id = 'Y';
}
function set_collection_locn_desc(p_value: string) {
  g_collection_locn_desc = p_value;
  gb_collection_locn_desc = 'Y';
}
function set_collection_cli_number(p_value: string) {
  g_collection_cli_number = p_value;
  gb_collection_cli_number = 'Y';
}
function set_collection_cli_locn_cd(p_value: string) {
  g_collection_cli_locn_cd = p_value;
  gb_collection_cli_locn_cd = 'Y';
}
function set_collection_start_date(p_value: Date) {
  g_collection_start_date = p_value;
  gb_collection_start_date = 'Y';
}
function set_collection_end_date(p_value: Date) {
  g_collection_end_date = p_value;
  gb_collection_end_date = 'Y';
}
function set_cone_collection_method_cd(p_value: string) {
  g_cone_collection_method_cd = p_value;
  gb_cone_collection_method_cd = 'Y';
}
function set_no_of_containers(p_value: number) {
  g_no_of_containers = p_value;
  gb_no_of_containers = 'Y';
}
function set_clctn_volume(p_value: number) {
  g_clctn_volume = p_value;
  gb_clctn_volume = 'Y';
}
function set_vol_per_container(p_value: number) {
  g_vol_per_container = p_value;
  gb_vol_per_container = 'Y';
}
function set_nmbr_trees_from_code(p_value: string) {
  g_nmbr_trees_from_code = p_value;
  gb_nmbr_trees_from_code = 'Y';
}
function set_coancestry(p_value: number) {
  g_coancestry = p_value;
  gb_coancestry = 'Y';
}
function set_effective_pop_size(p_value: number) {
  g_effective_pop_size = p_value;
  gb_effective_pop_size = 'Y';
}
function set_original_seed_qty(p_value: number) {
  g_original_seed_qty = p_value;
  gb_original_seed_qty = 'Y';
}
function set_interm_strg_client_number(p_value: string) {
  g_interm_strg_client_number = p_value;
  gb_interm_strg_client_number = 'Y';
}
function set_interm_strg_client_locn(p_value: string) {
  g_interm_strg_client_locn = p_value;
  gb_interm_strg_client_locn = 'Y';
}
function set_interm_strg_st_date(p_value: Date) {
  g_interm_strg_st_date = p_value;
  gb_interm_strg_st_date = 'Y';
}
function set_interm_strg_end_date(p_value: Date) {
  g_interm_strg_end_date = p_value;
  gb_interm_strg_end_date = 'Y';
}
function set_interm_facility_code(p_value: string) {
  g_interm_facility_code = p_value;
  gb_interm_facility_code = 'Y';
}
function set_extraction_st_date(p_value: Date) {
  g_extraction_st_date = p_value;
  gb_extraction_st_date = 'Y';
}
function set_extraction_end_date(p_value: Date) {
  g_extraction_end_date = p_value;
  gb_extraction_end_date = 'Y';
}
function set_extraction_volume(p_value: number) {
  g_extraction_volume = p_value;
  gb_extraction_volume = 'Y';
}
function set_extrct_cli_number(p_value: string) {
  g_extrct_cli_number = p_value;
  gb_extrct_cli_number = 'Y';
}
function set_extrct_cli_locn_cd(p_value: string) {
  g_extrct_cli_locn_cd = p_value;
  gb_extrct_cli_locn_cd = 'Y';
}
function set_stored_cli_number(p_value: string) {
  g_stored_cli_number = p_value;
  gb_stored_cli_number = 'Y';
}
function set_stored_cli_locn_cd(p_value: string) {
  g_stored_cli_locn_cd = p_value;
  gb_stored_cli_locn_cd = 'Y';
}
function set_lngterm_strg_st_date(p_value: Date) {
  g_lngterm_strg_st_date = p_value;
  gb_lngterm_strg_st_date = 'Y';
}
function set_historical_tsr_date(p_value: Date) {
  g_historical_tsr_date = p_value;
  gb_historical_tsr_date = 'Y';
}
function set_collection_lat_deg(p_value: number) {
  g_collection_lat_deg = p_value;
  gb_collection_lat_deg = 'Y';
}
function set_collection_lat_min(p_value: number) {
  g_collection_lat_min = p_value;
  gb_collection_lat_min = 'Y';
}
function set_collection_latitude_code(p_value: string) {
  g_collection_latitude_code = p_value;
  gb_collection_latitude_code = 'Y';
}
function set_collection_long_deg(p_value: number) {
  g_collection_long_deg = p_value;
  gb_collection_long_deg = 'Y';
}
function set_collection_long_min(p_value: number) {
  g_collection_long_min = p_value;
  gb_collection_long_min = 'Y';
}
function set_collection_longitude_code(p_value: string) {
  g_collection_longitude_code = p_value;
  gb_collection_longitude_code = 'Y';
}
function set_collection_elevation(p_value: number) {
  g_collection_elevation = p_value;
  gb_collection_elevation = 'Y';
}
function set_collection_elevation_min(p_value: number) {
  g_collection_elevation_min = p_value;
  gb_collection_elevation_min = 'Y';
}
function set_collection_elevation_max(p_value: number) {
  g_collection_elevation_max = p_value;
  gb_collection_elevation_max = 'Y';
}
function set_entry_timestamp(p_value: Date) {
  g_entry_timestamp = p_value;
  gb_entry_timestamp = 'Y';
}
function set_entry_userid(p_value: string) {
  g_entry_userid = p_value;
  gb_entry_userid = 'Y';
}
function set_update_timestamp(p_value: Date) {
  g_update_timestamp = p_value;
  gb_update_timestamp = 'Y';
}
function set_update_userid(p_value: string) {
  g_update_userid = p_value;
  gb_update_userid = 'Y';
}
function set_approved_timestamp(p_value: Date) {
  g_approved_timestamp = p_value;
  gb_approved_timestamp = 'Y';
}
function set_approved_userid(p_value: string) {
  g_approved_userid = p_value;
  gb_approved_userid = 'Y';
}
function set_revision_count(p_value: number) {
  g_revision_count = p_value;
  gb_revision_count = 'Y';
}
function set_interm_strg_locn(p_value: string) {
  g_interm_strg_locn = p_value;
  gb_interm_strg_locn = 'Y';
}
function set_interm_strg_cmt(p_value: string) {
  g_interm_strg_cmt = p_value;
  gb_interm_strg_cmt = 'Y';
}
function set_ownership_comment(p_value: string) {
  g_ownership_comment = p_value;
  gb_ownership_comment = 'Y';
}
function set_cone_seed_desc(p_value: string) {
  g_cone_seed_desc = p_value;
  gb_cone_seed_desc = 'Y';
}
function set_extraction_comment(p_value: string) {
  g_extraction_comment = p_value;
  gb_extraction_comment = 'Y';
}
function set_seedlot_comment(p_value: string) {
  g_seedlot_comment = p_value;
  gb_seedlot_comment = 'Y';
}
function set_bgc_zone_code(p_value: string) {
  g_bgc_zone_code = p_value;
  gb_bgc_zone_code = 'Y';
}
function set_bgc_subzone_code(p_value: string) {
  g_bgc_subzone_code = p_value;
  gb_bgc_subzone_code = 'Y';
}
function set_variant(p_value: string) {
  g_variant = p_value;
  gb_variant = 'Y';
}
function set_bec_version_id(p_value: string) {
  g_bec_version_id = p_value;
  gb_bec_version_id = 'Y';
}
function set_gw_AD(p_value: number) {
  g_gw_AD = p_value;
}
function set_gw_DFS(p_value: number) {
  g_gw_DFS = p_value;
}
function set_gw_DFU(p_value: number) {
  g_gw_DFU = p_value;
}
function set_gw_DFW(p_value: number) {
  g_gw_DFW = p_value;
}
function set_gw_DSB(p_value: number) {
  g_gw_DSB = p_value;
}
function set_gw_DSC(p_value: number) {
  g_gw_DSC = p_value;
}
function set_gw_DSG(p_value: number) {
  g_gw_DSG = p_value;
}
function set_gw_GVO(p_value: number) {
  g_gw_GVO = p_value;
}
function set_gw_IWS(p_value: number) {
  g_gw_IWS = p_value;
}
function set_gw_WDU(p_value: number) {
  g_gw_WDU = p_value;
}
function set_gw_WVE(p_value: number) {
  g_gw_WVE = p_value;
}
function set_gw_WWD(p_value: number) {
  g_gw_WWD = p_value;
}
function set_spz_list(p_value: string | null) {
  g_spz_list = p_value;
}
function set_spz_id_list(p_value: string) {
  g_spz_id_list = p_value;
}
//--***END SETTERS

/*
 * Procedure:  apply_superior_prov_limits
 * Purpose:    Apply superior provenance limits
 */
function apply_superior_prov_limits() {
  let b_first_row_processed: boolean;
  let v_spz_list: string = '';

  interface c_sup {
    genetic_worth_code: string;
    genetic_worth_rating: number;
    limit_up_elevation: number;
    limit_down_elevation: number;
    limit_elevation_min: number;
    limit_elevation_max: number;
    limit_latitude_min_degrees: number;
    limit_latitude_min_minutes: number;
    limit_latitude_max_degrees: number;
    limit_latitude_max_minutes: number;
    seed_plan_zone_code: string;
  }
  
  //--Limits && SPZ's for B Class sup provenance
  /* CURSOR c_sup IS
  SELECT sp.genetic_worth_code
        , sp.genetic_worth_rating
        , sp.limit_up_elevation
        , sp.limit_down_elevation
        , sp.limit_elevation_min
        , sp.limit_elevation_max
        , sp.limit_latitude_min_degrees
        , sp.limit_latitude_min_minutes
        , sp.limit_latitude_max_degrees
        , sp.limit_latitude_max_minutes
        , spz.seed_plan_zone_code
    FROM superior_provenance sp
        , superior_provenance_plan_zone spz
    WHERE sp.provenance_id = g_provenance_id
      && sp.vegetation_code = g_vegetation_code
      && spz.provenance_id = sp.provenance_id
    ORDER BY spz.seed_plan_zone_code;*/
    
  b_first_row_processed = false;
  let c_sup: c_sup[] = [];
  
  //--Derive Superior Provenance limits
  for (let r_sup in c_sup) {
    // --Area of Use SPZ's
    v_spz_list = v_spz_list || c_sup[r_sup].seed_plan_zone_code || ',';
    if (!b_first_row_processed) {
      //--Set Genetic Worth
      if (c_sup[r_sup].genetic_worth_code == 'AD' && replace_area_of_use(g_gw_AD)) {
        set_gw_AD(c_sup[r_sup].genetic_worth_rating);
      } else if (c_sup[r_sup].genetic_worth_code == 'DFS' && replace_area_of_use(g_gw_DFS)) {
        set_gw_DFS(c_sup[r_sup].genetic_worth_rating);
      } else if (c_sup[r_sup].genetic_worth_code == 'DFU' && replace_area_of_use(g_gw_DFU)) {
        set_gw_DFU(c_sup[r_sup].genetic_worth_rating);
      } else if (c_sup[r_sup].genetic_worth_code == 'DFW' && replace_area_of_use(g_gw_DFW)) {
        set_gw_DFW(c_sup[r_sup].genetic_worth_rating);
      } else if (c_sup[r_sup].genetic_worth_code == 'DSB' && replace_area_of_use(g_gw_DSB)) {
        set_gw_DSB(c_sup[r_sup].genetic_worth_rating);
      } else if (c_sup[r_sup].genetic_worth_code == 'DSC' && replace_area_of_use(g_gw_DSC)) {
        set_gw_DSC(c_sup[r_sup].genetic_worth_rating);
      } else if (c_sup[r_sup].genetic_worth_code == 'DSG' && replace_area_of_use(g_gw_DSG)) {
        set_gw_DSG(c_sup[r_sup].genetic_worth_rating);
      } else if (c_sup[r_sup].genetic_worth_code == 'GVO' && replace_area_of_use(g_gw_GVO)) {
        set_gw_GVO(c_sup[r_sup].genetic_worth_rating);
      } else if (c_sup[r_sup].genetic_worth_code == 'IWS' && replace_area_of_use(g_gw_IWS)) {
        set_gw_IWS(c_sup[r_sup].genetic_worth_rating);
      } else if (c_sup[r_sup].genetic_worth_code == 'WDU' && replace_area_of_use(g_gw_WDU)) {
        set_gw_WDU(c_sup[r_sup].genetic_worth_rating);
      } else if (c_sup[r_sup].genetic_worth_code == 'WVE' && replace_area_of_use(g_gw_WVE)) {
        set_gw_WVE(c_sup[r_sup].genetic_worth_rating);
      } else if (c_sup[r_sup].genetic_worth_code == 'WWD' && replace_area_of_use(g_gw_WWD)) {
        set_gw_WWD(c_sup[r_sup].genetic_worth_rating);
      }

      g_collection_elevation = g_collection_elevation == null? 0 : g_collection_elevation;
      
      if (is_area_of_use_status() || g_elevation_min == null) {
        // --Set Area of Use Min Elevation
        // -->limits can be up/down or a min/max
        if (c_sup[r_sup].limit_down_elevation != null) {
          // --Calculate min and max based on Collection Mean Elev
          set_elevation_min(g_collection_elevation - c_sup[r_sup].limit_down_elevation);
          set_elevation_max(g_collection_elevation + c_sup[r_sup].limit_up_elevation);
        } else {
          // --Take Min && Max Elevation directly from table
          set_elevation_min (c_sup[r_sup].limit_elevation_min);
        }
      }
      
      if (is_area_of_use_status() || g_elevation_max == null) {
        // --Set Area of Use Min/Max Elevation
        // -->limits can be up/down or a min/max
        if (c_sup[r_sup].limit_up_elevation != null) {
          // --Calculate min && max based on Collection Mean Elev
          set_elevation_max(g_collection_elevation + c_sup[r_sup].limit_up_elevation);
        } else {
          // --Take Min && Max Elevation directly from table
          set_elevation_max(c_sup[r_sup].limit_elevation_max);
        }
      }
    }
    
    if (is_area_of_use_status() || is_area_of_use_lat_min_empty()) {
      // --Set Area of Use Min/Max Lat
      if (c_sup[r_sup].limit_latitude_min_degrees != null) {
        set_latitude_deg_min (c_sup[r_sup].limit_latitude_min_degrees);
        set_latitude_min_min(c_sup[r_sup].limit_latitude_min_minutes);
        set_latitude_sec_min(0);
      } else {
        // --Set to mean collection lat
        set_latitude_deg_min(g_collection_lat_deg);
        set_latitude_min_min(g_collection_lat_min);
        set_latitude_sec_min(g_collection_lat_sec);
      }
    }
    
    if (is_area_of_use_status() || is_area_of_use_lat_max_empty()) {
      if (c_sup[r_sup].limit_latitude_min_degrees != null) {
        set_latitude_deg_max(c_sup[r_sup].limit_latitude_max_degrees);
        set_latitude_min_max(c_sup[r_sup].limit_latitude_max_minutes);
        set_latitude_sec_max(0);
      } else {
        // --Set to mean collection lat
        set_latitude_deg_max(g_collection_lat_deg);
        set_latitude_min_max(g_collection_lat_min);
        set_latitude_sec_max(g_collection_lat_sec);
      }
    }
    
    //--Currently no longitude limits for superior provenance lots
    //--(defined by SPZ's) so set to collection mean
    if (is_area_of_use_status() || is_area_of_use_long_min_empty()) {
      set_longitude_deg_min(g_collection_long_deg);
      set_longitude_min_min(g_collection_long_min);
      set_longitude_sec_min(g_collection_long_sec);
    }
    if (is_area_of_use_status() || is_area_of_use_long_max_empty()) {
      set_longitude_deg_max(g_collection_long_deg);
      set_longitude_min_max(g_collection_long_min);
      set_longitude_sec_max(g_collection_long_sec);
    }
    b_first_row_processed = true;
  }

  if (replace_area_of_use(g_spz_list)) {
    set_spz_list(RTRIM(v_spz_list, ','));
  }
}

/*
 * Procedure:  apply_no_superior_prov_limits
 * Purpose:    Apply NO superior provenance limits for Class B lots from within British Columbia (BC Source=Y)
 */
function apply_no_superior_prov_limits() {
  let e_no_limits_found: Error; // EXCEPTION;
  // --Limits for B Class non-superior provenance
  // CURSOR c_limit IS:
  interface ic_limit {
    transfer_limit_skey: string;
    site_min_latdeg: string;
    site_max_latdeg: string;
    limit_north_latdeg: string;
    limit_north_latmnt: string;
    limit_south_latdeg: string;
    limit_south_latmnt: string;
    limit_east_longdeg: string;
    limit_east_longmnt: string;
    limit_west_longdeg: string;
    limit_west_longmnt: string;
    limit_up_elevatn: number;
    limit_down_elevatn: number;
  }
  /*
  SELECT transfer_limit_skey
        , site_min_latdeg
        , site_max_latdeg
        , limit_north_latdeg
        , limit_north_latmnt
        , limit_south_latdeg
        , limit_south_latmnt
        , limit_east_longdeg
        , limit_east_longmnt
        , limit_west_longdeg
        , limit_west_longmnt
        , limit_up_elevatn
        , limit_down_elevatn
    FROM transfer_limit
    WHERE
          (   vegetation_code = g_vegetation_code
            || vegetation_code == null)
      && genetic_class_code = g_genetic_class_code
      && superior_prvnc_ind = NVL(g_superior_prvnc_ind,'N')
      && coast_interior_code = spr_get_spz_type(g_seed_plan_zone_code)
      && (   seed_plan_zone_code = g_seed_plan_zone_code
            || seed_plan_zone_code == null)
      && g_collection_lat_deg BETWEEN site_min_latdeg && site_max_latdeg
    ORDER BY vegetation_code, seed_plan_zone_code;
  */
  let r_limit: number = 0; // c_limit%ROWTYPE;
  let c_limit: ic_limit[] = []; // c_limit%ROWTYPE;
  
  // --B Class with No Superior Provenance has no Genetic Worth
  g_gw_AD  = null;
  g_gw_DFS = null;
  g_gw_DFU = null;
  g_gw_DFW = null;
  g_gw_DSB = null;
  g_gw_DSC = null;
  g_gw_DSG = null;
  g_gw_GVO = null;
  g_gw_IWS = null;
  g_gw_WDU = null;
  g_gw_WVE = null;
  g_gw_WWD = null;
  // --Area of Use SPZ = Collection SPZ
  if (replace_area_of_use(g_spz_list)) {
    set_spz_list(g_seed_plan_zone_code);
  }
  // --Derive Non Superior Provenance limits
  // OPEN c_limit; FETCH c_limit INTO r_limit; CLOSE c_limit;
  if (c_limit[r_limit].transfer_limit_skey == null) {
    throw new Error('e_no_limits_found');
  }
  // --Set Area of Use Min/Max Elevation
  g_collection_elevation = g_collection_elevation == null? 0 : g_collection_elevation;
  c_limit[r_limit].limit_down_elevatn = c_limit[r_limit].limit_down_elevatn == null? 0 : c_limit[r_limit].limit_down_elevatn;
  if (is_area_of_use_status() || g_elevation_min == null) {
    set_elevation_min(g_collection_elevation - c_limit[r_limit].limit_down_elevatn);
  }
  // -->Ensure elevation == at least 1m
  set_elevation_min(GREATEST(g_elevation_min,1));
  if (is_area_of_use_status() || g_elevation_max == null) {
    set_elevation_max(g_collection_elevation + c_limit[r_limit].limit_up_elevatn);
  }
  // --Set Area of Use Min Lat
  g_collection_lat_deg = g_collection_lat_deg == null? 0 : g_collection_lat_deg;
  g_collection_lat_min = g_collection_lat_min == null? 0 : g_collection_lat_min;
  g_latitude_min_min = g_latitude_min_min == null? 0 : g_latitude_min_min;
  g_latitude_deg_min = g_latitude_deg_min == null? 0 : g_latitude_deg_min;
  if (is_area_of_use_status() || is_area_of_use_lat_min_empty()) {
    // -->Min
    set_latitude_deg_min(g_collection_lat_deg - NVL(c_limit[r_limit].limit_south_latdeg,0));
    set_latitude_min_min(g_collection_lat_min - NVL(c_limit[r_limit].limit_south_latmnt,0));
    set_latitude_sec_min(g_collection_lat_sec);
    // -->Adjust for provincial boundary at 48 00 00
    if (g_latitude_min_min < 0) {
        set_latitude_deg_min(g_latitude_deg_min - 1);
        set_latitude_min_min(g_latitude_min_min + 60);
    }
    if (g_latitude_deg_min < 48) {
        set_latitude_deg_min(48);
        set_latitude_min_min(0);
        set_latitude_sec_min(0);
    }
  }
  // --Set Area of Use Max Lat
  g_latitude_min_max = g_latitude_min_max == null? 0 : g_latitude_min_max;
  g_latitude_deg_max = g_latitude_deg_max == null? 0 : g_latitude_deg_max;
  if (is_area_of_use_status() || is_area_of_use_lat_max_empty()) {
    // -->Max
    set_latitude_deg_max(g_collection_lat_deg + NVL(c_limit[r_limit].limit_north_latdeg,0));
    set_latitude_min_max(g_collection_lat_min + NVL(c_limit[r_limit].limit_north_latmnt,0));
    set_latitude_sec_max(g_collection_lat_sec);
    // -->Adjust for provincial boundary at 60 00 00
    if (g_latitude_min_max > 60) {
      set_latitude_deg_max(g_latitude_deg_max + 1);
      set_latitude_min_max(g_latitude_min_max - 60);
    }
    if (g_latitude_deg_max > 60) {
      set_latitude_deg_max(60);
      set_latitude_min_max(0);
      set_latitude_sec_max(0);
    }
  }
  // --Set Area of Use Min Long
  g_collection_long_deg = g_collection_long_deg == null? 0 : g_collection_long_deg;
  g_collection_long_min = g_collection_long_min == null? 0 : g_collection_long_min;
  g_longitude_min_min = g_longitude_min_min == null? 0 : g_longitude_min_min;
  g_longitude_deg_min = g_longitude_deg_min == null? 0 : g_longitude_deg_min;
  if (is_area_of_use_status() || is_area_of_use_long_min_empty()) {
    // -->Min
    set_longitude_deg_min(g_collection_long_deg - NVL(c_limit[r_limit].limit_east_longdeg,0));
    set_longitude_min_min(g_collection_long_min - NVL(c_limit[r_limit].limit_east_longmnt,0));
    set_longitude_sec_min(g_collection_long_sec);
    // -->Adjust for provincial boundary at 114 00 00
    if (g_longitude_min_min < 0) {
      set_longitude_deg_min(g_longitude_deg_min - 1);
      set_longitude_min_min(g_longitude_min_min + 60);
    }
    if (g_longitude_deg_min < 114) {
      set_longitude_deg_min(114);
      set_longitude_min_min(0);
      set_longitude_sec_min(0);
    }
  }
  // --Set Area of Use Min Long
  g_longitude_min_max = g_longitude_min_max == null? 0 : g_longitude_min_max;
  g_longitude_deg_max = g_longitude_deg_max == null? 0 : g_longitude_deg_max;
  if (is_area_of_use_status() || is_area_of_use_long_max_empty()) {
    // -->Max
    set_longitude_deg_max(g_collection_long_deg + NVL(c_limit[r_limit].limit_west_longdeg,0));
    set_longitude_min_max(g_collection_long_min + NVL(c_limit[r_limit].limit_west_longmnt,0));
    set_longitude_sec_max(g_collection_long_sec);
    // -->Adjust for provincial boundary at 140 00 00
    if (g_longitude_min_max > 60) {
      set_longitude_deg_max((g_longitude_deg_max == null ? 0 : g_longitude_deg_max) + 1);
      set_longitude_min_max((g_longitude_min_max == null ? 0 : g_longitude_min_max) - 60);
    }
    if (g_longitude_deg_max > 140) {
      set_longitude_deg_max(140);
      set_longitude_min_max(0);
      set_longitude_sec_max(0);
    }
  }
  if (e_no_limits_found) {
    throw new Error(e_no_limits_found);
  }
}

/*
 * Function: get_untested_common_spz
 * Purpose:  Get the SPZB that all Untested Parent Trees have in common.
 *           if (>1 SPZB found) { returns null
 */
function get_untested_common_spz(): string; {
  let v_spz: string; // parent_tree.seed_plan_zone_code%TYPE;
  /*
  BEGIN
    SELECT DISTINCT pt.seed_plan_zone_code
      INTO v_spz
      FROM parent_tree pt
          , seedlot_parent_tree_gen_qlty sptgq
          , seedlot_parent_tree spt  --select from temp table for recalc
      WHERE spt.seedlot_number = g_seedlot_number
        && spt.seedlot_number = sptgq.seedlot_number
        && spt.parent_tree_id = sptgq.parent_tree_id
        && pt.parent_tree_id = spt.parent_tree_id
        && sptgq.untested_ind = 'Y';
  EXCEPTION
    WHEN TOO_MANY_ROWS || NO_DATA_FOUND) {
      null;
  END
  */
  v_spz = sql_result;
  return (v_spz);
}

/*
 * Procedure: get_a_class_area_of_use_spz
 * Purpose:   Get primary && non-primary SPZ's for A class lot.
 */
function get_a_class_area_of_use_spz() {
  // CURSOR c_tested IS:
  /*
  SELECT spz.seed_plan_zone_code
        , spz.primary_ind
    FROM tested_pt_area_of_use_spz spz
      ,  tested_pt_area_of_use aou
    WHERE aou.seed_plan_unit_id = g_seed_plan_unit_id
      && spz.tested_pt_area_of_use_id = aou.tested_pt_area_of_use_id
    ORDER BY 2 DESC;
  */
  
  //--Always reset for INC,PND
  if (replace_area_of_use(g_spz_list)) {
    // --Tested Parent Trees
    if (['TPT','CUS'].includes(g_seedlot_source_code) && g_seed_plan_unit_id != null) {
      // --Get primary/secondary SPZ's (primary sorted first)
      set_spz_list(null);
      for (r_tested in c_tested) {
        set_spz_list(g_spz_list || r_tested.seed_plan_zone_code || ',');
      }
    }
    // --Untested Parent Trees
    else if (g_seedlot_source_code == 'UPT') {
      // --Primary SPZ == the SPZ that all PT's share
      set_spz_list(get_untested_common_spz);
    }
    // --Remove trailing comma
    set_spz_list(RTRIM(g_spz_list,','));
  }
}

/*
 * Procedure: get_tested_area_of_use_geog
 * Purpose:   Get Area of Use Geography for A Class lots from Tested Parent Trees
 */
function get_tested_area_of_use_geog() {
  // --First row contains all necessary information
  // CURSOR c_tested IS:
  /*
  SELECT MIN(spu.elevation_min) elevation_min
        , MAX(spu.elevation_max) elevation_max
        , MIN(spu.latitude_degrees_min +(spu.latitude_minutes_min / 60)) latitude_min
        , MAX(spu.latitude_degrees_max +(spu.latitude_minutes_max / 60)) latitude_max
    FROM tested_pt_area_of_use primary_spu
        , tested_pt_area_of_use_spu included_spus
        , seed_plan_unit spu
    WHERE primary_spu.seed_plan_unit_id = g_seed_plan_unit_id
      && included_spus.tested_pt_area_of_use_id = primary_spu.tested_pt_area_of_use_id
      && included_spus.seed_plan_unit_id = spu.seed_plan_unit_id;
  */
  let r_tested: any; // c_tested%ROWTYPE;
  if (g_seed_plan_unit_id != null) {
    // OPEN c_tested; FETCH c_tested INTO r_tested; CLOSE c_tested;
    if (replace_area_of_use(g_elevation_min)) {
      set_elevation_min(r_tested.elevation_min);
    }
  
    if (replace_area_of_use(g_elevation_max)) {
      set_elevation_max(r_tested.elevation_max);
    }

    if (is_area_of_use_status() || is_area_of_use_lat_min_empty()) {
      if (r_tested.latitude_min == null) {
        // --No lat limits - set to mean of parent trees
        set_latitude_deg_min(g_collection_lat_deg);
        set_latitude_min_min(g_collection_lat_min);
        set_latitude_sec_min(g_collection_lat_sec);
      } else {
        set_latitude_deg_min(Math.trunc(r_tested.latitude_min));
        set_latitude_min_min((r_tested.latitude_min - Math.trunc(r_tested.latitude_min)) * 60);
        set_latitude_sec_min(0);
      }
    }
    if (is_area_of_use_status() || is_area_of_use_lat_max_empty()) {
      if (r_tested.latitude_max == null) {
        // --No lat limits - set to mean of parent trees
        set_latitude_deg_max(g_collection_lat_deg);
        set_latitude_min_max(g_collection_lat_min);
        set_latitude_sec_max(g_collection_lat_sec);
      } else {
        set_latitude_deg_max(Math.trunc(r_tested.latitude_max));
        set_latitude_min_max((r_tested.latitude_max - Math.trunc(r_tested.latitude_max)) * 60);
        set_latitude_sec_max(0);
      }
    }
    // --Currently no longitude limits for A class lots (defined by SPZ's) so set to collection mean
    if (is_area_of_use_status() || is_area_of_use_long_min_empty()) {
      set_longitude_deg_min(g_collection_long_deg);
      set_longitude_min_min(g_collection_long_min);
      set_longitude_sec_min(g_collection_long_sec);
    }
    if (is_area_of_use_status() || is_area_of_use_long_max_empty()) {
      set_longitude_deg_max(g_collection_long_deg);
      set_longitude_min_max(g_collection_long_min);
      set_longitude_sec_max(g_collection_long_sec);
    }
  }
}

/*
 * Procedure: get_untested_area_of_use_geog
 * Purpose:   Get Area of Use Geography for A Class lots from Untested Parent Trees or Custom Lots
 */
function get_untested_area_of_use_geog() {
  let e_no_limits_found: Error; // EXCEPTION;
  let v_spz: string; // parent_tree.seed_plan_zone_code%TYPE;
  let r_limit: number; // c_limit%ROWTYPE;
  // CURSOR c_limit IS:
  /*
  SELECT transfer_limit_skey
        , site_min_latdeg
        , site_max_latdeg
        , limit_north_latdeg
        , limit_north_latmnt
        , limit_south_latdeg
        , limit_south_latmnt
        , limit_east_longdeg
        , limit_east_longmnt
        , limit_west_longdeg
        , limit_west_longmnt
        , limit_up_elevatn
        , limit_down_elevatn
    FROM transfer_limit
    WHERE
          (   vegetation_code = g_vegetation_code
            || vegetation_code == null)
      && genetic_class_code = g_genetic_class_code
      && coast_interior_code = spr_get_spz_type(v_spz)
      && (   seed_plan_zone_code = v_spz
            || seed_plan_zone_code == null)
      && g_collection_lat_deg BETWEEN site_min_latdeg && site_max_latdeg
    ORDER BY vegetation_code, seed_plan_zone_code;
    */
    
  //--Limits are retrieved based on SPZB common to untested parent trees
  v_spz = get_untested_common_spz();
  // --Derive Non Superior Provenance limits
  // OPEN c_limit; FETCH c_limit INTO r_limit; CLOSE c_limit;
  if (r_limit.transfer_limit_skey == null) {
    throw new Error(e_no_limits_found);
  }
  // --Set Area of Use Min/Max Elevation
  if (replace_area_of_use(g_elevation_min)) {
    set_elevation_min(g_collection_elevation - NVL(r_limit.limit_down_elevatn,0));
  }
  if (replace_area_of_use(g_elevation_max)) {
    set_elevation_max(g_collection_elevation + NVL(r_limit.limit_up_elevatn,0));
  }
  // -->Ensure elevation == at least 1m
  set_elevation_min(GREATEST(g_elevation_min,1));
  // --Set Area of Use Min/Max Lat
  // -->Min
  if (is_area_of_use_lat_min_empty() || is_area_of_use_status()) {
    set_latitude_deg_min(NVL(g_collection_lat_deg,0) - NVL(r_limit.limit_south_latdeg,0));
    set_latitude_min_min(g_collection_lat_min - NVL(r_limit.limit_south_latmnt,0));
    set_latitude_sec_min(g_collection_lat_sec);
    // -->Adjust for provincial boundary at 48 00 00
    if (g_latitude_min_min < 0) {
      set_latitude_deg_min(NVL(g_latitude_deg_min,0) - 1);
      set_latitude_min_min(g_latitude_min_min + 60);
    }
    if (g_latitude_deg_min < 48) {
      set_latitude_deg_min(48);
      set_latitude_min_min(0);
      set_latitude_sec_min(0);
    }
  }
  // -->Max
  if (is_area_of_use_lat_max_empty() || is_area_of_use_status()) {
    set_latitude_deg_max(g_collection_lat_deg + NVL(r_limit.limit_north_latdeg,0));
    set_latitude_min_max(g_collection_lat_min + NVL(r_limit.limit_north_latmnt,0));
    set_latitude_sec_max(g_collection_lat_sec);
    // -->Adjust for provincial boundary at 60 00 00
    if (g_latitude_min_max > 60) {
      set_latitude_deg_max(NVL(g_latitude_deg_max,0) + 1);
      set_latitude_min_max(NVL(g_latitude_min_max,0) - 60);
    }
    if (g_latitude_deg_max > 60) {
      set_latitude_deg_max(60);
      set_latitude_min_max(0);
      set_latitude_sec_max(0);
    }
  }
  // --Set Area of Use Min/Max Long
  // -->Min
  if (is_area_of_use_long_min_empty() || is_area_of_use_status()) {
    set_longitude_deg_min(g_collection_long_deg - NVL(r_limit.limit_east_longdeg,0));
    set_longitude_min_min(g_collection_long_min - NVL(r_limit.limit_east_longmnt,0));
    set_longitude_sec_min(g_collection_long_sec);
    // -->Adjust for provincial boundary at 114 00 00
    if (g_longitude_min_min < 0) {
      set_longitude_deg_min(NVL(g_longitude_deg_min,0) - 1);
      set_longitude_min_min(NVL(g_longitude_min_min,0) + 60);
    }
    if (g_longitude_deg_min < 114) {
      set_longitude_deg_min(114);
      set_longitude_min_min(0);
      set_longitude_sec_min(0);
    }
  }
  // -->Max
  if (is_area_of_use_long_max_empty() || is_area_of_use_status()) {
    set_longitude_deg_max(g_collection_long_deg + NVL(r_limit.limit_west_longdeg,0));
    set_longitude_min_max(g_collection_long_min + NVL(r_limit.limit_west_longmnt,0));
    set_longitude_sec_max(g_collection_long_sec);
    // -->Adjust for provincial boundary at 140 00 00
    if (g_longitude_min_max > 60) {
      set_longitude_deg_max(NVL(g_longitude_deg_max,0) + 1);
      set_longitude_min_max(NVL(g_longitude_min_max,0) - 60);
    }
    if (g_longitude_deg_max > 140) {
      set_longitude_deg_max(140);
      set_longitude_min_max(0);
      set_longitude_sec_max(0);
    }
  }
  if (e_no_limits_found) {
    throw new Error(e_no_limits_found);
  }
}

/*
 * Procedure: get_a_class_area_of_use_geog
 * Purpose:  Get Area of Use Geography for A Class lots
 */
function get_a_class_area_of_use_geog() {
  // --Tested Parent Trees
  if (g_seedlot_source_code == 'TPT') {
    get_tested_area_of_use_geog();
  }
  // --Untested Parent Trees && Custom Lots
  else if (['UPT','CUS'].includes(g_seedlot_source_code)) {
    get_untested_area_of_use_geog();
  }
}

/*
 * Procedure: get_area_of_use
 * Purpose:   Derive area of use for A && B class lots.
 *            For certain statuses, defined by is_area_of_use_status(),
 *            Area of Use == always recalculated && replaced.
 *            For other statuses, each Area of Use item == only recalculated
 *            if (it has been blanked-out (i.e. == null) by the user.
 */
function get_area_of_use() {
  // --Blank area of use information for status where it will be replaced
  if (is_area_of_use_status()) {
    set_spz_list(null);
    set_elevation_min(null);
    set_elevation_max(null);
    set_latitude_deg_min(null);
    set_latitude_min_min(null);
    set_latitude_sec_min(null);
    set_latitude_deg_max(null);
    set_latitude_min_max(null);
    set_latitude_sec_max(null);
    set_longitude_deg_min(null);
    set_longitude_min_min(null);
    set_longitude_sec_min(null);
    set_longitude_deg_max(null);
    set_longitude_min_max(null);
    set_longitude_sec_max(null);
  }
  // --B Class limits
  if (g_genetic_class_code == 'B') {
    if (g_bc_source_ind == 'Y') {
      if (g_superior_prvnc_ind == 'Y') {
        apply_superior_prov_limits();
      } else if (g_superior_prvnc_ind == 'N') {
        apply_no_superior_prov_limits();
      }
      // --BC Source not entered - cannot derive limits
    }
  }
  // --A Class limits
  else {
    get_a_class_area_of_use_geog();
    get_a_class_area_of_use_spz();
  }
}

/*
 * Procedure: provenance_is_valid_for_spp
 * Purpose:   Return true if (Provenance == valid for species, otherwise return false.
 */
function provenance_is_valid_for_spp(): boolean {
  let v_count: number; // NUMBER(10);
  /*
  SELECT COUNT(1)
    INTO v_count
    FROM superior_provenance
    WHERE provenance_id = g_provenance_id
      && vegetation_code = g_vegetation_code;
  */
  v_count = resultsql;
  return v_count > 0;
}

/*
 * Procedure: spu_is_valid_for_species
 * Purpose:   Return true if (Seed Plan Unit == valid for species, otherwise return false.
 */
function spu_is_valid_for_species(): boolean {
  let v_count: number; // NUMBER(10);
  /*
  SELECT COUNT(1)
    INTO v_count
    FROM seed_plan_unit spu
        , seed_plan_zone spz
    WHERE spu.seed_plan_unit_id = g_seed_plan_unit_id
      && spz.seed_plan_zone_id = spu.seed_plan_zone_id
      && spz.vegetation_code = g_vegetation_code;
  */
  v_count = resultsql;
  return v_count > 0;
}

/*
 * Procedure: orchard_is_valid_for_species
 * Purpose:   Return true if (Orchard passed-in == valid for species, otherwise return false.
 */
function orchard_is_valid_for_species(p_orchard_id: string): boolean {
  let v_count: number; // NUMBER(10);
  /*
  SELECT COUNT(1)
    INTO v_count
    FROM orchard
    WHERE orchard_id = p_orchard_id AND vegetation_code = g_vegetation_code;
  */
  v_count = resultsql;
  return v_count > 0;
}

/*
 * Procedure: set_mean_area_of_use_geography
 * Purpose:    Copy Mean Area of Use geography to Mean Collection geography
 */
function set_mean_area_of_use_geography() {
  // --IMPORTANT: Mean Area of Use geography must be set as Transfer Guideline
  // --           routines may use Mean Area of Use geography to derive
  // --           Transfer Limits.
  // -->Mean Elevation
  if (g_elevation_min == g_elevation_max) {
    // --->mean matches min && max
    set_elevation(g_elevation_max);
  } else {
    // --->default to collection elevation
    set_elevation(g_collection_elevation);
  }
  // -->Mean Latitude
  if (g_latitude_deg_min == g_latitude_deg_max && g_latitude_min_min == g_latitude_min_max && g_latitude_sec_min == g_latitude_sec_max) {
    // --->mean matches min && max
    set_latitude_degrees(g_latitude_deg_max);
    set_latitude_minutes(g_latitude_min_max);
    set_latitude_seconds(g_latitude_sec_max);
  } else {
    // --->default to mean collection lat
    set_latitude_degrees(g_collection_lat_deg);
    set_latitude_minutes(g_collection_lat_min);
    set_latitude_seconds(g_collection_lat_sec);
  }
  // -->Mean Longitude
  if (g_longitude_deg_min == g_longitude_deg_max && g_longitude_min_min == g_longitude_min_max && g_longitude_sec_min == g_longitude_sec_max) {
    // --->mean matches min && max
    set_longitude_degrees(g_longitude_deg_max);
    set_longitude_minutes(g_longitude_min_max);
    set_longitude_seconds(g_longitude_sec_max);
  } else {
    // --->default to mean collection long
    set_longitude_degrees(g_collection_long_deg);
    set_longitude_minutes(g_collection_long_min);
    set_longitude_seconds(g_collection_long_sec);
  }
}

/*
 * Procedure: load_array
 * Purpose:   Populate array from saved data if (array != present.
 *            if (p_get_current_tests == True:
 *             - Populate the BV/CV-G value in the array (whether passed-in
 *               or just generated as described above) with gq value flagged
 *               for use in calc .
 */
function load_array(p_pt_arrayZ: any[], p_get_current_tests: boolean) {
  let v_current_test_ind: string; // VARCHAR2(1);
  let v_genetic_type_code: string; // parent_tree_genetic_quality.genetic_type_code%TYPE;
  let r_gq: string; // c_gq%ROWTYPE;
  
  // CURSOR c_gq (p_parent_tree_id: number, p_seed_plan_unit_id: number, p_genetic_type_code: string, p_genetic_worth_code :string) IS:
  /*
  SELECT ptgq.genetic_quality_value
  FROM parent_tree_genetic_quality ptgq
      , parent_tree pt
  WHERE pt.parent_tree_id = p_parent_tree_id
    && pt.parent_tree_reg_status_code = 'APP'
    && pt.active_ind = 'Y'
    && ptgq.parent_tree_id = pt.parent_tree_id
    && ptgq.seed_plan_unit_id = p_seed_plan_unit_id
    && ptgq.genetic_type_code = p_genetic_type_code
    && ptgq.genetic_worth_code = p_genetic_worth_code
    && ptgq.genetic_worth_calc_ind = 'Y';
  */
  
  // CURSOR c_refresh_list IS:
  /*
  SELECT parent_tree_id, parent_tree_number
    , NVL(bv_AD_est, cv_AD_est)  AD_estimated_ind
    , NVL(bv_DFS_est,cv_DFS_est) DFS_estimated_ind
    , NVL(bv_DFU_est,cv_DFU_est) DFU_estimated_ind
    , NVL(bv_DFW_est,cv_DFW_est) DFW_estimated_ind
    , NVL(bv_DSB_est,cv_DSB_est) DSB_estimated_ind
    , NVL(bv_DSC_est,cv_DSC_est) DSC_estimated_ind
    , NVL(bv_DSG_est,cv_DSG_est) DSG_estimated_ind
    , NVL(bv_GVO_est,cv_GVO_est) GVO_estimated_ind
    , NVL(bv_IWS_est,cv_IWS_est) IWS_estimated_ind
    , NVL(bv_WDU_est,cv_WDU_est) WDU_estimated_ind
    , NVL(bv_WVE_est,cv_WVE_est) WVE_estimated_ind
    , NVL(bv_WWD_est,cv_WWD_est) WWD_estimated_ind
    , untested_ind , bv_AD, bv_DFS, bv_DFU, bv_DFW
    , bv_DSB, bv_DSC, bv_DSG, bv_GVO , bv_IWS, bv_WDU, bv_WVE, bv_WWD
    , cv_AD, cv_DFS, cv_DFU, cv_DFW , cv_DSB, cv_DSC, cv_DSG, cv_GVO
    , cv_IWS, cv_WDU, cv_WVE, cv_WWD
    , cone_count
    , pollen_count
    , smp_success_pct
    , smp_mix_latitude_degrees
    , smp_mix_latitude_minutes
    , smp_mix_longitude_degrees
    , smp_mix_longitude_minutes
    , smp_mix_elevation
    , bv_AD_smp_mix smp_mix_bv_AD
    , bv_DFS_smp_mix smp_mix_bv_DFS
    , bv_DFU_smp_mix smp_mix_bv_DFU
    , bv_DFW_smp_mix smp_mix_bv_DFW
    , bv_DSB_smp_mix smp_mix_bv_DSB
    , bv_DSC_smp_mix smp_mix_bv_DSC
    , bv_DSG_smp_mix smp_mix_bv_DSG
    , bv_GVO_smp_mix smp_mix_bv_GVO
    , bv_IWS_smp_mix smp_mix_bv_IWS
    , bv_WDU_smp_mix smp_mix_bv_WDU
    , bv_WVE_smp_mix smp_mix_bv_WVE
    , bv_WWD_smp_mix smp_mix_bv_WWD
    , non_orchard_pollen_contam_pct
    , total_genetic_worth_contrib
    , revision_count
    FROM (
      SELECT pt.parent_tree_id
            , pt.parent_tree_number
            , decode(v_current_test_ind,'Y',decode(gq.genetic_quality_value,null,sptgq.genetic_quality_value,gq.genetic_quality_value),sptgq.genetic_quality_value) genetic_quality_value
            , decode(v_current_test_ind,'Y',decode(gq.genetic_quality_value,null,sptgq.estimated_ind,'N'),sptgq.estimated_ind) estimated_ind
            , decode(v_current_test_ind,'Y',decode(gq.genetic_quality_value,null,sptgq.untested_ind,'N'),sptgq.untested_ind) untested_ind
            , gwc.genetic_worth_code
            , gtc.genetic_type_code
            , spt.cone_count
            , spt.pollen_count
            , spt.smp_success_pct
            , spt.smp_mix_latitude_degrees
            , spt.smp_mix_latitude_minutes
            , spt.smp_mix_longitude_degrees
            , spt.smp_mix_longitude_minutes
            , spt.smp_mix_elevation
            , spt.non_orchard_pollen_contam_pct
            , spt.total_genetic_worth_contrib
            , spt.revision_count
            , sptsm.smp_mix_value
        FROM
            PARENT_TREE pt
            LEFT OUTER JOIN PARENT_TREE fem_pt on pt.parent_tree_id = fem_pt.parent_tree_id
            LEFT OUTER JOIN SEEDLOT_PARENT_TREE spt on pt.parent_tree_id = spt.parent_tree_id
            LEFT OUTER JOIN SEEDLOT_PARENT_TREE_SMP_MIX sptsm on pt.parent_tree_id = sptsm.parent_tree_id && spt.seedlot_number = sptsm.seedlot_number
            LEFT OUTER JOIN SEEDLOT_PARENT_TREE_GEN_QLTY sptgq on spt.parent_tree_id = sptgq.parent_tree_id && spt.seedlot_number = sptgq.seedlot_number
            LEFT OUTER JOIN PARENT_TREE_GENETIC_QUALITY gq on sptgq.parent_tree_id = gq.parent_tree_id && gq.genetic_worth_calc_ind = 'Y'
            JOIN GENETIC_WORTH_CODE gwc on sptgq.genetic_worth_code = gwc.genetic_worth_code --&& sptsm.genetic_worth_code = gwc.genetic_worth_code
            JOIN GENETIC_TYPE_CODE gtc on sptgq.genetic_type_code = gtc.genetic_type_code --&& sptsm.genetic_type_code = gtc.genetic_type_code
        WHERE pt.parent_tree_reg_status_code = 'APP'
          && spt.seedlot_number = g_seedlot_number
          && pt.active_ind = 'Y'
    )
    PIVOT
    (MAX(estimated_ind) est
    ,MAX(genetic_quality_value)
    ,MAX(smp_mix_value) smp_mix
      FOR (genetic_type_code,genetic_worth_code)
      IN (('BV','AD') as bv_AD,
          ('BV','DFS') as bv_DFS,
          ('BV','DFU') as bv_DFU,
          ('BV','DFW') as bv_DFW,
          ('BV','DSB') as bv_DSB,
          ('BV','DSC') as bv_DSC,
          ('BV','DSG') as bv_DSG,
          ('BV','GVO') as bv_GVO,
          ('BV','IWS') as bv_IWS,
          ('BV','WDU') as bv_WDU,
          ('BV','WVE') as bv_WVE,
          ('BV','WWD') as bv_WWD,
          ('CV','AD')  as cv_AD,
          ('CV','DFS') as cv_DFS,
          ('CV','DFU') as cv_DFU,
          ('CV','DFW') as cv_DFW,
          ('CV','DSB') as cv_DSB,
          ('CV','DSC') as cv_DSC,
          ('CV','DSG') as cv_DSG,
          ('CV','GVO') as cv_GVO,
          ('CV','IWS') as cv_IWS,
          ('CV','WDU') as cv_WDU,
          ('CV','WVE') as cv_WVE,
          ('CV','WWD') as cv_WWD))
    ORDER BY 1;
  */
  let r_refresh_list: string; // c_refresh_list%ROWTYPE;
  let r_contrib: string; // spar_parent_tree_contrib_temp%ROWTYPE;
  let v_prev_parent_tree_id: numver; //spar_parent_tree_contrib_temp.parent_tree_id%TYPE;

  if (p_pt_array == null) {
    // --Set indicator to be used in query
    v_current_test_ind = 'N';
    if (p_get_current_tests) {
      v_current_test_ind = 'Y';
    }
    // --Empty out global temp table
    // DELETE FROM spar_parent_tree_contrib_temp;
    // OPEN c_refresh_list; FETCH c_refresh_list INTO r_refresh_list;
    while (c_refresh_list) {
      r_contrib.parent_tree_id = r_refresh_list.parent_tree_id;
      r_contrib.parent_tree_number = r_refresh_list.parent_tree_number;
      if (r_refresh_list.bv_AD != null) {
        r_contrib.bv_AD = r_refresh_list.bv_AD;
      }
      if (r_refresh_list.cv_AD != null) {
        r_contrib.cv_AD = r_refresh_list.cv_AD;
      }
      if (r_refresh_list.bv_DFS != null) {
        r_contrib.bv_DFS = r_refresh_list.bv_DFS;
      }
      if (r_refresh_list.cv_DFS != null) {
        r_contrib.cv_DFS = r_refresh_list.cv_DFS;
      }
      if (r_refresh_list.bv_DFU != null) {
        r_contrib.bv_DFU = r_refresh_list.bv_DFU;
      }
      if (r_refresh_list.cv_DFU != null) {
        r_contrib.cv_DFU = r_refresh_list.cv_DFU;
      }
      if (r_refresh_list.bv_DFW != null) {
        r_contrib.bv_DFW = r_refresh_list.bv_DFW;
      }
      if (r_refresh_list.cv_DFW != null) {
        r_contrib.cv_DFW = r_refresh_list.cv_DFW;
      }
      if (r_refresh_list.bv_DSB != null) {
        r_contrib.bv_DSB = r_refresh_list.bv_DSB;
      }
      if (r_refresh_list.cv_DSB != null) {
        r_contrib.cv_DSB = r_refresh_list.cv_DSB;
      }
      if (r_refresh_list.bv_DSC != null) {
        r_contrib.bv_DSC = r_refresh_list.bv_DSC;
      }
      if (r_refresh_list.cv_DSC != null) {
        r_contrib.cv_DSC = r_refresh_list.cv_DSC;
      }
      if (r_refresh_list.bv_DSG != null) {
        r_contrib.bv_DSG = r_refresh_list.bv_DSG;
      }
      if (r_refresh_list.cv_DSG != null) {
        r_contrib.cv_DSG = r_refresh_list.cv_DSG;
      }
      if (r_refresh_list.bv_GVO != null) {
        r_contrib.bv_GVO = r_refresh_list.bv_GVO;
      }
      if (r_refresh_list.cv_GVO != null) {
        r_contrib.cv_GVO = r_refresh_list.cv_GVO;
      }
      if (r_refresh_list.bv_IWS != null) {
        r_contrib.bv_IWS = r_refresh_list.bv_IWS;
      }
      if (r_refresh_list.cv_IWS != null) {
        r_contrib.cv_IWS = r_refresh_list.cv_IWS;
      }
      if (r_refresh_list.bv_WDU != null) {
        r_contrib.bv_WDU = r_refresh_list.bv_WDU;
      }
      if (r_refresh_list.cv_WDU != null) {
        r_contrib.cv_WDU = r_refresh_list.cv_WDU;
      }
      if (r_refresh_list.bv_WVE != null) {
        r_contrib.bv_WVE = r_refresh_list.bv_WVE;
      }
      if (r_refresh_list.cv_WVE != null) {
        r_contrib.cv_WVE = r_refresh_list.cv_WVE;
      }
      if (r_refresh_list.bv_WWD != null) {
        r_contrib.bv_WWD = r_refresh_list.bv_WWD;
      }
      if (r_refresh_list.cv_WWD != null) {
        r_contrib.cv_WWD = r_refresh_list.cv_WWD;
      }
      // --Estimated ind - applies to Deer browse
      if (r_refresh_list.AD_estimated_ind != null) {
        r_contrib.AD_estimated_ind = r_refresh_list.AD_estimated_ind;
      }
      // --Estimated ind - applies to Dothistroma needle blight
      if (r_refresh_list.DFS_estimated_ind != null) {
        r_contrib.DFS_estimated_ind = r_refresh_list.DFS_estimated_ind;
      }
      // --Estimated ind - applies to Cedar leaf blight
      if (r_refresh_list.DFU_estimated_ind != null) {
        r_contrib.DFU_estimated_ind = r_refresh_list.DFU_estimated_ind;
      }
      // --Estimated ind - applies to Swiss neeld cast
      if (r_refresh_list.DFW_estimated_ind != null) {
        r_contrib.DFW_estimated_ind = r_refresh_list.DFW_estimated_ind;
      }
      // --Estimated ind - applies to White pine blister rust
      if (r_refresh_list.DSB_estimated_ind != null) {
        r_contrib.DSB_estimated_ind = r_refresh_list.DSB_estimated_ind;
      }
      // --Estimated ind - applies to ComADra blister rust
      if (r_refresh_list.DSC_estimated_ind != null) {
        r_contrib.DSC_estimated_ind = r_refresh_list.DSC_estimated_ind;
      }
      // --Estimated ind - applies to Western gall rust
      if (r_refresh_list.DSG_estimated_ind != null) {
        r_contrib.DSG_estimated_ind = r_refresh_list.DSG_estimated_ind;
      }
      // --Estimated ind - applies to Volume Growth
      if (r_refresh_list.GVO_estimated_ind != null) {
        r_contrib.GVO_estimated_ind = r_refresh_list.GVO_estimated_ind;
      }
      // --Estimated ind - applies to White pine terminal weevil
      if (r_refresh_list.IWS_estimated_ind != null) {
        r_contrib.IWS_estimated_ind = r_refresh_list.IWS_estimated_ind;
      }
      // --Estimated ind - applies to Durability
      if (r_refresh_list.WDU_estimated_ind != null) {
        r_contrib.WDU_estimated_ind = r_refresh_list.WDU_estimated_ind;
      }
      // --Estimated ind - applies to Wood velocity measures
      if (r_refresh_list.WVE_estimated_ind != null) {
        r_contrib.WVE_estimated_ind = r_refresh_list.WVE_estimated_ind;
      }
      // --Estimated ind - applies to Wood density
      if (r_refresh_list.WWD_estimated_ind != null) {
        r_contrib.WWD_estimated_ind = r_refresh_list.WWD_estimated_ind;
      }
      if (r_refresh_list.untested_ind != null) {
        r_contrib.untested_ind = r_refresh_list.untested_ind;
      }
      // --Saved values
      r_contrib.revision_count = r_contrib.revision_count == null? r_refresh_list.revision_count : r_contrib.revision_count;
      r_contrib.cone_count = r_contrib.cone_count == null? r_refresh_list.cone_count : r_contrib.cone_count;
      r_contrib.pollen_count = NVL(r_contrib.pollen_count,r_refresh_list.pollen_count);
      r_contrib.smp_success_pct = NVL(r_contrib.smp_success_pct,r_refresh_list.smp_success_pct);
      r_contrib.smp_mix_bv_AD = NVL(r_contrib.smp_mix_bv_AD,r_refresh_list.smp_mix_bv_AD);
      r_contrib.smp_mix_bv_DFS = NVL(r_contrib.smp_mix_bv_DFS,r_refresh_list.smp_mix_bv_DFS);
      r_contrib.smp_mix_bv_DFU = NVL(r_contrib.smp_mix_bv_DFU,r_refresh_list.smp_mix_bv_DFU);
      r_contrib.smp_mix_bv_DFW = NVL(r_contrib.smp_mix_bv_DFW,r_refresh_list.smp_mix_bv_DFW);
      r_contrib.smp_mix_bv_DSB = NVL(r_contrib.smp_mix_bv_DSB,r_refresh_list.smp_mix_bv_DSB);
      r_contrib.smp_mix_bv_DSC = NVL(r_contrib.smp_mix_bv_DSC,r_refresh_list.smp_mix_bv_DSC);
      r_contrib.smp_mix_bv_DSG = NVL(r_contrib.smp_mix_bv_DSG,r_refresh_list.smp_mix_bv_DSG);
      r_contrib.smp_mix_bv_GVO = NVL(r_contrib.smp_mix_bv_GVO,r_refresh_list.smp_mix_bv_GVO);
      r_contrib.smp_mix_bv_IWS = NVL(r_contrib.smp_mix_bv_IWS,r_refresh_list.smp_mix_bv_IWS);
      r_contrib.smp_mix_bv_WDU = NVL(r_contrib.smp_mix_bv_WDU,r_refresh_list.smp_mix_bv_WDU);
      r_contrib.smp_mix_bv_WVE = NVL(r_contrib.smp_mix_bv_WVE,r_refresh_list.smp_mix_bv_WVE);
      r_contrib.smp_mix_bv_WWD = NVL(r_contrib.smp_mix_bv_WWD,r_refresh_list.smp_mix_bv_WWD);
      r_contrib.smp_mix_latitude_degrees = NVL(r_contrib.smp_mix_latitude_degrees,r_refresh_list.smp_mix_latitude_degrees);
      r_contrib.smp_mix_latitude_minutes = NVL(r_contrib.smp_mix_latitude_minutes,r_refresh_list.smp_mix_latitude_minutes);
      r_contrib.smp_mix_longitude_degrees = NVL(r_contrib.smp_mix_longitude_degrees,r_refresh_list.smp_mix_longitude_degrees);
      r_contrib.smp_mix_longitude_minutes = NVL(r_contrib.smp_mix_longitude_minutes,r_refresh_list.smp_mix_longitude_minutes);
      r_contrib.smp_mix_elevation = NVL(r_contrib.smp_mix_elevation,r_refresh_list.smp_mix_elevation);
      r_contrib.non_orchard_pollen_contam_pct = NVL(r_contrib.non_orchard_pollen_contam_pct,r_refresh_list.non_orchard_pollen_contam_pct);
      // --Save previous parent tree AND get next row
      v_prev_parent_tree_id = r_refresh_list.parent_tree_id;
      // FETCH c_refresh_list INTO r_refresh_list;
      // --if (Parent Tree changed or last row
      if (v_prev_parent_tree_id != r_refresh_list.parent_tree_id || c_refresh_list == null) {
        // --Insert the row
        /*
        INSERT INTO spar_parent_tree_contrib_temp (
              parent_tree_id
            , parent_tree_number
            , AD_estimated_ind
            , DFS_estimated_ind
            , DFU_estimated_ind
            , DFW_estimated_ind
            , DSB_estimated_ind
            , DSC_estimated_ind
            , DSG_estimated_ind
            , GVO_estimated_ind
            , IWS_estimated_ind
            , WDU_estimated_ind
            , WVE_estimated_ind
            , WWD_estimated_ind
            , untested_ind
            , bv_AD, bv_DFS, bv_DFU, bv_DFW
            , bv_DSB, bv_DSC, bv_DSG, bv_GVO
            , bv_IWS, bv_WDU, bv_WVE, bv_WWD
            , cv_AD, cv_DFS, cv_DFU, cv_DFW
            , cv_DSB, cv_DSC, cv_DSG, cv_GVO
            , cv_IWS, cv_WDU, cv_WVE, cv_WWD
            , cone_count
            , pollen_count
            , smp_success_pct
            , smp_mix_bv_AD
            , smp_mix_bv_DFS
            , smp_mix_bv_DFU
            , smp_mix_bv_DFW
            , smp_mix_bv_DSB
            , smp_mix_bv_DSC
            , smp_mix_bv_DSG
            , smp_mix_bv_GVO
            , smp_mix_bv_IWS
            , smp_mix_bv_WDU
            , smp_mix_bv_WVE
            , smp_mix_bv_WWD
            , smp_mix_latitude_degrees
            , smp_mix_latitude_minutes
            , smp_mix_longitude_degrees
            , smp_mix_longitude_minutes
            , smp_mix_elevation
            , non_orchard_pollen_contam_pct
            , total_genetic_worth_contrib
            , revision_count)
        VALUES (
              r_contrib.parent_tree_id
            , r_contrib.parent_tree_number
            , r_contrib.AD_estimated_ind
            , r_contrib.DFS_estimated_ind
            , r_contrib.DFU_estimated_ind
            , r_contrib.DFW_estimated_ind
            , r_contrib.DSB_estimated_ind
            , r_contrib.DSC_estimated_ind
            , r_contrib.DSG_estimated_ind
            , r_contrib.GVO_estimated_ind
            , r_contrib.IWS_estimated_ind
            , r_contrib.WDU_estimated_ind
            , r_contrib.WVE_estimated_ind
            , r_contrib.WWD_estimated_ind
            , r_contrib.untested_ind
            , r_contrib.bv_AD, r_contrib.bv_DFS, r_contrib.bv_DFU, r_contrib.bv_DFW
            , r_contrib.bv_DSB, r_contrib.bv_DSC, r_contrib.bv_DSG, r_contrib.bv_GVO
            , r_contrib.bv_IWS, r_contrib.bv_WDU, r_contrib.bv_WVE, r_contrib.bv_WWD
            , r_contrib.cv_AD, r_contrib.cv_DFS, r_contrib.cv_DFU, r_contrib.cv_DFW
            , r_contrib.cv_DSB, r_contrib.cv_DSC, r_contrib.cv_DSG, r_contrib.cv_GVO
            , r_contrib.cv_IWS, r_contrib.cv_WDU, r_contrib.cv_WVE, r_contrib.cv_WWD
            , r_contrib.cone_count
            , r_contrib.pollen_count
            , r_contrib.smp_success_pct
            , r_contrib.smp_mix_bv_AD
            , r_contrib.smp_mix_bv_DFS
            , r_contrib.smp_mix_bv_DFU
            , r_contrib.smp_mix_bv_DFW
            , r_contrib.smp_mix_bv_DSB
            , r_contrib.smp_mix_bv_DSC
            , r_contrib.smp_mix_bv_DSG
            , r_contrib.smp_mix_bv_GVO
            , r_contrib.smp_mix_bv_IWS
            , r_contrib.smp_mix_bv_WDU
            , r_contrib.smp_mix_bv_WVE
            , r_contrib.smp_mix_bv_WWD
            , r_contrib.smp_mix_latitude_degrees
            , r_contrib.smp_mix_latitude_minutes
            , r_contrib.smp_mix_longitude_degrees
            , r_contrib.smp_mix_longitude_minutes
            , r_contrib.smp_mix_elevation
            , r_contrib.non_orchard_pollen_contam_pct
            , r_contrib.total_genetic_worth_contrib
            , r_contrib.revision_count);
        */
        r_contrib = null;
      }
    }

    /*
    SELECT spr_001a_any(
            parent_tree_id
          , parent_tree_number
          , AD_estimated_ind
          , DFS_estimated_ind
          , DFU_estimated_ind
          , DFW_estimated_ind
          , DSB_estimated_ind
          , DSC_estimated_ind
          , DSG_estimated_ind
          , GVO_estimated_ind
          , IWS_estimated_ind
          , WDU_estimated_ind
          , WVE_estimated_ind
          , WWD_estimated_ind
          , untested_ind
          , bv_AD,  bv_DFS, bv_DFU, bv_DFW
          , bv_DSB, bv_DSC, bv_DSG, bv_GVO
          , bv_IWS, bv_WDU, bv_WVE, bv_WWD
          , cv_AD,  cv_DFS, cv_DFU, cv_DFW
          , cv_DSB, cv_DSC, cv_DSG, cv_GVO
          , cv_IWS, cv_WDU, cv_WVE, cv_WWD
          , cone_count
          , pollen_count
          , smp_success_pct
          , smp_mix_latitude_degrees
          , smp_mix_latitude_minutes
          , smp_mix_longitude_degrees
          , smp_mix_longitude_minutes
          , smp_mix_elevation
          , smp_mix_bv_AD
          , smp_mix_bv_DFS
          , smp_mix_bv_DFU
          , smp_mix_bv_DFW
          , smp_mix_bv_DSB
          , smp_mix_bv_DSC
          , smp_mix_bv_DSG
          , smp_mix_bv_GVO
          , smp_mix_bv_IWS
          , smp_mix_bv_WDU
          , smp_mix_bv_WVE
          , smp_mix_bv_WWD
          , non_orchard_pollen_contam_pct
          , total_genetic_worth_contrib
          , longitude_degrees
          , longitude_minutes
          , longitude_seconds
          , latitude_degrees
          , latitude_minutes
          , latitude_seconds
          , elevation
          , geography_error_ind
          , revision_count)
      BULK COLLECT INTO p_pt_array
      FROM spar_parent_tree_contrib_temp
      ORDER BY DECODE(cone_count||pollen_count,null,2,1),TO_NUMBER(parent_tree_number);
  ELSE
  */
    // NOTE: this if condition below belongs to the ELSE condition of the above query.
    if (p_get_current_tests && p_pt_array.COUNT > 0) {
      // --Loop through array setting latest gq values
      for (let i in p_pt_array) {
        // --Assume only saved rows need to get latest gq value
        // --(others should already have latest)
        if (p_pt_array[i].revision_count != null) {
          if (p_pt_array[i].bv_GVO != null) {
            v_genetic_type_code = 'BV';
          } else {
            v_genetic_type_code = 'CV';
          }
          r_gq = null;
          // --Get current Growth test flagged for use in GW calc
          // OPEN c_gq(p_pt_array[i].parent_tree_id , g_seed_plan_unit_id, v_genetic_type_code, 'AD');
          // FETCH c_gq INTO r_gq; CLOSE c_gq;
          // -->if (no result found, leave existing result
          if (r_gq.genetic_quality_value != null) {
            if (p_pt_array[i].bv_AD != null) {
              p_pt_array[i].bv_AD = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].AD_estimated_ind = 'N';
            } else {
              p_pt_array[i].cv_AD = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].AD_estimated_ind = 'N';
            }
          }
          r_gq = null;
          // --Get current Growth test flagged for use in GW calc
          // OPEN c_gq(p_pt_array[i].parent_tree_id , g_seed_plan_unit_id , v_genetic_type_code, 'DFS');
          // FETCH c_gq INTO r_gq; CLOSE c_gq;
          //-->if (no result found, leave existing result
          if (r_gq.genetic_quality_value != null) {
            if (p_pt_array[i].bv_DFS != null) {
              p_pt_array[i].bv_DFS = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].DFS_estimated_ind = 'N';
            } else {
              p_pt_array[i].cv_DFS = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].DFS_estimated_ind = 'N';
            }
          }
          r_gq = null;
          // --Get current Growth test flagged for use in GW calc
          // OPEN c_gq(p_pt_array[i].parent_tree_id , g_seed_plan_unit_id, v_genetic_type_code , 'DFU');
          // FETCH c_gq INTO r_gq; CLOSE c_gq;
          //-->if (no result found, leave existing result
          if (r_gq.genetic_quality_value != null) {
            if (p_pt_array[i].bv_DFU != null) {
              p_pt_array[i].bv_DFU = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].DFU_estimated_ind = 'N';
            } else {
              p_pt_array[i].cv_DFU = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].DFU_estimated_ind = 'N';
            }
          }
          r_gq = null;
          // --Get current Growth test flagged for use in GW calc
          // OPEN c_gq(p_pt_array[i].parent_tree_id, g_seed_plan_unit_id, v_genetic_type_code, 'DFW');
          // FETCH c_gq INTO r_gq; CLOSE c_gq;
          // -->if (no result found, leave existing result
          if (r_gq.genetic_quality_value != null) {
            if (p_pt_array[i].bv_DFW != null) {
              p_pt_array[i].bv_DFW = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].DFW_estimated_ind = 'N';
            } else {
              p_pt_array[i].cv_DFW = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].DFW_estimated_ind = 'N';
            }
          }
          r_gq = null;
          // --Get current Growth test flagged for use in GW calc
          // OPEN c_gq(p_pt_array[i].parent_tree_id, g_seed_plan_unit_id, v_genetic_type_code, 'DSB');
          // FETCH c_gq INTO r_gq; CLOSE c_gq;
          // -->if (no result found, leave existing result
          if (r_gq.genetic_quality_value != null) {
            if (p_pt_array[i].bv_DSB != null) {
              p_pt_array[i].bv_DSB = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].DSB_estimated_ind = 'N';
            } else {
              p_pt_array[i].cv_DSB = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].DSB_estimated_ind = 'N';
            }
          }
          r_gq = null;
          // --Get current Growth test flagged for use in GW calc
          // OPEN c_gq(p_pt_array[i].parent_tree_id, g_seed_plan_unit_id, v_genetic_type_code, 'DSC');
          // FETCH c_gq INTO r_gq; CLOSE c_gq;
          // -->if (no result found, leave existing result
          if (r_gq.genetic_quality_value != null) {
            if (p_pt_array[i].bv_DSC != null) {
              p_pt_array[i].bv_DSC = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].DSC_estimated_ind = 'N';
            } else {
              p_pt_array[i].cv_DSC = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].DSC_estimated_ind = 'N';
            }
          }
          r_gq = null;
          // --Get current Growth test flagged for use in GW calc
          // OPEN c_gq(p_pt_array[i].parent_tree_id, g_seed_plan_unit_id, v_genetic_type_code, 'DSG');
          // FETCH c_gq INTO r_gq; CLOSE c_gq;
          // -->if (no result found, leave existing result
          if (r_gq.genetic_quality_value != null) {
            if (p_pt_array[i].bv_DSG != null) {
              p_pt_array[i].bv_DSG = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].DSG_estimated_ind = 'N';
            } else {
              p_pt_array[i].cv_DSG = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].DSG_estimated_ind = 'N';
            }
          }
          r_gq = null;
          // --Get current Growth test flagged for use in GW calc
          // OPEN c_gq(p_pt_array[i].parent_tree_id, g_seed_plan_unit_id, v_genetic_type_code, 'GVO');
          // FETCH c_gq INTO r_gq; CLOSE c_gq;
          // -->if (no result found, leave existing result
          if (r_gq.genetic_quality_value != null) {
            if (p_pt_array[i].bv_GVO != null) {
              p_pt_array[i].bv_GVO = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].GVO_estimated_ind = 'N';
            } else {
              p_pt_array[i].cv_GVO = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].GVO_estimated_ind = 'N';
            }
          }
          r_gq = null;
          // --Get current Growth test flagged for use in GW calc
          // OPEN c_gq(p_pt_array[i].parent_tree_id, g_seed_plan_unit_id, v_genetic_type_code, 'IWS');
          // FETCH c_gq INTO r_gq; CLOSE c_gq;
          // -->if (no result found, leave existing result
          if (r_gq.genetic_quality_value != null) {
            if (p_pt_array[i].bv_IWS != null) {
              p_pt_array[i].bv_IWS = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].IWS_estimated_ind = 'N';
            } else {
              p_pt_array[i].cv_IWS = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].IWS_estimated_ind = 'N';
            }
          }
          r_gq = null;
          // --Get current Growth test flagged for use in GW calc
          // OPEN c_gq(p_pt_array[i].parent_tree_id, g_seed_plan_unit_id, v_genetic_type_code, 'WDU');
          // FETCH c_gq INTO r_gq; CLOSE c_gq;
          // -->if (no result found, leave existing result
          if (r_gq.genetic_quality_value != null) {
            if (p_pt_array[i].bv_WDU != null) {
              p_pt_array[i].bv_WDU = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].WDU_estimated_ind = 'N';
            } else {
              p_pt_array[i].cv_WDU = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].WDU_estimated_ind = 'N';
            }
          }
          r_gq = null;
          // --Get current Growth test flagged for use in GW calc
          // OPEN c_gq(p_pt_array[i].parent_tree_id, g_seed_plan_unit_id, v_genetic_type_code, 'WVE');
          // FETCH c_gq INTO r_gq; CLOSE c_gq;
          // -->if (no result found, leave existing result
          if (r_gq.genetic_quality_value != null) {
            if (p_pt_array[i].bv_WVE != null) {
              p_pt_array[i].bv_WVE = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].WVE_estimated_ind = 'N';
            } else {
              p_pt_array[i].cv_WVE = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].WVE_estimated_ind = 'N';
            }
          }
          r_gq = null;
          // --Get current Growth test flagged for use in GW calc
          // OPEN c_gq(p_pt_array[i].parent_tree_id, g_seed_plan_unit_id, v_genetic_type_code, 'WWD');
          // FETCH c_gq INTO r_gq; CLOSE c_gq;
          // -->if (no result found, leave existing result
          if (r_gq.genetic_quality_value != null) {
            if (p_pt_array[i].bv_WWD != null) {
              p_pt_array[i].bv_WWD = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].WWD_estimated_ind = 'N';
            } else {
              p_pt_array[i].cv_WWD = r_gq.genetic_quality_value;
              p_pt_array[i].untested_ind = 'N';
              p_pt_array[i].WWD_estimated_ind = 'N';
            }
          }
        }
      }
    }
    // Ends the SELECT ELSE statement
    // -- Get the geographic information for each of the anys in the array
    if (p_pt_array.COUNT > 0) {
      for (let i in p_pt_array) {
        spr_get_pt_geog(p_pt_array[i].parent_tree_id, p_pt_array[i].elevation,
            p_pt_array[i].latitude_degrees, p_pt_array[i].latitude_minutes, 
            p_pt_array[i].latitude_seconds, p_pt_array[i].longitude_degrees,
            p_pt_array[i].longitude_minutes, p_pt_array[i].longitude_seconds);
      }
    }
  }
}

/*
 * Procedure: calc_pt_contrib
 * Purpose:   Recalculate Area of Use, GW, Ne, Collection geography.
 *            -All calculations taken from the 2004 version of the
 *             Seedlot Certification Template (Excel).
 *            -Excel treats empty cells as 0 for calculations so
 *             NVL(__,0) == used liberally.
 *            -CURRENTLY ONLY CALCULATES GW-G.
 */
function calc_pt_contrib( p_ptZ: any[], p_get_current_tests: boolean) {
  let v_contaminant_pollen_bv: number; // seedlot.contaminant_pollen_bv%TYPE;
  let v_smp_parents_outside: number; // seedlot.smp_parents_outside%TYPE;
  //--Abbreviations used:
  //-- f_       female         m_    male         p_    parent
  //-- contrib_ contribution   poll_ pollen       prop_ proportion
  //-- wtd_     weighted
  //--col:xx = Seedlot Certification Template (xls) reference
  let v_coll_lat: number; // NUMBER;--col:E
  let v_coll_long: number; // NUMBER;--col:H
  let v_lat: number; // NUMBER;--col:T
  let v_long: number; // NUMBER;--col:U
  let v_female_crop_pop: number; // NUMBER;--col:V
  let v_parent_prop_orch_poll: number; // NUMBER;--col:W
  let v_m_gw_AD_contrib_orch_poll: number; // NUMBER;--col:X
  let v_sum_m_gw_AD_contb_orch_poll: number; // NUMBER = 0;--SUM(X)
  let v_m_gw_DFS_contrib_orch_poll: number; // NUMBER;--col:X
  let v_sum_m_gw_DFS_contb_orch_poll: number; // NUMBER = 0;--SUM(X)
  let v_m_gw_DFU_contrib_orch_poll: number; // NUMBER;--col:X
  let v_sum_m_gw_DFU_contb_orch_poll: number; // NUMBER = 0;--SUM(X)
  let v_m_gw_DFW_contrib_orch_poll: number; // NUMBER;--col:X
  let v_sum_m_gw_DFW_contb_orch_poll: number; // NUMBER = 0;--SUM(X)
  let v_m_gw_DSB_contrib_orch_poll: number; // NUMBER;--col:X
  let v_sum_m_gw_DSB_contb_orch_poll: number; // NUMBER = 0;--SUM(X)
  let v_m_gw_DSC_contrib_orch_poll: number; // NUMBER;--col:X
  let v_sum_m_gw_DSC_contb_orch_poll: number; // NUMBER = 0;--SUM(X)
  let v_m_gw_DSG_contrib_orch_poll: number; // NUMBER;--col:X
  let v_sum_m_gw_DSG_contb_orch_poll: number; // NUMBER = 0;--SUM(X)
  let v_m_gw_GVO_contrib_orch_poll: number; // NUMBER;--col:X
  let v_sum_m_gw_GVO_contb_orch_poll: number; // NUMBER = 0;--SUM(X)
  let v_m_gw_IWS_contrib_orch_poll: number; // NUMBER;--col:X
  let v_sum_m_gw_IWS_contb_orch_poll: number; // NUMBER = 0;--SUM(X)
  let v_m_gw_WDU_contrib_orch_poll: number; // NUMBER;--col:X
  let v_sum_m_gw_WDU_contb_orch_poll: number; // NUMBER = 0;--SUM(X)
  let v_m_gw_WVE_contrib_orch_poll: number; // NUMBER;--col:X
  let v_sum_m_gw_WVE_contb_orch_poll: number; // NUMBER = 0;--SUM(X)
  let v_m_gw_WWD_contrib_orch_poll: number; // NUMBER;--col:X
  let v_sum_m_gw_WWD_contb_orch_poll: number; // NUMBER = 0;--SUM(X)
  let v_m_contam_contrib: number; // NUMBER;--col:AA
  let v_f_gw_AD_contrib: number; // NUMBER;--col:Y
  let v_m_smp_AD_contrib: number; // NUMBER;--col:Z
  let v_f_gw_DFS_contrib: number; // NUMBER;--col:Y
  let v_m_smp_DFS_contrib: number; // NUMBER;--col:Z
  let v_f_gw_DFU_contrib: number; // NUMBER;--col:Y
  let v_m_smp_DFU_contrib: number; // NUMBER;--col:Z
  let v_f_gw_DFW_contrib: number; // NUMBER;--col:Y
  let v_m_smp_DFW_contrib: number; // NUMBER;--col:Z
  let v_f_gw_DSB_contrib: number; // NUMBER;--col:Y
  let v_m_smp_DSB_contrib: number; // NUMBER;--col:Z
  let v_f_gw_DSC_contrib: number; // NUMBER;--col:Y
  let v_m_smp_DSC_contrib: number; // NUMBER;--col:Z
  let v_f_gw_DSG_contrib: number; // NUMBER;--col:Y
  let v_m_smp_DSG_contrib: number; // NUMBER;--col:Z
  let v_f_gw_GVO_contrib: number; // NUMBER;--col:Y
  let v_m_smp_GVO_contrib: number; // NUMBER;--col:Z
  let v_f_gw_IWS_contrib: number; // NUMBER;--col:Y
  let v_m_smp_IWS_contrib: number; // NUMBER;--col:Z
  let v_f_gw_WDU_contrib: number; // NUMBER;--col:Y
  let v_m_smp_WDU_contrib: number; // NUMBER;--col:Z
  let v_f_gw_WVE_contrib: number; // NUMBER;--col:Y
  let v_m_smp_WVE_contrib: number; // NUMBER;--col:Z
  let v_f_gw_WWD_contrib: number; // NUMBER;--col:Y
  let v_m_smp_WWD_contrib: number; // NUMBER;--col:Z
  let v_m_orch_poll_contrib_AD: number; // NUMBER;--col:AB(dependent on SUM(X)
  let v_m_orch_poll_contrib_DFS: number; //NUMBER;--col:AB(dependent on SUM(X)
  let v_m_orch_poll_contrib_DFU: number; //NUMBER;--col:AB(dependent on SUM(X)
  let v_m_orch_poll_contrib_DFW: number; //NUMBER;--col:AB(dependent on SUM(X)
  let v_m_orch_poll_contrib_DSB: number; //NUMBER;--col:AB(dependent on SUM(X)
  let v_m_orch_poll_contrib_DSC: number; //NUMBER;--col:AB(dependent on SUM(X)
  let v_m_orch_poll_contrib_DSG: number; //NUMBER;--col:AB(dependent on SUM(X)
  let v_m_orch_poll_contrib_GVO: number; //NUMBER;--col:AB(dependent on SUM(X)
  let v_m_orch_poll_contrib_IWS: number; //NUMBER;--col:AB(dependent on SUM(X)
  let v_m_orch_poll_contrib_WDU: number; //NUMBER;--col:AB(dependent on SUM(X)
  let v_m_orch_poll_contrib_WVE: number; //NUMBER;--col:AB(dependent on SUM(X)
  let v_m_orch_poll_contrib_WWD: number; //NUMBER;--col:AB(dependent on SUM(X)
  let v_m_total_gw_AD_contrib: number; //NUMBER;--col:AC
  let v_m_total_gw_DFS_contrib: number; //NUMBER;--col:AC
  let v_m_total_gw_DFU_contrib: number; //NUMBER;--col:AC
  let v_m_total_gw_DFW_contrib: number; //NUMBER;--col:AC
  let v_m_total_gw_DSB_contrib: number; //NUMBER;--col:AC
  let v_m_total_gw_DSC_contrib: number; //NUMBER;--col:AC
  let v_m_total_gw_DSG_contrib: number; //NUMBER;--col:AC
  let v_m_total_gw_GVO_contrib: number; //NUMBER;--col:AC
  let v_m_total_gw_IWS_contrib: number; //NUMBER;--col:AC
  let v_m_total_gw_WDU_contrib: number; //NUMBER;--col:AC
  let v_m_total_gw_WVE_contrib: number; //NUMBER;--col:AC
  let v_m_total_gw_WWD_contrib: number; //NUMBER;--col:AC
  let v_p_total_gw_AD_contrib: number; //NUMBER;--col:AD
  let v_sum_p_total_gw_AD_contrib: number; //NUMBER = 0;--SUM(AD)
  let v_p_total_gw_DFS_contrib: number; //NUMBER;--col:AD
  let v_sum_p_total_gw_DFS_contrib: number; //NUMBER = 0;--SUM(AD)
  let v_p_total_gw_DFU_contrib: number; //NUMBER;--col:AD
  let v_sum_p_total_gw_DFU_contrib: number; //NUMBER = 0;--SUM(AD)
  let v_p_total_gw_DFW_contrib: number; //NUMBER;--col:AD
  let v_sum_p_total_gw_DFW_contrib: number; //NUMBER = 0;--SUM(AD)
  let v_p_total_gw_DSB_contrib: number; //NUMBER;--col:AD
  let v_sum_p_total_gw_DSB_contrib: number; //NUMBER = 0;--SUM(AD)
  let v_p_total_gw_DSC_contrib: number; //NUMBER;--col:AD
  let v_sum_p_total_gw_DSC_contrib: number; //NUMBER = 0;--SUM(AD)
  let v_p_total_gw_DSG_contrib: number; //NUMBER;--col:AD
  let v_sum_p_total_gw_DSG_contrib: number; //NUMBER = 0;--SUM(AD)
  let v_p_total_gw_GVO_contrib: number; //NUMBER;--col:AD
  let v_sum_p_total_gw_GVO_contrib: number; //NUMBER = 0;--SUM(AD)
  let v_p_total_gw_IWS_contrib: number; //NUMBER;--col:AD
  let v_sum_p_total_gw_IWS_contrib: number; //NUMBER = 0;--SUM(AD)
  let v_p_total_gw_WDU_contrib: number; //NUMBER;--col:AD
  let v_sum_p_total_gw_WDU_contrib: number; //NUMBER = 0;--SUM(AD)
  let v_p_total_gw_WVE_contrib: number; //NUMBER;--col:AD
  let v_sum_p_total_gw_WVE_contrib: number; //NUMBER = 0;--SUM(AD)
  let v_p_total_gw_WWD_contrib: number; //NUMBER;--col:AD
  let v_sum_p_total_gw_WWD_contrib: number; //NUMBER = 0;--SUM(AD)
  let v_p_prop_contrib: number; //NUMBER;--col:AE
  let v_sum_p_prop_contrib: number; //NUMBER = 0;--SUM(AE)
  let v_sum_p_prop_contrib_tested: number; //NUMBER = 0;--SUM(AE for Tested Parent Trees)
  let v_sum_p_prop_contrib_test_AD: number; //NUMBER = 0;--SUM(AE for Tested Parent Trees)
  let v_sum_p_prop_contrib_test_DFS: number; //NUMBER = 0;--SUM(AE for Tested Parent Trees)
  let v_sum_p_prop_contrib_test_DFU: number; //NUMBER = 0;--SUM(AE for Tested Parent Trees)
  let v_sum_p_prop_contrib_test_DFW: number; //NUMBER = 0;--SUM(AE for Tested Parent Trees)
  let v_sum_p_prop_contrib_test_DSB: number; //NUMBER = 0;--SUM(AE for Tested Parent Trees)
  let v_sum_p_prop_contrib_test_DSC: number; //NUMBER = 0;--SUM(AE for Tested Parent Trees)
  let v_sum_p_prop_contrib_test_DSG: number; //NUMBER = 0;--SUM(AE for Tested Parent Trees)
  let v_sum_p_prop_contrib_test_GVO: number; //NUMBER = 0;--SUM(AE for Tested Parent Trees)   
  let v_sum_p_prop_contrib_test_IWS: number; //NUMBER = 0;--SUM(AE for Tested Parent Trees)
  let v_sum_p_prop_contrib_test_WDU: number; //NUMBER = 0;--SUM(AE for Tested Parent Trees)
  let v_sum_p_prop_contrib_test_WVE: number; //NUMBER = 0;--SUM(AE for Tested Parent Trees)
  let v_sum_p_prop_contrib_test_WWD: number; //NUMBER = 0;--SUM(AE for Tested Parent Trees)           
  let v_p_contrib_elev_no_smp_poll: number; //NUMBER;--col:AF
  let v_p_contrib_lat_no_smp_poll: number; //NUMBER;--col:AG
  let v_p_contrib_long_no_smp_poll: number; //NUMBER;--col:AH
  let v_smp_poll_wtd_contrib_elev: number; //NUMBER;--col:AI
  let v_smp_poll_wtd_contrib_lat: number; //NUMBER;--col:AJ
  let v_smp_poll_wtd_contrib_long: number; //NUMBER;--col:AK
  let v_wtd_elev_p_and_smp_poll: number; //NUMBER;--col:AL
  let v_sum_wtd_elev_p_and_smp_poll: number; //NUMBER = 0;--SUM(AL)
  let v_wtd_lat_p_and_smp_poll: number; //NUMBER;--col:AM
  let v_sum_wtd_lat_p_and_smp_poll: number; //NUMBER = 0;--SUM(am)
  let v_wtd_long_p_and_smp_poll: number; //NUMBER;--col:AN
  let v_sum_wtd_long_p_and_smp_poll: number; //NUMBER = 0;--SUM(AN)
  let v_ne_no_smp_contrib: number; //NUMBER;--col:AO
  let v_sum_ne_no_smp_contrib: number; //NUMBER = 0;--SUM(AO)
  let v_smp_success_wtd_by_f_p: number; //NUMBER;--col:AP
  let v_sum_smp_success_wtd_by_f_p: number; //NUMBER = 0;--SUM(AP)
  let v_orch_gamete_contr: number; //NUMBER;--col:AQ
  let v_sum_orch_gamete_contr: number; //NUMBER = 0;--SUM(AQ)
  let v_total_parent_trees: number; //NUMBER(5)  = 0;
  let v_gw_AD: number; //NUMBER;
  let v_gw_DFS: number; //NUMBER;
  let v_gw_DFU: number; //NUMBER;
  let v_gw_DFW: number; //NUMBER;
  let v_gw_DSB: number; //NUMBER;
  let v_gw_DSC: number; //NUMBER;
  let v_gw_DSG: number; //NUMBER;
  let v_gw_GVO: number; //NUMBER;
  let v_gw_IWS: number; //NUMBER;
  let v_gw_WDU: number; //NUMBER;
  let v_gw_WVE: number; //NUMBER;
  let v_gw_WWD: number; //NUMBER;
  let v_effective_pop_size: number; //NUMBER;
  let v_lat_deg: number; //seedlot.collection_lat_deg%TYPE;
  let v_lat_min: number; //seedlot.collection_lat_min%TYPE;
  let v_lat_sec: number; //seedlot.collection_lat_sec%TYPE;
  let v_long_deg: number; //seedlot.collection_long_deg%TYPE;
  let v_long_min: number; //seedlot.collection_long_min%TYPE;
  let v_long_sec: number; //seedlot.collection_long_sec%TYPE;
  let v_elev: number; //seedlot.collection_elevation%TYPE;
  let v_elev_min: number; //seedlot.collection_elevation%TYPE;
  let v_elev_max: number; //seedlot.collection_elevation%TYPE;
  let v_smp_mean_bv_AD: number; //seedlot_parent_tree_smp_mix.smp_mix_value%TYPE;
  let v_smp_mean_bv_DFS: number; //seedlot_parent_tree_smp_mix.smp_mix_value%TYPE;
  let v_smp_mean_bv_DFU: number; //seedlot_parent_tree_smp_mix.smp_mix_value%TYPE;
  let v_smp_mean_bv_DFW: number; //seedlot_parent_tree_smp_mix.smp_mix_value%TYPE;
  let v_smp_mean_bv_DSB: number; //seedlot_parent_tree_smp_mix.smp_mix_value%TYPE;
  let v_smp_mean_bv_DSC: number; //seedlot_parent_tree_smp_mix.smp_mix_value%TYPE;
  let v_smp_mean_bv_DSG: number; //seedlot_parent_tree_smp_mix.smp_mix_value%TYPE;
  let v_smp_mean_bv_GVO: number; //seedlot_parent_tree_smp_mix.smp_mix_value%TYPE;
  let v_smp_mean_bv_IWS: number; //seedlot_parent_tree_smp_mix.smp_mix_value%TYPE;
  let v_smp_mean_bv_WDU: number; //seedlot_parent_tree_smp_mix.smp_mix_value%TYPE;
  let v_smp_mean_bv_WVE: number; //seedlot_parent_tree_smp_mix.smp_mix_value%TYPE;
  let v_smp_mean_bv_WWD: number; //seedlot_parent_tree_smp_mix.smp_mix_value%TYPE;
  let v_smp_success_pct: number; //seedlot.smp_success_pct%TYPE;
  let v_orchard_contamination_pct: number; //seedlot.orchard_contamination_pct%TYPE;
  let v_pt_elevation: number; //seedlot.collection_elevation%TYPE;
  let v_pt_latitude_degrees: number; //seedlot.collection_lat_deg%TYPE;
  let v_pt_latitude_minutes: number; //seedlot.collection_lat_min%TYPE;
  let v_pt_latitude_seconds: number; //seedlot.collection_lat_sec%TYPE;
  let v_pt_longitude_degrees: number; //seedlot.collection_long_deg%TYPE;
  let v_pt_longitude_minutes: number; //seedlot.collection_long_min%TYPE;
  let v_pt_longitude_seconds: number; //seedlot.collection_long_sec%TYPE;
  let v_total_cone_count: number; //NUMBER = 0;
  let v_total_pollen_count: number; //NUMBER = 0;
  // --Values used in calculating averages
  let v_total_smp_mix_bv_AD: number; //NUMBER = 0;
  let v_num_smp_mix_bv_AD: number; //NUMBER(5) = 0;
  let v_avg_smp_mix_bv_AD: number; //NUMBER;
  let v_total_smp_mix_bv_DFS: number; //NUMBER = 0;
  let v_num_smp_mix_bv_DFS: number; //NUMBER(5) = 0;
  let v_avg_smp_mix_bv_DFS: number; //NUMBER;
  let v_total_smp_mix_bv_DFU: number; //NUMBER = 0;
  let v_num_smp_mix_bv_DFU: number; //NUMBER(5) = 0;
  let v_avg_smp_mix_bv_DFU: number; //NUMBER;
  let v_total_smp_mix_bv_DFW: number; //NUMBER = 0;
  let v_num_smp_mix_bv_DFW: number; //NUMBER(5) = 0;
  let v_avg_smp_mix_bv_DFW: number; //NUMBER;
  let v_total_smp_mix_bv_DSB: number; //NUMBER = 0;
  let v_num_smp_mix_bv_DSB: number; //NUMBER(5) = 0;
  let v_avg_smp_mix_bv_DSB: number; //NUMBER;
  let v_total_smp_mix_bv_DSC: number; //NUMBER = 0;
  let v_num_smp_mix_bv_DSC: number; //NUMBER(5) = 0;
  let v_avg_smp_mix_bv_DSC: number; //NUMBER;
  let v_total_smp_mix_bv_DSG: number; //NUMBER = 0;
  let v_num_smp_mix_bv_DSG: number; //NUMBER(5) = 0;
  let v_avg_smp_mix_bv_DSG: number; //NUMBER;
  let v_total_smp_mix_bv_GVO: number; //NUMBER = 0;
  let v_num_smp_mix_bv_GVO: number; //NUMBER(5) = 0;
  let v_avg_smp_mix_bv_GVO: number; //NUMBER;
  let v_total_smp_mix_bv_IWS: number; //NUMBER = 0;
  let v_num_smp_mix_bv_IWS: number; //NUMBER(5) = 0;
  let v_avg_smp_mix_bv_IWS: number; //NUMBER;
  let v_total_smp_mix_bv_WDU: number; //NUMBER = 0;
  let v_num_smp_mix_bv_WDU: number; //NUMBER(5) = 0;
  let v_avg_smp_mix_bv_WDU: number; //NUMBER;
  let v_total_smp_mix_bv_WVE: number; //NUMBER = 0;
  let v_num_smp_mix_bv_WVE: number; //NUMBER(5) = 0;
  let v_avg_smp_mix_bv_WVE: number; //NUMBER;
  let v_total_smp_mix_bv_WWD: number; //NUMBER = 0;
  let v_num_smp_mix_bv_WWD: number; // NUMBER(5) = 0;
  let v_avg_smp_mix_bv_WWD: number; // NUMBER;
  let v_total_non_orchard_pollen: number; //NUMBER = 0;
  let v_num_non_orchard_pollen: number; //NUMBER(5) = 0;
  let v_avg_non_orchard_pollen: number; //NUMBER;
  // --Values pulled from the array
  let v_a_cone_count: number; //NUMBER;
  let v_a_pollen_count: number; //NUMBER;
  let v_a_smp_success_pct: number; //NUMBER;
  let v_a_smp_mix_bv_AD: number; //NUMBER;
  let v_a_smp_mix_bv_DFS: number; //NUMBER;
  let v_a_smp_mix_bv_DFU: number; //NUMBER;
  let v_a_smp_mix_bv_DFW: number; //NUMBER;
  let v_a_smp_mix_bv_DSB: number; //NUMBER;
  let v_a_smp_mix_bv_DSC: number; //NUMBER;
  let v_a_smp_mix_bv_DSG: number; //NUMBER;
  let v_a_smp_mix_bv_GVO: number; //NUMBER;
  let v_a_smp_mix_bv_IWS: number; //NUMBER;
  let v_a_smp_mix_bv_WDU: number; //NUMBER;
  let v_a_smp_mix_bv_WVE: number; //NUMBER;
  let v_a_smp_mix_bv_WWD: number; //NUMBER;
  let v_a_smp_mix_latitude_degrees: number; //NUMBER;
  let v_a_smp_mix_latitude_minutes: number; //NUMBER;
  let v_a_smp_mix_longitude_degrees: number; //NUMBER;
  let v_a_smp_mix_longitude_minutes: number; //NUMBER;
  let v_a_smp_mix_elevation: number; //NUMBER;
  let v_a_non_orchard_pollen_contam: number; //NUMBER;
  // -- replace smp mix if (latest bv calculated.
  let v_smp_records_exist: boolean; //BOOLEAN;
  let v_old_smp_mix_bv_AD: number; //NUMBER;
  let v_old_smp_mix_bv_DFS: number; //NUMBER;
  let v_old_smp_mix_bv_DFU: number; //NUMBER;
  let v_old_smp_mix_bv_DFW: number; //NUMBER;
  let v_old_smp_mix_bv_DSB: number; //NUMBER;
  let v_old_smp_mix_bv_DSC: number; //NUMBER;
  let v_old_smp_mix_bv_DSG: number; //NUMBER;
  let v_old_smp_mix_bv_GVO: number; //NUMBER;
  let v_old_smp_mix_bv_IWS: number; //NUMBER;
  let v_old_smp_mix_bv_WDU: number; //NUMBER;
  let v_old_smp_mix_bv_WVE: number; //NUMBER;
  let v_old_smp_mix_bv_WWD: number; //NUMBER;
  let v_old_smp_mix_lat_deg: number; //NUMBER;
  let v_old_smp_mix_lat_min: number; //NUMBER;
  let v_old_smp_mix_long_deg: number; //NUMBER;
  let v_old_smp_mix_long_min: number; //NUMBER;
  let v_old_smp_mix_elevation: number; //NUMBER;
  let v_new_smp_mix_bv_AD: number; //NUMBER;
  let v_new_smp_mix_bv_DFS: number; //NUMBER;
  let v_new_smp_mix_bv_DFU: number; //NUMBER;
  let v_new_smp_mix_bv_DFW: number; //NUMBER;
  let v_new_smp_mix_bv_DSB: number; //NUMBER;
  let v_new_smp_mix_bv_DSC: number; //NUMBER;
  let v_new_smp_mix_bv_DSG: number; //NUMBER;
  let v_new_smp_mix_bv_GVO: number; //NUMBER;
  let v_new_smp_mix_bv_IWS: number; //NUMBER;
  let v_new_smp_mix_bv_WDU: number; //NUMBER;
  let v_new_smp_mix_bv_WVE: number; //NUMBER;
  let v_new_smp_mix_bv_WWD: number; //NUMBER;
  let v_new_smp_mix_lat_deg: number; //NUMBER;
  let v_new_smp_mix_lat_min: number; //NUMBER;
  let v_new_smp_mix_long_deg: number; //NUMBER;
  let v_new_smp_mix_long_min: number; //NUMBER;
  let v_new_smp_mix_elevation: number; //NUMBER;
  let b_bv_AD_not_estimated: boolean = false;
  let b_bv_DFS_not_estimated: boolean = false;
  let b_bv_DFU_not_estimated: boolean = false;
  let b_bv_DFW_not_estimated: boolean = false;
  let b_bv_DSB_not_estimated: boolean = false;
  let b_bv_DSC_not_estimated: boolean = false;
  let b_bv_DSG_not_estimated: boolean = false;
  let b_bv_GVO_not_estimated: boolean = false;
  let b_bv_IWS_not_estimated: boolean = false;
  let b_bv_WDU_not_estimated: boolean = false;
  let b_bv_WVE_not_estimated: boolean = false;
  let b_bv_WWD_not_estimated: boolean = false;
      
  // --Get current GQ values if (required && load array from saved data if (not passed
  load_array(p_pt,p_get_current_tests);
  // --Contam pollen bv used in calc - use set value if (it has been set, otherwise
  // --use the previous value...in either case, convert null to 0 as Excel would
  if (gb_contaminant_pollen_bv == 'Y') {
    v_contaminant_pollen_bv = g_contaminant_pollen_bv == null? 0 : g_contaminant_pollen_bv;
  } else {
    v_contaminant_pollen_bv = r_previous.contaminant_pollen_bv == null? 0 : r_previous.contaminant_pollen_bv;
  }
  // --SMP Parents Outside used in calc - use set value if (it has been set, otherwise
  // --use the previous value...in either case, convert null to 0 as Excel would
  if (gb_smp_parents_outside == 'Y') {
    v_smp_parents_outside = g_smp_parents_outside == null? 0 : g_smp_parents_outside;
  } else {
    v_smp_parents_outside = r_previous.smp_parents_outside == null? 0 : r_previous.smp_parents_outside;
  }
  
  // --First pass to calculate simple sums used in row-based calcs and to check if (all bv d/r/m are estimated.
  for (let i in p_pt.COUNT) {
    v_total_cone_count = v_total_cone_count + (p_pt[i].cone_count == null? 0 : p_pt[i].cone_count);
    v_total_pollen_count = v_total_pollen_count + (p_pt[i].pollen_count == null ? 0 : p_pt[i].pollen_count);
    if (p_pt[i].AD_ESTIMATED_IND != 'Y' && (p_pt[i].CONE_COUNT != null || p_pt[i].POLLEN_COUNT != null)) {
      b_bv_AD_not_estimated = true;      
    }
    if (p_pt[i].DFS_ESTIMATED_IND != 'Y' && (p_pt[i].CONE_COUNT != null || p_pt[i].POLLEN_COUNT != null)) {
      b_bv_DFS_not_estimated = true;      
    }
    if (p_pt[i].DFU_ESTIMATED_IND != 'Y' && (p_pt[i].CONE_COUNT != null || p_pt[i].POLLEN_COUNT != null)) {
      b_bv_DFU_not_estimated = true;
    }
    if (p_pt[i].DFW_ESTIMATED_IND != 'Y' && (p_pt[i].CONE_COUNT != null || p_pt[i].POLLEN_COUNT != null)) {
      b_bv_DFW_not_estimated = true;
    }
    if (p_pt[i].DSB_ESTIMATED_IND != 'Y' && (p_pt[i].CONE_COUNT != null || p_pt[i].POLLEN_COUNT != null)) {
      b_bv_DSB_not_estimated = true;      
    }
    if (p_pt[i].DSC_ESTIMATED_IND != 'Y' && (p_pt[i].CONE_COUNT != null || p_pt[i].POLLEN_COUNT != null)) {
      b_bv_DSC_not_estimated = true;      
    }
    if (p_pt[i].DSG_ESTIMATED_IND != 'Y' && (p_pt[i].CONE_COUNT != null || p_pt[i].POLLEN_COUNT != null)) {
      b_bv_DSG_not_estimated = true;
    }
    if (p_pt[i].GVO_ESTIMATED_IND != 'Y' && (p_pt[i].CONE_COUNT != null || p_pt[i].POLLEN_COUNT != null)) {
      b_bv_GVO_not_estimated = true;   
    }
    if (p_pt[i].IWS_ESTIMATED_IND != 'Y' && (p_pt[i].CONE_COUNT != null || p_pt[i].POLLEN_COUNT != null)) {
      b_bv_IWS_not_estimated = true;
    }
    if (p_pt[i].WDU_ESTIMATED_IND != 'Y' && (p_pt[i].CONE_COUNT != null || p_pt[i].POLLEN_COUNT != null)) {
      b_bv_WDU_not_estimated = true;  
    }
    if (p_pt[i].WVE_ESTIMATED_IND != 'Y' && (p_pt[i].CONE_COUNT != null || p_pt[i].POLLEN_COUNT != null)) {
      b_bv_WVE_not_estimated = true;     
    }
    if (p_pt[i].WWD_ESTIMATED_IND != 'Y' && (p_pt[i].CONE_COUNT != null || p_pt[i].POLLEN_COUNT != null)) {
      b_bv_WWD_not_estimated = true;      
    }
  }
  
  // --Second pass to calculate total male gw contribution orchard pollen (uses v_total_pollen_count from first pass)
  for (let i in p_pt.COUNT) {
    // --col:W
    if (v_total_pollen_count = 0) {
      v_parent_prop_orch_poll = 0;
    } else {
      v_parent_prop_orch_poll = (p_pt[i].pollen_count == null? 0 : p_pt[i].pollen_count) / v_total_pollen_count;
    }
    // --col:X
    v_m_gw_AD_contrib_orch_poll  = v_parent_prop_orch_poll * (p_pt[i].bv_AD, p_pt[i].cv_AD  == null? 0 : p_pt[i].bv_AD, p_pt[i].cv_AD );
    v_m_gw_DFS_contrib_orch_poll = v_parent_prop_orch_poll * (p_pt[i].bv_DFS,p_pt[i].cv_DFS == null? 0 : p_pt[i].bv_DFS,p_pt[i].cv_DFS);
    v_m_gw_DFU_contrib_orch_poll = v_parent_prop_orch_poll * (p_pt[i].bv_DFU,p_pt[i].cv_DFU == null? 0 : p_pt[i].bv_DFU,p_pt[i].cv_DFU);
    v_m_gw_DFW_contrib_orch_poll = v_parent_prop_orch_poll * (p_pt[i].bv_DFW,p_pt[i].cv_DFW == null? 0 : p_pt[i].bv_DFW,p_pt[i].cv_DFW);
    v_m_gw_DSB_contrib_orch_poll = v_parent_prop_orch_poll * (p_pt[i].bv_DSB,p_pt[i].cv_DSB == null? 0 : p_pt[i].bv_DSB,p_pt[i].cv_DSB);
    v_m_gw_DSC_contrib_orch_poll = v_parent_prop_orch_poll * (p_pt[i].bv_DSC,p_pt[i].cv_DSC == null? 0 : p_pt[i].bv_DSC,p_pt[i].cv_DSC);
    v_m_gw_DSG_contrib_orch_poll = v_parent_prop_orch_poll * (p_pt[i].bv_DSG,p_pt[i].cv_DSG == null? 0 : p_pt[i].bv_DSG,p_pt[i].cv_DSG);
    v_m_gw_GVO_contrib_orch_poll = v_parent_prop_orch_poll * (p_pt[i].bv_GVO,p_pt[i].cv_GVO == null? 0 : p_pt[i].bv_GVO,p_pt[i].cv_GVO);
    v_m_gw_IWS_contrib_orch_poll = v_parent_prop_orch_poll * (p_pt[i].bv_IWS,p_pt[i].cv_IWS == null? 0 : p_pt[i].bv_IWS,p_pt[i].cv_IWS);
    v_m_gw_WDU_contrib_orch_poll = v_parent_prop_orch_poll * (p_pt[i].bv_WDU,p_pt[i].cv_WDU == null? 0 : p_pt[i].bv_WDU,p_pt[i].cv_WDU);
    v_m_gw_WVE_contrib_orch_poll = v_parent_prop_orch_poll * (p_pt[i].bv_WVE,p_pt[i].cv_WVE == null? 0 : p_pt[i].bv_WVE,p_pt[i].cv_WVE);
    v_m_gw_WWD_contrib_orch_poll = v_parent_prop_orch_poll * (p_pt[i].bv_WWD,p_pt[i].cv_WWD == null? 0 : p_pt[i].bv_WWD,p_pt[i].cv_WWD);
    // --accumulate total SUM(x)
    v_sum_m_gw_AD_contb_orch_poll  = v_sum_m_gw_AD_contb_orch_poll  + v_m_gw_AD_contrib_orch_poll;
    v_sum_m_gw_DFS_contb_orch_poll = v_sum_m_gw_DFS_contb_orch_poll + v_m_gw_DFS_contrib_orch_poll;
    v_sum_m_gw_DFU_contb_orch_poll = v_sum_m_gw_DFU_contb_orch_poll + v_m_gw_DFU_contrib_orch_poll;
    v_sum_m_gw_DFW_contb_orch_poll = v_sum_m_gw_DFW_contb_orch_poll + v_m_gw_DFW_contrib_orch_poll;
    v_sum_m_gw_DSB_contb_orch_poll = v_sum_m_gw_DSB_contb_orch_poll + v_m_gw_DSB_contrib_orch_poll;
    v_sum_m_gw_DSC_contb_orch_poll = v_sum_m_gw_DSC_contb_orch_poll + v_m_gw_DSC_contrib_orch_poll;
    v_sum_m_gw_DSG_contb_orch_poll = v_sum_m_gw_DSG_contb_orch_poll + v_m_gw_DSG_contrib_orch_poll;
    v_sum_m_gw_GVO_contb_orch_poll = v_sum_m_gw_GVO_contb_orch_poll + v_m_gw_GVO_contrib_orch_poll;
    v_sum_m_gw_IWS_contb_orch_poll = v_sum_m_gw_IWS_contb_orch_poll + v_m_gw_IWS_contrib_orch_poll;
    v_sum_m_gw_WDU_contb_orch_poll = v_sum_m_gw_WDU_contb_orch_poll + v_m_gw_WDU_contrib_orch_poll;
    v_sum_m_gw_WVE_contb_orch_poll = v_sum_m_gw_WVE_contb_orch_poll + v_m_gw_WVE_contrib_orch_poll;
    v_sum_m_gw_WWD_contb_orch_poll = v_sum_m_gw_WWD_contb_orch_poll + v_m_gw_WWD_contrib_orch_poll;
  }

  // -- recalculate the smp mix values (only if (smp records exist for seedlot).
  v_smp_records_exist = spr_001a_smp_calculation.smp_records_exist(get_seedlot_number);
  if (v_smp_records_exist) {
    spr_001a_smp_calculation.recalculate(get_seedlot_number,get_seedlot_status_code,
        get_vegetation_code, get_orchard_id, get_secondary_orchard_id, get_seed_plan_unit_id,'N','N',
        v_smp_parents_outside, v_old_smp_mix_bv_AD, v_old_smp_mix_bv_DFS, v_old_smp_mix_bv_DFU,
        v_old_smp_mix_bv_DFW, v_old_smp_mix_bv_DSB, v_old_smp_mix_bv_DSC, v_old_smp_mix_bv_DSG,
        v_old_smp_mix_bv_GVO, v_old_smp_mix_bv_IWS, v_old_smp_mix_bv_WDU, v_old_smp_mix_bv_WVE,
        v_old_smp_mix_bv_WWD, v_old_smp_mix_elevation, v_old_smp_mix_lat_deg, v_old_smp_mix_lat_min,
        v_old_smp_mix_long_deg, v_old_smp_mix_long_min, g_error_message);
    
    if (p_get_current_tests) {
      spr_001a_smp_calculation.recalculate(get_seedlot_number, get_seedlot_status_code, 
          get_vegetation_code, get_orchard_id, get_secondary_orchard_id, get_seed_plan_unit_id,'Y',
          'N', v_smp_parents_outside, v_new_smp_mix_bv_AD, v_new_smp_mix_bv_DFS,
          v_new_smp_mix_bv_DFU, v_new_smp_mix_bv_DFW, v_new_smp_mix_bv_DSB, v_new_smp_mix_bv_DSC,
          v_new_smp_mix_bv_DSG, v_new_smp_mix_bv_GVO, v_new_smp_mix_bv_IWS, v_new_smp_mix_bv_WDU,
          v_new_smp_mix_bv_WVE, v_new_smp_mix_bv_WWD, v_new_smp_mix_elevation, v_new_smp_mix_lat_deg,
          v_new_smp_mix_lat_min, v_new_smp_mix_long_deg, v_new_smp_mix_long_min, g_error_message);
    }
    g_smp_parents_outside = v_smp_parents_outside == null? 0 : v_smp_parents_outside;
  }
  
  // --Third pass to calc values that depend on totals derived above && the remainder
  for (let i in p_pt.COUNT) {
    // --ignore rows without cone or pollen count
    if (p_pt[i].cone_count != null || p_pt[i].pollen_count != null) {
      v_total_parent_trees = v_total_parent_trees + 1;
      // -- replace smp mix values, if changed.
      if (p_get_current_tests) {
        if ((p_pt[i].smp_mix_bv_AD  == null? 0 : p_pt[i].smp_mix_bv_AD ) == v_old_smp_mix_bv_AD  &&
            (p_pt[i].smp_mix_bv_DFS == null? 0 : p_pt[i].smp_mix_bv_DFS) == v_old_smp_mix_bv_DFS &&
            (p_pt[i].smp_mix_bv_DFU == null? 0 : p_pt[i].smp_mix_bv_DFU) == v_old_smp_mix_bv_DFU &&
            (p_pt[i].smp_mix_bv_DFW == null? 0 : p_pt[i].smp_mix_bv_DFW) == v_old_smp_mix_bv_DFW &&
            (p_pt[i].smp_mix_bv_DSB == null? 0 : p_pt[i].smp_mix_bv_DSB) == v_old_smp_mix_bv_DSB &&
            (p_pt[i].smp_mix_bv_DSC == null? 0 : p_pt[i].smp_mix_bv_DSC) == v_old_smp_mix_bv_DSC &&
            (p_pt[i].smp_mix_bv_DSG == null? 0 : p_pt[i].smp_mix_bv_DSG) == v_old_smp_mix_bv_DSG &&
            (p_pt[i].smp_mix_bv_GVO == null? 0 : p_pt[i].smp_mix_bv_GVO) == v_old_smp_mix_bv_GVO &&
            (p_pt[i].smp_mix_bv_IWS == null? 0 : p_pt[i].smp_mix_bv_IWS) == v_old_smp_mix_bv_IWS &&
            (p_pt[i].smp_mix_bv_WDU == null? 0 : p_pt[i].smp_mix_bv_WDU) == v_old_smp_mix_bv_WDU &&
            (p_pt[i].smp_mix_bv_WVE == null? 0 : p_pt[i].smp_mix_bv_WVE) == v_old_smp_mix_bv_WVE &&
            (p_pt[i].smp_mix_bv_WWD == null? 0 : p_pt[i].smp_mix_bv_WWD) == v_old_smp_mix_bv_WWD &&
            (p_pt[i].smp_mix_elevation == null? 0 : p_pt[i].smp_mix_elevation) == v_old_smp_mix_elevation &&
            (p_pt[i].smp_mix_latitude_degrees == null? 0 : p_pt[i].smp_mix_latitude_degrees) == v_old_smp_mix_lat_deg &&
            (p_pt[i].smp_mix_latitude_minutes == null? 0 : p_pt[i].smp_mix_latitude_minutes) == v_old_smp_mix_lat_min &&
            (p_pt[i].smp_mix_longitude_degrees == null? 0 : p_pt[i].smp_mix_longitude_degrees) == v_old_smp_mix_long_deg &&
            (p_pt[i].smp_mix_longitude_minutes == null? 0 : p_pt[i].smp_mix_longitude_minutes) == v_old_smp_mix_long_min) {

          p_pt[i].smp_mix_bv_AD  = v_new_smp_mix_bv_AD;
          p_pt[i].smp_mix_bv_DFS = v_new_smp_mix_bv_DFS;
          p_pt[i].smp_mix_bv_DFU = v_new_smp_mix_bv_DFU;
          p_pt[i].smp_mix_bv_DFW = v_new_smp_mix_bv_DFW;
          p_pt[i].smp_mix_bv_DSB = v_new_smp_mix_bv_DSB;
          p_pt[i].smp_mix_bv_DSC = v_new_smp_mix_bv_DSC;
          p_pt[i].smp_mix_bv_DSG = v_new_smp_mix_bv_DSG;
          p_pt[i].smp_mix_bv_GVO = v_new_smp_mix_bv_GVO;
          p_pt[i].smp_mix_bv_IWS = v_new_smp_mix_bv_IWS;
          p_pt[i].smp_mix_bv_WDU = v_new_smp_mix_bv_WDU;
          p_pt[i].smp_mix_bv_WVE = v_new_smp_mix_bv_WVE;
          p_pt[i].smp_mix_bv_WWD = v_new_smp_mix_bv_WWD;
          p_pt[i].smp_mix_elevation = v_new_smp_mix_elevation;
          p_pt[i].smp_mix_latitude_degrees = v_new_smp_mix_lat_deg;
          p_pt[i].smp_mix_latitude_minutes = v_new_smp_mix_lat_min;
          p_pt[i].smp_mix_longitude_degrees = v_new_smp_mix_long_deg;
          p_pt[i].smp_mix_longitude_minutes = v_new_smp_mix_long_min;
        }
      }
      // --Convert null array values to 0 as Excel does
      v_a_cone_count = p_pt[i].cone_count   == null? 0 : p_pt[i].cone_count;
      v_a_pollen_count = p_pt[i].pollen_count == null? 0 : p_pt[i].pollen_count;
      v_a_smp_success_pct = p_pt[i].smp_success_pct == null? 0 : p_pt[i].smp_success_pct;
      v_a_smp_mix_bv_AD = p_pt[i].smp_mix_bv_AD == null? 0 : p_pt[i].smp_mix_bv_AD;
      v_a_smp_mix_bv_DFS = p_pt[i].smp_mix_bv_DFS == null? 0 : p_pt[i].smp_mix_bv_DFS;
      v_a_smp_mix_bv_DFU = p_pt[i].smp_mix_bv_DFU == null? 0 : p_pt[i].smp_mix_bv_DFU;
      v_a_smp_mix_bv_DFW = p_pt[i].smp_mix_bv_DFW == null? 0 : p_pt[i].smp_mix_bv_DFW;
      v_a_smp_mix_bv_DSB = p_pt[i].smp_mix_bv_DSB == null? 0 : p_pt[i].smp_mix_bv_DSB;
      v_a_smp_mix_bv_DSC = p_pt[i].smp_mix_bv_DSC == null? 0 : p_pt[i].smp_mix_bv_DSC;
      v_a_smp_mix_bv_DSG = p_pt[i].smp_mix_bv_DSG == null? 0 : p_pt[i].smp_mix_bv_DSG;
      v_a_smp_mix_bv_GVO = p_pt[i].smp_mix_bv_GVO == null? 0 : p_pt[i].smp_mix_bv_GVO;
      v_a_smp_mix_bv_IWS = p_pt[i].smp_mix_bv_IWS == null? 0 : p_pt[i].smp_mix_bv_IWS;
      v_a_smp_mix_bv_WDU = p_pt[i].smp_mix_bv_WDU == null? 0 : p_pt[i].smp_mix_bv_WDU;
      v_a_smp_mix_bv_WVE = p_pt[i].smp_mix_bv_WVE == null? 0 : p_pt[i].smp_mix_bv_WVE;
      v_a_smp_mix_bv_WWD = p_pt[i].smp_mix_bv_WWD == null? 0 : p_pt[i].smp_mix_bv_WWD;
      v_a_smp_mix_latitude_degrees = p_pt[i].smp_mix_latitude_degrees == null? 0 : p_pt[i].smp_mix_latitude_degrees;
      v_a_smp_mix_latitude_minutes = p_pt[i].smp_mix_latitude_minutes == null? 0 : p_pt[i].smp_mix_latitude_minutes;
      v_a_smp_mix_longitude_degrees = p_pt[i].smp_mix_longitude_degrees == null? 0 : p_pt[i].smp_mix_longitude_degrees;
      v_a_smp_mix_longitude_minutes = p_pt[i].smp_mix_longitude_minutes == null? 0 : p_pt[i].smp_mix_longitude_minutes;
      v_a_smp_mix_elevation = p_pt[i].smp_mix_elevation == null? 0 : p_pt[i].smp_mix_elevation;
      v_a_non_orchard_pollen_contam = p_pt[i].non_orchard_pollen_contam == null? 0 : p_pt[i].non_orchard_pollen_contam;
      // --values to calc avg smp mix bv AD (only contribute to avg if specified)
      if (p_pt[i].smp_mix_bv_AD != null) {
        v_total_smp_mix_bv_AD = v_total_smp_mix_bv_AD + v_a_smp_mix_bv_AD;
        v_num_smp_mix_bv_AD = v_num_smp_mix_bv_AD + 1;
      }
      // --values to calc avg smp mix bv DFS (only contribute to avg if specified)
      if (p_pt[i].smp_mix_bv_DFS != null) {
        v_total_smp_mix_bv_DFS = v_total_smp_mix_bv_DFS + v_a_smp_mix_bv_DFS;
        v_num_smp_mix_bv_DFS = v_num_smp_mix_bv_DFS + 1;
      }
      // --values to calc avg smp mix bv DFU (only contribute to avg if specified)
      if (p_pt[i].smp_mix_bv_DFU != null) {
        v_total_smp_mix_bv_DFU = v_total_smp_mix_bv_DFU + v_a_smp_mix_bv_DFU;
        v_num_smp_mix_bv_DFU = v_num_smp_mix_bv_DFU + 1;
      }
      // --values to calc avg smp mix bv DFW (only contribute to avg if specified)
      if (p_pt[i].smp_mix_bv_DFW != null) {
        v_total_smp_mix_bv_DFW = v_total_smp_mix_bv_DFW + v_a_smp_mix_bv_DFW;
        v_num_smp_mix_bv_DFW = v_num_smp_mix_bv_DFW + 1;
      }
      // --values to calc avg smp mix bv DSB (only contribute to avg if specified)
      if (p_pt[i].smp_mix_bv_DSB != null) {
        v_total_smp_mix_bv_DSB = v_total_smp_mix_bv_DSB + v_a_smp_mix_bv_DSB;
        v_num_smp_mix_bv_DSB = v_num_smp_mix_bv_DSB + 1;
      }
      // --values to calc avg smp mix bv DSC (only contribute to avg if specified)
      if (p_pt[i].smp_mix_bv_DSC != null) {
        v_total_smp_mix_bv_DSC = v_total_smp_mix_bv_DSC + v_a_smp_mix_bv_DSC;
        v_num_smp_mix_bv_DSC = v_num_smp_mix_bv_DSC + 1;
      }
      // --values to calc avg smp mix bv DSG (only contribute to avg if specified)
      if (p_pt[i].smp_mix_bv_DSG != null) {
        v_total_smp_mix_bv_DSG = v_total_smp_mix_bv_DSG + v_a_smp_mix_bv_DSG;
        v_num_smp_mix_bv_DSG = v_num_smp_mix_bv_DSG + 1;
      }
      // --values to calc avg smp mix bv GVO (only contribute to avg if specified)
      if (p_pt[i].smp_mix_bv_GVO != null) {
        v_total_smp_mix_bv_GVO = v_total_smp_mix_bv_GVO + v_a_smp_mix_bv_GVO;
        v_num_smp_mix_bv_GVO = v_num_smp_mix_bv_GVO + 1;
      }
      // --values to calc avg smp mix bv IWS (only contribute to avg if specified)
      if (p_pt[i].smp_mix_bv_IWS != null) {
        v_total_smp_mix_bv_IWS = v_total_smp_mix_bv_IWS + v_a_smp_mix_bv_IWS;
        v_num_smp_mix_bv_IWS = v_num_smp_mix_bv_IWS + 1;
      }
      // --values to calc avg smp mix bv WDU (only contribute to avg if specified)
      if (p_pt[i].smp_mix_bv_WDU != null) {
        v_total_smp_mix_bv_WDU = v_total_smp_mix_bv_WDU + v_a_smp_mix_bv_WDU;
        v_num_smp_mix_bv_WDU = v_num_smp_mix_bv_WDU + 1;
      }
      // --values to calc avg smp mix bv WVE (only contribute to avg if specified)
      if (p_pt[i].smp_mix_bv_WVE != null) {
        v_total_smp_mix_bv_WVE = v_total_smp_mix_bv_WVE + v_a_smp_mix_bv_WVE;
        v_num_smp_mix_bv_WVE = v_num_smp_mix_bv_WVE + 1;
      }
      // --values to calc avg smp mix bv WWD (only contribute to avg if specified)
      if (p_pt[i].smp_mix_bv_WWD != null) {
        v_total_smp_mix_bv_WWD = v_total_smp_mix_bv_WWD + v_a_smp_mix_bv_WWD;
        v_num_smp_mix_bv_WWD = v_num_smp_mix_bv_WWD + 1;
      }
      // --values to calc avg non-orchard pollen contamination pct (only contribute to avg if specified)
      if (p_pt[i].non_orchard_pollen_contam_pct != null) {
        v_total_non_orchard_pollen = v_total_non_orchard_pollen + v_a_non_orchard_pollen_contam;
        v_num_non_orchard_pollen = v_num_non_orchard_pollen + 1;
      }
      // --Get geography from parents if present
      spr_get_pt_geog(p_pt[i].parent_tree_id,v_pt_elevation,v_pt_latitude_degrees,v_pt_latitude_minutes,
          v_pt_latitude_seconds, v_pt_longitude_degrees, v_pt_longitude_minutes, v_pt_longitude_seconds);
      // -->Set to 0 if null as Excel would
      v_pt_elevation = NVL(v_pt_elevation,0);
      v_pt_latitude_degrees = v_pt_latitude_degrees == null? 0 : v_pt_latitude_degrees;
      v_pt_latitude_minutes = v_pt_latitude_minutes == null? 0 : v_pt_latitude_minutes;
      v_pt_latitude_seconds = v_pt_latitude_seconds == null? 0 : v_pt_latitude_seconds;
      v_pt_longitude_degrees = v_pt_longitude_degrees == null? 0 : v_pt_longitude_degrees;
      v_pt_longitude_minutes = v_pt_longitude_minutes == null? 0 : v_pt_longitude_minutes;
      v_pt_longitude_seconds = v_pt_longitude_seconds == null? 0 : v_pt_longitude_seconds;
      //--NOTE for lat/long: converting all lat/longs to seconds instead of a decimal as spreadsheet did
      // --col:E
      v_coll_lat = (v_pt_latitude_degrees*3600) + (v_pt_latitude_minutes*60) + v_pt_latitude_seconds;
      // --col:H
      v_coll_long = (v_pt_longitude_degrees*3600) + (v_pt_longitude_minutes*60) + v_pt_longitude_seconds;
      // --col:T
      v_lat = (v_a_smp_mix_latitude_degrees*3600) + (v_a_smp_mix_latitude_minutes*60);
      // --col:U
      v_long = (v_a_smp_mix_longitude_degrees*3600) + (v_a_smp_mix_longitude_minutes*60);
      // --col:V
      if (v_total_cone_count = 0) {
        v_female_crop_pop = 0;
      } else {
        v_female_crop_pop = v_a_cone_count / v_total_cone_count;
      }
      // --col:W
      if (v_total_pollen_count = 0) {
        v_parent_prop_orch_poll = 0;
      } else {
        v_parent_prop_orch_poll = v_a_pollen_count / v_total_pollen_count;
      }
      // --col:Y
      v_f_gw_AD_contrib = v_female_crop_pop * (p_pt[i].bv_AD == null ? p_pt[i].cv_AD : p_pt[i].bv_AD);
      v_f_gw_DFS_contrib = v_female_crop_pop * (p_pt[i].bv_DFS == null ? p_pt[i].cv_DFS : p_pt[i].bv_DFS);
      v_f_gw_DFU_contrib = v_female_crop_pop * (p_pt[i].bv_DFU == null ? p_pt[i].cv_DFU : p_pt[i].bv_DFU);
      v_f_gw_DFW_contrib = v_female_crop_pop * (p_pt[i].bv_DFW == null ? p_pt[i].cv_DFW : p_pt[i].bv_DFW);
      v_f_gw_DSB_contrib = v_female_crop_pop * (p_pt[i].bv_DSB == null ? p_pt[i].cv_DSB : p_pt[i].bv_DSB);
      v_f_gw_DSC_contrib = v_female_crop_pop * (p_pt[i].bv_DSC == null ? p_pt[i].cv_DSC : p_pt[i].bv_DSC);
      v_f_gw_DSG_contrib = v_female_crop_pop * (p_pt[i].bv_DSG == null ? p_pt[i].cv_DSG : p_pt[i].bv_DSG);
      v_f_gw_GVO_contrib = v_female_crop_pop * (p_pt[i].bv_GVO == null ? p_pt[i].cv_GVO : p_pt[i].bv_GVO);
      v_f_gw_IWS_contrib = v_female_crop_pop * (p_pt[i].bv_IWS == null ? p_pt[i].cv_IWS : p_pt[i].bv_IWS);
      v_f_gw_WDU_contrib = v_female_crop_pop * (p_pt[i].bv_WDU == null ? p_pt[i].cv_WDU : p_pt[i].bv_WDU);
      v_f_gw_WVE_contrib = v_female_crop_pop * (p_pt[i].bv_WVE == null ? p_pt[i].cv_WVE : p_pt[i].bv_WVE);
      v_f_gw_WWD_contrib = v_female_crop_pop * (p_pt[i].bv_WWD == null ? p_pt[i].cv_WWD : p_pt[i].bv_WWD);
      // --col:Z
      v_m_smp_AD_contrib  = ( (v_a_smp_success_pct * v_a_smp_mix_bv_AD) / 100 ) * v_female_crop_pop;
      v_m_smp_DFS_contrib = ( (v_a_smp_success_pct * v_a_smp_mix_bv_DFS) / 100 ) * v_female_crop_pop;
      v_m_smp_DFU_contrib = ( (v_a_smp_success_pct * v_a_smp_mix_bv_DFU) / 100 ) * v_female_crop_pop;
      v_m_smp_DFW_contrib = ( (v_a_smp_success_pct * v_a_smp_mix_bv_DFW) / 100 ) * v_female_crop_pop;
      v_m_smp_DSB_contrib = ( (v_a_smp_success_pct * v_a_smp_mix_bv_DSB) / 100 ) * v_female_crop_pop;
      v_m_smp_DSC_contrib = ( (v_a_smp_success_pct * v_a_smp_mix_bv_DSC) / 100 ) * v_female_crop_pop;
      v_m_smp_DSG_contrib = ( (v_a_smp_success_pct * v_a_smp_mix_bv_DSG) / 100 ) * v_female_crop_pop;
      v_m_smp_GVO_contrib = ( (v_a_smp_success_pct * v_a_smp_mix_bv_GVO) / 100 ) * v_female_crop_pop;
      v_m_smp_IWS_contrib = ( (v_a_smp_success_pct * v_a_smp_mix_bv_IWS) / 100 ) * v_female_crop_pop;
      v_m_smp_WDU_contrib = ( (v_a_smp_success_pct * v_a_smp_mix_bv_WDU) / 100 ) * v_female_crop_pop;
      v_m_smp_WVE_contrib = ( (v_a_smp_success_pct * v_a_smp_mix_bv_WVE) / 100 ) * v_female_crop_pop;
      v_m_smp_WWD_contrib = ( (v_a_smp_success_pct * v_a_smp_mix_bv_WWD) / 100 ) * v_female_crop_pop;
      // --col:AA
      v_m_contam_contrib = ( (1 - (v_a_smp_success_pct/100)) * (v_a_non_orchard_pollen_contam/100) * v_contaminant_pollen_bv ) * v_female_crop_pop;
      // --col:AB   (depends on SUM(X)=v_sum_m_gw_contrib_orch_poll)
      v_m_orch_poll_contrib_AD  = ( ( 1 - (v_a_smp_success_pct/100) - (v_a_non_orchard_pollen_contam/100) ) * v_sum_m_gw_AD_contb_orch_poll ) * v_female_crop_pop;
      v_m_orch_poll_contrib_DFS = ( ( 1 - (v_a_smp_success_pct/100) - (v_a_non_orchard_pollen_contam/100) ) * v_sum_m_gw_DFS_contb_orch_poll ) * v_female_crop_pop;
      v_m_orch_poll_contrib_DFU = ( ( 1 - (v_a_smp_success_pct/100) - (v_a_non_orchard_pollen_contam/100) ) * v_sum_m_gw_DFU_contb_orch_poll ) * v_female_crop_pop;
      v_m_orch_poll_contrib_DFW = ( ( 1 - (v_a_smp_success_pct/100) - (v_a_non_orchard_pollen_contam/100) ) * v_sum_m_gw_DFW_contb_orch_poll ) * v_female_crop_pop;
      v_m_orch_poll_contrib_DSB = ( ( 1 - (v_a_smp_success_pct/100) - (v_a_non_orchard_pollen_contam/100) ) * v_sum_m_gw_DSB_contb_orch_poll ) * v_female_crop_pop;
      v_m_orch_poll_contrib_DSC = ( ( 1 - (v_a_smp_success_pct/100) - (v_a_non_orchard_pollen_contam/100) ) * v_sum_m_gw_DSC_contb_orch_poll ) * v_female_crop_pop;
      v_m_orch_poll_contrib_DSG = ( ( 1 - (v_a_smp_success_pct/100) - (v_a_non_orchard_pollen_contam/100) ) * v_sum_m_gw_DSG_contb_orch_poll ) * v_female_crop_pop;
      v_m_orch_poll_contrib_GVO = ( ( 1 - (v_a_smp_success_pct/100) - (v_a_non_orchard_pollen_contam/100) ) * v_sum_m_gw_GVO_contb_orch_poll ) * v_female_crop_pop;
      v_m_orch_poll_contrib_IWS = ( ( 1 - (v_a_smp_success_pct/100) - (v_a_non_orchard_pollen_contam/100) ) * v_sum_m_gw_IWS_contb_orch_poll ) * v_female_crop_pop;
      v_m_orch_poll_contrib_WDU = ( ( 1 - (v_a_smp_success_pct/100) - (v_a_non_orchard_pollen_contam/100) ) * v_sum_m_gw_WDU_contb_orch_poll ) * v_female_crop_pop;
      v_m_orch_poll_contrib_WVE = ( ( 1 - (v_a_smp_success_pct/100) - (v_a_non_orchard_pollen_contam/100) ) * v_sum_m_gw_WVE_contb_orch_poll ) * v_female_crop_pop;
      v_m_orch_poll_contrib_WWD = ( ( 1 - (v_a_smp_success_pct/100) - (v_a_non_orchard_pollen_contam/100) ) * v_sum_m_gw_WWD_contb_orch_poll ) * v_female_crop_pop;
      // --col:AC depends on prev value
      v_m_total_gw_AD_contrib  = v_m_smp_AD_contrib  + v_m_contam_contrib + v_m_orch_poll_contrib_AD;
      v_m_total_gw_DFS_contrib = v_m_smp_DFS_contrib + v_m_contam_contrib + v_m_orch_poll_contrib_DFS;
      v_m_total_gw_DFU_contrib = v_m_smp_DFU_contrib + v_m_contam_contrib + v_m_orch_poll_contrib_DFU;
      v_m_total_gw_DFW_contrib = v_m_smp_DFW_contrib + v_m_contam_contrib + v_m_orch_poll_contrib_DFW;
      v_m_total_gw_DSB_contrib = v_m_smp_DSB_contrib + v_m_contam_contrib + v_m_orch_poll_contrib_DSB;
      v_m_total_gw_DSC_contrib = v_m_smp_DSC_contrib + v_m_contam_contrib + v_m_orch_poll_contrib_DSC;
      v_m_total_gw_DSG_contrib = v_m_smp_DSG_contrib + v_m_contam_contrib + v_m_orch_poll_contrib_DSG;
      v_m_total_gw_GVO_contrib = v_m_smp_GVO_contrib + v_m_contam_contrib + v_m_orch_poll_contrib_GVO;
      v_m_total_gw_IWS_contrib = v_m_smp_IWS_contrib + v_m_contam_contrib + v_m_orch_poll_contrib_IWS;
      v_m_total_gw_WDU_contrib = v_m_smp_WDU_contrib + v_m_contam_contrib + v_m_orch_poll_contrib_WDU;
      v_m_total_gw_WVE_contrib = v_m_smp_WVE_contrib + v_m_contam_contrib + v_m_orch_poll_contrib_WVE;
      v_m_total_gw_WWD_contrib = v_m_smp_WWD_contrib + v_m_contam_contrib + v_m_orch_poll_contrib_WWD;
      // --col:AD
      if (v_total_pollen_count = 0) {
        v_p_total_gw_AD_contrib = v_f_gw_AD_contrib;
        v_p_total_gw_DFS_contrib = v_f_gw_DFS_contrib;
        v_p_total_gw_DFU_contrib = v_f_gw_DFU_contrib;
        v_p_total_gw_DFW_contrib = v_f_gw_DFW_contrib;
        v_p_total_gw_DSB_contrib = v_f_gw_DSB_contrib;
        v_p_total_gw_DSC_contrib = v_f_gw_DSC_contrib;
        v_p_total_gw_DSG_contrib = v_f_gw_DSG_contrib;
        v_p_total_gw_GVO_contrib = v_f_gw_GVO_contrib;
        v_p_total_gw_IWS_contrib = v_f_gw_IWS_contrib;
        v_p_total_gw_WDU_contrib = v_f_gw_WDU_contrib;
        v_p_total_gw_WVE_contrib = v_f_gw_WVE_contrib;
        v_p_total_gw_WWD_contrib = v_f_gw_WWD_contrib;
      } else {
        v_p_total_gw_AD_contrib  = (v_f_gw_AD_contrib + v_m_total_gw_AD_contrib) / 2;
        v_p_total_gw_DFS_contrib = (v_f_gw_DFS_contrib + v_m_total_gw_DFS_contrib) / 2;
        v_p_total_gw_DFU_contrib = (v_f_gw_DFU_contrib + v_m_total_gw_DFU_contrib) / 2;
        v_p_total_gw_DFW_contrib = (v_f_gw_DFW_contrib + v_m_total_gw_DFW_contrib) / 2;
        v_p_total_gw_DSB_contrib = (v_f_gw_DSB_contrib + v_m_total_gw_DSB_contrib) / 2;
        v_p_total_gw_DSC_contrib = (v_f_gw_DSC_contrib + v_m_total_gw_DSC_contrib) / 2;
        v_p_total_gw_DSG_contrib = (v_f_gw_DSG_contrib + v_m_total_gw_DSG_contrib) / 2;
        v_p_total_gw_GVO_contrib = (v_f_gw_GVO_contrib + v_m_total_gw_GVO_contrib) / 2;
        v_p_total_gw_IWS_contrib = (v_f_gw_IWS_contrib + v_m_total_gw_IWS_contrib) / 2;
        v_p_total_gw_WDU_contrib = (v_f_gw_WDU_contrib + v_m_total_gw_WDU_contrib) / 2;
        v_p_total_gw_WVE_contrib = (v_f_gw_WVE_contrib + v_m_total_gw_WVE_contrib) / 2;
        v_p_total_gw_WWD_contrib = (v_f_gw_WWD_contrib + v_m_total_gw_WWD_contrib) / 2;
      }
      // --Set total gw contrib back into array so it can be displayed/saved
      p_pt[i].total_genetic_worth_contrib = v_p_total_gw_GVO_contrib;
      v_sum_p_total_gw_AD_contrib = v_sum_p_total_gw_AD_contrib   + (v_p_total_gw_AD_contrib  == null? 0 : v_p_total_gw_AD_contrib );
      v_sum_p_total_gw_DFS_contrib = v_sum_p_total_gw_DFS_contrib + (v_p_total_gw_DFS_contrib == null? 0 : v_p_total_gw_DFS_contrib);
      v_sum_p_total_gw_DFU_contrib = v_sum_p_total_gw_DFU_contrib + (v_p_total_gw_DFU_contrib == null? 0 : v_p_total_gw_DFU_contrib);
      v_sum_p_total_gw_DFW_contrib = v_sum_p_total_gw_DFW_contrib + (v_p_total_gw_DFW_contrib == null? 0 : v_p_total_gw_DFW_contrib);
      v_sum_p_total_gw_DSB_contrib = v_sum_p_total_gw_DSB_contrib + (v_p_total_gw_DSB_contrib == null? 0 : v_p_total_gw_DSB_contrib);
      v_sum_p_total_gw_DSC_contrib = v_sum_p_total_gw_DSC_contrib + (v_p_total_gw_DSC_contrib == null? 0 : v_p_total_gw_DSC_contrib);
      v_sum_p_total_gw_DSG_contrib = v_sum_p_total_gw_DSG_contrib + (v_p_total_gw_DSG_contrib == null? 0 : v_p_total_gw_DSG_contrib);
      v_sum_p_total_gw_GVO_contrib = v_sum_p_total_gw_GVO_contrib + v_p_total_gw_GVO_contrib;
      v_sum_p_total_gw_IWS_contrib = v_sum_p_total_gw_IWS_contrib + (v_p_total_gw_IWS_contrib == null? 0 : v_p_total_gw_IWS_contrib);
      v_sum_p_total_gw_WDU_contrib = v_sum_p_total_gw_WDU_contrib + (v_p_total_gw_WDU_contrib == null? 0 : v_p_total_gw_WDU_contrib);
      v_sum_p_total_gw_WVE_contrib = v_sum_p_total_gw_WVE_contrib + (v_p_total_gw_WVE_contrib == null? 0 : v_p_total_gw_WVE_contrib);
      v_sum_p_total_gw_WWD_contrib = v_sum_p_total_gw_WWD_contrib + (v_p_total_gw_WWD_contrib == null? 0 : v_p_total_gw_WWD_contrib);
      // --col:AE
      if (v_total_pollen_count = 0) {
        v_p_prop_contrib = v_female_crop_pop;
      } else {
        v_p_prop_contrib = (v_female_crop_pop + v_parent_prop_orch_poll) / 2;
      }
      v_sum_p_prop_contrib = v_sum_p_prop_contrib + v_p_prop_contrib;
      // --SUM(AE for Tested Parent Trees)
      if (p_pt[i].untested_ind != 'Y' && ((p_pt[i].AD_estimated_ind != 'Y')
                                      || (p_pt[i].DFS_estimated_ind != 'Y')
                                      || (p_pt[i].DFU_estimated_ind != 'Y')
                                      || (p_pt[i].DFW_estimated_ind != 'Y')
                                      || (p_pt[i].DSB_estimated_ind != 'Y')
                                      || (p_pt[i].DSC_estimated_ind != 'Y')
                                      || (p_pt[i].DSG_estimated_ind != 'Y')
                                      || (p_pt[i].GVO_estimated_ind != 'Y')
                                      || (p_pt[i].IWS_estimated_ind != 'Y')
                                      || (p_pt[i].WDU_estimated_ind != 'Y')
                                      || (p_pt[i].WVE_estimated_ind != 'Y')
                                      || (p_pt[i].WWD_estimated_ind != 'Y'))) {
        v_sum_p_prop_contrib_tested = v_sum_p_prop_contrib_tested + v_p_prop_contrib;
      }
      if (p_pt[i].untested_ind != 'Y' && p_pt[i].AD_estimated_ind != 'Y') {
        v_sum_p_prop_contrib_test_AD = v_sum_p_prop_contrib_test_AD + v_p_prop_contrib;
      }
      if (p_pt[i].untested_ind != 'Y' && p_pt[i].DFS_estimated_ind != 'Y') {
        v_sum_p_prop_contrib_test_DFS = v_sum_p_prop_contrib_test_DFS + v_p_prop_contrib;
      }   
      if (p_pt[i].untested_ind != 'Y' && p_pt[i].DFU_estimated_ind != 'Y') {
        v_sum_p_prop_contrib_test_DFU = v_sum_p_prop_contrib_test_DFU + v_p_prop_contrib;
      }   
      if (p_pt[i].untested_ind != 'Y' && p_pt[i].DFW_estimated_ind != 'Y' ) {
        v_sum_p_prop_contrib_test_DFW = v_sum_p_prop_contrib_test_DFW + v_p_prop_contrib;
      }   
      if (p_pt[i].untested_ind != 'Y' && p_pt[i].DSB_estimated_ind != 'Y' ) {
        v_sum_p_prop_contrib_test_DSB = v_sum_p_prop_contrib_test_DSB + v_p_prop_contrib;
      }   
      if (p_pt[i].untested_ind != 'Y' && p_pt[i].DSC_estimated_ind != 'Y' ) {
        v_sum_p_prop_contrib_test_DSC = v_sum_p_prop_contrib_test_DSC + v_p_prop_contrib;
      }   
      if (p_pt[i].untested_ind != 'Y' && p_pt[i].DSG_estimated_ind != 'Y' ) {
        v_sum_p_prop_contrib_test_DSG = v_sum_p_prop_contrib_test_DSG + v_p_prop_contrib;
      }   
      if (p_pt[i].untested_ind != 'Y' && p_pt[i].GVO_estimated_ind != 'Y' ) {
        v_sum_p_prop_contrib_test_GVO = v_sum_p_prop_contrib_test_GVO + v_p_prop_contrib;
      }   
      if (p_pt[i].untested_ind != 'Y' && p_pt[i].IWS_estimated_ind != 'Y' ) {
        v_sum_p_prop_contrib_test_IWS = v_sum_p_prop_contrib_test_IWS + v_p_prop_contrib;
      }   
      if (p_pt[i].untested_ind != 'Y' && p_pt[i].WDU_estimated_ind != 'Y' ) {
        v_sum_p_prop_contrib_test_WDU = v_sum_p_prop_contrib_test_WDU + v_p_prop_contrib;
      }   
      if (p_pt[i].untested_ind != 'Y' && p_pt[i].WVE_estimated_ind != 'Y' ) {
        v_sum_p_prop_contrib_test_WVE = v_sum_p_prop_contrib_test_WVE + v_p_prop_contrib;
      }   
      if (p_pt[i].untested_ind != 'Y' && p_pt[i].WWD_estimated_ind != 'Y' ) {
        v_sum_p_prop_contrib_test_WWD = v_sum_p_prop_contrib_test_WWD + v_p_prop_contrib;
      }                                                                                        
      // --col:AF
      v_p_contrib_elev_no_smp_poll = v_pt_elevation * (v_p_prop_contrib-((v_female_crop_pop*v_a_smp_success_pct)/200));
      // --col:AG
      v_p_contrib_lat_no_smp_poll = v_coll_lat * (v_p_prop_contrib-((v_female_crop_pop*v_a_smp_success_pct)/200));
      // --col:AH
      v_p_contrib_long_no_smp_poll = v_coll_long * (v_p_prop_contrib-((v_female_crop_pop*v_a_smp_success_pct)/200));
      // --col:AI
      v_smp_poll_wtd_contrib_elev = ((v_a_smp_mix_elevation * v_a_smp_success_pct)/200)*v_female_crop_pop;
      // --col:AJ
      v_smp_poll_wtd_contrib_lat = ((v_lat * v_a_smp_success_pct)/200)*v_female_crop_pop;
      // --col:AK
      v_smp_poll_wtd_contrib_long = ((v_long * v_a_smp_success_pct)/200)*v_female_crop_pop;
      // --col:AL
      v_wtd_elev_p_and_smp_poll = v_p_contrib_elev_no_smp_poll + v_smp_poll_wtd_contrib_elev;
      v_sum_wtd_elev_p_and_smp_poll = v_sum_wtd_elev_p_and_smp_poll + v_wtd_elev_p_and_smp_poll;
      // --col:AM
      v_wtd_lat_p_and_smp_poll = v_p_contrib_lat_no_smp_poll + v_smp_poll_wtd_contrib_lat;
      v_sum_wtd_lat_p_and_smp_poll = v_sum_wtd_lat_p_and_smp_poll + v_wtd_lat_p_and_smp_poll;
      // --col:AN
      v_wtd_long_p_and_smp_poll = v_p_contrib_long_no_smp_poll + v_smp_poll_wtd_contrib_long;
      v_sum_wtd_long_p_and_smp_poll = v_sum_wtd_long_p_and_smp_poll + v_wtd_long_p_and_smp_poll;
      // --col:AO
      v_ne_no_smp_contrib = Math.pow(v_p_prop_contrib, 2);
      v_sum_ne_no_smp_contrib = v_sum_ne_no_smp_contrib + v_ne_no_smp_contrib;
      // --col:AP (xls did /100 so left in for comparison && * 100 at end to get smp success %)
      v_smp_success_wtd_by_f_p = (v_female_crop_pop * v_a_smp_success_pct) / 100;
      v_sum_smp_success_wtd_by_f_p = v_sum_smp_success_wtd_by_f_p + v_smp_success_wtd_by_f_p;
      // --col:AQ
      v_orch_gamete_contr = Math.pow( ( v_female_crop_pop + (0.75*v_parent_prop_orch_poll) )/2,2);
      v_sum_orch_gamete_contr = v_sum_orch_gamete_contr + v_orch_gamete_contr;
    } else {
      // --Set total gw contrib back into array so it can be displayed/saved
      p_pt[i].total_genetic_worth_contrib = 0;
    }
  }

  r_pt_contrib.pct_tested_parent_trees_AD  = (v_sum_p_prop_contrib_test_AD)  * 100;
  r_pt_contrib.pct_tested_parent_trees_DFS = (v_sum_p_prop_contrib_test_DFS) * 100;
  r_pt_contrib.pct_tested_parent_trees_DFU = (v_sum_p_prop_contrib_test_DFU) * 100;
  r_pt_contrib.pct_tested_parent_trees_DFW = (v_sum_p_prop_contrib_test_DFW) * 100;
  r_pt_contrib.pct_tested_parent_trees_DSB = (v_sum_p_prop_contrib_test_DSB) * 100;
  r_pt_contrib.pct_tested_parent_trees_DSC = (v_sum_p_prop_contrib_test_DSC) * 100;
  r_pt_contrib.pct_tested_parent_trees_DSG = (v_sum_p_prop_contrib_test_DSG) * 100;
  r_pt_contrib.pct_tested_parent_trees_GVO = (v_sum_p_prop_contrib_test_GVO) * 100;
  r_pt_contrib.pct_tested_parent_trees_IWS = (v_sum_p_prop_contrib_test_IWS) * 100;
  r_pt_contrib.pct_tested_parent_trees_WDU = (v_sum_p_prop_contrib_test_WDU) * 100;
  r_pt_contrib.pct_tested_parent_trees_WVE = (v_sum_p_prop_contrib_test_WVE) * 100;
  r_pt_contrib.pct_tested_parent_trees_WWD = (v_sum_p_prop_contrib_test_WWD) * 100;
  
  // --calc avg smp mix bv AD
  if (v_num_smp_mix_bv_AD > 0) {
    v_avg_smp_mix_bv_AD = v_total_smp_mix_bv_AD / v_num_smp_mix_bv_AD;
  }
  // --calc avg smp mix bv DFS
  if (v_num_smp_mix_bv_DFS > 0) {
    v_avg_smp_mix_bv_DFS = v_total_smp_mix_bv_DFS / v_num_smp_mix_bv_DFS;
  }
  // --calc avg smp mix bv DFU
  if (v_num_smp_mix_bv_DFU > 0) {
    v_avg_smp_mix_bv_DFU = v_total_smp_mix_bv_DFU / v_num_smp_mix_bv_DFU;
  }
  // --calc avg smp mix bv DFW
  if (v_num_smp_mix_bv_DFW > 0) {
    v_avg_smp_mix_bv_DFW = v_total_smp_mix_bv_DFW / v_num_smp_mix_bv_DFW;
  }
  // --calc avg smp mix bv DSB
  if (v_num_smp_mix_bv_DSB > 0) {
    v_avg_smp_mix_bv_DSB = v_total_smp_mix_bv_DSB / v_num_smp_mix_bv_DSB;
  }
  // --calc avg smp mix bv DSC
  if (v_num_smp_mix_bv_DSC > 0) {
    v_avg_smp_mix_bv_DSC = v_total_smp_mix_bv_DSC / v_num_smp_mix_bv_DSC;
  }
  // --calc avg smp mix bv DSG
  if (v_num_smp_mix_bv_DSG > 0) {
    v_avg_smp_mix_bv_DSG = v_total_smp_mix_bv_DSG / v_num_smp_mix_bv_DSG;
  }
  // --calc avg smp mix bv GVO
  if (v_num_smp_mix_bv_GVO > 0) {
    v_avg_smp_mix_bv_GVO = v_total_smp_mix_bv_GVO / v_num_smp_mix_bv_GVO;
  }
  // --calc avg smp mix bv IWS
  if (v_num_smp_mix_bv_IWS > 0) {
    v_avg_smp_mix_bv_IWS = v_total_smp_mix_bv_IWS / v_num_smp_mix_bv_IWS;
  }
  // --calc avg smp mix bv WDU
  if (v_num_smp_mix_bv_WDU > 0) {
    v_avg_smp_mix_bv_WDU = v_total_smp_mix_bv_WDU / v_num_smp_mix_bv_WDU;
  }
  // --calc avg smp mix bv WVE
  if (v_num_smp_mix_bv_WVE > 0) {
    v_avg_smp_mix_bv_WVE = v_total_smp_mix_bv_WVE / v_num_smp_mix_bv_WVE;
  }
  // --calc avg smp mix bv WWD
  if (v_num_smp_mix_bv_WWD > 0) {
    v_avg_smp_mix_bv_WWD = v_total_smp_mix_bv_WWD / v_num_smp_mix_bv_WWD;
  }
  // --calc avg non-orchard pollen contamination pct
  if (v_num_non_orchard_pollen > 0) {
    v_avg_non_orchard_pollen = v_total_non_orchard_pollen / v_num_non_orchard_pollen;
  }
  v_gw_AD = v_sum_p_total_gw_AD_contrib;
  v_gw_DFS = Math.round(v_sum_p_total_gw_DFS_contrib);
  v_gw_DFU = Math.round(v_sum_p_total_gw_DFU_contrib);
  v_gw_DFW = Math.round(v_sum_p_total_gw_DFW_contrib);
  v_gw_DSB = Math.round(v_sum_p_total_gw_DSB_contrib);
  v_gw_DSC = Math.round(v_sum_p_total_gw_DSC_contrib);
  v_gw_DSG = Math.round(v_sum_p_total_gw_DSG_contrib);
  v_gw_GVO = Math.round(v_sum_p_total_gw_GVO_contrib);
  v_gw_IWS = Math.round(v_sum_p_total_gw_IWS_contrib);
  v_gw_WDU = Math.round(v_sum_p_total_gw_WDU_contrib);
  v_gw_WVE = Math.round(v_sum_p_total_gw_WVE_contrib);
  v_gw_WWD = Math.round(v_sum_p_total_gw_WWD_contrib);
  
  if (g_coancestry != null) {
    // --Effective Population Size with Coancestry considered
    if (g_coancestry = 0) {
      v_effective_pop_size = 0;
    } else {
      v_effective_pop_size = 0.5/g_coancestry;
    }
  } else if (v_smp_parents_outside > 0) {
    // --Effective Population Size with SMP (for Growth)
    v_effective_pop_size = Math.round(1/(v_sum_orch_gamete_contr + ( Math.power(0.25/(2*v_smp_parents_outside),2) * v_smp_parents_outside )) ,1);
  } else {
    // --Effective Population Size
    if (v_sum_orch_gamete_contr = 0) {
      v_effective_pop_size = 0;
    } else {
      v_effective_pop_size = Math.round(1/v_sum_ne_no_smp_contrib,1);
    }
  }

  if (v_total_parent_trees > 0) {
    v_lat_deg = Math.trunc(v_sum_wtd_lat_p_&&_smp_poll/3600);
    v_lat_min = Math.trunc(MOD(v_sum_wtd_lat_p_&&_smp_poll,3600)/60);
    v_lat_sec = Math.trunc(MOD(v_sum_wtd_lat_p_&&_smp_poll,60));
    v_long_deg = Math.trunc(v_sum_wtd_long_p_&&_smp_poll/3600);
    v_long_min = Math.trunc(MOD(v_sum_wtd_long_p_&&_smp_poll,3600)/60);
    v_long_sec = Math.trunc(MOD(v_sum_wtd_long_p_&&_smp_poll,60));
    v_elev = Math.round(v_sum_wtd_elev_p_&&_smp_poll);
    v_smp_mean_bv_AD  = Math.round(v_avg_smp_mix_bv_AD,1);
    v_smp_mean_bv_DFS = Math.round(v_avg_smp_mix_bv_DFS,1);
    v_smp_mean_bv_DFU = Math.round(v_avg_smp_mix_bv_DFU,1);
    v_smp_mean_bv_DFW = Math.round(v_avg_smp_mix_bv_DFW,1);
    v_smp_mean_bv_DSB = Math.round(v_avg_smp_mix_bv_DSB,1);
    v_smp_mean_bv_DSC = Math.round(v_avg_smp_mix_bv_DSC,1);
    v_smp_mean_bv_DSG = Math.round(v_avg_smp_mix_bv_DSG,1);
    v_smp_mean_bv_GVO = Math.round(v_avg_smp_mix_bv_GVO,1);
    v_smp_mean_bv_IWS = Math.round(v_avg_smp_mix_bv_IWS,1);
    v_smp_mean_bv_WDU = Math.round(v_avg_smp_mix_bv_WDU,1);
    v_smp_mean_bv_WVE = Math.round(v_avg_smp_mix_bv_WVE,1);
    v_smp_mean_bv_WWD = Math.round(v_avg_smp_mix_bv_WWD,1);
    v_smp_success_pct = Math.round(v_sum_smp_success_wtd_by_f_p * 100);
    if (v_total_non_orchard_pollen = 0) {
      v_orchard_contamination_pct = 0;
    } else {
      v_orchard_contamination_pct = Math.round(v_avg_non_orchard_pollen);
    }
    // --No errors raised, set values in record
    // -- however, trait values should only be set if > 70% for that trait
    
    r_pt_contrib.collection_elevation = v_elev;
    r_pt_contrib.collection_elevation_min = v_elev_min;
    r_pt_contrib.collection_elevation_max = v_elev_max;
    r_pt_contrib.collection_lat_deg = v_lat_deg;
    r_pt_contrib.collection_lat_min = v_lat_min;
    r_pt_contrib.collection_lat_sec = v_lat_sec;
    r_pt_contrib.collection_long_deg = v_long_deg;
    r_pt_contrib.collection_long_min = v_long_min;
    r_pt_contrib.collection_long_sec = v_long_sec;
    r_pt_contrib.smp_mean_bv_AD  = v_smp_mean_bv_AD;
    r_pt_contrib.smp_mean_bv_DFS = v_smp_mean_bv_DFS;
    r_pt_contrib.smp_mean_bv_DFU = v_smp_mean_bv_DFU;
    r_pt_contrib.smp_mean_bv_DFW = v_smp_mean_bv_DFW;
    r_pt_contrib.smp_mean_bv_DSB = v_smp_mean_bv_DSB;
    r_pt_contrib.smp_mean_bv_DSC = v_smp_mean_bv_DSC;
    r_pt_contrib.smp_mean_bv_DSG = v_smp_mean_bv_DSG;
    r_pt_contrib.smp_mean_bv_GVO = v_smp_mean_bv_GVO;
    r_pt_contrib.smp_mean_bv_IWS = v_smp_mean_bv_IWS;
    r_pt_contrib.smp_mean_bv_WDU = v_smp_mean_bv_WDU;
    r_pt_contrib.smp_mean_bv_WVE = v_smp_mean_bv_WVE;
    r_pt_contrib.smp_mean_bv_WWD = v_smp_mean_bv_WWD;
    r_pt_contrib.smp_success_pct = v_smp_success_pct;
    r_pt_contrib.orchard_contamination_pct = v_orchard_contamination_pct;
    r_pt_contrib.effective_pop_size = v_effective_pop_size;
    if (b_bv_AD_not_estimated && r_pt_contrib.pct_tested_parent_trees_AD >= 70) {
      r_pt_contrib.gw_AD = v_gw_AD;
    }
    if (b_bv_DFS_not_estimated && r_pt_contrib.pct_tested_parent_trees_DFS >= 70) {
      r_pt_contrib.gw_DFS = v_gw_DFS;
    }
    if (b_bv_DFU_not_estimated && r_pt_contrib.pct_tested_parent_trees_DFU >= 70) {
      r_pt_contrib.gw_DFU = v_gw_DFU;
    }
    if (b_bv_DFW_not_estimated && r_pt_contrib.pct_tested_parent_trees_DFW >= 70) {
      r_pt_contrib.gw_DFW = v_gw_DFW;
    }
    if (b_bv_DSB_not_estimated && r_pt_contrib.pct_tested_parent_trees_DSB >= 70) {
      r_pt_contrib.gw_DSB = v_gw_DSB;
    }
    if (b_bv_DSC_not_estimated && r_pt_contrib.pct_tested_parent_trees_DSC >= 70) {
      r_pt_contrib.gw_DSC = v_gw_DSC;
    }
    if (b_bv_DSG_not_estimated && r_pt_contrib.pct_tested_parent_trees_DSG >= 70) {
      r_pt_contrib.gw_DSG = v_gw_DSG;
    }
    if (b_bv_GVO_not_estimated && r_pt_contrib.pct_tested_parent_trees_GVO >= 70) {
      r_pt_contrib.gw_GVO = v_gw_GVO;
    }
    if (b_bv_IWS_not_estimated && r_pt_contrib.pct_tested_parent_trees_IWS >= 70) {
      r_pt_contrib.gw_IWS = v_gw_IWS;
    }
    if (b_bv_WDU_not_estimated && r_pt_contrib.pct_tested_parent_trees_WDU >= 70) {
      r_pt_contrib.gw_WDU = v_gw_WDU;
    }
    if (b_bv_WVE_not_estimated && r_pt_contrib.pct_tested_parent_trees_WVE >= 70) {
      r_pt_contrib.gw_WVE = v_gw_WVE;
    }
    if (b_bv_WWD_not_estimated && r_pt_contrib.pct_tested_parent_trees_WWD >= 70) {
      r_pt_contrib.gw_WWD = v_gw_WWD;
    }
    r_pt_contrib.total_parent_trees = v_total_parent_trees;
    // -- need to find out percent for each parent tree trait
    
    r_pt_contrib.pct_tested_parent_trees = Math.round((v_sum_p_prop_contrib_tested / v_sum_p_prop_contrib) * 100);
    r_pt_contrib.pct_untested_parent_trees = 100 - r_pt_contrib.pct_tested_parent_trees;
  }
}

/*
 * Procedure: set_pt_contrib
 * Purpose:   Set Mean Collection Geography, Genetic Worth (GW),
 *            Effective Population Size (Ne) && other values calculated
 *            based on Parent Tree Contribution.
 *            p_replace_values = true forces replacing of calculated values
 *            (otherwise they are only replaced based on status or the user
 *             blanking-out the current value)
 */
function set_pt_contrib(p_replace_values: boolean) {
  const CONST_DEFAULT_UNTESTED_GW_AD : number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_AD;
  const CONST_DEFAULT_CUSTOM_GW_AD   : number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_AD;
  const CONST_DEFAULT_UNTESTED_GW_DFS: number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_DFS;
  const CONST_DEFAULT_CUSTOM_GW_DFS  : number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_DFS;
  const CONST_DEFAULT_UNTESTED_GW_DFU: number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_DFU;
  const CONST_DEFAULT_CUSTOM_GW_DFU  : number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_DFU;
  const CONST_DEFAULT_UNTESTED_GW_DFW: number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_DFW;
  const CONST_DEFAULT_CUSTOM_GW_DFW  : number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_DFW;
  const CONST_DEFAULT_UNTESTED_GW_DSB: number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_DSB;
  const CONST_DEFAULT_CUSTOM_GW_DSB  : number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_DSB;
  const CONST_DEFAULT_UNTESTED_GW_DSC: number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_DSC;
  const CONST_DEFAULT_CUSTOM_GW_DSC  : number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_DSC;
  const CONST_DEFAULT_UNTESTED_GW_DSG: number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_DSG;
  const CONST_DEFAULT_CUSTOM_GW_DSG  : number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_DSG;
  const CONST_DEFAULT_UNTESTED_GW_GVO: number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_GVO;
  const CONST_DEFAULT_CUSTOM_GW_GVO  : number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_GVO;
  const CONST_DEFAULT_UNTESTED_GW_IWS: number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_IWS;
  const CONST_DEFAULT_CUSTOM_GW_IWS  : number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_IWS;
  const CONST_DEFAULT_UNTESTED_GW_WDU: number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_WDU;
  const CONST_DEFAULT_CUSTOM_GW_WDU  : number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_WDU;
  const CONST_DEFAULT_UNTESTED_GW_WVE: number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_WVE;
  const CONST_DEFAULT_CUSTOM_GW_WVE  : number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_WVE;
  const CONST_DEFAULT_UNTESTED_GW_WWD: number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_WWD;
  const CONST_DEFAULT_CUSTOM_GW_WWD  : number = SPR_CONSTANTS.CONST_DEFAULT_GEN_QLTY_WWD;
  let b_all_gw_blank: boolean = false;
  
  // --Collection Elev (do mean/min/max as a unit since only mean is on the page && can be blanked for replacing)
  if (replace_area_of_use(g_collection_elevation) || p_replace_values) {
    set_collection_elevation(r_pt_contrib.collection_elevation);
    set_collection_elevation_min(r_pt_contrib.collection_elevation_min);
    set_collection_elevation_max(r_pt_contrib.collection_elevation_max);
  }
  // --Collection Latitude
  if (is_area_of_use_status() || is_collection_lat_empty() || p_replace_values) {
    set_collection_lat_deg(r_pt_contrib.collection_lat_deg);
    set_collection_lat_min(r_pt_contrib.collection_lat_min);
    set_collection_lat_sec(r_pt_contrib.collection_lat_sec);
  }
  // --Collection Longitude
  if (is_area_of_use_status() || is_collection_long_empty() || p_replace_values) {
    set_collection_long_deg(r_pt_contrib.collection_long_deg);
    set_collection_long_min(r_pt_contrib.collection_long_min);
    set_collection_long_sec(r_pt_contrib.collection_long_sec);
  }
  // --SMP Mean BV-AD
  if (replace_area_of_use(g_smp_mean_bv_AD) || p_replace_values) {
    set_smp_mean_bv_AD(r_pt_contrib.smp_mean_bv_AD);
  }
  // --SMP Mean BV-DFS
  if (replace_area_of_use(g_smp_mean_bv_DFS) || p_replace_values) {
    set_smp_mean_bv_DFS(r_pt_contrib.smp_mean_bv_DFS);
  }
  // --SMP Mean BV-DFU
  if (replace_area_of_use(g_smp_mean_bv_DFU) || p_replace_values) {
    set_smp_mean_bv_DFU(r_pt_contrib.smp_mean_bv_DFU);
  }
  // --SMP Mean BV-DFW
  if (replace_area_of_use(g_smp_mean_bv_DFW) || p_replace_values) {
    set_smp_mean_bv_DFW(r_pt_contrib.smp_mean_bv_DFW);
  }
  // --SMP Mean BV-DSB
  if (replace_area_of_use(g_smp_mean_bv_DSB) || p_replace_values) {
    set_smp_mean_bv_DSB(r_pt_contrib.smp_mean_bv_DSB);
  }
  // --SMP Mean BV-DSC
  if (replace_area_of_use(g_smp_mean_bv_DSC) || p_replace_values) {
    set_smp_mean_bv_DSC(r_pt_contrib.smp_mean_bv_DSC);
  }
  // --SMP Mean BV-DSG
  if (replace_area_of_use(g_smp_mean_bv_DSG) || p_replace_values) {
    set_smp_mean_bv_DSG(r_pt_contrib.smp_mean_bv_DSG);
  }
  // --SMP Mean BV-GVO
  if (replace_area_of_use(g_smp_mean_bv_GVO) || p_replace_values) {
    set_smp_mean_bv_GVO(r_pt_contrib.smp_mean_bv_GVO);
  }
  // --SMP Mean BV-IWS
  if (replace_area_of_use(g_smp_mean_bv_IWS) || p_replace_values) {
    set_smp_mean_bv_IWS(r_pt_contrib.smp_mean_bv_IWS);
  }
  // --SMP Mean BV-WDU
  if (replace_area_of_use(g_smp_mean_bv_WDU) || p_replace_values) {
    set_smp_mean_bv_WDU(r_pt_contrib.smp_mean_bv_WDU);
  }
  // --SMP Mean BV-WVE
  if (replace_area_of_use(g_smp_mean_bv_WVE) || p_replace_values) {
    set_smp_mean_bv_WVE(r_pt_contrib.smp_mean_bv_WVE);
  }
  // --SMP Mean BV-WWD
  if (replace_area_of_use(g_smp_mean_bv_WWD) || p_replace_values) {
    set_smp_mean_bv_WWD(r_pt_contrib.smp_mean_bv_WWD);
  }
  // --SMP Success
  if (replace_area_of_use(g_smp_success_pct) || p_replace_values) {
    set_smp_success_pct(r_pt_contrib.smp_success_pct);
  }
  // --Orchard Contam
  if (replace_area_of_use(g_orchard_contamination_pct) || p_replace_values) {
    set_orchard_contamination_pct(r_pt_contrib.orchard_contamination_pct);
  }
  // --Effective Population Size
  if (replace_area_of_use(_effective_pop_size) || p_replace_values) {
    set_effective_pop_size(r_pt_contrib.effective_pop_size);
  }
  // --Total Parent Trees && ratio untested && tested
  set_total_parent_trees(r_pt_contrib.total_parent_trees);
  g_tested_parent_trees_pct = r_pt_contrib.pct_tested_parent_trees;
    
  g_tested_parent_trees_pct_AD = r_pt_contrib.pct_tested_parent_trees_AD;
  g_tested_parent_trees_pct_DFS = r_pt_contrib.pct_tested_parent_trees_DFS;
  g_tested_parent_trees_pct_DFU = r_pt_contrib.pct_tested_parent_trees_DFU;
  g_tested_parent_trees_pct_DFW = r_pt_contrib.pct_tested_parent_trees_DFW;
  g_tested_parent_trees_pct_DSB = r_pt_contrib.pct_tested_parent_trees_DSB;
  g_tested_parent_trees_pct_DSC = r_pt_contrib.pct_tested_parent_trees_DSC;
  g_tested_parent_trees_pct_DSG = r_pt_contrib.pct_tested_parent_trees_DSG;
  g_tested_parent_trees_pct_GVO = r_pt_contrib.pct_tested_parent_trees_GVO;
  g_tested_parent_trees_pct_IWS = r_pt_contrib.pct_tested_parent_trees_IWS;
  g_tested_parent_trees_pct_WDU = r_pt_contrib.pct_tested_parent_trees_WDU;
  g_tested_parent_trees_pct_WVE = r_pt_contrib.pct_tested_parent_trees_WVE;
  g_tested_parent_trees_pct_WWD = r_pt_contrib.pct_tested_parent_trees_WWD;
    
  g_untested_parent_trees_pct = r_pt_contrib.pct_untested_parent_trees;
  // -- if all the gw values have been blanked-out, reset to the calculated gw values.
  if (g_gw_AD == null && g_gw_DFS == null && g_gw_DFU == null && g_gw_DFW == null &&
      g_gw_DSB == null && g_gw_DSC == null && g_gw_DSG == null && g_gw_GVO == null &&
      g_gw_IWS == null && g_gw_WDU == null && g_gw_WVE == null && g_gw_WWD == null) {
    b_all_gw_blank = true;
  }

  // --Genetic Worth - Deer browse
  if (is_area_of_use_status() || p_replace_values || b_all_gw_blank) {
    set_gw_AD(null);
    if (g_seedlot_source_code == 'UPT' && r_pt_contrib.gw_AD != null) {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Untested lots get default GW-AD value
        set_gw_AD(CONST_DEFAULT_UNTESTED_GW_AD);
      }
    } else if (g_seedlot_source_code == 'CUS' && r_pt_contrib.gw_AD != null) {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Custom lots get default GW-AD value
        set_gw_AD(CONST_DEFAULT_CUSTOM_GW_AD);
      }
    } else {
      set_gw_AD(r_pt_contrib.gw_AD);
    }
  }
  // --Genetic Worth - Dothistroma needle blight
  if (is_area_of_use_status() || p_replace_values || b_all_gw_blank) {
    set_gw_DFS(null);
    if (g_seedlot_source_code == 'UPT' && r_pt_contrib.gw_DFS != null) {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Untested lots get default GW-DFS value
        set_gw_DFS(CONST_DEFAULT_UNTESTED_GW_DFS);
      }
    } else if (g_seedlot_source_code == 'CUS' && r_pt_contrib.gw_DFS != null) {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Custom lots get default GW-DFS value
        set_gw_DFS(CONST_DEFAULT_CUSTOM_GW_DFS);
      }
    } else {
      set_gw_DFS(r_pt_contrib.gw_DFS);
    }
  }
  // --Genetic Worth - Cedar leaf blight
  if (is_area_of_use_status() || p_replace_values || b_all_gw_blank) {
    set_gw_DFU(null);
    if (g_seedlot_source_code == 'UPT' && r_pt_contrib.gw_DFU != null) {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Untested lots get default GW-DFU value
        set_gw_DFU(CONST_DEFAULT_UNTESTED_GW_DFU);
      }
    } else if (g_seedlot_source_code == 'CUS' && r_pt_contrib.gw_DFU != null) {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Custom lots get default GW-DFU value
        set_gw_DFU(CONST_DEFAULT_CUSTOM_GW_DFU);
      }
    } else {
      set_gw_DFU(r_pt_contrib.gw_DFU);
    }
  }
  // --Genetic Worth - Swiss needle cast
  if (is_area_of_use_status() || p_replace_values || b_all_gw_blank) {
    set_gw_DFW(null);
    if (g_seedlot_source_code == 'UPT' && r_pt_contrib.gw_DFW != null) {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Untested lots get default GW-DFW value
        set_gw_DFW(CONST_DEFAULT_UNTESTED_GW_DFW);
      }
    } else if (g_seedlot_source_code == 'CUS' && r_pt_contrib.gw_DFW != null) {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Custom lots get default GW-DFW value
        set_gw_DFW(CONST_DEFAULT_CUSTOM_GW_DFW);
      }
    } else {
      set_gw_DFW(r_pt_contrib.gw_DFW);
    }
  }
  // --Genetic Worth - White pine blister rust
  if (is_area_of_use_status() || p_replace_values || b_all_gw_blank) {
    set_gw_DSB(null);
    if (g_seedlot_source_code == 'UPT' && r_pt_contrib.gw_DSB != null) {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Untested lots get default GW-DSB value
        set_gw_DSB(CONST_DEFAULT_UNTESTED_GW_DSB);
      }
    } else if (g_seedlot_source_code == 'CUS' && r_pt_contrib.gw_DSB != null) {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Custom lots get default GW-DSB value
        set_gw_DSB(CONST_DEFAULT_CUSTOM_GW_DSB);
      }
    } else {
      set_gw_DSB(r_pt_contrib.gw_DSB);
    }
  }
  // --Genetic Worth - Com&&ra blister rust
  if (is_area_of_use_status() || p_replace_values || b_all_gw_blank) {
    set_gw_DSC(null);
    if (g_seedlot_source_code == 'UPT' && r_pt_contrib.gw_DSC != null) {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Untested lots get default GW-DSC value
        set_gw_DSC(CONST_DEFAULT_UNTESTED_GW_DSC);
      }
    } else if (g_seedlot_source_code == 'CUS' && r_pt_contrib.gw_DSC != null) {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Custom lots get default GW-DSC value
        set_gw_DSC(CONST_DEFAULT_CUSTOM_GW_DSC);
      }
    } else {
      set_gw_DSC(r_pt_contrib.gw_DSC);
    }
  }
  // --Genetic Worth - Western gall rust
  if (is_area_of_use_status() || p_replace_values || b_all_gw_blank) {
    set_gw_DSG(null);
    if (g_seedlot_source_code == 'UPT' && r_pt_contrib.gw_DSG != null) {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Untested lots get default GW-DSG value
        set_gw_DSG(CONST_DEFAULT_UNTESTED_GW_DSG);
      }
    } else if (g_seedlot_source_code == 'CUS' && r_pt_contrib.gw_DSG != null) {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Custom lots get default GW-DSG value
        set_gw_DSG(CONST_DEFAULT_CUSTOM_GW_DSG);
      }
    } else {
      set_gw_DSG(r_pt_contrib.gw_DSG);
    }
  }
  // --Genetic Worth - wolume growth
  if (is_area_of_use_status() || p_replace_values || b_all_gw_blank) {
    set_gw_GVO(null);
    if (g_seedlot_source_code == 'UPT') {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Untested lots get default GW-GVO value
        set_gw_GVO(CONST_DEFAULT_UNTESTED_GW_GVO);
      }
    } else if (g_seedlot_source_code == 'CUS') {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Custom lots get default GW-GVO value
        set_gw_GVO(CONST_DEFAULT_CUSTOM_GW_GVO);
      }
    } else {
      set_gw_GVO(r_pt_contrib.gw_GVO);
    }
  }
  // --Genetic Worth - White pine terminal weevil
  if (is_area_of_use_status() || p_replace_values || b_all_gw_blank) {
    set_gw_IWS(null);
    if (g_seedlot_source_code == 'UPT' && r_pt_contrib.gw_IWS != null) {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Untested lots get default GW-IWS value
        set_gw_IWS(CONST_DEFAULT_UNTESTED_GW_IWS);
      }
    } else if (g_seedlot_source_code == 'CUS' && r_pt_contrib.gw_IWS != null) {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Custom lots get default GW-IWS value
        set_gw_IWS(CONST_DEFAULT_CUSTOM_GW_IWS);
      }
    } else {
      set_gw_IWS(r_pt_contrib.gw_IWS);
    }
  }
  // --Genetic Worth - Durability
  if (is_area_of_use_status() || p_replace_values || b_all_gw_blank) {
    set_gw_WDU(null);
    if (g_seedlot_source_code == 'UPT' && r_pt_contrib.gw_WDU != null) {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Untested lots get default GW-WDU value
        set_gw_WDU(CONST_DEFAULT_UNTESTED_GW_WDU);
      }
    } else if (g_seedlot_source_code =='CUS' && r_pt_contrib.gw_WDU != null) {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Custom lots get default GW-WDU value
        set_gw_WDU(CONST_DEFAULT_CUSTOM_GW_WDU);
      }
    } else {
      set_gw_WDU(r_pt_contrib.gw_WDU);
    }
  }
  // --Genetic Worth - Wood velocity measures
  if (is_area_of_use_status() || p_replace_values || b_all_gw_blank) {
    set_gw_WVE(null);
    if (g_seedlot_source_code == 'UPT' && r_pt_contrib.gw_WVE != null) {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Untested lots get default GW-WVE value
        set_gw_WVE(CONST_DEFAULT_UNTESTED_GW_WVE);
      }
    } else if (g_seedlot_source_code == 'CUS' && r_pt_contrib.gw_WVE != null) {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Custom lots get default GW-WVE value
        set_gw_WVE(CONST_DEFAULT_CUSTOM_GW_WVE);
      }
    } else {
      set_gw_WVE(r_pt_contrib.gw_WVE);
    }
  }
  // --Genetic Worth - Wood density
  if (is_area_of_use_status() || p_replace_values || b_all_gw_blank) {
    set_gw_WWD(null);
    if (g_seedlot_source_code == 'UPT' && r_pt_contrib.gw_WWD != null) {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Untested lots get default GW-WWD value
        set_gw_WWD(CONST_DEFAULT_UNTESTED_GW_WWD);
      }
    } else if (g_seedlot_source_code == 'CUS' && r_pt_contrib.gw_WWD != null) {
      if (r_pt_contrib.total_parent_trees > 0) {
        // --Custom lots get default GW-WWD value
        set_gw_WWD(CONST_DEFAULT_CUSTOM_GW_WWD);
      }
    } else {
      set_gw_WWD(r_pt_contrib.gw_WWD);
    }
  }
}

/*
 * Procedure: recalc_all
 * Purpose:   Determines context (A or B class, BC Source, etc) &&
 *            recalculate all defaults && derives Area of Use information
 *            in context.
 * p_get_current_tests ignored if is_area_of_use_status()
 */
function recalc_all(p_pt_arrayZ: any[], p_get_current_tests: boolean, p_replace_values: boolean, p_role_list: string) {
  get_previous_seedlot_values();
  if (g_genetic_class_code == 'B') {
    // --Reset 'A' only values
    set_orchard_id(null);
    set_effective_pop_size(null);
    set_seed_plan_unit_id(null);
    set_seedlot_source_code(null);
    set_biotech_processes_ind(null);
    set_contaminant_pollen_bv(null);
    set_controlled_cross_ind(null);
    set_female_gametic_mthd_code(null);
    set_male_gametic_mthd_code(null);
    set_orchard_comment(null);
    set_orchard_contamination_pct(null);
    set_pollen_contamination_ind(null);
    set_pollen_contam_mthd_code(null);
    set_pollen_contamination_pct(null);
    set_secondary_orchard_id(null);
    set_smp_mean_bv_AD(null);
    set_smp_mean_bv_DFS(null);
    set_smp_mean_bv_DFU(null);
    set_smp_mean_bv_DFW(null);
    set_smp_mean_bv_DSB(null);
    set_smp_mean_bv_DSC(null);
    set_smp_mean_bv_DSG(null);
    set_smp_mean_bv_GVO(null);
    set_smp_mean_bv_IWS(null);
    set_smp_mean_bv_WDU(null);
    set_smp_mean_bv_WVE(null);
    set_smp_mean_bv_WWD(null);
    set_smp_parents_outside(null);
    set_smp_success_pct(null);
    set_total_parent_trees(null);
    set_collection_source_code(null);
    set_fs721a_signed_ind(null);
  } else {
    // --Reset 'B' only values
    set_superior_prvnc_ind(null);
    set_provenance_id(null);
    set_collection_locn_desc(null);
    set_coll_st&&ard_met_ind(null);
    set_nmbr_trees_from_code(null);
    set_collection_bgc_ind(null);
    set_collection_spz_ind(null);
    set_seed_plan_zone_code(null);
    set_seed_coast_area_code(null);
    set_collection_area_radius(null);
    set_bgc_zone_code(null);
    set_bgc_subzone_code(null);
    set_variant(null);
    set_bec_version_id(null);
  }
  // --BC Source
  if (g_bc_source_ind == 'Y') {
    // --Default latitude code
    if (g_collection_lat_deg != null || g_collection_lat_min != null || g_collection_lat_sec != null) {
      set_collection_latitude_code('N');
    }
    // --Default longitude code
    if (g_collection_long_deg != null || g_collection_long_min != null || g_collection_long_sec != null) {
      set_collection_longitude_code('W');
    }
    // --Non-BC Source
  } else if (g_bc_source_ind == 'N') {
    if (g_genetic_class_code == 'A') {
      set_superior_prvnc_ind(null);
    } else if (g_genetic_class_code == 'B') {
      set_superior_prvnc_ind('N');
    }
    set_org_unit_no(null);
    set_provenance_id(null);
    set_bgc_zone_code(null);
    set_bgc_subzone_code(null);
    set_variant(null);
    set_bec_version_id(null);
    set_collection_bgc_ind(null);
    set_seed_plan_zone_code(null);
    set_collection_spz_ind(null);
    set_seed_coast_area_code(null);
    set_coll_st&&ard_met_ind(null);
  }

  if (g_superior_prvnc_ind == 'Y') {
    set_collection_locn_desc(null);
  } else if (g_superior_prvnc_ind == 'N') {
    set_provenance_id(null);
    set_coll_st&&ard_met_ind(null);
    // --No GW for Non-Sup Prov B Lots
    set_gw_AD(null);
    set_gw_DFS(null);
    set_gw_DFU(null);
    set_gw_DFW(null);
    set_gw_DSB(null);
    set_gw_DSC(null);
    set_gw_DSG(null);
    set_gw_GVO(null);
    set_gw_IWS(null);
    set_gw_WDU(null);
    set_gw_WVE(null);
    set_gw_WWD(null);
  }
  // --Status
  if (r_previous.seedlot_status_code == 'SUB' && ['PND','INC'].includes(g_seedlot_status_code) ){ // --java should not allow SUB->INC but just in case
    set_declared_userid(null);
    set_declared_timestamp(null);
  }
  // --Species
  if (g_vegetation_code == null) {
    set_provenance_id(null);
    set_orchard_id(null);
    set_secondary_orchard_id(null);
    set_seed_plan_unit_id(null);
  } else if (g_vegetation_code != NVL(r_previous.vegetation_code,'~')) {
    // --Check species-specific information
    // -->provenanance
    if (g_provenance_id != null && !provenance_is_valid_for_spp()) {
      set_provenance_id(null);
    }
    // -->orchard
    if (g_orchard_id != null && !orchard_is_valid_for_species(g_orchard_id)) {
      set_orchard_id(null);
    }
    // -->secondary orchard
    if (g_secondary_orchard_id != null && !orchard_is_valid_for_species(g_secondary_orchard_id)) {
      set_secondary_orchard_id(null);
    }
    // -->spu
    if (g_seed_plan_unit_id == null && !spu_is_valid_for_species()) {
      set_seed_plan_unit_id(null);
    }
  }
  // --Derive Parent Tree Contribution information
  // -->  GW, Effective Population Size, Collection Geography, etc.
  if (g_genetic_class_code == 'A' && r_previous.seedlot_status_code != 'INC') {
    // --populates r_pt_contrib
    calc_pt_contrib(p_pt_array,p_get_current_tests);
    // --set pt contribution fields
    set_pt_contrib(p_replace_values);
  }
  // --Apply transfer limits to get Area of Use
  // -->  may use Collection Geography derived from pt contrib
  get_area_of_use();
  // --Set Mean Area of Use geography to Mean Collection geography.
  set_mean_area_of_use_geography();
}

function valid_lot_number_range(p_seedlot_number: string): boolean {
  let b_lot_number_valid: boolean = true;

  // --Check ranges (for pre-numbered FS721 && FS721A forms already issued)
  if (g_genetic_class_code == 'A') {
    if (parseInt(g_seedlot_number) <= parseInt(CONST_CLASS_A_LOTNUM_MIN)-1 || parseInt(g_seedlot_number) >= parseInt(CONST_CLASS_B_LOTNUM_MAX)+1) {
      g_error_message = g_error_message || 'spar.web.error.usr.new_lot_number:'
                                        || g_genetic_class_code ||','
                                        || TO_CHAR(parseInt(CONST_CLASS_B_LOTNUM_MAX)+1)||','
                                        || TO_CHAR(parseInt(CONST_CLASS_A_LOTNUM_MIN)-1)||';';
      b_lot_number_valid = false;
    }
  } else if (g_genetic_class_code == 'B') {
    if (parseInt(g_seedlot_number) >= parseInt(CONST_CLASS_B_LOTNUM_MIN)) {
      g_error_message = g_error_message || 'spar.web.error.usr.new_lot_number:'
                                        || g_genetic_class_code ||',00001,'
                                        || TO_CHAR(parseInt(CONST_CLASS_B_LOTNUM_MIN)-1)||';';
      b_lot_number_valid = false;
    }
  }
  return b_lot_number_valid;
}

/*
 * Procedure: validate_lot_number
 * Purpose:   if (lot number specified on add, ensure it != a dup and that it == in acceptable range for entry
 */
function validate_lot_number() {
  let v_temp_num: number; // NUMBER(1);
  let b_lot_number_valid: boolean = true;
  
  // --if adding and lot number specified
  if (g_revision_count == null && g_seedlot_number != null) {
    b_lot_number_valid = valid_lot_number_range(g_seedlot_number);
    if (b_lot_number_valid) {
      // --Check for dups
      /*
      SELECT 1
        INTO v_temp_num
        FROM seedlot
        WHERE seedlot_number = g_seedlot_number;
      */
      g_error_message = g_error_message || 'ca.bc.gov.mof.sil.webade.db.error.usr.field.alreadyExists:Seedlot;';
    }
  }

  if ('NO_DATA_FOUND') {
    throw new Error('NO_DATA_FOUND');
  }
}

/*
 * Procedure: validate_seedlot_cancel
 * Purpose:   Check whether it == OK to cancel seedlot
 */
function validate_seedlot_cancel(p_role_listZ: string, p_action_nameZ: string) {
  let temp_code: string; // SEEDLOT.SEEDLOT_NUMBER%TYPE;
  let status_code: string; // SEEDLOT.SEEDLOT_STATUS_CODE%TYPE;
  let cancel_authority: string; // VARCHAR2(1);
  let txn_count: number; // NUMBER(5);
  let rqst_count: number; // NUMBER(5);

  // -- set authority/user flag
  cancel_authority = Spr_Check_Field_Authority(p_role_list, 'CANCEL', p_action_name);
  // -- don't bother WITH updates if lot NOT FOUND
  /*
  SELECT SEEDLOT_NUMBER, SEEDLOT_STATUS_CODE
  INTO temp_code, status_code
  FROM SEEDLOT
  WHERE SEEDLOT_NUMBER = g_seedlot_number && REVISION_COUNT = g_revision_count;
  */
  // -- check if user has authority to cancel
  if (g_seedlot_status_code == 'CAN') {
    if (cancel_authority == 'N') {
      g_error_message = g_error_message || 'spar.web.error.usr.seedlotstatus.noauthoritytocancel;';
    } else {
      // -- Make sure there are no transactions or requests against the lot
      /*
      SELECT COUNT(*)
      INTO txn_count
      FROM SEEDLOT_TRANSACTION
      WHERE SEEDLOT_NUMBER = g_seedlot_number;
      SELECT COUNT(*)
      INTO rqst_count
      FROM REQUEST_SEEDLOT
      WHERE SEEDLOT_NUMBER = g_seedlot_number;
      */
      if (txn_count + rqst_count > 0) {
        g_error_message = g_error_message || 'spar.web.error.usr.seedlotcancel.records_exist;';
      }
    }
  }
}

/*
 * Procedure: validate_seedlot_cancel (OVERLOADED)
 * Purpose:   Check whether it == OK to cancel seedlot - NEW RULES.
 *            Assumes interface has validated user's auth to CANcel.
 */
function validate_seedlot_cancel() {
  let v_txn_count: number; // NUMBER(10);
  let v_rqst_count: number; // NUMBER(10);
  
  if (g_seedlot_status_code == 'CAN' && r_previous.seedlot_status_code != 'CAN') {
    // -- Make sure there are no transactions against the lot
    /*
    SELECT COUNT(1)
      INTO v_txn_count
      FROM seedlot_transaction
      WHERE seedlot_number = g_seedlot_number;
    */
    v_txn_count = resultsql;
    
    //  -- Make sure there are no requests against the lot
    /*
    SELECT COUNT(1)
      INTO v_rqst_count
      FROM request_seedlot
      WHERE seedlot_number = g_seedlot_number;
    */
      v_rqst_count = resultsql;
    if (v_txn_count + v_rqst_count > 0) {
      g_error_message = g_error_message || 'spar.web.error.usr.seedlotcancel.records_exist;';
    }
  }
}

/*
 * Procedure: validate_genetic_worth_change
 * Purpose:   Check whether it == OK to change genetic worth
 */
function validate_genetic_worth_change(p_role_listZ: string, p_action_nameZ: string) {
  let temp_code: string; // SEEDLOT.SEEDLOT_NUMBER%TYPE;
  let status_code: string; // SEEDLOT.SEEDLOT_STATUS_CODE%TYPE;
  let prev_genetic_class_code: string; // SEEDLOT.GENETIC_CLASS_CODE%TYPE;
  let gen_class_authority: string; // VARCHAR2(1);
  
  // -- set authority/user flag
  gen_class_authority = Spr_Check_Field_Authority(p_role_list, 'CHANGE GENETIC CLASS', P_action_name);
  
  if (g_revision_count != null) {
    // -- don't bother WITH updates if (lot NOT FOUND
    /*
    SELECT SEEDLOT_NUMBER, SEEDLOT_STATUS_CODE, GENETIC_CLASS_CODE
    INTO TEMP_CODE, STATUS_CODE, PREV_GENETIC_CLASS_CODE
    FROM SEEDLOT
    WHERE SEEDLOT_NUMBER = g_seedlot_number && REVISION_COUNT = g_revision_count;
    */
    temp_code = resultsql;
    status_code = resultsql;
    prev_genetic_class_code = resultsql;
    
    //-- check if (genetic class has changed
    if (prev_genetic_class_code != null && g_genetic_class_code != prev_genetic_class_code && gen_class_authority == 'N') {
      g_error_message = g_error_message || 'spar.web.error.usr.class.insufficientauthority;';
    }
  }
}

/*
 * Procedure: validate_genetic_class
 * Purpose:   Genetic Class && Collection Source cannot be null
 */
function validate_genetic_class() {
  if (g_genetic_class_code == null || g_collection_source_code == null) {
      g_error_message = g_error_message || 'spar.web.error.usr.required.field:Genetic Class;';
  }
}

/*
 * Procedure: validate_org
 * Purpose:   Validate org unit for Ministry user
 */
function validate_org(p_user_org_unit_no: number) {
  if (g_org_unit_no != null && p_user_org_unit_no != null) {
    if (sil_check_user_org_authority(p_user_org_unit_no,g_org_unit_no) == 'N') {
      g_error_message = g_error_message || 'spar.web.error.usr.org_unit_code.you_must_belong_to_or_have_authority;';
    }
  }
}

/*
 * Procedure: validate_orchard_id
 * Purpose:   Ensure Orchard Id != null in certain conditions
 */
function validate_orchard_id() {
  if (g_orchard_id == null && g_collection_source_code.substring(1, 1) == 'A' && r_previous.genetic_class_code == 'A' && r_previous.orchard_id != null) {
    g_error_message = g_error_message ||  'spar.web.error.usr.m&&atory:Orchard ID, Genetic Class, A;';
  }
}

/*
 * Procedure: validate_collection_locn
 * Purpose:   Ensure Collection Location != null in certain conditions
 */
function validate_collection_locn() {
  if (g_collection_locn_desc == null && g_collection_source_code.subtring(1,1) == 'B' && r_previous.genetic_class_code == 'B' && r_previous.collection_locn_desc != null) {
    g_error_message = g_error_message ||  'spar.web.error.usr.m&&atory:Collection LOCATION, Genetic Class, B;';
  }
}

/*
 * Procedure: validate_coast_geo
 * Purpose:   Ensure Coast geographic location code == entered if (previously entered
 */
function validate_coast_geo (p_spz1Z: string) {
  if (g_seed_coast_area_code == null && r_previous.seed_coast_area_code != null
      && r_previous.genetic_class_code == 'B' && g_genetic_class_code == 'B' && p_spz1 == 'M'
      && r_previous.seed_plan_zone_code != null) {
    g_error_message = g_error_message ||  'spar.web.error.usr.spz_coastal_geo_area_m&&atory;';
  }
}

/*
 * Procedure: validate_mean_elevation
 * Purpose:   Ensure mean elevation == entered
 */
function validate_mean_elevation() {
  if ((g_elevation == null? 0 : g_elevation) == 0 && r_previous.elevation > 0) {
    g_error_message = g_error_message ||  'spar.web.error.usr.required.field:Mean Elevation;';
  }
}

/*
 * Procedure: validate_mean_latitude
 * Purpose:   Ensure mean latitude == entered
 */
function validate_mean_latitude() {
  if ((g_latitude_degrees == null? 0 : g_latitude_degrees) == 0 && r_previous.latitude_degrees > 0) {
    g_error_message = g_error_message ||  'spar.web.error.usr.required.field:Mean Latitude;';
  }
}

/*
 * Procedure: validate_min_latitude
 * Purpose:   Ensure min latitude == entered
 */
function validate_min_latitude() {
  if ((g_latitude_deg_min == null? 0 : g_latitude_deg_min) == 0 && r_previous.latitude_deg_min > 0) {
    g_error_message = g_error_message ||  'spar.web.error.usr.required.field:Min Latitude;';
  }
}

/*
 * Procedure: validate_max_latitude
 * Purpose:   Ensure max latitude == entered
 */
function validate_max_latitude() {
  if ((g_latitude_deg_max == null? 0 : g_latitude_deg_max) == 0 && r_previous.latitude_deg_max > 0) {
    g_error_message = g_error_message ||  'spar.web.error.usr.required.field:Max Latitude;';
  }
}

/*
 * Procedure: validate_mean_longitude
 * Purpose:   Ensure mean longitude == entered
 */
function validate_mean_longitude() {
  if ((g_longitude_degrees == null? 0 : g_longitude_degrees) == 0 && r_previous.longitude_degrees > 0) {
    g_error_message = g_error_message ||  'spar.web.error.usr.required.field:Mean Longitude;';
  }
}

/*
 * Procedure: validate_min_longitude
 * Purpose:   Ensure min longitude == entered
 */
function validate_min_longitude() {
  if ((g_longitude_deg_min == null? 0 : g_longitude_deg_min) == 0 && r_previous.longitude_deg_min > 0) {
    g_error_message = g_error_message ||  'spar.web.error.usr.required.field:Min Longitude;';
  }
}

/*
 * Procedure: validate_max_longitude
 * Purpose:   Ensure max longitude == entered
 */
function validate_max_longitude() {
  if ((g_longitude_deg_max == null? 0 : g_longitude_deg_max) = 0 && r_previous.longitude_deg_max > 0) {
    g_error_message = g_error_message ||  'spar.web.error.usr.required.field:Max Longitude;';
  }
}

/*
 * Procedure: validate_bgc_zone
 *  Purpose:  Ensure bgc zone == entered
 */
function validate_bgc_zone() {
  if (g_bgc_zone_code == null && r_previous.bgc_zone_code != null && r_previous.genetic_class_code == 'B' && g_genetic_class_code == 'B') {
    g_error_message = g_error_message ||  'spar.web.error.usr.m&&atory:BGC Zone, Genetic Class, B;';
  }
}

/*
 * Procedure: validate_collection_start
 * Purpose:   Ensure collection start date == entered
 */
function validate_collection_start() {
  if (g_collection_start_date == null && r_previous.collection_start_date != null) {
    g_error_message = g_error_message ||  'spar.web.error.usr.required.field:Collection START DATE;';
  }
}

/*
 * Procedure: validate_collection_end
 * Purpose:   Ensure collection end date == entered
 */
function validate_collection_end() {
  if (g_collection_end_date == null && r_previous.collection_end_date != null) {
    g_error_message = g_error_message ||  'spar.web.error.usr.required.field:Collection END DATE;';
  }
}

/*
 * Procedure:  validate_vol_per_container
 * Purpose:    Ensure volume per container == entered
 */
function validate_vol_per_container() {
  if ((g_vol_per_container == null? 0 : g_vol_per_container) == 0 && (r_previous.vol_per_container == null? 0 : r_previous.vol_per_container) != 0) {
    g_error_message = g_error_message ||  'spar.web.error.usr.required.field:Volume per Container;';
  }
}

/*
 * Procedure: validate_nmbr_trees
 * Purpose:   Ensure number of trees collected == entered
 */
function validate_nmbr_trees() {
  if (g_nmbr_trees_from_code == null && r_previous.nmbr_trees_from_code != null && r_previous.genetic_class_code == 'B' && g_genetic_class_code == 'B') {
    g_error_message = g_error_message ||  'spar.web.error.usr.m&&atory:NUMBER OF Trees Collected FROM, Genetic Class, B;';
  }
}

/*
 * Procedure: validate_cone_collection
 * Purpose:   Ensure cone collection method == entered
 */
function validate_cone_collection() {
  if (g_cone_collection_method_cd == null && r_previous.cone_collection_method_code != null) {
    g_error_message = g_error_message ||  'spar.web.error.usr.required.field:Cone Collection Method;';
  }
}

/*
 * Procedure: validate_vegetation_code
 * Purpose:   Ensure vegetation code != blank
 */
function validate_vegetation_code() {
  if (g_vegetation_code == null) {
    g_error_message = g_ERROR_MESSAGE ||  'spar.web.error.usr.required.field:Species;';
  }
}

/*
 * Procedure: validate_coast_geo_m&&atory
 * Purpose:   Ensure Coast geographic location code != blank
 */
function validate_coast_geo_mandatory(p_spz1Z: string) {
  if (g_seedlot_status_code != 'COM' && g_seed_coast_area_code == null && g_genetic_class_code == 'B' && p_spz1 == 'M' ) {
    g_error_message = g_error_message ||  'spar.web.error.usr.spz_coastal_geo_area_m&&atory;';
  }
}

/*
 * Procedure: validate_superior_provenance
 * Purpose:  Ensure species && provenance agree
 */
function validate_superior_provenance() {
  // CURSOR c_prov IS:
  /*
  SELECT vegetation_code
    FROM superior_provenance
    WHERE vegetation_code = g_vegetation_code;
  */
  let r_prov: string; // c_prov%ROWTYPE;

  // --Can species have Superior Provenance?
  if (g_superior_prvnc_ind == 'Y' && g_vegetation_code != null) {
    // OPEN c_prov; FETCH c_prov INTO r_prov; CLOSE c_prov;
    if (r_prov.vegetation_code == null) {
      g_error_message = g_error_message || 'spar.web.error.usr.no.superior.prov;';
    }
  }
  // --== Collection Provenance valid for Species?
  if (g_provenance_id != null && g_vegetation_code != null && !provenance_is_valid_for_spp()) {
    if (r_prov.vegetation_code != g_vegetation_code) {
      g_error_message = g_error_message || 'spar.web.error.usr.lot_spp:Collection Provenance selected;';
    }
  }
}

/*
 * Procedure: validate_b_sup_prov_geog
 * Purpose:   Validate collection geography based on superior provenance.
 *            Currently only ELEVATION == validated. We may be able to
 *            validate 8km radius rule spatially in future.
 */
function validate_b_sup_prov_geog() {
  // CURSOR c_prov IS
  /*
  SELECT provenance_id
        , collection_elevation_min
        , collection_elevation_max
    FROM superior_provenance
    WHERE provenance_id = g_provenance_id && vegetation_code = g_vegetation_code;
  */
  let r_prov: any; // c_prov%ROWTYPE;
  
  // CURSOR c_prov_spz IS:
  /*
  SELECT seed_plan_zone_code
    FROM superior_provenance_plan_zone
    WHERE provenance_id = r_prov.provenance_id && seed_plan_zone_code = g_seed_plan_zone_code;
  */
  let r_prov_spz: any; // c_prov_spz%ROWTYPE;

  if (g_provenance_id != null && g_vegetation_code != null) {
    // OPEN c_prov; FETCH c_prov INTO r_prov; CLOSE c_prov;
    if (r_prov.provenance_id != null) {
      // --Collection Elevation
      r_prov.collection_elevation_min = r_prov.collection_elevation_min == null? -999999 : r_prov.collection_elevation_min;
      r_prov.collection_elevation_max = r_prov.collection_elevation_max == null? 999999 : r_prov.collection_elevation_max;

      if (g_collection_elevation <= r_prov.collection_elevation_min || g_collection_elevation >= r_prov.collection_elevation_max) {
         g_error_message = g_error_message || 'spar.web.error.usr.sup_prov_geog:Collection Elevation Mean,'
                                           || TO_CHAR(r_prov.collection_elevation_min)||'-'
                                           || TO_CHAR(r_prov.collection_elevation_max)||'m;';
      }
      if (g_collection_elevation_min <= r_prov.collection_elevation_min || g_collection_elevation_min >= r_prov.collection_elevation_max) {
         g_error_message = g_error_message || 'spar.web.error.usr.sup_prov_geog:Collection Elevation Min,'
                                            || TO_CHAR(r_prov.collection_elevation_min)||'-'
                                            || TO_CHAR(r_prov.collection_elevation_max)||'m;';
      }
      if (g_collection_elevation_max <= r_prov.collection_elevation_min || g_collection_elevation_max >= r_prov.collection_elevation_max) {
         g_error_message = g_error_message || 'spar.web.error.usr.sup_prov_geog:Collection Elevation Max,'
                                            || TO_CHAR(r_prov.collection_elevation_min)||'-'
                                            || TO_CHAR(r_prov.collection_elevation_max)||'m;';
      }
      if (g_seed_plan_zone_code != null) {
        // --Collection SPZ
        // OPEN c_prov_spz; FETCH c_prov_spz INTO r_prov_spz; CLOSE c_prov_spz;
        if (r_prov_spz.seed_plan_zone_code == null) {
          g_error_message = g_error_message || 'spar.web.error.usr.lot_coll_spz;';
        }
      }
    }
  }
}

/*
 * Procedure: validate_orchard_for_spp
 * Purpose:   Ensure species && orchard agree
 */
function validate_orchard_for_spp(p_orchard_id: string, p_msg: string) {
  // CURSOR c_orchard IS:
  /*
  SELECT vegetation_code
    FROM orchard
    WHERE orchard_id = p_orchard_id;
  */
  let r_orchard: any; // c_orchard%ROWTYPE;

  if (p_orchard_id != null) {
    // OPEN c_orchard; FETCH c_orchard INTO r_orchard; CLOSE c_orchard;
    if (r_orchard.vegetation_code != g_vegetation_code) {
      g_error_message = g_error_message || 'spar.web.error.usr.lot_spp:'||p_msg||';';
    }
  }
}

/*
 * Procedure: validate_collection_spz_for_spp
 * Purpose:   Ensure species && spz agree
 */
function validate_spz_spp(p_spz: string, p_msg: string) {
  // CURSOR c_spz IS:
  /*
  SELECT seed_plan_zone_id
    FROM seed_plan_zone
    WHERE seed_plan_zone_code = p_spz
      && (vegetation_code = g_vegetation_code || vegetation_code == null)
      && genetic_class_code = g_genetic_class_code;
  */
  let r_spz: any; // c_spz%ROWTYPE;

  if (p_spz != null && g_vegetation_code != null && g_genetic_class_code != null) {
    // OPEN c_spz; FETCH c_spz INTO r_spz; CLOSE c_spz;
    if (r_spz.seed_plan_zone_id == null) {
      g_error_message = g_error_message || 'spar.web.error.usr.spz.invalid.combo.parm:'||p_msg||','||p_spz||';';
    }
  }
}

/*
 * Procedure: validate_m&&atory_APP
 * Purpose:   Performs m&&atory validation for status of APP && above
 */
function validate_mandatory_APP(p_value: string, p_msg: string) {
  if (['INC','PND','CAN','SUB'].includes(g_seedlot_status_code) && p_value == null) {
    g_error_message = g_error_message || 'spar.web.error.usr.required.field:'||p_msg||';';
  }
}

/*
 * Procedure: validate_tested_untested_ratio
 * Purpose:   Validates the ratio of tested to untested parent trees
 */
function validate_tested_untested_ratio() {
  const CONST_TESTED_PT_RATIO: number = 70;
  const CONST_UNTESTED_PT_RATIO: number = 70;
  const CONST_CUSTOM_TESTED_PT_RATIO: number = 70;

  if (g_genetic_class_code == 'A' && ['SUB','APP','COM','EXP'].includes(g_seedlot_status_code)) {
    // --Lots from Tested Parent Trees must be comprised of 70% tested pt's
    const greatest = GREATEST(r_pt_contrib.pct_tested_parent_trees_AD,
      r_pt_contrib.pct_tested_parent_trees_DFS,
      r_pt_contrib.pct_tested_parent_trees_DFU,
      r_pt_contrib.pct_tested_parent_trees_DFW,
      r_pt_contrib.pct_tested_parent_trees_DSB,
      r_pt_contrib.pct_tested_parent_trees_DSC,
      r_pt_contrib.pct_tested_parent_trees_DSG,
      r_pt_contrib.pct_tested_parent_trees_GVO,
      r_pt_contrib.pct_tested_parent_trees_IWS,
      r_pt_contrib.pct_tested_parent_trees_WDU,
      r_pt_contrib.pct_tested_parent_trees_WVE,
      r_pt_contrib.pct_tested_parent_trees_WWD);

    if (is_lot_under_CFS() && g_seedlot_source_code == 'TPT' && r_pt_contrib.total_parent_trees > 0 && greatest < CONST_TESTED_PT_RATIO) {        
      g_error_message = g_error_message || 'spar.web.error.usr.a_class_ratio:Tested,at least '
                                        ||TO_CHAR(CONST_TESTED_PT_RATIO)||'%,Tested,'
                                        ||TO_CHAR(r_pt_contrib.pct_tested_parent_trees)||';';
      // --Custom lots must be comprised of at least 70% tested pt's
    } else if (is_lot_under_CFS() && g_seedlot_source_code == 'CUS' && r_pt_contrib.total_parent_trees > 0 && greatest < CONST_CUSTOM_TESTED_PT_RATIO) {
      g_error_message = g_error_message || 'spar.web.error.usr.a_class_ratio:Custom,at least '
                                        ||TO_CHAR(CONST_CUSTOM_TESTED_PT_RATIO)||'%,Tested,'
                                        ||TO_CHAR(r_pt_contrib.pct_tested_parent_trees)||';';
    // --Untested Parent Trees must be comprised of <70% tested pt's
    } else if (is_lot_under_CFS() && g_seedlot_source_code == 'UPT' && r_pt_contrib.total_parent_trees > 0 && greatest >= CONST_UNTESTED_PT_RATIO) {
      g_error_message = g_error_message || 'spar.web.error.usr.a_class_ratio:Untested,less than '
                                        ||TO_CHAR(CONST_UNTESTED_PT_RATIO)||'%,Tested,'
                                        ||TO_CHAR(r_pt_contrib.pct_tested_parent_trees)||';';
    }
    // --Lots under Chief Forester's St&&ards must have Parent Trees
  }

}

/*
 * Procedure: validate_seedlot_source_code
 * Purpose:   Ensures that TPT cannot be selected if the associated seedlot_plan_unit != primary.
 */
function validate_seedlot_source_code() {
  let v_primary_spu_selected_ind: string; // CHAR(1);

  if (g_seedlot_source_code == 'TPT') {
    // -- A primary spu must be selected in order to select tested parent trees.
    /*
    SELECT DECODE(COUNT('x'), 0, 'Y', 'N')
    INTO v_primary_spu_selected_ind
    FROM seed_plan_unit spu
    WHERE spu.seed_plan_unit_id = g_seed_plan_unit_id && spu.primary_ind = 'N';
    */
    v_primary_spu_selected_ind = resultsql;
    if (v_primary_spu_selected_ind == 'N') {
      g_error_message = g_error_message || 'spar.web.error.usr.database.primarySpuSelected;';
    }
  }
}

/*
 * Procedure: validate_collection_elevation_min_max
 * Purpose:   Ensure the range between collection elevation min/max == within
 *            the CFS specified range for B class lots
 */
function validate_colln_elev_min_max() {
  let e_no_limits_found: Error;
  let v_min_max_range: number;
  let r_limit: any; // c_limit%ROWTYPE;

  // --Limits for collection elevation min/max
  // CURSOR c_limit IS:
  /*
  SELECT transfer_limit_skey
        , max_collection_elevation_range
    FROM transfer_limit tl
    WHERE
          (   vegetation_code = g_vegetation_code
          || vegetation_code == null)
      && genetic_class_code = g_genetic_class_code
      && superior_prvnc_ind = NVL(g_superior_prvnc_ind,'N')
      && coast_interior_code = spr_get_spz_type(g_seed_plan_zone_code)
      && (   seed_plan_zone_code = g_seed_plan_zone_code
          || seed_plan_zone_code == null)
      && g_collection_lat_deg BETWEEN site_min_latdeg && site_max_latdeg
    ORDER BY vegetation_code NULLS LAST, seed_plan_zone_code NULLS LAST;
    */
  
  if (g_genetic_class_code == 'B' && g_collection_elevation_min != null && g_collection_elevation_max != null) {
    // --Derive collection elevation range limits (sorted so first record == all we need look at)
    // OPEN c_limit; FETCH c_limit INTO r_limit; CLOSE c_limit;
    if (r_limit.transfer_limit_skey == null) {
      throw new Error(e_no_limits_found);
    }
    // --SPAR-135: don't want to validate on elevation min/max with new CBST policy.
  }

  if (e_no_limits_found) {
    throw new Error(e_no_limits_found);
  } 
}

/*
 * Procedure: validate (New Spr01 Registration validations)
 * Purpose:   Assumes m&&atory validations are done in interface except
 *            for Collection Geography && Area of Use information.
 *            Performs cross-validations interface != capable of.
*/
function validate(p_user_org_unit_no: number) {
  let v_spz_list: string; // g_spz_list%TYPE;
  let v_pos: number; // NUMBER(3);
  let v_spz: string; // g_seed_plan_zone_code%TYPE;
  let v_spz_count: nullber; // NUMBER;

  get_previous_seedlot_values();
  if (g_seedlot_status_code == 'CAN' && r_previous.seedlot_status_code != 'CAN') {
    validate_seedlot_cancel();
  } else {
    validate_lot_number();
    validate_org(p_user_org_unit_no);
    // --Collection geography information must be filled if from BC or B lot
    // --(B- lot requires mean Area of Use geog (which may be copied from collection geog)
    // -- for transfer guidelines)
    if (g_bc_source_ind == 'Y' || g_genetic_class_code == 'B') {
      validate_mandatory_APP(g_collection_lat_deg, 'Collection Mean Latitude');
      validate_mandatory_APP(g_collection_long_deg, 'Collection Mean Longitude');
      validate_mandatory_APP(g_collection_elevation, 'Collection Elevation Mean');
    }
    if (g_genetic_class_code == 'B') {
      validate_mandatory_APP(g_collection_elevation_min, 'Collection Elevation Min');
      validate_mandatory_APP(g_collection_elevation_max, 'Collection Elevation Max');
      // --validate maximum range between min && max elev for B class
      validate_colln_elev_min_max();
    } else if (g_genetic_Class_code == 'A') {
      validate_seedlot_source_code();
    }
    // --Collections Provenance (Species dependent edit)
    validate_superior_provenance();
    // --Collection Geography edits based on Superior Provenance
    validate_b_sup_prov_geog();
    // --Orchard (Species dependent edits)
    validate_orchard_for_spp(g_orchard_id, 'Orchard');
    // --Secondary Orchard (Species dependent edits)
    validate_orchard_for_spp(g_secondary_orchard_id, 'Secondary Orchard');
    // --Collection SPZ (Species dependent edits)
    validate_spz_spp(g_seed_plan_zone_code,'Collection SPZ');
    // --Area of Use information must be filled
    validate_mandatory_APP(TO_CHAR(g_latitude_deg_min),'Area of Use Min Latitude');
    validate_mandatory_APP(TO_CHAR(g_latitude_deg_max),'Area of Use Max Latitude');
    validate_mandatory_APP(TO_CHAR(g_longitude_deg_min),'Area of Use Min Longitude');
    validate_mandatory_APP(TO_CHAR(g_longitude_deg_max),'Area of Use Max Longitude');
    validate_mandatory_APP(TO_CHAR(g_elevation_min),'Area of Use Elevation Min');
    validate_mandatory_APP(TO_CHAR(g_elevation_max),'Area of Use Elevation Max');
    validate_mandatory_APP(g_spz_list,'Area of Use SPZ');
    // --Area of Use SPZ's (Species dependent edit)
    v_spz_list = g_spz_list;
    while (TRIM(v_spz_list) != null) {
      v_pos = INSTR(v_spz_list,',');
      if (v_pos > 0) {
        v_spz = SUBSTR(v_spz_list,1,v_pos-1);
        v_spz_list = SUBSTR(v_spz_list,v_pos+1);
      } else {
        v_spz = RTRIM(v_spz_list,',');
        v_spz_list = null;
      }
      validate_spz_spp(v_spz,'Area of Use SPZ');
      v_spz_count = v_spz_count+1;
    }
    // -- if superior provenance == N, only one SPZ == allowed
    if (g_superior_prvnc_ind == 'N' && v_spz_count > 1) {
      g_error_message = g_error_message || 'spar.web.error.usr.database.provenanceNo_SPZ_Limit;';
    }
    validate_tested_untested_ratio();
  }
}

/*
 * Procedure: validate (OVERLOADED)
 * Purpose:   These are the validations from the original SPR01 Seedlot Maintenance page.
 */
function validate(p_spz1Z: string) {
  get_previous_seedlot_values();
  if (g_seedlot_status_code = 'COM') {
    validate_genetic_class();
    validate_orchard_id();
    validate_collection_locn();
    validate_coast_geo(p_spz1);
    validate_mean_elevation();
    validate_mean_latitude();
    validate_min_latitude();
    validate_max_latitude();
    validate_mean_longitude();
    validate_min_longitude();
    validate_max_longitude();
    validate_bgc_zone();
    validate_collection_start();
    validate_collection_end();
    validate_vol_per_container();
    validate_nmbr_trees();
    validate_cone_collection();
  }
}

/*
 * Procedure: get_seedlot_spz_list
 * Purpose:   Returns a comma delimited list of Area of Use Seed Planning
 *            Zones for a Seedlot.
 *            Written as a function so that it may be used outside of this package.
 */
function get_seedlot_spz_list(p_seedlot_number:string | null): string {
  // CURSOR c_spz IS:
  let v_spz_list: string; // VARCHAR2(100);
  /*
  SELECT seed_plan_zone_code
    FROM seedlot_plan_zone
    WHERE seedlot_number = p_seedlot_number
    ORDER BY DECODE(primary_ind,'Y',1,2) --sort primary_ind to top
          , seed_plan_zone_code;
  */

  // --Get comma delim list of SPZ's
  for (let r_spz in c_spz) {
    v_spz_list = v_spz_list || r_spz.seed_plan_zone_code || ',';
  }
  v_spz_list = RTRIM(v_spz_list, ',');
  return v_spz_list;
}

/*
 * Procedure: get_seedlot_spz_id_list
 * Purpose:   Returns a comma delimited list of Area of Use Seed Planning
 *            Zone Ids for a Seedlot.
 *            Written as a function so that it may be used outside of this
 *            package.
 */
function get_seedlot_spz_id_list(p_seedlot_number :string): string {
  // CURSOR c_spz IS:
  /*
  SELECT spr_get_seed_plan_zone_Id(spz.SEED_PLAN_ZONE_CODE, seedlot.genetic_class_code, seedlot.vegetation_code) AS spz_id
    FROM seedlot_plan_zone spz, SEEDLOT seedlot
    WHERE spz.seedlot_number = seedlot.seedlot_number && spz.seedlot_number = p_seedlot_number;
  */
  let v_spz_list: string; // VARCHAR2(100);
  
  // --Get comma delim list of SPZ's
  for (let r_spz in c_spz) {
      v_spz_list = v_spz_list || r_spz.spz_id || ',';
  }
  v_spz_list = RTRIM(v_spz_list,',');
  return v_spz_list;
}

/*
 * Procedure: is_lot_split
 * Purpose:   Returns true of the lot has been split, otherwise returns false.
 *            Currently, the only was to tell if (a lot has been split == if
 *            the lot has an ASP request && has heritage.
 */
function is_lot_split (p_seedlot_number :string): boolean {
  // CURSOR c_asp IS
  /*
  SELECT COUNT(1)
    FROM request_seedlot rs
        , spar_request sr
    WHERE rs.seedlot_number = p_seedlot_number
      && sr.request_skey = rs.request_skey
      && sr.request_type_code = 'ASP';
  */
  
  // CURSOR c_heritage IS:
  /*
  SELECT COUNT(1)
    FROM seedlot_heritage
    WHERE parent_seedlot_no = p_seedlot_number || child_seedlot_no = p_seedlot_number;
  */
  let b_is_lot_split: boolean;
  let v_count: number; // NUMBER(10);
  
  b_is_lot_split = false;
  // --ASP request exists
  // OPEN c_asp; FETCH c_asp INTO v_count; CLOSE c_asp;
  if (v_count > 0) {
    // OPEN c_heritage; FETCH c_heritage INTO v_count; CLOSE c_heritage;
    b_is_lot_split = v_count > 0;
  }
  return b_is_lot_split;
}

/*
 * Procedure: get
 * Purpose:   Retrieve ONE Seedlot row && associated Genetic Worth && Seed Plan Zone information.
 * Security:  HQ users can access all; otherwise:
 *            if (user == a client or BCTS, access == allowed by
 *              applicant_client_number = user client number
 *            if (user == an org, access == allowed by
 *               applicant_client_number = org unit resolving to a client number
 */
function get(p_user_client_number: string, p_user_org_unit_no: number) {
  let v_user_client_number: string; // g_applicant_client_number%TYPE;
  let v_tested: number; // NUMBER(5);
  let v_total: number; // NUMBER(5);
  
  // --if user != a client, resolve org to its client number
  v_user_client_number = p_user_client_number == null? sil_get_org_cli_number(p_user_org_unit_no) : p_user_client_number;
  /*
  SELECT * INTO
      g_seedlot_number
    ,g_to_be_registrd_ind
    ,g_registered_seed_ind
    ,g_seedlot_status_code
    ,g_vegetation_code
    ,g_genetic_class_code
    ,g_superior_prvnc_ind
    ,g_seedlot_source_code
    ,g_bc_source_ind
    ,g_applicant_client_number
    ,g_applicant_client_locn
    ,g_applicant_email_address
    ,g_org_unit_no
    ,g_collection_locn_desc
    ,g_provenance_id
    ,g_coll_st&&ard_met_ind
    ,g_collection_elevation
    ,g_collection_elevation_min
    ,g_collection_elevation_max
    ,g_collection_area_radius
    ,g_collection_lat_deg
    ,g_collection_lat_min
    ,g_collection_lat_sec
    ,g_collection_latitude_code
    ,g_collection_long_deg
    ,g_collection_long_min
    ,g_collection_long_sec
    ,g_collection_longitude_code
    ,g_seed_plan_zone_code
    ,g_seed_plan_zone_id
    ,g_collection_spz_ind
    ,g_seed_coast_area_code
    ,g_bgc_zone_code
    ,g_bgc_subzone_code
    ,g_variant
    ,g_bec_version_id
    ,g_collection_bgc_ind
    ,g_collection_start_date
    ,g_collection_end_date
    ,g_cone_collection_method_cd
    ,g_cone_collection_method2_cd
    ,g_nmbr_trees_from_code
    ,g_no_of_containers
    ,g_vol_per_container
    ,g_clctn_volume
    ,g_seedlot_comment
    ,g_collection_cli_number
    ,g_collection_cli_locn_cd
    ,g_orchard_id
    ,g_coancestry
    ,g_effective_pop_size
    ,g_seed_plan_unit_id
    ,g_elevation_min
    ,g_elevation_max
    ,g_latitude_deg_min
    ,g_latitude_min_min
    ,g_latitude_sec_min
    ,g_latitude_deg_max
    ,g_latitude_min_max
    ,g_latitude_sec_max
    ,g_longitude_deg_min
    ,g_longitude_min_min
    ,g_longitude_sec_min
    ,g_longitude_deg_max
    ,g_longitude_min_max
    ,g_longitude_sec_max
    ,g_interm_strg_client_number
    ,g_interm_strg_client_locn
    ,g_interm_strg_st_date
    ,g_interm_strg_end_date
    ,g_interm_facility_code
    ,g_interm_strg_locn
    ,g_extrct_cli_number
    ,g_extrct_cli_locn_cd
    ,g_extraction_st_date
    ,g_extraction_end_date
    ,g_original_seed_qty
    ,g_temporary_storage_end_date
    ,g_temporary_storage_start_dt
    ,g_seed_store_client_number
    ,g_seed_store_client_locn
    ,g_secondary_orchard_id
    ,g_orchard_comment
    ,g_smp_mean_bv_GVO
    ,g_smp_success_pct
    ,g_female_gametic_mthd_code
    ,g_male_gametic_mthd_code
    ,g_pollen_contamination_ind
    ,g_pollen_contamination_pct
    ,g_controlled_cross_ind
    ,g_biotech_processes_ind
    ,g_contaminant_pollen_bv
    ,g_pollen_contam_mthd_code
    ,g_orchard_contamination_pct
    ,g_total_parent_trees
    ,g_smp_parents_outside
    ,g_declared_userid
    ,g_declared_timestamp
    ,g_update_userid
    ,g_update_timestamp
    ,g_entry_userid
    ,g_entry_timestamp
    ,g_approved_userid
    ,g_approved_timestamp
    ,g_revision_count
    ,g_gw_AD
    ,g_gw_DFS
    ,g_gw_DFU
    ,g_gw_DFW
    ,g_gw_DSB
    ,g_gw_DSC
    ,g_gw_DSG
    ,g_gw_GVO
    ,g_gw_IWS
    ,g_gw_WDU
    ,g_gw_WVE
    ,g_gw_WWD
  FROM (
     SELECT DISTINCT
         s.seedlot_number
        ,s.to_be_registrd_ind
        ,s.registered_seed_ind
        ,s.seedlot_status_code
        ,s.vegetation_code
        ,s.genetic_class_code
        ,s.superior_prvnc_ind
        ,s.seedlot_source_code
        ,s.bc_source_ind
        ,s.applicant_client_number
        ,s.applicant_client_locn
        ,s.applicant_email_address
        ,s.org_unit_no
        ,s.collection_locn_desc
        ,s.provenance_id
        ,s.collection_st&&ard_met_ind
        ,s.collection_elevation
        ,s.collection_elevation_min
        ,s.collection_elevation_max
        ,s.collection_area_radius
        ,s.collection_lat_deg
        ,s.collection_lat_min
        ,s.collection_lat_sec
        ,s.collection_latitude_code
        ,s.collection_long_deg
        ,s.collection_long_min
        ,s.collection_long_sec
        ,s.collection_longitude_code
        ,s.seed_plan_zone_code
        ,spr_get_seed_plan_zone_Id(s.seed_plan_zone_code,s.genetic_class_code,s.vegetation_code) seed_plan_zone_id
        ,s.collection_seed_plan_zone_ind collection_spz_ind
        ,s.seed_coast_area_code
        ,s.bgc_zone_code
        ,s.bgc_subzone_code
        ,s.variant
        ,s.bec_version_id
        ,s.collection_bgc_ind
        ,s.collection_start_date
        ,s.collection_end_date
        ,s.cone_collection_method_code
        ,s.cone_collection_method2_code
        ,s.nmbr_trees_from_code
        ,s.no_of_containers
        ,s.vol_per_container
        ,s.clctn_volume
        ,s.seedlot_comment
        ,s.collection_cli_number
        ,s.collection_cli_locn_cd
        ,s.orchard_id
        ,s.coancestry
        ,s.effective_pop_size
        ,s.seed_plan_unit_id
        ,s.elevation_min
        ,s.elevation_max
        ,s.latitude_deg_min
        ,s.latitude_min_min
        ,s.latitude_sec_min
        ,s.latitude_deg_max
        ,s.latitude_min_max
        ,s.latitude_sec_max
        ,s.longitude_deg_min
        ,s.longitude_min_min
        ,s.longitude_sec_min
        ,s.longitude_deg_max
        ,s.longitude_min_max
        ,s.longitude_sec_max
        ,s.interm_strg_client_number
        ,s.interm_strg_client_locn
        ,s.interm_strg_st_date
        ,s.interm_strg_end_date
        ,s.interm_facility_code
        ,s.interm_strg_locn
        ,s.extrct_cli_number
        ,s.extrct_cli_locn_cd
        ,s.extraction_st_date
        ,s.extraction_end_date
        ,s.original_seed_qty
        ,s.temporary_storage_end_date
        ,s.temporary_storage_start_date
        ,s.seed_store_client_number
        ,s.seed_store_client_locn
        ,s.secondary_orchard_id
        ,s.orchard_comment
        ,s.smp_mean_bv_growth
        ,s.smp_success_pct
        ,s.female_gametic_mthd_code
        ,s.male_gametic_mthd_code
        ,s.pollen_contamination_ind
        ,s.pollen_contamination_pct
        ,s.controlled_cross_ind
        ,s.biotech_processes_ind
        ,s.contaminant_pollen_bv
        ,s.pollen_contamination_mthd_code
        ,s.orchard_contamination_pct
        ,s.total_parent_trees
        ,s.smp_parents_outside
        ,s.declared_userid
        ,s.declared_timestamp
        ,s.update_userid
        ,s.update_timestamp
        ,s.entry_userid
        ,s.entry_timestamp
        ,s.approved_userid
        ,s.approved_timestamp
        ,s.revision_count
        ,gw.genetic_worth_code
        ,gw.genetic_worth_rtng
      FROM seedlot s
           , seedlot_genetic_worth gw
    WHERE s.seedlot_number = g_seedlot_number
      && (s.applicant_client_number = v_user_client_number
           || s.applicant_client_number IN (select client_number
                                              from org_client_xref
                                             where client_number = v_user_client_number
                                                or org_unit_no = p_user_org_unit_no)
           || s.seedlot_number IN (select seedlot_number
                                     from seedlot_owner_quantity
                                    where seedlot_number = g_seedlot_number
                                      && client_number = v_user_client_number)
           || sil_get_org_level(p_user_org_unit_no) = 'H')
      && gw.seedlot_number(+) = s.seedlot_number
  )
  PIVOT
   (MAX(genetic_worth_rtng)
   FOR (genetic_worth_code)
     IN (('AD') as bv_AD,
         ('DFS') as bv_DFS,
         ('DFU') as bv_DFU,
         ('DFW') as bv_DFW,
         ('DSB') as bv_DSB,
         ('DSC') as bv_DSC,
         ('DSG') as bv_DSG,
         ('GVO') as bv_GVO,
         ('IWS') as bv_IWS,
         ('WDU') as bv_WDU,
         ('WVE') as bv_WVE,
         ('WWD') as bv_WWD));
  */
  set_spz_list(get_seedlot_spz_list(g_seedlot_number));
  set_spz_id_list(get_seedlot_spz_id_list(g_seedlot_number));
  g_is_lot_split = is_lot_split(g_seedlot_number);

  if ('NO_DATA_FOUND') {
    throw new Error('NO_DATA_FOUND');   
  }
}

/*
 * Procedure: set_status_defaults
 * Purpose:   Set defaults that depend on Status
 */
function set_status_defaults() {
  // --Did we already get previous data?
  if (g_revision_count != null && r_previous.seedlot_number == null) {
    get_previous_seedlot_values();
  }
  // --if approving, set approved userid/timestamp
  if (g_seedlot_status_code == 'APP' && NVL(r_previous.seedlot_status_code,'~') != 'APP' && r_previous.approved_userid == null) {
    set_approved_userid(g_update_userid);
    set_approved_timestamp(new Date());
    // --In case skipped SUB status, set declaration data to approver
    if (g_update_userid == null) {
      set_declared_userid(g_update_userid);
      set_declared_timestamp(new Date());
    }
  }
  // --if(submitting, set declared userid/timestamp
  if (g_seedlot_status_code == 'SUB' && NVL(r_previous.seedlot_status_code,'~') != 'SUB' && r_previous.declared_userid == null) {
    set_declared_userid(g_update_userid);
    set_declared_timestamp(new Date());
  }
}

/*
 * Procedure: add
 * Purpose:  INSERT one row into SEEDLOT
 */
function add() {
  let v_seedlot_number: number; // NUMBER(6);
  let e_error_generating_lot_number: Error;
  
  // --Generate new number if none provided
  if (g_seedlot_number == null) {
    if (g_genetic_class_code == 'B') {
      /*
      SELECT MAX(TO_NUMBER(seedlot_number)) + 1
        INTO v_seedlot_number
        FROM seedlot
      WHERE seedlot_number BETWEEN CONST_CLASS_B_LOTNUM_MIN && TO_CHAR(TO_NUMBER(CONST_CLASS_B_LOTNUM_MAX)-1 );
      */
      if (v_seedlot_number >= CONST_CLASS_B_LOTNUM_MAX) {
        throw new Error(e_error_generating_lot_number);
      } else if (v_seedlot_number == null) {
        g_seedlot_number = CONST_CLASS_B_LOTNUM_MIN + 1;
      } else {
        g_seedlot_number = v_seedlot_number;
      }
    } else if (g_genetic_class_code == 'A') {
      /*
      SELECT MAX(TO_NUMBER(seedlot_number)) + 1
        INTO v_seedlot_number
        FROM seedlot
      WHERE seedlot_number BETWEEN CONST_CLASS_A_LOTNUM_MIN && TO_CHAR(TO_NUMBER(CONST_CLASS_A_LOTNUM_MAX)-1 );
      */
      if (v_seedlot_number >= CONST_CLASS_A_LOTNUM_MAX) {
        throw new Error(e_error_generating_lot_number);
      } else if (v_seedlot_number == null) {
        g_seedlot_number = CONST_CLASS_A_LOTNUM_MIN + 1;
      } else {
        g_seedlot_number = v_seedlot_number;
      }
    }
  }
    
  // --Defaults for a new seedlot, taken from old SPR01 package
  set_stored_cli_number('00012797');
  set_stored_cli_locn_cd('00');
  set_original_seed_qty(0);
  set_extraction_volume(null);
  set_utm_easting(0);
  set_utm_northing(0);
  set_utm_zone(0);
  set_registered_seed_ind('N');
  
  // --Set Mean Area of Use geography to Mean Collection geography.
  // --Should already have been done in recalc() but IMPORTANT, thus insurance.
  set_mean_area_of_use_geography();
  //--Set items that depend on status
  set_status_defaults();

  /*
  INSERT INTO seedlot (seedlot_number, seedlot_status_code, vegetation_code, genetic_class_code,
    collection_source_code, superior_prvnc_ind, org_unit_no, registered_seed_ind, to_be_registrd_ind,
    registered_date, fs721a_signed_ind, nad_datum_code, utm_zone, utm_easting, utm_northing,
    longitude_degrees, longitude_minutes, longitude_deg_min, longitude_min_min, longitude_deg_max,
    longitude_min_max, latitude_degrees, latitude_minutes, latitude_deg_min, latitude_min_min,
    latitude_deg_max ,latitude_min_max, seed_coast_area_code, elevation, elevation_min, elevation_max,
    orchard_id, collection_locn_desc, collection_cli_number, collection_cli_locn_cd, collection_start_date,
    collection_end_date, cone_collection_method_code, no_of_containers, clctn_volume, vol_per_container,
    nmbr_trees_from_code, coancestry, effective_pop_size, original_seed_qty, interm_strg_st_date,
    interm_strg_end_date, interm_facility_code, extraction_st_date, extraction_end_date, extraction_volume,
    extrct_cli_number, extrct_cli_locn_cd, stored_cli_number, stored_cli_locn_cd, lngterm_strg_st_date,
    historical_tsr_date, collection_lat_deg, collection_lat_min, collection_latitude_code, collection_long_deg,
    collection_long_min, collection_longitude_code, collection_elevation, collection_elevation_min,
    collection_elevation_max, entry_timestamp, entry_userid, update_timestamp, update_userid,
    approved_timestamp, approved_userid, revision_count, interm_strg_locn, interm_strg_cmt, ownership_comment,
    cone_seed_desc, extraction_comment, seedlot_comment, bgc_zone_code, bgc_subzone_code, variant,
    bec_version_id, collection_lat_sec, collection_long_sec, latitude_seconds, longitude_seconds,
    seed_plan_zone_code, applicant_client_locn, applicant_client_number, applicant_email_address,
    bc_source_ind, biotech_processes_ind, collection_area_radius, collection_bgc_ind,
    collection_seed_plan_zone_ind, collection_st&&ard_met_ind, cone_collection_method2_code,
    contaminant_pollen_bv, controlled_cross_ind, declared_userid, declared_timestamp, female_gametic_mthd_code,
    latitude_sec_max, latitude_sec_min, longitude_sec_max, longitude_sec_min, male_gametic_mthd_code,
    orchard_comment, orchard_contamination_pct, pollen_contamination_ind, pollen_contamination_mthd_code,
    pollen_contamination_pct, provenance_id, secondary_orchard_id, seed_plan_unit_id, seed_store_client_locn,
    seed_store_client_number, seedlot_source_code, smp_mean_bv_growth, smp_parents_outside, smp_success_pct,
    temporary_storage_end_date, temporary_storage_start_date, total_parent_trees, interm_strg_client_number, interm_strg_client_locn)
  VALUES (g_seedlot_number, g_seedlot_status_code, g_vegetation_code, g_genetic_class_code, g_collection_source_code,
    g_superior_prvnc_ind, g_org_unit_no, g_registered_seed_ind, g_to_be_registrd_ind, g_registered_date,
    g_fs721a_signed_ind, g_nad_datum_code, g_utm_zone, g_utm_easting, g_utm_northing, g_longitude_degrees,
    g_longitude_minutes, g_longitude_deg_min, g_longitude_min_min, g_longitude_deg_max, g_longitude_min_max,
    g_latitude_degrees, g_latitude_minutes, g_latitude_deg_min, g_latitude_min_min, g_latitude_deg_max,
    g_latitude_min_max, g_seed_coast_area_code, g_elevation, g_elevation_min, g_elevation_max, g_orchard_id,
    g_collection_locn_desc, g_collection_cli_number, g_collection_cli_locn_cd, g_collection_start_date,
    g_collection_end_date, g_cone_collection_method_cd, g_no_of_containers, g_clctn_volume, g_vol_per_container,
    g_nmbr_trees_from_code, g_coancestry, g_effective_pop_size, g_original_seed_qty, g_interm_strg_st_date,
    g_interm_strg_end_date, g_interm_facility_code, g_extraction_st_date, g_extraction_end_date, g_extraction_volume,
    g_extrct_cli_number, g_extrct_cli_locn_cd, g_stored_cli_number, g_stored_cli_locn_cd, g_lngterm_strg_st_date,
    g_historical_tsr_date, g_collection_lat_deg, g_collection_lat_min, g_collection_latitude_code,
    g_collection_long_deg, g_collection_long_min, g_collection_longitude_code, g_collection_elevation,
    g_collection_elevation_min, g_collection_elevation_max, g_entry_timestamp, g_entry_userid,
    g_update_timestamp, g_update_userid, g_approved_timestamp, g_approved_userid, g_revision_count,
    g_interm_strg_locn, g_interm_strg_cmt, g_ownership_comment, g_cone_seed_desc, g_extraction_comment,
    g_seedlot_comment, g_bgc_zone_code, g_bgc_subzone_code, g_variant, g_bec_version_id,
    g_collection_lat_sec, g_collection_long_sec, g_latitude_seconds, g_longitude_seconds, g_seed_plan_zone_code,
    g_applicant_client_locn, g_applicant_client_number, g_applicant_email_address, g_bc_source_ind,
    g_biotech_processes_ind, g_collection_area_radius, g_collection_bgc_ind, g_collection_spz_ind,
    g_coll_standard_met_ind, g_cone_collection_method2_cd, g_contaminant_pollen_bv, g_controlled_cross_ind,
    g_declared_userid, g_declared_timestamp, g_female_gametic_mthd_code, g_latitude_sec_max, g_latitude_sec_min,
    g_longitude_sec_max, g_longitude_sec_min, g_male_gametic_mthd_code, g_orchard_comment, g_orchard_contamination_pct,
    g_pollen_contamination_ind, g_pollen_contam_mthd_code, g_pollen_contamination_pct, g_provenance_id,
    g_secondary_orchard_id, g_seed_plan_unit_id, g_seed_store_client_locn, g_seed_store_client_number,
    g_seedlot_source_code, g_smp_mean_bv_GVO, g_smp_parents_outside, g_smp_success_pct,
    g_temporary_storage_end_date, g_temporary_storage_start_dt, g_total_parent_trees, g_interm_strg_client_number,
    g_interm_strg_client_locn);
  */
  if (e_error_generating_lot_number) {
    throw new Error(g_error_message = g_error_message || 'spar.web.error.usr.gen_lot_number;';);
  }     
}

/*
 * Procedure: change
 * Purpose:   UPDATE one SEEDLOT row
 */
function change() {
  if (g_seedlot_status_code != 'CAN') {
    // --Set Mean Area of Use geography to Mean Collection geography.
    // --Should already have been done in recalc() but IMPORTANT, thus insurance.
    set_mean_area_of_use_geography();
    // --Set items that depend on status
    set_status_defaults();
  }
  /*
  UPDATE seedlot
      SET seedlot_status_code              = DECODE(gb_seedlot_status_code,'Y',g_seedlot_status_code,seedlot_status_code)
        ,vegetation_code                  = DECODE(gb_vegetation_code,'Y',g_vegetation_code,vegetation_code)
        ,genetic_class_code               = DECODE(gb_genetic_class_code,'Y',g_genetic_class_code,genetic_class_code)
        ,collection_source_code           = DECODE(gb_collection_source_code,'Y',g_collection_source_code,collection_source_code)
        ,superior_prvnc_ind               = DECODE(gb_superior_prvnc_ind,'Y',g_superior_prvnc_ind,superior_prvnc_ind)
        ,org_unit_no                      = DECODE(gb_org_unit_no,'Y',g_org_unit_no,org_unit_no)
        ,registered_seed_ind              = DECODE(gb_registered_seed_ind,'Y',g_registered_seed_ind,registered_seed_ind)
        ,to_be_registrd_ind               = DECODE(gb_to_be_registrd_ind,'Y',g_to_be_registrd_ind,to_be_registrd_ind)
        ,registered_date                  = DECODE(gb_registered_date,'Y',g_registered_date,registered_date)
        ,fs721a_signed_ind                = DECODE(gb_fs721a_signed_ind,'Y',g_fs721a_signed_ind,fs721a_signed_ind)
        ,nad_datum_code                   = DECODE(gb_nad_datum_code,'Y',g_nad_datum_code,nad_datum_code)
        ,utm_zone                         = DECODE(gb_utm_zone,'Y',g_utm_zone,utm_zone)
        ,utm_easting                      = DECODE(gb_utm_easting,'Y',g_utm_easting,utm_easting)
        ,utm_northing                     = DECODE(gb_utm_northing,'Y',g_utm_northing,utm_northing)
        ,longitude_degrees                = DECODE(gb_longitude_degrees,'Y',g_longitude_degrees,longitude_degrees)
        ,longitude_minutes                = DECODE(gb_longitude_minutes,'Y',g_longitude_minutes,longitude_minutes)
        ,longitude_deg_min                = DECODE(gb_longitude_deg_min,'Y',g_longitude_deg_min,longitude_deg_min)
        ,longitude_min_min                = DECODE(gb_longitude_min_min,'Y',g_longitude_min_min,longitude_min_min)
        ,longitude_deg_max                = DECODE(gb_longitude_deg_max,'Y',g_longitude_deg_max,longitude_deg_max)
        ,longitude_min_max                = DECODE(gb_longitude_min_max,'Y',g_longitude_min_max,longitude_min_max)
        ,latitude_degrees                 = DECODE(gb_latitude_degrees,'Y',g_latitude_degrees,latitude_degrees)
        ,latitude_minutes                 = DECODE(gb_latitude_minutes,'Y',g_latitude_minutes,latitude_minutes)
        ,latitude_deg_min                 = DECODE(gb_latitude_deg_min,'Y',g_latitude_deg_min,latitude_deg_min)
        ,latitude_min_min                 = DECODE(gb_latitude_min_min,'Y',g_latitude_min_min,latitude_min_min)
        ,latitude_deg_max                 = DECODE(gb_latitude_deg_max,'Y',g_latitude_deg_max,latitude_deg_max)
        ,latitude_min_max                 = DECODE(gb_latitude_min_max,'Y',g_latitude_min_max,latitude_min_max)
        ,seed_coast_area_code             = DECODE(gb_seed_coast_area_code,'Y',g_seed_coast_area_code,seed_coast_area_code)
        ,elevation                        = DECODE(gb_elevation,'Y',g_elevation,elevation)
        ,elevation_min                    = DECODE(gb_elevation_min,'Y',g_elevation_min,elevation_min)
        ,elevation_max                    = DECODE(gb_elevation_max,'Y',g_elevation_max,elevation_max)
        ,orchard_id                       = DECODE(gb_orchard_id,'Y',g_orchard_id,orchard_id)
        ,collection_locn_desc             = DECODE(gb_collection_locn_desc,'Y',g_collection_locn_desc,collection_locn_desc)
        ,collection_cli_number            = DECODE(gb_collection_cli_number,'Y',g_collection_cli_number,collection_cli_number)
        ,collection_cli_locn_cd           = DECODE(gb_collection_cli_locn_cd,'Y',g_collection_cli_locn_cd,collection_cli_locn_cd)
        ,collection_start_date            = DECODE(gb_collection_start_date,'Y',g_collection_start_date,collection_start_date)
        ,collection_end_date              = DECODE(gb_collection_end_date,'Y',g_collection_end_date,collection_end_date)
        ,cone_collection_method_code      = DECODE(gb_cone_collection_method_cd,'Y',g_cone_collection_method_cd,cone_collection_method_code)
        ,no_of_containers                 = DECODE(gb_no_of_containers,'Y',g_no_of_containers,no_of_containers)
        ,clctn_volume                     = DECODE(gb_clctn_volume,'Y',g_clctn_volume,clctn_volume)
        ,vol_per_container                = DECODE(gb_vol_per_container,'Y',g_vol_per_container,vol_per_container)
        ,nmbr_trees_from_code             = DECODE(gb_nmbr_trees_from_code,'Y',g_nmbr_trees_from_code,nmbr_trees_from_code)
        ,coancestry                       = DECODE(gb_coancestry,'Y',g_coancestry,coancestry)
        ,effective_pop_size               = DECODE(gb_effective_pop_size,'Y',g_effective_pop_size,effective_pop_size)
        ,original_seed_qty                = DECODE(gb_original_seed_qty,'Y',g_original_seed_qty,original_seed_qty)
        ,interm_strg_client_number        = DECODE(gb_interm_strg_client_number,'Y',g_interm_strg_client_number,interm_strg_client_number)
        ,interm_strg_client_locn          = DECODE(gb_interm_strg_client_locn,'Y',g_interm_strg_client_locn,interm_strg_client_locn)
        ,interm_strg_st_date              = DECODE(gb_interm_strg_st_date,'Y',g_interm_strg_st_date,interm_strg_st_date)
        ,interm_strg_end_date             = DECODE(gb_interm_strg_end_date,'Y',g_interm_strg_end_date,interm_strg_end_date)
        ,interm_facility_code             = DECODE(gb_interm_facility_code,'Y',g_interm_facility_code,interm_facility_code)
        ,extraction_st_date               = DECODE(gb_extraction_st_date,'Y',g_extraction_st_date,extraction_st_date)
        ,extraction_end_date              = DECODE(gb_extraction_end_date,'Y',g_extraction_end_date,extraction_end_date)
        ,extraction_volume                = DECODE(gb_extraction_volume,'Y',g_extraction_volume,extraction_volume)
        ,extrct_cli_number                = DECODE(gb_extrct_cli_number,'Y',g_extrct_cli_number,extrct_cli_number)
        ,extrct_cli_locn_cd               = DECODE(gb_extrct_cli_locn_cd,'Y',g_extrct_cli_locn_cd,extrct_cli_locn_cd)
        ,stored_cli_number                = DECODE(gb_stored_cli_number,'Y',g_stored_cli_number,stored_cli_number)
        ,stored_cli_locn_cd               = DECODE(gb_stored_cli_locn_cd,'Y',g_stored_cli_locn_cd,stored_cli_locn_cd)
        ,lngterm_strg_st_date             = DECODE(gb_lngterm_strg_st_date,'Y',g_lngterm_strg_st_date,lngterm_strg_st_date)
        ,historical_tsr_date              = DECODE(gb_historical_tsr_date,'Y',g_historical_tsr_date,historical_tsr_date)
        ,collection_lat_deg               = DECODE(gb_collection_lat_deg,'Y',g_collection_lat_deg,collection_lat_deg)
        ,collection_lat_min               = DECODE(gb_collection_lat_min,'Y',g_collection_lat_min,collection_lat_min)
        ,collection_latitude_code         = DECODE(gb_collection_latitude_code,'Y',g_collection_latitude_code,collection_latitude_code)
        ,collection_long_deg              = DECODE(gb_collection_long_deg,'Y',g_collection_long_deg,collection_long_deg)
        ,collection_long_min              = DECODE(gb_collection_long_min,'Y',g_collection_long_min,collection_long_min)
        ,collection_longitude_code        = DECODE(gb_collection_longitude_code,'Y',g_collection_longitude_code,collection_longitude_code)
        ,collection_elevation             = DECODE(gb_collection_elevation,'Y',g_collection_elevation,collection_elevation)
        ,collection_elevation_min         = DECODE(gb_collection_elevation_min,'Y',g_collection_elevation_min,collection_elevation_min)
        ,collection_elevation_max         = DECODE(gb_collection_elevation_max,'Y',g_collection_elevation_max,collection_elevation_max)
        ,approved_timestamp               = DECODE(gb_approved_timestamp,'Y',g_approved_timestamp,approved_timestamp)
        ,approved_userid                  = DECODE(gb_approved_userid,'Y',g_approved_userid,approved_userid)
        ,interm_strg_locn                 = DECODE(gb_interm_strg_locn,'Y',g_interm_strg_locn,interm_strg_locn)
        ,interm_strg_cmt                  = DECODE(gb_interm_strg_cmt,'Y',g_interm_strg_cmt,interm_strg_cmt)
        ,ownership_comment                = DECODE(gb_ownership_comment,'Y',g_ownership_comment,ownership_comment)
        ,cone_seed_desc                   = DECODE(gb_cone_seed_desc,'Y',g_cone_seed_desc,cone_seed_desc)
        ,extraction_comment               = DECODE(gb_extraction_comment,'Y',g_extraction_comment,extraction_comment)
        ,seedlot_comment                  = DECODE(gb_seedlot_comment,'Y',g_seedlot_comment,seedlot_comment)
        ,bgc_zone_code                    = DECODE(gb_bgc_zone_code,'Y',g_bgc_zone_code,bgc_zone_code)
        ,bgc_subzone_code                 = DECODE(gb_bgc_subzone_code,'Y',g_bgc_subzone_code,bgc_subzone_code)
        ,variant                          = DECODE(gb_variant,'Y',g_variant,variant)
        ,bec_version_id                   = DECODE(gb_bec_version_id,'Y',g_bec_version_id,bec_version_id)
        ,collection_lat_sec               = DECODE(gb_collection_lat_sec,'Y',g_collection_lat_sec,collection_lat_sec)
        ,collection_long_sec              = DECODE(gb_collection_long_sec,'Y',g_collection_long_sec,collection_long_sec)
        ,latitude_seconds                 = DECODE(gb_latitude_seconds,'Y',g_latitude_seconds,latitude_seconds)
        ,longitude_seconds                = DECODE(gb_longitude_seconds,'Y',g_longitude_seconds,longitude_seconds)
        ,seed_plan_zone_code              = DECODE(gb_seed_plan_zone_code,'Y',g_seed_plan_zone_code,seed_plan_zone_code)
        ,applicant_client_locn            = DECODE(gb_applicant_client_locn,'Y',g_applicant_client_locn,applicant_client_locn)
        ,applicant_client_number          = DECODE(gb_applicant_client_number,'Y',g_applicant_client_number,applicant_client_number)
        ,applicant_email_address          = DECODE(gb_applicant_email_address,'Y',g_applicant_email_address,applicant_email_address)
        ,bc_source_ind                    = DECODE(gb_bc_source_ind,'Y',g_bc_source_ind,bc_source_ind)
        ,biotech_processes_ind            = DECODE(gb_biotech_processes_ind,'Y',g_biotech_processes_ind,biotech_processes_ind)
        ,collection_area_radius           = DECODE(gb_collection_area_radius,'Y',g_collection_area_radius,collection_area_radius)
        ,collection_bgc_ind               = DECODE(gb_collection_bgc_ind,'Y',g_collection_bgc_ind,collection_bgc_ind)
        ,collection_seed_plan_zone_ind    = DECODE(gb_collection_spz_ind,'Y',g_collection_spz_ind,collection_seed_plan_zone_ind)
        ,collection_st&&ard_met_ind      = DECODE(gb_coll_st&&ard_met_ind,'Y',g_coll_st&&ard_met_ind,collection_st&&ard_met_ind)
        ,cone_collection_method2_code     = DECODE(gb_cone_collection_method2_cd,'Y',g_cone_collection_method2_cd,cone_collection_method2_code)
        ,contaminant_pollen_bv            = DECODE(gb_contaminant_pollen_bv,'Y',g_contaminant_pollen_bv,contaminant_pollen_bv)
        ,controlled_cross_ind             = DECODE(gb_controlled_cross_ind,'Y',g_controlled_cross_ind,controlled_cross_ind)
        ,declared_userid                  = DECODE(gb_declared_userid,'Y',g_declared_userid,declared_userid)
        ,declared_timestamp               = DECODE(gb_declared_timestamp,'Y',g_declared_timestamp,declared_timestamp)
        ,female_gametic_mthd_code         = DECODE(gb_female_gametic_mthd_code,'Y',g_female_gametic_mthd_code,female_gametic_mthd_code)
        ,latitude_sec_max                 = DECODE(gb_latitude_sec_max,'Y',g_latitude_sec_max,latitude_sec_max)
        ,latitude_sec_min                 = DECODE(gb_latitude_sec_min,'Y',g_latitude_sec_min,latitude_sec_min)
        ,longitude_sec_max                = DECODE(gb_longitude_sec_max,'Y',g_longitude_sec_max,longitude_sec_max)
        ,longitude_sec_min                = DECODE(gb_longitude_sec_min,'Y',g_longitude_sec_min,longitude_sec_min)
        ,male_gametic_mthd_code           = DECODE(gb_male_gametic_mthd_code,'Y',g_male_gametic_mthd_code,male_gametic_mthd_code)
        ,orchard_comment                  = DECODE(gb_orchard_comment,'Y',g_orchard_comment,orchard_comment)
        ,orchard_contamination_pct        = DECODE(gb_orchard_contamination_pct,'Y',g_orchard_contamination_pct,orchard_contamination_pct)
        ,pollen_contamination_ind         = DECODE(gb_pollen_contamination_ind,'Y',g_pollen_contamination_ind,pollen_contamination_ind)
        ,pollen_contamination_mthd_code   = DECODE(gb_pollen_contam_mthd_code,'Y',g_pollen_contam_mthd_code,pollen_contamination_mthd_code)
        ,pollen_contamination_pct         = DECODE(gb_pollen_contamination_pct,'Y',g_pollen_contamination_pct,pollen_contamination_pct)
        ,provenance_id                    = DECODE(gb_provenance_id,'Y',g_provenance_id,provenance_id)
        ,secondary_orchard_id             = DECODE(gb_secondary_orchard_id,'Y',g_secondary_orchard_id,secondary_orchard_id)
        ,seed_plan_unit_id                = DECODE(gb_seed_plan_unit_id,'Y',g_seed_plan_unit_id,seed_plan_unit_id)
        ,seed_store_client_locn           = DECODE(gb_seed_store_client_locn,'Y',g_seed_store_client_locn,seed_store_client_locn)
        ,seed_store_client_number         = DECODE(gb_seed_store_client_number,'Y',g_seed_store_client_number,seed_store_client_number)
        ,seedlot_source_code              = DECODE(gb_seedlot_source_code,'Y',g_seedlot_source_code,seedlot_source_code)
        ,smp_mean_bv_growth               = DECODE(gb_smp_mean_bv_GVO,'Y',g_smp_mean_bv_GVO,smp_mean_bv_growth)
        ,smp_parents_outside              = DECODE(gb_smp_parents_outside,'Y',g_smp_parents_outside,smp_parents_outside)
        ,smp_success_pct                  = DECODE(gb_smp_success_pct,'Y',g_smp_success_pct,smp_success_pct)
        ,temporary_storage_end_date       = DECODE(gb_temporary_storage_end_date,'Y',g_temporary_storage_end_date,temporary_storage_end_date)
        ,temporary_storage_start_date     = DECODE(gb_temporary_storage_start_dt,'Y',g_temporary_storage_start_dt,temporary_storage_start_date)
        ,total_parent_trees               = DECODE(gb_total_parent_trees,'Y',g_total_parent_trees,total_parent_trees)
        ,update_userid                    = g_update_userid
        ,update_timestamp                 = SYSDATE
        ,revision_count                   = revision_count + 1
    WHERE seedlot_number                   = g_seedlot_number
      && revision_count                   = g_revision_count
    RETURNING revision_count, update_timestamp
        INTO g_revision_count, g_update_timestamp;
  */
  let rowCount: number;
  if (rowCount != 1) {
    g_error_message = g_error_message  || 'spar.web.error.usr.database.record.modified:Seedlot;';
    throw new Error(g_error_message);
  }
}

/*
 * Procedure: remove
 * Purpose:   DELETE one row from SEEDLOT
 */
function remove() {
  /*  
  DELETE FROM seedlot
  WHERE seedlot_number = g_seedlot_number && revision_count = g_revision_count;
  */
}

/*
 * Procedure: validate_new_copy_lot_number
 * Purpose:   Validate the entered seedlot number to be used for the copied seedlot, to make sure no errors.
 */
function validate_new_copy_lot_number(p_new_copy_seedlot_number: string) {
  let v_count: number = 0;
  let b_valid: boolean = true;
  
  // -- Check if the lot number already exists && not INC status.
  /*
  SELECT COUNT('x')
    INTO v_count
    FROM seedlot
    WHERE seedlot_number = p_new_copy_seedlot_number && seedlot_status_code != 'INC'
      || p_new_copy_seedlot_number = g_seedlot_number;
  */
  if (v_count > 0) {
    g_error_message = g_error_message || 'spar.web.error.spr01.usr.seedlot.copy.overwrite:' || 'INC;';
  }
  
  // -- Make sure entered lot number == a valid one.
  // --Check ranges (for pre-numbered FS721 and FS721A forms already issued)
  if (g_genetic_class_code == 'A') {
    // WARN: Possible BUG found in the line below.
    if (p_new_copy_seedlot_number >= CONST_CLASS_B_LOTNUM_MAX+1 || g_genetic_class_code <= TO_NUMBER(CONST_CLASS_A_LOTNUM_MAX)) {
      g_error_message = g_error_message || 'spar.web.error.usr.new_lot_number:' || g_genetic_class_code ||','
                                        || TO_CHAR(TO_NUMBER(CONST_CLASS_B_LOTNUM_MAX)+1)||','
                                        || TO_CHAR(TO_NUMBER(CONST_CLASS_A_LOTNUM_MAX))||';';
    }
  } else if (g_genetic_class_code == 'B') {
    if (p_new_copy_seedlot_number > CONST_CLASS_B_LOTNUM_MAX) {
      g_error_message = g_error_message || 'spar.web.error.usr.new_lot_number:' || g_genetic_class_code ||',00001,'
                                        || TO_CHAR(TO_NUMBER(CONST_CLASS_B_LOTNUM_MAX))||';';
    }
  }
}

/*
 * Procedure: copy_seedlot
 * Purpose:   DELETE one row from SEEDLOT
 */
function copy_seedlot(p_new_copy_seedlot_number: string, p_userid: string) {
  let v_seedlot_number: number; //NUMBER;
  let v_new_seedlot_number: string; // seedlot.seedlot_number%TYPE;
  let v_seedlot_comment: string; // seedlot.seedlot_comment%TYPE;
  let v_count: number; // NUMBER;
  let e_error_generating_lot_number: Error;
  
  if (p_new_copy_seedlot_number == null) {
    // --Generate new number for copied seedlot. 52xxx for B lots, 62xxx for A lots.
    if (g_genetic_class_code == 'B') {
      /*
      SELECT MAX(TO_NUMBER(seedlot_number)) + 1
        INTO v_seedlot_number
        FROM seedlot
        WHERE seedlot_number BETWEEN CONST_CLASS_B_COPY_MIN && CONST_CLASS_B_COPY_MAX;
      */
      if (v_seedlot_number == null || v_seedlot_number >= CONST_CLASS_B_COPY_MAX) {
        throw new Error(e_error_generating_lot_number);
      }
    } else if (g_genetic_class_code == 'A') {
      /*
      SELECT MAX(TO_NUMBER(seedlot_number)) + 1
        INTO v_seedlot_number
        FROM seedlot
        WHERE seedlot_number BETWEEN CONST_CLASS_A_COPY_MIN && CONST_CLASS_A_COPY_MAX;
      */
      if (v_seedlot_number == null || v_seedlot_number >= CONST_CLASS_A_COPY_MAX) {
        throw new Error(e_error_generating_lot_number);
      }
    }
    v_new_seedlot_number = v_seedlot_number;
  } else {
    validate_new_copy_lot_number(p_new_copy_seedlot_number);
    v_new_seedlot_number = p_new_copy_seedlot_number;
  }
  if (g_error_message == null) {
    /*
    SELECT 'COPIED FROM LOT ' || g_seedlot_number || '.  ' || SUBSTR(seedlot_comment, 1, 1950)
      INTO v_seedlot_comment
      FROM seedlot
      WHERE seedlot_number = g_seedlot_number;
    */

    // -- if lot already exists, delete its child records, && overwrite seedlot record.
    /*
    SELECT COUNT('x')
      INTO v_count
    FROM seedlot
    WHERE seedlot_number = v_new_seedlot_number;
    */

    if (v_count >= 1) {
      /*
      DELETE FROM smp_mix_gen_qlty
        WHERE seedlot_number = v_new_seedlot_number;
      DELETE FROM smp_mix
        WHERE seedlot_number = v_new_seedlot_number;
      DELETE FROM seedlot_characteristic
        WHERE seedlot_number = v_new_seedlot_number;
      DELETE FROM seedlot_genetic_worth
        WHERE seedlot_number = v_new_seedlot_number;
      DELETE FROM seedlot_geometry
        WHERE seedlot_number = v_new_seedlot_number;
      DELETE FROM seedlot_collection_geometry
        WHERE seedlot_number = v_new_seedlot_number;
      DELETE FROM seedlot_heritage
        WHERE parent_seedlot_no = v_new_seedlot_number;
      DELETE FROM seedlot_heritage
        WHERE child_seedlot_no = v_new_seedlot_number;
      DELETE FROM seedlot_override
        WHERE seedlot_number = v_new_seedlot_number;
      DELETE FROM seedlot_owner_quantity
        WHERE seedlot_number = v_new_seedlot_number;
      DELETE FROM seedlot_physical_balance
        WHERE seedlot_number = v_new_seedlot_number;
      DELETE FROM seedlot_plan_zone
        WHERE seedlot_number = v_new_seedlot_number;
      DELETE FROM seedlot_parent_tree_gen_qlty
        WHERE seedlot_number = v_new_seedlot_number;
      DELETE FROM seedlot_parent_tree
        WHERE seedlot_number = v_new_seedlot_number;
      DELETE FROM seedlot_transaction
        WHERE seedlot_number = v_new_seedlot_number;
      UPDATE SEEDLOT
          SET seedlot_status_code            = 'INC'
            , vegetation_code                = g_vegetation_code
            , genetic_class_code             = g_genetic_class_code
            , collection_source_code         = g_collection_source_code
            , superior_prvnc_ind             = g_superior_prvnc_ind
            , org_unit_no                    = g_org_unit_no
            , registered_seed_ind            = 'N' -- registered_seed_ind
            , to_be_registrd_ind             = g_to_be_registrd_ind
            , registered_date                = null -- registered_date
            , fs721a_signed_ind              = g_fs721a_signed_ind
            , bc_source_ind                  = g_bc_source_ind
            , nad_datum_code                 = g_nad_datum_code
            , utm_zone                       = g_utm_zone
            , utm_easting                    = g_utm_easting
            , utm_northing                   = g_utm_northing
            , longitude_degrees              = g_longitude_degrees
            , longitude_minutes              = g_longitude_minutes
            , longitude_seconds              = g_longitude_seconds
            , longitude_deg_min              = g_longitude_deg_min
            , longitude_min_min              = g_longitude_min_min
            , longitude_sec_min              = g_longitude_sec_min
            , longitude_deg_max              = g_longitude_deg_max
            , longitude_min_max              = g_longitude_min_max
            , longitude_sec_max              = g_longitude_sec_max
            , latitude_degrees               = g_latitude_degrees
            , latitude_minutes               = g_latitude_minutes
            , latitude_seconds               = g_latitude_seconds
            , latitude_deg_min               = g_latitude_deg_min
            , latitude_min_min               = g_latitude_min_min
            , latitude_sec_min               = g_latitude_sec_min
            , latitude_deg_max               = g_latitude_deg_max
            , latitude_min_max               = g_latitude_min_max
            , latitude_sec_max               = g_latitude_sec_max
            , seed_coast_area_code           = g_seed_coast_area_code
            , elevation                      = g_elevation
            , elevation_min                  = g_elevation_min
            , elevation_max                  = g_elevation_max
            , seed_plan_unit_id              = g_seed_plan_unit_id
            , orchard_id                     = g_orchard_id
            , secondary_orchard_id           = g_secondary_orchard_id
            , collection_locn_desc           = g_collection_locn_desc
            , collection_cli_number          = g_collection_cli_number
            , collection_cli_locn_cd         = g_collection_cli_locn_cd
            , collection_start_date          = g_collection_start_date
            , collection_end_date            = g_collection_end_date
            , cone_collection_method_code    = g_cone_collection_method_cd
            , cone_collection_method2_code   = g_cone_collection_method2_cd
            , collection_lat_deg             = g_collection_lat_deg
            , collection_lat_min             = g_collection_lat_min
            , collection_lat_sec             = g_collection_lat_sec
            , collection_latitude_code       = g_collection_latitude_code
            , collection_long_deg            = g_collection_long_deg
            , collection_long_min            = g_collection_long_min
            , collection_long_sec            = g_collection_long_sec
            , collection_longitude_code      = g_collection_longitude_code
            , collection_elevation           = g_collection_elevation
            , collection_elevation_min       = g_collection_elevation_min
            , collection_elevation_max       = g_collection_elevation_max
            , collection_area_radius         = g_collection_area_radius
            , collection_seed_plan_zone_ind  = g_collection_spz_ind
            , collection_bgc_ind             = g_collection_bgc_ind
            , no_of_containers               = 1 -- no_of_containers
            , clctn_volume                   = 0.01 -- clctn_volume
            , vol_per_container              = 0.01-- vol_per_container
            , nmbr_trees_from_code           = g_nmbr_trees_from_code
            , effective_pop_size             = g_effective_pop_size
            , original_seed_qty              = 0 -- original_seed_qty
            , interm_strg_client_number      = g_interm_strg_client_number
            , interm_strg_client_locn        = g_interm_strg_client_locn
            , interm_strg_st_date            = g_interm_strg_st_date
            , interm_strg_end_date           = g_interm_strg_end_date
            , interm_facility_code           = g_interm_facility_code
            , interm_strg_locn               = g_interm_strg_locn
            , interm_strg_cmt                = g_interm_strg_cmt
            , extraction_st_date             = g_extraction_st_date
            , extraction_end_date            = g_extraction_end_date
            , extraction_volume              = 0 -- extraction_volume
            , extrct_cli_number              = g_extrct_cli_number
            , extrct_cli_locn_cd             = g_extrct_cli_locn_cd
            , extraction_comment             = g_extraction_comment
            , stored_cli_number              = g_stored_cli_number
            , stored_cli_locn_cd             = g_stored_cli_locn_cd
            , lngterm_strg_st_date           = g_lngterm_strg_st_date
            , historical_tsr_date            = g_historical_tsr_date
            , ownership_comment              = g_ownership_comment
            , cone_seed_desc                 = g_cone_seed_desc
            , seedlot_comment                = v_seedlot_comment
            , temporary_storage_start_date   = g_temporary_storage_start_dt
            , temporary_storage_end_date     = g_temporary_storage_end_date
            , collection_st&&ard_met_ind    = g_coll_st&&ard_met_ind
            , applicant_email_address        = g_applicant_email_address
            , biotech_processes_ind          = g_biotech_processes_ind
            , pollen_contamination_ind       = g_pollen_contamination_ind
            , pollen_contamination_pct       = g_pollen_contamination_pct
            , controlled_cross_ind           = g_controlled_cross_ind
            , orchard_comment                = g_orchard_comment
            , total_parent_trees             = g_total_parent_trees
            , smp_parents_outside            = g_smp_parents_outside
            , smp_mean_bv_growth             = g_smp_mean_bv_GVO
            , smp_success_pct                = g_smp_success_pct
            , contaminant_pollen_bv          = g_contaminant_pollen_bv
            , orchard_contamination_pct      = g_orchard_contamination_pct
            , coancestry                     = g_coancestry
            , provenance_id                  = g_provenance_id
            , seed_plan_zone_code            = g_seed_plan_zone_code
            , pollen_contamination_mthd_code = g_pollen_contam_mthd_code
            , applicant_client_number        = g_applicant_client_number
            , applicant_client_locn          = g_applicant_client_locn
            , seed_store_client_number       = g_seed_store_client_number
            , seed_store_client_locn         = g_seed_store_client_locn
            , seedlot_source_code            = g_seedlot_source_code
            , female_gametic_mthd_code       = g_female_gametic_mthd_code
            , male_gametic_mthd_code         = g_male_gametic_mthd_code
            , bgc_zone_code                  = g_bgc_zone_code
            , bgc_subzone_code               = g_bgc_subzone_code
            , variant                        = g_variant
            , bec_version_id                 = g_bec_version_id
            , entry_userid                   = p_userid -- entry_userid
            , entry_timestamp                = SYSDATE -- entry_timestamp
            , update_userid                  = p_userid -- update_userid
            , update_timestamp               = SYSDATE -- update_timestamp
            , approved_userid                = 'COPIED_LOT' -- approved_userid
            , approved_timestamp             = g_approved_timestamp -- retain the approved information, for older seedlots.
            , declared_userid                = null -- declared_userid
            , declared_timestamp             = null -- declared_timestamp
            , revision_count                 = 1 -- revision_count
        WHERE seedlot_number = v_new_seedlot_number;
      */
    } else {
      // -- Copy the SEEDLOT record, with status of INC && userid/timestamp to the
      // -- current user's && current date.
      /*
      INSERT INTO seedlot
            (seedlot_number
            , seedlot_status_code
            , vegetation_code
            , genetic_class_code
            , collection_source_code
            , superior_prvnc_ind
            , org_unit_no
            , registered_seed_ind
            , to_be_registrd_ind
            , registered_date
            , fs721a_signed_ind
            , bc_source_ind
            , nad_datum_code
            , utm_zone
            , utm_easting
            , utm_northing
            , longitude_degrees
            , longitude_minutes
            , longitude_seconds
            , longitude_deg_min
            , longitude_min_min
            , longitude_sec_min
            , longitude_deg_max
            , longitude_min_max
            , longitude_sec_max
            , latitude_degrees
            , latitude_minutes
            , latitude_seconds
            , latitude_deg_min
            , latitude_min_min
            , latitude_sec_min
            , latitude_deg_max
            , latitude_min_max
            , latitude_sec_max
            , seed_coast_area_code
            , elevation
            , elevation_min
            , elevation_max
            , seed_plan_unit_id
            , orchard_id
            , secondary_orchard_id
            , collection_locn_desc
            , collection_cli_number
            , collection_cli_locn_cd
            , collection_start_date
            , collection_end_date
            , cone_collection_method_code
            , cone_collection_method2_code
            , collection_lat_deg
            , collection_lat_min
            , collection_lat_sec
            , collection_latitude_code
            , collection_long_deg
            , collection_long_min
            , collection_long_sec
            , collection_longitude_code
            , collection_elevation
            , collection_elevation_min
            , collection_elevation_max
            , collection_area_radius
            , collection_seed_plan_zone_ind
            , collection_bgc_ind
            , no_of_containers
            , clctn_volume
            , vol_per_container
            , nmbr_trees_from_code
            , effective_pop_size
            , original_seed_qty
            , interm_strg_client_number
            , interm_strg_client_locn
            , interm_strg_st_date
            , interm_strg_end_date
            , interm_facility_code
            , interm_strg_locn
            , interm_strg_cmt
            , extraction_st_date
            , extraction_end_date
            , extraction_volume
            , extrct_cli_number
            , extrct_cli_locn_cd
            , extraction_comment
            , stored_cli_number
            , stored_cli_locn_cd
            , lngterm_strg_st_date
            , historical_tsr_date
            , ownership_comment
            , cone_seed_desc
            , seedlot_comment
            , temporary_storage_start_date
            , temporary_storage_end_date
            , collection_st&&ard_met_ind
            , applicant_email_address
            , biotech_processes_ind
            , pollen_contamination_ind
            , pollen_contamination_pct
            , controlled_cross_ind
            , orchard_comment
            , total_parent_trees
            , smp_parents_outside
            , smp_mean_bv_growth
            , smp_success_pct
            , contaminant_pollen_bv
            , orchard_contamination_pct
            , coancestry
            , provenance_id
            , seed_plan_zone_code
            , pollen_contamination_mthd_code
            , applicant_client_number
            , applicant_client_locn
            , seed_store_client_number
            , seed_store_client_locn
            , seedlot_source_code
            , female_gametic_mthd_code
            , male_gametic_mthd_code
            , bgc_zone_code
            , bgc_subzone_code
            , variant
            , bec_version_id
            , entry_userid
            , entry_timestamp
            , update_userid
            , update_timestamp
            , approved_userid
            , approved_timestamp
            , declared_userid
            , declared_timestamp
            , revision_count)
      SELECT v_new_seedlot_number
            , 'INC'
            , vegetation_code
            , genetic_class_code
            , collection_source_code
            , superior_prvnc_ind
            , org_unit_no
            , 'N' -- registered_seed_ind
            , to_be_registrd_ind
            , null -- registered_date
            , fs721a_signed_ind
            , bc_source_ind
            , nad_datum_code
            , utm_zone
            , utm_easting
            , utm_northing
            , longitude_degrees
            , longitude_minutes
            , longitude_seconds
            , longitude_deg_min
            , longitude_min_min
            , longitude_sec_min
            , longitude_deg_max
            , longitude_min_max
            , longitude_sec_max
            , latitude_degrees
            , latitude_minutes
            , latitude_seconds
            , latitude_deg_min
            , latitude_min_min
            , latitude_sec_min
            , latitude_deg_max
            , latitude_min_max
            , latitude_sec_max
            , seed_coast_area_code
            , elevation
            , elevation_min
            , elevation_max
            , seed_plan_unit_id
            , orchard_id
            , secondary_orchard_id
            , collection_locn_desc
            , collection_cli_number
            , collection_cli_locn_cd
            , collection_start_date
            , collection_end_date
            , cone_collection_method_code
            , cone_collection_method2_code
            , collection_lat_deg
            , collection_lat_min
            , collection_lat_sec
            , collection_latitude_code
            , collection_long_deg
            , collection_long_min
            , collection_long_sec
            , collection_longitude_code
            , collection_elevation
            , collection_elevation_min
            , collection_elevation_max
            , collection_area_radius
            , collection_seed_plan_zone_ind
            , collection_bgc_ind
            , 1 -- no_of_containers
            , 0.01 -- clctn_volume
            , 0.01-- vol_per_container
            , nmbr_trees_from_code
            , effective_pop_size
            , 0 -- original_seed_qty
            , interm_strg_client_number
            , interm_strg_client_locn
            , interm_strg_st_date
            , interm_strg_end_date
            , interm_facility_code
            , interm_strg_locn
            , interm_strg_cmt
            , extraction_st_date
            , extraction_end_date
            , 0 -- extraction_volume
            , extrct_cli_number
            , extrct_cli_locn_cd
            , extraction_comment
            , stored_cli_number
            , stored_cli_locn_cd
            , lngterm_strg_st_date
            , historical_tsr_date
            , ownership_comment
            , cone_seed_desc
            , v_seedlot_comment
            , temporary_storage_start_date
            , temporary_storage_end_date
            , collection_st&&ard_met_ind
            , applicant_email_address
            , biotech_processes_ind
            , pollen_contamination_ind
            , pollen_contamination_pct
            , controlled_cross_ind
            , orchard_comment
            , total_parent_trees
            , smp_parents_outside
            , smp_mean_bv_growth
            , smp_success_pct
            , contaminant_pollen_bv
            , orchard_contamination_pct
            , coancestry
            , provenance_id
            , seed_plan_zone_code
            , pollen_contamination_mthd_code
            , applicant_client_number
            , applicant_client_locn
            , seed_store_client_number
            , seed_store_client_locn
            , seedlot_source_code
            , female_gametic_mthd_code
            , male_gametic_mthd_code
            , bgc_zone_code
            , bgc_subzone_code
            , variant
            , bec_version_id
            , p_userid -- entry_userid
            , SYSDATE -- entry_timestamp
            , p_userid -- update_userid
            , SYSDATE -- update_timestamp
            , 'COPIED_LOT' -- approved_userid
            , approved_timestamp -- retain the approved information, for older seedlots.
            , null -- declared_userid
            , null -- declared_timestamp
            , 1 -- revision_count
      FROM seedlot
      WHERE seedlot_number = g_seedlot_number;
      */
      
      // -- Copy the SEEDLOT_GENETIC_WORTH data to the new seedlot.
      spr_seedlot_genetic_worth.copy_genetic_worth(g_seedlot_number, v_new_seedlot_number, p_userid);

      // -- Copy the SEEDLOT_PLAN_ZONE data to the new seedlot.
      /*
      INSERT INTO seedlot_plan_zone
            (seedlot_number
            ,seed_plan_zone_code
            ,revision_count
            ,entry_userid
            ,entry_timestamp
            ,primary_ind)
      SELECT v_new_seedlot_number
           , seed_plan_zone_code
           , 1
           , p_userid
           , SYSDATE
           , primary_ind
        FROM seedlot_plan_zone
       WHERE seedlot_number = g_seedlot_number;
      */

      // -- Copy the SEEDLOT_PARENT_TREE data to the new seedlot, with a new revision count.
      /*
      INSERT INTO seedlot_parent_tree
            (seedlot_number
           , parent_tree_id
           , cone_count
           , pollen_count
           , smp_success_pct
           , smp_mix_latitude_degrees
           , smp_mix_latitude_minutes
           , smp_mix_longitude_degrees
           , smp_mix_longitude_minutes
           , smp_mix_elevation
           , non_orchard_pollen_contam_pct
           , total_genetic_worth_contrib
           , revision_count)
      SELECT v_new_seedlot_number
           , parent_tree_id
           , cone_count
           , pollen_count
           , smp_success_pct
           , smp_mix_latitude_degrees
           , smp_mix_latitude_minutes
           , smp_mix_longitude_degrees
           , smp_mix_longitude_minutes
           , smp_mix_elevation
           , non_orchard_pollen_contam_pct
           , total_genetic_worth_contrib
           , 1
        FROM seedlot_parent_tree
       WHERE seedlot_number = g_seedlot_number;
      */
      
      //  -- Copy the SEEDLOT_PARENT_TREE_SMP_MIX data to the new seedlot.
      /*
      INSERT INTO seedlot_parent_tree_smp_mix
            (seedlot_number
           , parent_tree_id
           , genetic_type_code
           , genetic_worth_code
           , smp_mix_value
           , revision_count)
      SELECT v_new_seedlot_number
           , parent_tree_id
           , genetic_type_code
           , genetic_worth_code
           , smp_mix_value
           , 1
      FROM seedlot_parent_tree_smp_mix
      WHERE seedlot_number = g_seedlot_number;
      */
      
      //-- Copy the SEEDLOT_PARENT_TREE_GEN_QLTY data to the new seedlot.
      /*
      INSERT INTO seedlot_parent_tree_gen_qlty
            (seedlot_number
           , parent_tree_id
           , genetic_type_code
           , genetic_worth_code
           , genetic_quality_value
           , revision_count
           , seed_plan_unit_id
           , estimated_ind
           , untested_ind)
      SELECT v_new_seedlot_number
           , parent_tree_id
           , genetic_type_code
           , genetic_worth_code
           , genetic_quality_value
           , 1
           , seed_plan_unit_id
           , estimated_ind
           , untested_ind
      FROM seedlot_parent_tree_gen_qlty
      WHERE seedlot_number = g_seedlot_number;
      */

      // -- Copy the SMP_MIX data to the new seedlot.
      /*
      INSERT INTO smp_mix
            (seedlot_number
           , parent_tree_id
           , amount_of_material
           , revision_count)
      SELECT v_new_seedlot_number
           , parent_tree_id
           , amount_of_material
           , 1
      FROM smp_mix
      WHERE seedlot_number = g_seedlot_number;
      */

      // -- Copy the SMP_MIX_GEN_QLTY data to the new seedlot.
      /* 
      INSERT INTO smp_mix_gen_qlty
            (seedlot_number
           , parent_tree_id
           , genetic_type_code
           , genetic_worth_code
           , genetic_quality_value
           , estimated_ind
           , revision_count)
      SELECT v_new_seedlot_number
           , parent_tree_id
           , genetic_type_code
           , genetic_worth_code
           , genetic_quality_value
           , estimated_ind
           , 1
      FROM smp_mix_gen_qlty
      WHERE seedlot_number = g_seedlot_number;
      */
      g_seedlot_number = v_new_seedlot_number;
    }
  }
}

/*
 * Procedure: get_rank_a_germ_test_type
 * Purpose:   Static method to get Current Rank A Germ Test Type
 */
function get_rank_a_germ_test_type(p_seedlot_number: string): string {
  // CURSOR c_test IS:
  /*
  SELECT seedlot_test_code
    FROM seedlot_test
    WHERE seedlot_number = p_seedlot_number && current_test_ind = 'Y' AND preferred_prep_rnk = 'A';
  */
  let r_test: any; // c_test%ROWTYPE;
  
  // OPEN c_test; FETCH c_test INTO r_test; CLOSE c_test;
  return r_test.seedlot_test_code;
}

/*
 * Procedure: get_original_germ_pct
 * Purpose:   Static method to get Original Rank A Germ Test Type
 */
function get_original_germ_pct(p_seedlot_number: string): number {
  // CURSOR c_test IS
  /*
  SELECT germination_pct
    FROM seedlot_test
    WHERE seedlot_number = p_seedlot_number AND preferred_prep_rnk = 'A'
    ORDER BY test_date;
  */
  let r_test: any; // c_test%ROWTYPE;
  
  // OPEN c_test; FETCH c_test INTO r_test; CLOSE c_test;
  return r_test.germination_pct;
}

/*
 * Procedure: get_original_tpg
 * Purpose:   Static method to get original trees per gram.
              Code based on CONSEP function cns_fn_get_orig_tpg
 */
function get_original_tpg(p_seedlot_number: string): number {
  let v_trees_per_gram: number; // NUMBER(11, 4);
  
  // CURSOR c_lot IS:
  /*
  SELECT s.vegetation_code , s.genetic_class_code
  FROM seedlot s
  WHERE s.seedlot_number = p_seedlot_number;
  */
  let r_lot: any; // c_lot%ROWTYPE;

  // --First row returned == original germ
  // CURSOR c_germ IS:
  /*
  SELECT s.germination_pct
  FROM seedlot_test s
  WHERE s.seedlot_number = p_seedlot_number AND s.preferred_prep_rnk = 'A'
  ORDER BY s.test_date;
  */
  let r_germ: any; // c_germ%ROWTYPE;

  // --First row returned == original spg
  // CURSOR c_spg IS
  /*
  SELECT s.seeds_per_gram
  FROM seedlot_test s
  WHERE s.seedlot_number = p_seedlot_number AND s.seedlot_test_code = 'SPG'
  ORDER BY s.test_date;
  */
  let r_spg: any; // c_spg%ROWTYPE;
  
  // CURSOR c_cpb IS:
  /*
  SELECT cavities_per_block
  FROM cavities_block cb
  WHERE cb.seedling_container_code = '415B';
  */
  let r_cpb: any; // c_cpb%ROWTYPE;

  /*
  CURSOR c_sow_rule(
    p_germ_pct           IN NUMBER
  , p_genetic_class_code IN VARCHAR2
  , p_vegetation_code    IN VARCHAR2)
  IS:
      SELECT seeds_per_cavity
           , swng_crctn_factor
        FROM sowing_rule_factor sr
       WHERE sr.genetic_class_code = p_genetic_class_code
         && (   sr.vegetation_code = p_vegetation_code
              || sr.vegetation_code == null)
         && sr.min_grmntn_pct <= p_germ_pct
         && sr.max_grmntn_pct >= p_germ_pct
      ORDER BY sr.vegetation_code NULLS LAST;
  */
  let r_sow_rule: any; // c_sow_rule%ROWTYPE;
  
  // CURSOR c_spb(p_seeds_cavity IN NUMBER) IS:
  /*
  SELECT seeds_per_block
  FROM seeds_block sb
  WHERE sb.seedling_container_code = '415B' AND sb.seeds_per_cavity = p_seeds_cavity;
  */
  let r_spb: string; // c_spb%ROWTYPE;
  
  // OPEN c_lot; FETCH  c_lot INTO r_lot; CLOSE c_lot;
  // OPEN c_germ; FETCH  c_germ INTO r_germ; CLOSE c_germ;
  // OPEN c_spg; FETCH  c_spg INTO r_spg; CLOSE c_spg;
  if (r_spg.seeds_per_gram == null) {
    // --unexpected
    v_trees_per_gram = 0;
  } else {
    // OPEN c_cpb; FETCH  c_cpb INTO r_cpb; CLOSE c_cpb;
    if (r_germ.germination_pct == null) {
      // --unexpected
      v_trees_per_gram = 0;
    } else {
      // OPEN c_sow_rule(r_germ.germination_pct, r_lot.genetic_class_code, r_lot.vegetation_code); FETCH  c_sow_rule INTO r_sow_rule; CLOSE c_sow_rule;
      // OPEN c_spb (r_sow_rule.seeds_per_cavity); FETCH  c_spb INTO r_spb; CLOSE c_spb;
      if (r_spb.seeds_per_block == 0 || r_sow_rule.swng_crctn_factor == 0) {
        // --unexpected
        v_trees_per_gram = 0;
      } else {
        v_trees_per_gram = (r_spg.seeds_per_gram / r_spb.seeds_per_block) * (r_cpb.cavities_per_block / r_sow_rule.swng_crctn_factor);
      }
    }
  }
  return(v_trees_per_gram);
}

/*
 * Procedure: get_original_potential_trees
 * Purpose:   Static method to get original potential trees
 */
function get_original_potential_trees(p_seedlot_number: string): number {
  let v_potential_trees: number; // NUMBER(11, 1);
  // CURSOR c_lot IS:
  /*
  SELECT s.original_seed_qty
  FROM seedlot s
  WHERE s.seedlot_number = p_seedlot_number;
  */
  let r_lot: any; // c_lot%ROWTYPE;
  
  // OPEN c_lot; FETCH  c_lot INTO r_lot; CLOSE c_lot;
  v_potential_trees = r_lot.original_seed_qty * get_original_tpg(p_seedlot_number);
  return v_potential_trees;
}

/*
 * Procedure: is_seedlot_b_plus
 * Purpose:   Returns true if the seedlot == B+(i.e. B class with superior provenance)
 */
function is_seedlot_b_plus(p_seedlot_number :string): boolean {
  // CURSOR c_lot IS:
  /*
  SELECT COUNT(1)
  FROM seedlot
  WHERE seedlot_number = p_seedlot_number
      AND genetic_class_code = 'B'
      AND superior_prvnc_ind = 'Y';
  */
  let v_count: number; // NUMBER(10);
  
  // --B+ row exists?
  // OPEN c_lot; FETCH c_lot INTO v_count; CLOSE c_lot;
  return v_count > 0;
}

/*
 * Procedure: is_seedlot_b_not_supprov
 * Purpose:   Returns true if (the seedlot == B && != of superior provenance. (i.e. B class with superior provenance of N)
 */
function is_seedlot_b_not_supprov(p_seedlot_number: string): boolean {
  // CURSOR c_lot IS:
  /*
  SELECT COUNT(1)
  FROM seedlot
  WHERE seedlot_number = p_seedlot_number
      AND genetic_class_code = 'B'
      AND superior_prvnc_ind = 'N';
  */
  let v_count: number; // NUMBER(10);
  
  // --B row exists?
  // OPEN c_lot; FETCH c_lot INTO v_count; CLOSE c_lot;
  return v_count > 0;
}

/*
 * Procedure: get_gw
 * Purpose:   Static: returns Genetic Worth value identified by the id and code passed in.
 */
function get_gw(p_seedlot_number: string, p_genetic_worth_code: string): number {
  // CURSOR c_lot IS:
  /*
  SELECT genetic_worth_rtng
  FROM seedlot_genetic_worth
  WHERE seedlot_number = p_seedlot_number
      AND genetic_worth_code = p_genetic_worth_code;
  */
  let v_gw: any; // seedlot_genetic_worth.genetic_worth_rtng%TYPE;
  
  // OPEN c_lot; FETCH c_lot INTO v_gw; CLOSE c_lot;
  return v_gw;
}
