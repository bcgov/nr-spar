/* --- ORACLE SEEDLOT TABLE IN THE SCHEMA */
WITH CTE_SEEDLOT AS (
select --SYSTIMESTAMP CURRENT_TS,
	 s.APPLICANT_CLIENT_NUMBER
	,s.APPLICANT_EMAIL_ADDRESS
	,s.APPLICANT_CLIENT_LOCN          as applicant_locn_code
	,CASE WHEN s.APPROVED_TIMESTAMP IS NULL THEN '' ELSE TO_CHAR(s.APPROVED_TIMESTAMP,'YYYY-MM-DD HH24:MI:SS') END as APPROVED_TIMESTAMP
	,s.APPROVED_USERID
	,s.BC_SOURCE_IND
	,s.BEC_VERSION_ID
	,s.BGC_SUBZONE_CODE
	,s.BGC_ZONE_CODE
	,s.BIOTECH_PROCESSES_IND
	,s.CLCTN_VOLUME
	--,s.COANCESTRY									-- NOT found in POSTGRES
	--,s.COLLECTION_AREA_RADIUS						-- NOT found in POSTGRES
	--,s.COLLECTION_BGC_IND							-- NOT found in POSTGRES
	,s.COLLECTION_CLI_LOCN_CD         as collection_locn_code
	,s.COLLECTION_CLI_NUMBER          as collection_client_number
	,s.COLLECTION_ELEVATION
	,s.COLLECTION_ELEVATION_MAX
	,s.COLLECTION_ELEVATION_MIN
	,CASE WHEN s.COLLECTION_END_DATE IS NULL THEN '' ELSE TO_CHAR(s.COLLECTION_END_DATE,'YYYY-MM-DD HH24:MI:SS') END as COLLECTION_END_DATE
	,s.COLLECTION_LATITUDE_CODE
	,s.COLLECTION_LAT_DEG			  as collection_latitude_deg
	,s.COLLECTION_LAT_MIN             as collection_latitude_min
	,s.COLLECTION_LAT_SEC             as collection_latitude_sec
	--,s.COLLECTION_LOCN_DESC                        -- NOT found in POSTGRES
	,s.COLLECTION_LONGITUDE_CODE
	,s.COLLECTION_LONG_DEG            as collection_longitude_deg
	,s.COLLECTION_LONG_MIN            as collection_longitude_min
	,s.COLLECTION_LONG_SEC            as collection_longitude_sec
	--,s.COLLECTION_SEED_PLAN_ZONE_IND                -- NOT found in POSTGRES         
	--,s.COLLECTION_SOURCE_CODE                       -- NOT found in POSTGRES
	--,s.COLLECTION_STANDARD_MET_IND                  -- NOT found in POSTGRES
	,CASE WHEN s.COLLECTION_START_DATE IS NULL THEN '' ELSE TO_CHAR(s.COLLECTION_START_DATE,'YYYY-MM-DD HH24:MI:SS') END as COLLECTION_START_DATE
	--,s.CONE_COLLECTION_METHOD2_CODE                 -- NOT found in POSTGRES         
	--,s.CONE_COLLECTION_METHOD_CODE                  -- NOT found in POSTGRES         
	--,s.CONE_SEED_DESC                               -- NOT found in POSTGRES         
	,s.CONTAMINANT_POLLEN_BV
	,s.CONTROLLED_CROSS_IND
	,CASE WHEN s.DECLARED_TIMESTAMP IS NULL THEN '' ELSE TO_CHAR(s.DECLARED_TIMESTAMP,'YYYY-MM-DD HH24:MI:SS') END as DECLARED_TIMESTAMP
	,s.DECLARED_USERID
	,s.EFFECTIVE_POP_SIZE
	,s.ELEVATION
	,s.ELEVATION_MAX
	,s.ELEVATION_MIN
	,s.ENTRY_TIMESTAMP
	,s.ENTRY_USERID
	--,s.EXTRACTION_COMMENT                            -- NOT found in POSTGRES         
	,CASE WHEN s.EXTRACTION_END_DATE IS NULL THEN '' ELSE TO_CHAR(s.EXTRACTION_END_DATE,'YYYY-MM-DD HH24:MI:SS') END as EXTRACTION_END_DATE
	,CASE WHEN s.EXTRACTION_ST_DATE IS NULL THEN '' ELSE TO_CHAR(s.EXTRACTION_ST_DATE,'YYYY-MM-DD HH24:MI:SS') END as EXTRACTION_ST_DATE
	--,s.EXTRACTION_VOLUME                             -- NOT found in POSTGRES         
	,s.EXTRCT_CLI_NUMBER                as extractory_client_number
	,s.EXTRCT_CLI_LOCN_CD               as extractory_locn_code
	,s.FEMALE_GAMETIC_MTHD_CODE         
	--,s.FS721A_SIGNED_IND                             -- NOT found in POSTGRES         
	,s.GENETIC_CLASS_CODE               
	--,s.HISTORICAL_TSR_DATE                           -- NOT found in POSTGRES   
	,s.INTERM_FACILITY_CODE             
	,s.INTERM_STRG_CLIENT_LOCN          as interm_strg_locn_code 
	,s.INTERM_STRG_CLIENT_NUMBER        
	--,s.INTERM_STRG_CMT							  -- NOT found in POSTGRES   
	,CASE WHEN s.INTERM_STRG_END_DATE IS NULL THEN '' ELSE TO_CHAR(s.INTERM_STRG_END_DATE,'YYYY-MM-DD HH24:MI:SS') END as interm_strg_end_date
	,s.INTERM_STRG_LOCN
	,CASE WHEN s.INTERM_STRG_ST_DATE IS NULL THEN '' ELSE TO_CHAR(s.INTERM_STRG_ST_DATE,'YYYY-MM-DD HH24:MI:SS') END as interm_strg_st_date
	,s.LATITUDE_DEG_MAX
	,s.LATITUDE_DEG_MIN
	,s.LATITUDE_DEGREES
	,s.LATITUDE_MIN_MAX
	,s.LATITUDE_MIN_MIN
	,s.LATITUDE_MINUTES
	,s.LATITUDE_SEC_MAX
	,s.LATITUDE_SEC_MIN
	,s.LATITUDE_SECONDS
	--,s.LNGTERM_STRG_ST_DATE                        -- NOT found in POSTGRES 
	,s.LONGITUDE_DEG_MAX
	,s.LONGITUDE_DEG_MIN
	,s.LONGITUDE_DEGREES
	,s.LONGITUDE_MIN_MAX
	,s.LONGITUDE_MIN_MIN
	,s.LONGITUDE_MINUTES
	,s.LONGITUDE_SEC_MAX
	,s.LONGITUDE_SEC_MIN
	,s.LONGITUDE_SECONDS
	,s.MALE_GAMETIC_MTHD_CODE
	--,s.NAD_DATUM_CODE                              -- NOT found in POSTGRES   
	--,s.NMBR_TREES_FROM_CODE                        -- NOT found in POSTGRES   
	,s.NO_OF_CONTAINERS
	,s.ORCHARD_COMMENT                  as area_of_use_comment
	--,s.ORCHARD_CONTAMINATION_PCT  				 -- NO column found in Postgres  
	--,s.ORCHARD_ID                              	 -- NO column found in Postgres  
	--,s.ORG_UNIT_NO                                 -- NO column found in Postgres  
	--,s.ORIGINAL_SEED_QTY                           -- NO column found in Postgres  
	--,s.OWNERSHIP_COMMENT                           -- NO column found in Postgres  
	,s.POLLEN_CONTAMINATION_IND
	,s.POLLEN_CONTAMINATION_MTHD_CODE
	,s.POLLEN_CONTAMINATION_PCT
	--,s.PRICE_COMMENT                               -- NO column found in Postgres  
	--,s.PRICE_PER_KG                                -- NO column found in Postgres  
	--,s.PROVENANCE_ID                               -- NO column found in Postgres  
	--,s.REGISTERED_DATE                             -- NO column found in Postgres  
	--,s.REGISTERED_SEED_IND                         -- NO column found in Postgres  
	,s.REVISION_COUNT
	--,s.SECONDARY_ORCHARD_ID                        -- NO column found in Postgres  
    ,s.SEED_PLAN_UNIT_ID
	,s.SEEDLOT_COMMENT
	,s.SEEDLOT_NUMBER
	,s.SEEDLOT_SOURCE_CODE
	,s.SEEDLOT_STATUS_CODE
	--,s.SEED_COAST_AREA_CODE                        -- NO column found in Postgres  
	--,s.SEED_PLAN_ZONE_CODE                         -- NO column found in Postgres  
	,s.SEED_STORE_CLIENT_LOCN           as temporary_strg_locn_code
	,s.SEED_STORE_CLIENT_NUMBER         as temporary_strg_client_number
	,s.SMP_MEAN_BV_GROWTH
	,s.SMP_PARENTS_OUTSIDE
	,s.SMP_SUCCESS_PCT
	--,s.STORED_CLI_LOCN_CD                          -- NO column found in Postgres  
	--,s.STORED_CLI_NUMBER                           -- NO column found in Postgres  
	--,s.SUPERIOR_PRVNC_IND                          -- NO column found in Postgres  
	,CASE WHEN s.TEMPORARY_STORAGE_END_DATE IS NULL THEN '' ELSE TO_CHAR(s.TEMPORARY_STORAGE_END_DATE,'YYYY-MM-DD HH24:MI:SS') END as temporary_strg_end_date
	--,NULL as temporary_strg_locn_code 			-- NO column found in ORACLE
	,CASE WHEN s.TEMPORARY_STORAGE_START_DATE IS NULL THEN '' ELSE TO_CHAR(s.TEMPORARY_STORAGE_START_DATE,'YYYY-MM-DD HH24:MI:SS') END as temporary_strg_start_date
	,s.TO_BE_REGISTRD_IND
	,s.TOTAL_PARENT_TREES	
	,s.UPDATE_TIMESTAMP
	,s.UPDATE_USERID
	--,s.UTM_EASTING                                    -- NO column found in Postgres  
	--,s.UTM_NORTHING                                   -- NO column found in Postgres  
	--,s.UTM_ZONE                                       -- NO column found in Postgres  
	,s.VARIANT                                          
	,s.VEGETATION_CODE
	,s.VOL_PER_CONTAINER
FROM seedlot s 
) 
SELECT applicant_client_number, applicant_email_address, applicant_locn_code, approved_timestamp, approved_userid, bc_source_ind, bec_version_id, bgc_subzone_code, bgc_zone_code, 
biotech_processes_ind, clctn_volume, collection_locn_code, collection_client_number, collection_elevation, collection_elevation_max, collection_elevation_min, collection_end_date, 
collection_latitude_code, collection_latitude_deg, collection_latitude_min, collection_latitude_sec, collection_longitude_code, collection_longitude_deg, collection_longitude_min, 
collection_longitude_sec, collection_start_date, contaminant_pollen_bv, controlled_cross_ind, declared_timestamp, declared_userid, effective_pop_size, elevation, elevation_max, 
elevation_min, entry_timestamp, entry_userid, extraction_end_date, extraction_st_date, extractory_client_number, extractory_locn_code, female_gametic_mthd_code, genetic_class_code, 
interm_facility_code, interm_strg_locn_code, interm_strg_client_number, interm_strg_end_date, interm_strg_locn, interm_strg_st_date, latitude_deg_max, latitude_deg_min, latitude_degrees, 
latitude_min_max, latitude_min_min, latitude_minutes, latitude_sec_max, latitude_sec_min, latitude_seconds, longitude_deg_max, longitude_deg_min, longitude_degrees, longitude_min_max,
longitude_min_min, longitude_minutes, longitude_sec_max, longitude_sec_min, longitude_seconds, male_gametic_mthd_code, no_of_containers, area_of_use_comment, 
pollen_contamination_ind, pollen_contamination_mthd_code, pollen_contamination_pct, revision_count, seed_plan_unit_id, seedlot_comment, 
seedlot_number, 
seedlot_source_code, seedlot_status_code,
temporary_strg_locn_code, temporary_strg_client_number, smp_mean_bv_growth, smp_parents_outside, smp_success_pct, temporary_strg_end_date, temporary_strg_start_date, to_be_registrd_ind, 
total_parent_trees, update_timestamp, update_userid, variant, vegetation_code, vol_per_container
FROM CTE_SEEDLOT C
WHERE update_timestamp between :start_time and :end_time 
ORDER BY seedlot_number