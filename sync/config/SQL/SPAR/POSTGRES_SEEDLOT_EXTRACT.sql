/* --- EXTRACT FROM POSTGRES spar.seedlot table */
WITH CTE_SEEDLOT AS (
select --SYSTIMESTAMP CURRENT_TS,
	 s.APPLICANT_CLIENT_NUMBER
	,s.APPLICANT_EMAIL_ADDRESS
	,s.applicant_locn_code          			as APPLICANT_CLIENT_LOCN
	,s.APPROVED_TIMESTAMP
	,s.APPROVED_USERID
	,CASE WHEN s.BC_SOURCE_IND THEN 'Y' ELSE 'N' END as BC_SOURCE_IND
	,s.BEC_VERSION_ID
	,s.BGC_SUBZONE_CODE
	,s.BGC_ZONE_CODE
	,case when s.BIOTECH_PROCESSES_IND = True then 'Y' when  BIOTECH_PROCESSES_IND = False then 'N' else '' end as BIOTECH_PROCESSES_IND
	,s.CLCTN_VOLUME
	,s.collection_locn_code         			as COLLECTION_CLI_LOCN_CD
	,s.collection_client_number          		as COLLECTION_CLI_NUMBER
	,s.COLLECTION_ELEVATION
	,s.COLLECTION_ELEVATION_MAX
	,s.COLLECTION_ELEVATION_MIN
	,s.COLLECTION_END_DATE
	,s.COLLECTION_LATITUDE_CODE
	,s.collection_latitude_deg			   		as COLLECTION_LAT_DEG
	,s.collection_latitude_min             		as COLLECTION_LAT_MIN
	,s.collection_latitude_sec             		as COLLECTION_LAT_SEC
	--,s.COLLECTION_LOCN_DESC                        -- NOT found in POSTGRES
	,s.COLLECTION_LONGITUDE_CODE
	,s.collection_longitude_deg            		as COLLECTION_LONG_DEG
	,s.collection_longitude_min            		as COLLECTION_LONG_MIN
	,s.collection_longitude_sec            		as COLLECTION_LONG_SEC
	,s.COLLECTION_START_DATE 
	,s.CONTAMINANT_POLLEN_BV
	,case when s.CONTROLLED_CROSS_IND = True then 'Y' when  CONTROLLED_CROSS_IND = False then 'N' else '' end as CONTROLLED_CROSS_IND
	,s.DECLARED_TIMESTAMP
	,s.DECLARED_USERID
	,s.EFFECTIVE_POP_SIZE
	,s.ELEVATION
	,s.ELEVATION_MAX
	,s.ELEVATION_MIN
	,s.ENTRY_TIMESTAMP
	,s.ENTRY_USERID
	,s.EXTRACTION_END_DATE
	,s.EXTRACTION_ST_DATE
	,s.extractory_client_number                 as EXTRCT_CLI_NUMBER
	,s.extractory_locn_code                	    as EXTRCT_CLI_LOCN_CD
	,s.FEMALE_GAMETIC_MTHD_CODE         
	,s.GENETIC_CLASS_CODE               
	,s.INTERM_FACILITY_CODE             
	,s.interm_strg_locn_code           			as INTERM_STRG_CLIENT_LOCN
	,s.INTERM_STRG_CLIENT_NUMBER        
	,s.INTERM_STRG_END_DATE
	,s.INTERM_STRG_LOCN
	,s.INTERM_STRG_ST_DATE
	,s.LATITUDE_DEG_MAX
	,s.LATITUDE_DEG_MIN
	,s.LATITUDE_DEGREES
	,s.LATITUDE_MIN_MAX
	,s.LATITUDE_MIN_MIN
	,s.LATITUDE_MINUTES
	,s.LATITUDE_SEC_MAX
	,s.LATITUDE_SEC_MIN
	,s.LATITUDE_SECONDS
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
	,s.NO_OF_CONTAINERS
	,s.area_of_use_comment                  as ORCHARD_COMMENT
	,case when s.POLLEN_CONTAMINATION_IND = True then 'Y' when  POLLEN_CONTAMINATION_IND = False then 'N' else '' end as POLLEN_CONTAMINATION_IND
	,s.POLLEN_CONTAMINATION_MTHD_CODE
	,s.POLLEN_CONTAMINATION_PCT
	,s.REVISION_COUNT
    ,s.SEED_PLAN_UNIT_ID
	,s.SEEDLOT_COMMENT
	,s.SEEDLOT_NUMBER
	,s.SEEDLOT_SOURCE_CODE
	,s.SEEDLOT_STATUS_CODE
	,s.temporary_strg_locn_code           	as SEED_STORE_CLIENT_LOCN
	,s.temporary_strg_client_number         as SEED_STORE_CLIENT_NUMBER
	,s.SMP_MEAN_BV_GROWTH
	,s.SMP_PARENTS_OUTSIDE
	,s.SMP_SUCCESS_PCT
	,s.temporary_strg_end_date::date    as TEMPORARY_STORAGE_END_DATE
	,s.temporary_strg_start_date::date  as TEMPORARY_STORAGE_START_DATE
	,CASE WHEN s.TO_BE_REGISTRD_IND THEN 'Y' ELSE 'N' END AS TO_BE_REGISTRD_IND
	,s.TOTAL_PARENT_TREES	
	,s.UPDATE_TIMESTAMP
	,s.UPDATE_USERID
	,s.VARIANT                                          
	,s.VEGETATION_CODE
	,s.VOL_PER_CONTAINER
FROM spar.seedlot s 
) 
SELECT applicant_client_number, applicant_email_address, APPLICANT_CLIENT_LOCN, approved_timestamp, approved_userid, bc_source_ind, bec_version_id, bgc_subzone_code, bgc_zone_code, 
biotech_processes_ind, clctn_volume, COLLECTION_CLI_LOCN_CD, COLLECTION_CLI_NUMBER, collection_elevation, collection_elevation_max, collection_elevation_min, collection_end_date, 
collection_latitude_code, COLLECTION_LAT_DEG, COLLECTION_LAT_MIN, COLLECTION_LAT_SEC, collection_longitude_code, COLLECTION_LONG_DEG, COLLECTION_LONG_MIN, 
COLLECTION_LONG_SEC, collection_start_date, contaminant_pollen_bv, controlled_cross_ind, declared_timestamp, declared_userid, effective_pop_size, elevation, elevation_max, 
elevation_min, entry_timestamp, entry_userid, extraction_end_date, extraction_st_date, EXTRCT_CLI_NUMBER, EXTRCT_CLI_LOCN_CD, female_gametic_mthd_code, genetic_class_code, 
interm_facility_code, INTERM_STRG_CLIENT_LOCN, interm_strg_client_number, interm_strg_end_date, interm_strg_locn, interm_strg_st_date, latitude_deg_max, latitude_deg_min, 
latitude_degrees, latitude_min_max, latitude_min_min, latitude_minutes, latitude_sec_max, latitude_sec_min, latitude_seconds, longitude_deg_max, longitude_deg_min, longitude_degrees,
 longitude_min_max,longitude_min_min, longitude_minutes, longitude_sec_max, longitude_sec_min, longitude_seconds, male_gametic_mthd_code, no_of_containers, 
 ORCHARD_COMMENT,pollen_contamination_ind, pollen_contamination_mthd_code, pollen_contamination_pct, revision_count, seed_plan_unit_id, seedlot_comment, 
seedlot_number, 
seedlot_source_code, seedlot_status_code,
SEED_STORE_CLIENT_LOCN, SEED_STORE_CLIENT_NUMBER, smp_mean_bv_growth, smp_parents_outside, smp_success_pct, TEMPORARY_STORAGE_END_DATE, TEMPORARY_STORAGE_START_DATE, to_be_registrd_ind, 
total_parent_trees, update_timestamp, update_userid, variant, vegetation_code, vol_per_container
FROM 
	CTE_SEEDLOT C
WHERE 
	update_timestamp between %(start_time)s AND %(end_time)s 
ORDER BY 
	SEEDLOT_NUMBER DESC
