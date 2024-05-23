-- Processes gathering data from Oracle to Postgres (First to bring all historical data)

-- INCLUDING PROCESS SMP_MIX from Oracle to Postgres in EXECUTION_ID=0 
insert into spar.etl_execution_map(execution_id, execution_parent_id ,interface_id, source_file,source_name, source_table, source_db_type,
                                   target_file,target_name, target_table, target_db_type,target_primary_key, 
								   truncate_before_run ,retry_errors, execution_order)
select 4 										as execution_id, 
       0 										as execution_parent_id ,
       'SPAR-SMPMIX-ORACLE-TO-POSTGRES-TEST' 	    as interface_id, 
       '/SQL/SPAR/ORACLE_SMP_MIX_EXTRACT.sql'   as source_file,
       'ORACLE THE'                 			as source_name, 
       'SMP_MIX'               	    			as source_table,
       'ORACLE'               	    			as source_db_type,
       '/SQL/SPAR/POSTGRES_SMP_MIX_UPSERT.sql' 	as target_file,
       'NEW SPAR' 								as target_name, 
       'spar.smp_mix' 							as target_table, 
       'POSTGRES' 								as target_db_type, 
       'seedlot_number,parent_tree_id' 			as target_primary_key, 
       false 									as truncate_before_run ,
       false 									as retry_errors ,
	   2 										as execution_order
where not exists (select 1 from spar.etl_execution_map where interface_id = 'SPAR-SMPMIX-ORACLE-TO-POSTGRES-TEST');

insert into spar.etl_execution_map(execution_id, execution_parent_id ,interface_id, source_file,source_name, source_table, source_db_type,
                                   target_file,target_name, target_table, target_db_type,target_primary_key, 
								   truncate_before_run ,retry_errors, execution_order)
select 5 										as execution_id, 
       0 										as execution_parent_id ,
       'SPAR-SMPMIX-GEN-QLTY-ORACLE-TO-POSTGRES-TEST' 	    as interface_id, 
       '/SQL/SPAR/ORACLE_SMP_MIX_GEN_QLTY_EXTRACT.sql'   as source_file,
       'ORACLE THE'                 			as source_name, 
       'SMP_MIX_GEN_QLTY'               	    			as source_table,
       'ORACLE'               	    			as source_db_type,
       '/SQL/SPAR/POSTGRES_SMP_MIX_GEN_QLTY_UPSERT.sql' 	as target_file,
       'NEW SPAR' 								as target_name, 
       'spar.smp_mix_gen_qlty' 							as target_table, 
       'POSTGRES' 								as target_db_type, 
       'seedlot_number,parent_tree_id,genetic_type_code,genetic_worth_code' 					as target_primary_key, 
       false 									as truncate_before_run ,
       false 									as retry_errors ,
	   3 										as execution_order
where not exists (select 1 from spar.etl_execution_map where interface_id = 'SPAR-SMPMIX-GEN-QLTY-ORACLE-TO-POSTGRES-TEST');


-- INCLUDING PROCESS SEEDLOT_PARENT_TREE_SMP_MIX from Oracle to Postgres in EXECUTION_ID=0 
insert into spar.etl_execution_map(execution_id, execution_parent_id ,interface_id, source_file,source_name, source_table, source_db_type,
                                   target_file,target_name, target_table, target_db_type,target_primary_key, 
								   truncate_before_run ,retry_errors, execution_order)
select 6 										as execution_id, 
       0 										as execution_parent_id ,
       'SPAR-SEEDLOT-PARENT-TREE-ORACLE-TO-POSTGRES-TEST' 	    as interface_id, 
       '/SQL/SPAR/ORACLE_SEEDLOT_PARENT_TREE_EXTRACT.sql'   as source_file, 
       'ORACLE THE'                 			as source_name, 
       'SEEDLOT_PARENT_TREE'               	    as source_table,
       'ORACLE'               	    			as source_db_type,
       '/SQL/SPAR/POSTGRES_SEEDLOT_PARENT_TREE_UPSERT.sql' 	as target_file,
       'NEW SPAR' 								as target_name, 
       'spar.seedlot_parent_tree' 				as target_table, 
       'POSTGRES' 								as target_db_type, 
       'seedlot_number,parent_tree_id'          as target_primary_key, 
       false 									as truncate_before_run ,
       false 									as retry_errors ,
	   4 										as execution_order
