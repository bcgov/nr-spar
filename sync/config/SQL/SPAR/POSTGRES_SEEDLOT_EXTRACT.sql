/* --- EXTRACT FROM POSTGRES spar.seedlot table */
WITH seedlot_coll_methods
 AS
 (SELECT seedlot_number
       , TO_CHAR(cone_collection_method_code,'FM00') cone_collection_method_code
	   , ROW_NUMBER() OVER (PARTITION BY seedlot_number ORDER BY entry_timestamp) rown
	FROM spar.seedlot_collection_method
   WHERE seedlot_number = %(p_seedlot_number)s)
  , draft_seedlots
 AS
  (select seedlot_number
     , case when all_step_data->'extractionStorageStep'->'extraction'->'agency'->>'isInvalid' = 'false' 
             and all_step_data->'extractionStorageStep'->'extraction'->'locationCode'->>'isInvalid' = 'false' 
            then all_step_data->'extractionStorageStep'->'extraction'->'agency'->>'value'
            else null 
       end as extrct_cli_number 
     , case when all_step_data->'extractionStorageStep'->'extraction'->'agency'->>'isInvalid' = 'false' 
             and all_step_data->'extractionStorageStep'->'extraction'->'locationCode'->>'isInvalid' = 'false' 
            then all_step_data->'extractionStorageStep'->'extraction'->'locationCode'->>'value'
            else null 
       end as extrct_cli_locn_cd 
     , case when all_step_data->'interimStep'->'facilityType'->>'isInvalid' = 'false' 
            then all_step_data->'interimStep'->'facilityType'->>'value' 
            else null 
       end as interm_facility_code 
     , case when all_step_data->'orchardStep'->'orchards'->'primaryOrchard'->>'isInvalid' = 'false' 
            then all_step_data->'orchardStep'->'orchards'->'primaryOrchard'->'value'->>'code'
            else null 
       end as orchard_id
     , case when all_step_data->'orchardStep'->'orchards'->'secondaryOrchard'->>'isInvalid' = 'false' 
            then all_step_data->'orchardStep'->'orchards'->'secondaryOrchard'->'value'->>'code'
            else null 
       end as secondary_orchard_id
     , CAST(case when all_step_data->'collectionStep'->'startDate'->>'isInvalid' = 'false'
                 then all_step_data->'collectionStep'->'startDate'->>'value'
                 else null 
                  end AS DATE)  as collection_start_date
     , CAST(case when all_step_data->'collectionStep'->'endDate'->>'isInvalid' = 'false'
                 then all_step_data->'collectionStep'->'endDate'->>'value'
                 else null
                  end AS DATE) as collection_end_date
     , case when all_step_data->'collectionStep'->'collectorAgency'->>'isInvalid' = 'false'
             and all_step_data->'collectionStep'->'locationCode'->>'isInvalid' = 'false'
            then all_step_data->'collectionStep'->'collectorAgency'->>'value' 
            else null
       end as collection_cli_number
     , case when all_step_data->'collectionStep'->'collectorAgency'->>'isInvalid' = 'false'
             and all_step_data->'collectionStep'->'locationCode'->>'isInvalid' = 'false'
            then all_step_data->'collectionStep'->'locationCode'->>'value'
            else null
       end as collection_cli_locn_cd
     , CAST(case when all_step_data->'collectionStep'->'volumeOfCones'->>'isInvalid' = 'false'
                 then all_step_data->'collectionStep'->'volumeOfCones'->>'value'
                 else null
                  end as NUMERIC) as clctn_volume
     , CAST(case when all_step_data->'collectionStep'->'numberOfContainers'->>'isInvalid' = 'false'
                 then all_step_data->'collectionStep'->'numberOfContainers'->>'value'
                 else null
                  end as NUMERIC) as no_of_containers
     , CAST(case when all_step_data->'collectionStep'->'volumePerContainers'->>'isInvalid' = 'false'
                 then all_step_data->'collectionStep'->'volumePerContainers'->>'value'
                 else null
             end as NUMERIC)      as vol_per_container
     , TO_CHAR(CAST(case when all_step_data->'collectionStep'->'selectedCollectionCodes'->>'isInvalid' = 'false'
                    then all_step_data->'collectionStep'->'selectedCollectionCodes'->'value'->>0
                    else null
                end AS NUMERIC),'FM00') as cone_collection_method_code
     , TO_CHAR(CAST(case when all_step_data->'collectionStep'->'selectedCollectionCodes'->>'isInvalid' = 'false'
                    then all_step_data->'collectionStep'->'selectedCollectionCodes'->'value'->>1
                    else null
                end AS NUMERIC),'FM00') as cone_collection_method2_code
     , case when all_step_data->'collectionStep'->'comments'->>'isInvalid' = 'false'
            then all_step_data->'collectionStep'->'comments'->>'value'
            else null
       end as seedlot_comment
  from spar.seedlot_registration_a_class_save
 where seedlot_number = %(p_seedlot_number)s)
