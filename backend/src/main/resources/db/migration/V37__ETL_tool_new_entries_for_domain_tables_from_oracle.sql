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

-- INCLUDING PROCESS GENETIC_CLASS from Oracle to Postgres in EXECUTION_ID=0  
insert into spar.etl_execution_map(execution_id, execution_parent_id ,interface_id, source_file,source_name, source_table, source_db_type,
                                   target_file,target_name, target_table, target_db_type,target_primary_key, 
								   truncate_before_run ,retry_errors, execution_order)
select 16 										as execution_id, 
       0 										as execution_parent_id ,
       'SPAR-GENETIC-CLASS-ORACLE-TO-POSTGRES-TEST'   as interface_id, 
       '/SQL/SPAR/ORACLE_GENETIC_CLASS_EXTRACT.sql'   as source_file, 
       'ORACLE THE'                 			as source_name, 
       'GENETIC_CLASS_CODE'       				as source_table,
       'ORACLE'               	    			as source_db_type,
       '/SQL/SPAR/POSTGRES_GENETIC_CLASS_UPSERT.sql' 	as target_file,
       'NEW SPAR' 								as target_name, 
       'spar.genetic_class_list' 			as target_table, 
       'POSTGRES' 								as target_db_type, 
       'genetic_class_code' 				as target_primary_key, 
       false 									as truncate_before_run ,
       false 									as retry_errors,
	   3 										as execution_order
where not exists (select 1 from spar.etl_execution_map where interface_id = 'SPAR-GENETIC-CLASS-ORACLE-TO-POSTGRES-TEST');

-- INCLUDING PROCESS GENETIC_WORTH from Oracle to Postgres in EXECUTION_ID=0  
insert into spar.etl_execution_map(execution_id, execution_parent_id ,interface_id, source_file,source_name, source_table, source_db_type,
                                   target_file,target_name, target_table, target_db_type,target_primary_key, 
								   truncate_before_run ,retry_errors, execution_order)
select 17 										as execution_id, 
       0 										as execution_parent_id ,
       'SPAR-GENETIC-WORTH-ORACLE-TO-POSTGRES-TEST'   as interface_id, 
       '/SQL/SPAR/ORACLE_GENETIC_WORTH_EXTRACT.sql'   as source_file, 
       'ORACLE THE'                 			as source_name, 
       'GENETIC_WORTH_CODE'       				as source_table,
       'ORACLE'               	    			as source_db_type,
       '/SQL/SPAR/POSTGRES_GENETIC_WORTH_UPSERT.sql' 	as target_file,
       'NEW SPAR' 								as target_name, 
       'spar.genetic_worth_list' 				as target_table, 
       'POSTGRES' 								as target_db_type, 
       'genetic_worth_code' 					as target_primary_key, 
       false 									as truncate_before_run ,
       false 									as retry_errors,
	   4 										as execution_order
where not exists (select 1 from spar.etl_execution_map where interface_id = 'SPAR-GENETIC-WORTH-ORACLE-TO-POSTGRES-TEST');

-- INCLUDING PROCESS method_of_payment from Oracle to Postgres in EXECUTION_ID=0  
insert into spar.etl_execution_map(execution_id, execution_parent_id ,interface_id, source_file,source_name, source_table, source_db_type,
                                   target_file,target_name, target_table, target_db_type,target_primary_key, 
								   truncate_before_run ,retry_errors, execution_order)
select 18 										as execution_id, 
       0 										as execution_parent_id ,
       'SPAR-METHOD-OF-PAYMENT-ORACLE-TO-POSTGRES-TEST'   as interface_id, 
       '/SQL/SPAR/ORACLE_METHOD_OF_PAYMENT_EXTRACT.sql'   as source_file, 
       'ORACLE THE'                 			as source_name, 
       'METHOD_OF_PAYMENT_CODE'       				as source_table,
       'ORACLE'               	    			as source_db_type,
       '/SQL/SPAR/POSTGRES_METHOD_OF_PAYMENT_UPSERT.sql' 	as target_file,
       'NEW SPAR' 								as target_name, 
       'spar.method_of_payment_list' 				as target_table, 
       'POSTGRES' 								as target_db_type, 
       'method_of_payment_code' 					as target_primary_key, 
       false 									as truncate_before_run ,
       false 									as retry_errors,
	   5 										as execution_order
where not exists (select 1 from spar.etl_execution_map where interface_id = 'SPAR-METHOD-OF-PAYMENT-ORACLE-TO-POSTGRES-TEST');

-- INCLUDING PROCESS seedlot_source from Oracle to Postgres in EXECUTION_ID=0  
insert into spar.etl_execution_map(execution_id, execution_parent_id ,interface_id, source_file,source_name, source_table, source_db_type,
                                   target_file,target_name, target_table, target_db_type,target_primary_key, 
								   truncate_before_run ,retry_errors, execution_order)
select 19 										as execution_id, 
       0 										as execution_parent_id ,
       'SPAR-SEEDLOT-SOURCE-ORACLE-TO-POSTGRES-TEST'   as interface_id, 
       '/SQL/SPAR/ORACLE_SEEDLOT_SOURCE_EXTRACT.sql'   as source_file, 
       'ORACLE THE'                 			as source_name, 
       'SEEDLOT_SOURCE_CODE'       				as source_table,
       'ORACLE'               	    			as source_db_type,
       '/SQL/SPAR/POSTGRES_SEEDLOT_SOURCE_UPSERT.sql' 	as target_file,
       'NEW SPAR' 								as target_name, 
       'spar.seedlot_source_list' 				as target_table, 
       'POSTGRES' 								as target_db_type, 
       'seedlot_source_code' 					as target_primary_key, 
       false 									as truncate_before_run ,
       false 									as retry_errors,
	   6 										as execution_order
where not exists (select 1 from spar.etl_execution_map where interface_id = 'SPAR-SEEDLOT-SOURCE-ORACLE-TO-POSTGRES-TEST');

-- INCLUDING PROCESS seedlot_source from Oracle to Postgres in EXECUTION_ID=0  
insert into spar.etl_execution_map(execution_id, execution_parent_id ,interface_id, source_file,source_name, source_table, source_db_type,
                                   target_file,target_name, target_table, target_db_type,target_primary_key, 
								   truncate_before_run ,retry_errors, execution_order)
select 20 										as execution_id, 
       0 										as execution_parent_id ,
       'SPAR-SEEDLOT-STATUS-ORACLE-TO-POSTGRES-TEST'   as interface_id, 
       '/SQL/SPAR/ORACLE_SEEDLOT_STATUS_EXTRACT.sql'   as source_file, 
       'ORACLE THE'                 			as source_name, 
       'SEEDLOT_STATUS_CODE'       				as source_table,
       'ORACLE'               	    			as source_db_type,
       '/SQL/SPAR/POSTGRES_SEEDLOT_STATUS_UPSERT.sql' 	as target_file,
       'NEW SPAR' 								as target_name, 
       'spar.seedlot_status_list' 				as target_table, 
       'POSTGRES' 								as target_db_type, 
       'seedlot_status_code' 					as target_primary_key, 
       false 									as truncate_before_run ,
       false 									as retry_errors,
	   7 										as execution_order
where not exists (select 1 from spar.etl_execution_map where interface_id = 'SPAR-SEEDLOT-STATUS-ORACLE-TO-POSTGRES-TEST');