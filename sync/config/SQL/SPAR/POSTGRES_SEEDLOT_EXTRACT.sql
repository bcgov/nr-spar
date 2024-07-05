/* --- EXTRACT FROM POSTGRES spar.seedlot table */
WITH seedlot_coll_methods
 AS
 (SELECT seedlot_number
       , TO_CHAR(cone_collection_method_code,'FM00') cone_collection_method_code
	   , ROW_NUMBER() OVER (PARTITION BY seedlot_number ORDER BY entry_timestamp) rown
	FROM spar.seedlot_collection_method)
SELECT 
    s.applicant_client_number,
    s.applicant_email_address,
    s.applicant_locn_code                AS applicant_client_locn,
    s.approved_timestamp,
    replace(s.approved_userid, '\', '@') approved_userid  -- 'Replacing @ to \ for Provider@User
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
	,s.COLLECTION_LONGITUDE_CODE
	,s.collection_longitude_deg            		as COLLECTION_LONG_DEG
	,s.collection_longitude_min            		as COLLECTION_LONG_MIN
	,s.collection_longitude_sec            		as COLLECTION_LONG_SEC
	,s.COLLECTION_START_DATE
	,scm1.cone_collection_method_code
	,scm2.cone_collection_method_code           as CONE_COLLECTION_METHOD2_CODE
	,s.CONTAMINANT_POLLEN_BV
	,case when s.CONTROLLED_CROSS_IND = True then 'Y' when  CONTROLLED_CROSS_IND = False then 'N' else '' end as CONTROLLED_CROSS_IND
	,s.DECLARED_TIMESTAMP
	,REPLACE(s.DECLARED_USERID,'\', '@') DECLARED_USERID  -- 'Replacing @ to \ for Provider@User
	,s.EFFECTIVE_POP_SIZE
	,s.ELEVATION
	,s.ELEVATION_MAX
	,s.ELEVATION_MIN
	,s.ENTRY_TIMESTAMP
	,REPLACE(s.ENTRY_USERID,'\', '@') ENTRY_USERID  -- 'Replacing @ to \ for Provider@User
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
    ,prim.orchard_id
    ,sec.secondary_orchard_id
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
	,REPLACE(s.UPDATE_USERID,'\', '@') UPDATE_USERID  -- 'Replacing @ to \ for Provider@User
	,s.VARIANT                                          
	,s.VEGETATION_CODE
	,s.VOL_PER_CONTAINER
FROM spar.seedlot s
LEFT OUTER JOIN seedlot_coll_methods scm1 
             ON (scm1.seedlot_number = s.seedlot_number AND scm1.rown = 1)
LEFT OUTER JOIN seedlot_coll_methods scm2
             ON (scm2.seedlot_number = s.seedlot_number AND scm2.rown = 2)
LEFT OUTER JOIN (SELECT po.seedlot_number
                      , po.orchard_id 
                   FROM spar.seedlot_orchard po
                  WHERE po.primary_ind = 'Y') prim 
             ON prim.seedlot_number = s.seedlot_number
LEFT OUTER JOIN (SELECT DISTINCT
                        so.seedlot_number
                      , FIRST_VALUE(so.orchard_id) OVER (PARTITION BY so.seedlot_number 
                                                             ORDER BY so.entry_timestamp) secondary_orchard_id
                   FROM spar.seedlot_orchard so
                  WHERE so.primary_ind = 'N') sec
             ON sec.seedlot_number = s.seedlot_number
WHERE s.seedlot_number = %(p_seedlot_number)s
order by seedlot_number desc