where not exists (select 1 from spar.etl_execution_map where interface_id = 'SPAR-SEEDLOT-PARENT-TREE-ORACLE-TO-POSTGRES-TEST');

-- INCLUDING PROCESS SEEDLOT_PARENT_TREE_SMP_MIX from Oracle to Postgres in EXECUTION_ID=0 
insert into spar.etl_execution_map(execution_id, execution_parent_id ,interface_id, source_file,source_name, source_table, source_db_type,
                                   target_file,target_name, target_table, target_db_type,target_primary_key, 
								   truncate_before_run ,retry_errors, execution_order)
select 7 										as execution_id, 
       0 										as execution_parent_id ,
       'SPAR-SEEDLOT-PARENT-TREE-SMPMIX-ORACLE-TO-POSTGRES-TEST' 	    as interface_id, 
       '/SQL/SPAR/ORACLE_PARENT_TREE_SMPMIX_EXTRACT.sql'   as source_file, 
       'ORACLE THE'                 			as source_name, 
       'SMP_MIX_GEN_QLTY'               	   	as source_table,
       'ORACLE'               	    			as source_db_type,
       '/SQL/SPAR/POSTGRES_PARENT_TREE_SMPMIX_UPSERT.sql' 	as target_file,
       'NEW SPAR' 								as target_name, 
       'spar.seedlot_parent_tree_smp_mix' 							as target_table, 
       'POSTGRES' 								as target_db_type, 
       'seedlot_number,parent_tree_id,genetic_type_code,genetic_worth_code' 					as target_primary_key, 
       false 									as truncate_before_run ,
       false 									as retry_errors ,
	   5 										as execution_order
where not exists (select 1 from spar.etl_execution_map where interface_id = 'SPAR-SEEDLOT-PARENT-TREE-SMPMIX-ORACLE-TO-POSTGRES-TEST');

-- INCLUDING PROCESS SEEDLOT_ORCHARD from Oracle to Postgres in EXECUTION_ID=0  
insert into spar.etl_execution_map(execution_id, execution_parent_id ,interface_id, source_file,source_name, source_table, source_db_type,
                                   target_file,target_name, target_table, target_db_type,target_primary_key, 
								   truncate_before_run ,retry_errors, execution_order)
select 8 										as execution_id, 
       0 										as execution_parent_id ,
       'SPAR-SEEDLOT-ORCHARD-ORACLE-TO-POSTGRES-TEST' 	    as interface_id, 
       '/SQL/SPAR/ORACLE_SEEDLOT_ORCHARD_EXTRACT.sql'   as source_file, -- SAME AS SMP_MIX_GEN_QLTY Extract (same structure)
       'ORACLE THE'                 			as source_name, 
       'SEEDLOT'               	    			as source_table,
       'ORACLE'               	    			as source_db_type,
       '/SQL/SPAR/POSTGRES_SEEDLOT_ORCHARD_UPSERT.sql' 	as target_file,
       'NEW SPAR' 								as target_name, 
       'spar.seedlot_orchard' 					as target_table, 
       'POSTGRES' 								as target_db_type, 
       'seedlot_number,primary_ind' 			as target_primary_key, 
       false 									as truncate_before_run ,
       false 									as retry_errors ,
	   6 										as execution_order
where not exists (select 1 from spar.etl_execution_map where interface_id = 'SPAR-SEEDLOT-ORCHARD-ORACLE-TO-POSTGRES-TEST');

-- INCLUDING PROCESS SEEDLOT_GENETIC_WORTH from Oracle to Postgres in EXECUTION_ID=0  
insert into spar.etl_execution_map(execution_id, execution_parent_id ,interface_id, source_file,source_name, source_table, source_db_type,
                                   target_file,target_name, target_table, target_db_type,target_primary_key, 
								   truncate_before_run ,retry_errors, execution_order)
