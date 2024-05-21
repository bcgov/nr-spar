

-- INCLUDING PROCESS SMP_MIX from Oracle to Postgres in EXECUTION_ID=0 
insert into spar.etl_execution_map(execution_id, execution_parent_id ,interface_id, source_file,source_name, source_table, source_db_type,
                                   target_file,target_name, target_table, target_db_type,target_primary_key, 
								   truncate_before_run ,retry_errors, execution_order)
select 4 										as execution_id, 
       0 										as execution_parent_id ,
       'SPAR-SMPMIX-ORACLE-TO-POSTGRES-TEST' 	    as interface_id, 
       '/SQL/SPAR/ORACLE_SMP_MIX_EXTRACT.sql'   as source_file,
       'ORACLE THE'                 			as source_name, 
       'SEEDLOT'               	    			as source_table,
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