SELECT 
    s.applicant_client_number,
    s.applicant_email_address,
    s.applicant_locn_code                AS applicant_client_locn,
    s.approved_timestamp,
    replace(s.approved_userid, '\', '@') approved_userid  -- 'Replacing @ to \ for Provider@User
	,CASE WHEN s.bc_source_ind THEN 'Y' ELSE 'N' END as bc_source_ind
	,S.bec_version_id
	,S.bgc_subzone_code
	,S.bgc_zone_code
	,case when s.biotech_processes_ind = True then 'Y' when  biotech_processes_ind = False then 'N' else '' end as biotech_processes_ind
	,CASE WHEN s.seedlot_status_code = 'PND' THEN drft.clctn_volume
          ELSE s.clctn_volume
     END                                        as clctn_volume
	,CASE WHEN s.seedlot_status_code = 'PND' THEN drft.collection_cli_locn_cd
          ELSE s.collection_locn_code
     END                                        as collection_cli_locn_cd
	,CASE WHEN s.seedlot_status_code = 'PND' THEN drft.collection_cli_number
          ELSE s.collection_client_number
     END                                        as collection_cli_number
	,S.collection_elevation
	,S.collection_elevation_max
	,S.collection_elevation_min
	,CASE WHEN s.seedlot_status_code = 'PND' THEN drft.collection_end_date
          ELSE s.collection_end_date
     END                                        as collection_end_date
	,s.collection_latitude_code
	,s.collection_latitude_deg			   		as collection_lat_deg
	,s.collection_latitude_min             		as collection_lat_min
	,s.collection_latitude_sec             		as collection_lat_sec
	,s.collection_longitude_code
	,s.collection_longitude_deg            		as collection_long_deg
	,s.collection_longitude_min            		as collection_long_min
	,s.collection_longitude_sec            		as collection_long_sec
	,CASE WHEN s.seedlot_status_code = 'PND' THEN drft.collection_start_date
          ELSE s.collection_start_date
     END                                        as collection_start_date
	,CASE WHEN s.seedlot_status_code = 'PND' THEN drft.cone_collection_method_code
          ELSE scm1.cone_collection_method_code
     END                                        as cone_collection_method_code
	,CASE WHEN s.seedlot_status_code = 'PND' THEN drft.cone_collection_method2_code
          ELSE scm2.cone_collection_method_code
     END                                        as cone_collection_method2_code
	,s.contaminant_pollen_bv
	,CASE WHEN s.controlled_cross_ind = True THEN 'Y' WHEN  controlled_cross_ind = False THEN 'N' ELSE '' END as CONTROLLED_CROSS_IND
	,s.declared_timestamp
	,REPLACE(s.declared_userid,'\', '@') declared_userid  -- 'Replacing @ to \ for Provider@User
	,s.effective_pop_size
	,s.elevation
	,s.elevation_max
	,s.elevation_min
	,s.entry_timestamp
	,REPLACE(s.entry_userid,'\', '@') entry_userid  -- 'Replacing @ to \ for Provider@User
	,S.extraction_end_date
	,S.extraction_st_date
	,CASE WHEN s.seedlot_status_code = 'PND' THEN drft.extrct_cli_number
          ELSE s.extractory_client_number 
     END                       as extrct_cli_number
	,CASE WHEN s.seedlot_status_code = 'PND' THEN drft.extrct_cli_locn_cd
          ELSE s.extractory_locn_code 
     END                	    as extrct_cli_locn_cd
	,s.female_gametic_mthd_code         
	,S.genetic_class_code               
	,CASE WHEN s.seedlot_status_code = 'PND' THEN drft.interm_facility_code 
          ELSE s.interm_facility_code             
     END                        as interm_facility_code
	,s.interm_strg_locn_code           			as interm_strg_client_locn
	,S.interm_strg_client_number        
	,S.interm_strg_end_date
	,S.interm_strg_locn
	,S.interm_strg_st_date
	,S.latitude_deg_max
	,S.latitude_deg_min
	,S.latitude_degrees
	,S.latitude_min_max
	,S.latitude_min_min
	,S.latitude_minutes
	,S.latitude_sec_max
	,S.latitude_sec_min
	,S.latitude_seconds
	,S.longitude_deg_max
	,S.longitude_deg_min
	,S.longitude_degrees
	,S.longitude_min_max
	,S.longitude_min_min
	,S.longitude_minutes
	,S.longitude_sec_max
	,S.longitude_sec_min
	,S.longitude_seconds
	,S.male_gametic_mthd_code
    ,CASE WHEN s.seedlot_status_code = 'PND' THEN drft.no_of_containers
          ELSE s.no_of_containers
     END no_of_containers
	,s.area_of_use_comment                  as orchard_comment
    ,CASE WHEN s.seedlot_status_code = 'PND' THEN drft.orchard_id
          ELSE prim.orchard_id
     END orchard_id
    ,CASE WHEN s.seedlot_status_code = 'PND' THEN drft.secondary_orchard_id
          ELSE sec.secondary_orchard_id
     END secondary_orchard_id
	,CASE WHEN s.pollen_contamination_ind = True THEN 'Y' WHEN  pollen_contamination_ind = False THEN 'N' ELSE '' END as pollen_contamination_ind
	,s.pollen_contamination_mthd_code
	,s.pollen_contamination_pct
	,s.revision_count
    ,s.seed_plan_unit_id
	,s.seedlot_comment
	,s.seedlot_number
	,s.seedlot_source_code
	,s.seedlot_status_code
	,s.temporary_strg_locn_code           	as seed_store_client_locn
	,s.temporary_strg_client_number         as seed_store_client_number
	,s.smp_mean_bv_growth
	,s.smp_parents_outside
	,s.smp_success_pct
	,s.temporary_strg_end_date::date    as temporary_storage_end_date
	,s.temporary_strg_start_date::date  as temporary_storage_start_date
	,CASE WHEN s.to_be_registrd_ind THEN 'Y' Else 'N' END as to_be_registrd_ind
	,s.total_parent_trees	
	,s.update_timestamp
	,REPLACE(s.update_userid,'\', '@') update_userid  -- 'Replacing @ to \ for Provider@User
	,s.variant                                          
	,s.vegetation_code
    ,CASE WHEN s.seedlot_status_code = 'PND' THEN drft.vol_per_container
          ELSE s.vol_per_container
     END vol_per_container
FROM spar.seedlot s
LEFT OUTER JOIN seedlot_coll_methods scm1 
             ON (scm1.seedlot_number = s.seedlot_number AND scm1.rown = 1)
LEFT OUTER JOIN seedlot_coll_methods scm2
             ON (scm2.seedlot_number = s.seedlot_number AND scm2.rown = 2)
LEFT OUTER JOIN (SELECT po.seedlot_number
                      , po.orchard_id 
                   FROM spar.seedlot_orchard po
                  WHERE po.primary_ind = True) prim 
             ON prim.seedlot_number = s.seedlot_number
LEFT OUTER JOIN (SELECT DISTINCT
                        so.seedlot_number
                      , FIRST_VALUE(so.orchard_id) OVER (PARTITION BY so.seedlot_number 
                                                             ORDER BY so.entry_timestamp) secondary_orchard_id
                   FROM spar.seedlot_orchard so
                  WHERE so.primary_ind = False) sec
             ON sec.seedlot_number = s.seedlot_number
LEFT OUTER JOIN spar.active_orchard_spu ospu
             ON ospu.orchard_id = prim.orchard_id
            AND ospu.active_ind = True
LEFT OUTER JOIN draft_seedlots drft 
             ON drft.seedlot_number = s.seedlot_number
WHERE s.seedlot_number = %(p_seedlot_number)s
ORDER BY s.seedlot_number DESC