select 9 										as execution_id, 
       0 										as execution_parent_id ,
       'SPAR-SEEDLOT-GENETIC-WORTH-ORACLE-TO-POSTGRES-TEST' 	    as interface_id, 
       '/SQL/SPAR/ORACLE_SEEDLOT_GENETIC_WORTH_EXTRACT.sql'   as source_file, 
       'ORACLE THE'                 			as source_name, 
       'SMP_MIX_GEN_QLTY'           			as source_table,
       'ORACLE'               	    			as source_db_type,
       '/SQL/SPAR/POSTGRES_SEEDLOT_GENETIC_WORTH_UPSERT.sql' 	as target_file,
       'NEW SPAR' 								as target_name, 
       'spar.seedlot_genetic_worth' 			as target_table, 
       'POSTGRES' 								as target_db_type, 
       'seedlot_number,genetic_worth_code' 		as target_primary_key, 
       false 									as truncate_before_run ,
       false 									as retry_errors ,
	   7 										as execution_order
where not exists (select 1 from spar.etl_execution_map where interface_id = 'SPAR-SEEDLOT-GENETIC-WORTH-ORACLE-TO-POSTGRES-TEST');



-- INCLUDING PROCESS SEEDLOT_OWNER_QUANTITY from Oracle to Postgres in EXECUTION_ID=0  
insert into spar.etl_execution_map(execution_id, execution_parent_id ,interface_id, source_file,source_name, source_table, source_db_type,
                                   target_file,target_name, target_table, target_db_type,target_primary_key, 
								   truncate_before_run ,retry_errors, execution_order)
select 10 										as execution_id, 
       0 										as execution_parent_id ,
       'SPAR-SEEDLOT-OWNER-QUANTITY-ORACLE-TO-POSTGRES-TEST' 	    as interface_id, 
       '/SQL/SPAR/ORACLE_SEEDLOT_OWNER_QUANTITY_EXTRACT.sql'   as source_file, -- SAME AS SMP_MIX_GEN_QLTY Extract (same structure)
       'ORACLE THE'                 			as source_name, 
       'SEEDLOT_OWNER_QUANTITY'           			as source_table,
       'ORACLE'               	    			as source_db_type,
       '/SQL/SPAR/POSTGRES_SEEDLOT_OWNER_QUANTITY_UPSERT.sql' 	as target_file,
       'NEW SPAR' 								as target_name, 
       'spar.seedlot_owner_quantity' 			as target_table, 
       'POSTGRES' 								as target_db_type, 
       'seedlot_number,owner_client_number,owner_locn_code' 		as target_primary_key, 
       false 									as truncate_before_run ,
       false 									as retry_errors ,
	   8 										as execution_order
where not exists (select 1 from spar.etl_execution_map where interface_id = 'SPAR-SEEDLOT-OWNER-QUANTITY-ORACLE-TO-POSTGRES-TEST');




-- INCLUDING PROCESS seedlot_collection_method from Oracle to Postgres in EXECUTION_ID=0  
insert into spar.etl_execution_map(execution_id, execution_parent_id ,interface_id, source_file,source_name, source_table, source_db_type,
                                   target_file,target_name, target_table, target_db_type,target_primary_key, 
								   truncate_before_run ,retry_errors, execution_order)
select 11 										as execution_id, 
       0 										as execution_parent_id ,
       'SPAR-SEEDLOT-COLLECTION-METHOD-ORACLE-TO-POSTGRES-TEST' 	    as interface_id, 
       '/SQL/SPAR/ORACLE_SEEDLOT_COLLECTION_METHOD_EXTRACT.sql'   as source_file, -- SAME AS SMP_MIX_GEN_QLTY Extract (same structure)
       'ORACLE THE'                 			as source_name, 
       'CONE_COLLECTION_METHOD_CODE'       		as source_table,
       'ORACLE'               	    			as source_db_type,
       '/SQL/SPAR/POSTGRES_SEEDLOT_COLLECTION_METHOD_UPSERT.sql' 	as target_file,
       'NEW SPAR' 								as target_name, 
       'spar.seedlot_collection_method' 		as target_table, 
       'POSTGRES' 								as target_db_type, 
       'seedlot_number,cone_collection_method_code' 		as target_primary_key, 
       false 									as truncate_before_run ,
       false 									as retry_errors ,
	   9 										as execution_order
