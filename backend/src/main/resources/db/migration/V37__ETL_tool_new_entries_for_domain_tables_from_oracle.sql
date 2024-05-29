/*
-- Including Entries for ETL Tool execution for Spar related - Oracle Domain Tables
*/

-- MOVE EXISTING PROCESSES TO END, TO INCLUDE DOMAIN TABLES 
update spar.etl_execution_map set execution_order = execution_order + 7 where execution_parent_id = 0;

-- INCLUDING PROCESS CONE_COLLECTION_METHOD from Oracle to Postgres in EXECUTION_ID=0  
insert into spar.etl_execution_map(execution_id, execution_parent_id ,interface_id, source_file,source_name, source_table, source_db_type,
                                   target_file,target_name, target_table, target_db_type,target_primary_key, 
								   truncate_before_run ,retry_errors, execution_order)
select 14 										as execution_id, 
       0 										as execution_parent_id ,
       'SPAR-CONE-COLLECTION-ORACLE-TO-POSTGRES-TEST' 	    as interface_id, 
       '/SQL/SPAR/ORACLE_CONE_COLLECTION_METHOD_EXTRACT.sql'   as source_file, 
       'ORACLE THE'                 			as source_name, 
       'CONE_COLLECTION_METHOD_CODE'       		as source_table,
       'ORACLE'               	    			as source_db_type,
       '/SQL/SPAR/POSTGRES_CONE_COLLECTION_METHOD_UPSERT.sql' 	as target_file,
       'NEW SPAR' 								as target_name, 
       'spar.cone_collection_method_list' 		as target_table, 
       'POSTGRES' 								as target_db_type, 
       'cone_collection_method_code' 			as target_primary_key, 
       false 									as truncate_before_run ,
       false 									as retry_errors ,
	   1 										as execution_order
where not exists (select 1 from spar.etl_execution_map where interface_id = 'SPAR-CONE-COLLECTION-ORACLE-TO-POSTGRES-TEST');

-- INCLUDING PROCESS GAMETIC_METHODOLOGY from Oracle to Postgres in EXECUTION_ID=0  
insert into spar.etl_execution_map(execution_id, execution_parent_id ,interface_id, source_file,source_name, source_table, source_db_type,
                                   target_file,target_name, target_table, target_db_type,target_primary_key, 
								   truncate_before_run ,retry_errors, execution_order)
select 15 										as execution_id, 
       0 										as execution_parent_id ,
       'SPAR-GAMETIC-METHODOLOGY-ORACLE-TO-POSTGRES-TEST' 	    as interface_id, 
       '/SQL/SPAR/ORACLE_GAMETIC_METHODOLOGY_EXTRACT.sql'   as source_file, 
       'ORACLE THE'                 			as source_name, 
       'GAMETIC_MTHD_CODE'       				as source_table,
       'ORACLE'               	    			as source_db_type,
       '/SQL/SPAR/POSTGRES_GAMETIC_METHODOLOGY__UPSERT.sql' 	as target_file,
       'NEW SPAR' 								as target_name, 
       'spar.gametic_methodology_list' 			as target_table, 
       'POSTGRES' 								as target_db_type, 
       'gametic_methodology_code' 				as target_primary_key, 
       false 									as truncate_before_run ,
       false 									as retry_errors ,
	   2 										as execution_order
where not exists (select 1 from spar.etl_execution_map where interface_id = 'SPAR-GAMETIC-METHODOLOGY-ORACLE-TO-POSTGRES-TEST');
