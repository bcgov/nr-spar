--- POSTGRES SPAR SEEDLOT TABLE 
select	NOW() current_ts
     ,s.applicant_client_number
	,s.applicant_email_address
	,s.applicant_locn_code
	,s.approved_timestamp
	,s.approved_userid
	,s.area_of_use_comment
	,s.bc_source_ind
	,s.bec_version_id
	,s.bgc_subzone_code
	,s.bgc_zone_code
	,s.biotech_processes_ind
	,s.clctn_volume
	-- NO COANCESTRY COLUMN
	-- NO COLLECTION_AREA_RADIUS
	-- NO COLLECTION_BGC_IND
	-- NO COLLECTION_CLI_LOCN_CD
	,s.collection_client_number
	,s.collection_elevation
	,s.collection_elevation_max
	,s.collection_elevation_min
	,s.collection_end_date
	,s.collection_latitude_code
	,s.collection_latitude_deg
	,s.collection_latitude_min
	,s.collection_latitude_sec
	,s.collection_locn_code
	,s.collection_longitude_code
	,s.collection_longitude_deg
	,s.collection_longitude_min
	,s.collection_longitude_sec
	-- NO COLLECTION_SEED_PLAN_ZONE_IND
	-- NO COLLECTION_SOURCE_CODE
	-- NO COLLECTION_STANDARD_MET_IND
	,s.collection_start_date
	-- NO CONE_COLLECTION_METHOD2_CODE
	-- NO CONE_COLLECTION_METHOD_CODE
	-- NO CONE_SEED_DESC
	,s.contaminant_pollen_bv
	,s.controlled_cross_ind
	,s.declared_timestamp
	,s.declared_userid
	,s.effective_pop_size
	,s.elevation
	,s.elevation_max
	,s.elevation_min
	,s.entry_timestamp
	,s.entry_userid
	-- NO EXTRACTION_COMMENT
	,s.extraction_end_date
	,s.extraction_st_date
	-- NO EXTRACTION_VOLUME
	,s.extractory_client_number
	,s.extractory_locn_code
	,s.female_gametic_mthd_code
	-- NO FS721A_SIGNED_IND
	,s.genetic_class_code
	-- NO HISTORICAL_TSR_DATE
	,s.interm_facility_code
	-- NO INTERM_STRG_CLIENT_LOCN
	,s.interm_strg_client_number
	-- NO INTERM_STRG_CMT
	,s.interm_strg_end_date
	,s.interm_strg_locn
	,s.interm_strg_locn_code
	,s.interm_strg_st_date
	,s.latitude_deg_max
	,s.latitude_deg_min
	,s.latitude_degrees
	,s.latitude_min_max
	,s.latitude_min_min
	,s.latitude_minutes
	,s.latitude_sec_max
	,s.latitude_sec_min
	,s.latitude_seconds
	-- NO LNGTERM_STRG_ST_DATE
	,s.longitude_deg_max
	,s.longitude_deg_min
	,s.longitude_degrees
	,s.longitude_min_max
	,s.longitude_min_min
	,s.longitude_minutes
	,s.longitude_sec_max
	,s.longitude_sec_min
	,s.longitude_seconds
	,s.male_gametic_mthd_code
	-- NO NAD_DATUM_CODE
	-- NO NMBR_TREES_FROM_CODE
	,s.no_of_containers
	,s.non_orchard_pollen_contam_pct
	-- NO ORCHARD_COMMENT
	-- NO ORCHARD_CONTAMINATION_PCT
	-- NO ORCHARD_ID
	-- NO ORG_UNIT_NO
	-- NO ORIGINAL_SEED_QTY
	,s.OWNERSHIP_COMMENT
	,s.pollen_contamination_ind
	,s.pollen_contamination_mthd_code
	,s.pollen_contamination_pct
	-- NO PRICE_COMMENT
	-- NO PRICE_PER_KG
	-- NO PROVENANCE_ID
	-- NO REGISTERED_DATE
	-- NO REGISTERED_SEED_IND
	,s.revision_count
	-- NO SECONDARY_ORCHARD_ID
	,s.seed_plan_unit_id
	,s.seedlot_comment
	,s.seedlot_number
	,s.seedlot_source_code
	,s.seedlot_status_code
	-- NO SEED_COAST_AREA_CODE
	-- NO SEED_PLAN_ZONE_CODE
	-- NO SEED_STORE_CLIENT_LOCN
	-- NO SEED_STORE_CLIENT_NUMBER
	,s.smp_mean_bv_growth
	,s.smp_parents_outside
	,s.smp_success_pct
	-- NO STORED_CLI_LOCN_CD
	-- NO STORED_CLI_NUMBER
	-- NO SUPERIOR_PRVNC_IND
	,s.temporary_strg_client_number
	,s.temporary_strg_end_date
	,s.temporary_strg_locn_code
	,s.temporary_strg_start_date
	,s.to_be_registrd_ind
	,s.total_parent_trees
	,s.update_timestamp
	,s.update_userid
	-- NO UTM_EASTING
	-- NO UTM_NORTHING
	-- NO UTM_ZONE
	,s.variant
	,s.vegetation_code
	,s.vol_per_container
from spar.seedlot s