where not exists (select 1 from spar.etl_execution_map where interface_id = 'SPAR-SEEDLOT-COLLECTION-METHOD-ORACLE-TO-POSTGRES-TEST');


-- INCLUDING PROCESS SEEDLOT_PARENT_TREE_GEN_QLTY from Oracle to Postgres in EXECUTION_ID=0  
insert into spar.etl_execution_map(execution_id, execution_parent_id ,interface_id, source_file,source_name, source_table, source_db_type,
                                   target_file,target_name, target_table, target_db_type,target_primary_key, 
								   truncate_before_run ,retry_errors, execution_order)
select 12 										as execution_id, 
       0 										as execution_parent_id ,
       'SPAR-SEEDLOT-PARENT-TREE-GEN-QLTY-ORACLE-TO-POSTGRES-TEST' 	    as interface_id, 
       '/SQL/SPAR/ORACLE_SEEDLOT_PARENT_TREE_GEN_QLTY_EXTRACT.sql'   as source_file, -- SAME AS SMP_MIX_GEN_QLTY Extract (same structure)
       'ORACLE THE'                 			as source_name, 
       'SEEDLOT_PARENT_TREE_GEN_QLTY'       		as source_table,
       'ORACLE'               	    			as source_db_type,
       '/SQL/SPAR/POSTGRES_SEEDLOT_COLLECTION_METHOD_UPSERT.sql' 	as target_file,
       'NEW SPAR' 								as target_name, 
       'spar.seedlot_parent_tree_gen_qlty' 		as target_table, 
       'POSTGRES' 								as target_db_type, 
       'seedlot_number,parent_tree_id,genetic_type_code,genetic_worth_code' 	as target_primary_key, 
       false 									as truncate_before_run ,
       false 									as retry_errors ,
	   10 										as execution_order
where not exists (select 1 from spar.etl_execution_map where interface_id = 'SPAR-SEEDLOT-PARENT-TREE-GEN-QLTY-ORACLE-TO-POSTGRES-TEST');


-- INCLUDING PROCESS SEEDLOT_SEED_PLAN_ZONE from Oracle to Postgres in EXECUTION_ID=0  
insert into spar.etl_execution_map(execution_id, execution_parent_id ,interface_id, source_file,source_name, source_table, source_db_type,
                                   target_file,target_name, target_table, target_db_type,target_primary_key, 
								   truncate_before_run ,retry_errors, execution_order)
select 13 										as execution_id, 
       0 										as execution_parent_id ,
       'SPAR-SEEDLOT-SEED-PLAN-ZONE-ORACLE-TO-POSTGRES-TEST' 	    as interface_id, 
       '/SQL/SPAR/ORACLE_SEEDLOT_SEED_PLAN_ZONE_EXTRACT.sql'   as source_file, -- SAME AS SMP_MIX_GEN_QLTY Extract (same structure)
       'ORACLE THE'                 			as source_name, 
       'SEEDLOT_PLAN_ZONE'       				as source_table,
       'ORACLE'               	    			as source_db_type,
       '/SQL/SPAR/POSTGRES_SEEDLOT_SEED_PLAN_ZONE_UPSERT.sql' 	as target_file,
       'NEW SPAR' 								as target_name, 
       'spar.seedlot_seed_plan_zone' 			as target_table, 
       'POSTGRES' 								as target_db_type, 
       'seedlot_number,seed_plan_zone_code' 	as target_primary_key, 
       false 									as truncate_before_run ,
       false 									as retry_errors ,
	   11 										as execution_order
where not exists (select 1 from spar.etl_execution_map where interface_id = 'SPAR-SEEDLOT-SEED-PLAN-ZONE-ORACLE-TO-POSTGRES-TEST');