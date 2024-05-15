DROP TABLE IF EXISTS spar.ETL_EXECUTION_MAP;
DROP TABLE IF EXISTS spar.ETL_EXECUTION_LOG;
DROP TABLE IF EXISTS spar.ETL_EXECUTION_LOG_HIST;

create table if not exists spar.ETL_EXECUTION_MAP(
interface_id 		  varchar(100) not null,
execution_id 		  integer not null,
execution_parent_id   integer,
execution_order 	  integer,
source_file 		  varchar(200),
source_db_type 		  varchar(200),
source_name 		  varchar(100),
source_table 		  varchar(100),
target_file 		  varchar(200),
target_db_type 		  varchar(200),
target_name 		  varchar(100),
target_table 		  varchar(100),
target_primary_key 	  varchar(100),
truncate_before_run   boolean     default false not null,
retry_errors   		  boolean     default false not null,
updated_at  		  timestamp   default now() not null,
created_at  		  timestamp   default now() not null,
constraint etl_execution_map_pk
    primary key (interface_id,execution_id)
);

comment on table spar.ETL_EXECUTION_MAP is 'ETL Tool monitoring table to store execution details of batch processing interfaces';
comment on column spar.ETL_EXECUTION_MAP.interface_id               is 'Unique interface name to represent a batch execution. Part of the composite PK, with execution_id column.';
comment on column spar.ETL_EXECUTION_MAP.execution_id               is 'Execution ID number to represent a instance of interface_id. Part of the composite PK, with interface_id column.';
comment on column spar.ETL_EXECUTION_MAP.execution_parent_id        is 'Reference to a parent execution ID that groups one or more execution_id in a batch run. If null, then this execution_id is a parent.';
comment on column spar.ETL_EXECUTION_MAP.execution_order            is 'Order of execution of this instance in a collection of same execution_parent_id. Execution runs in ascending order. If it is less than 0, it will not run.';
comment on column spar.ETL_EXECUTION_MAP.source_file                is 'Source instruction file for batch execution';
comment on column spar.ETL_EXECUTION_MAP.source_db_type             is 'Database type of the source connection. Expected ORACLE or POSTGRES.';
comment on column spar.ETL_EXECUTION_MAP.source_name                is 'Source name of this batch execution';
comment on column spar.ETL_EXECUTION_MAP.source_table               is 'Source table (if it is a single table) of this batch execution';
comment on column spar.ETL_EXECUTION_MAP.target_file                is 'Target instruction file for batch execution';
comment on column spar.ETL_EXECUTION_MAP.target_db_type             is 'Database type of the target connection. Expected ORACLE or POSTGRES.';
comment on column spar.ETL_EXECUTION_MAP.target_name                is 'Target name of this batch execution';
comment on column spar.ETL_EXECUTION_MAP.target_table               is 'Target table (if it is a single table) of this batch execution';
comment on column spar.ETL_EXECUTION_MAP.target_primary_key         is 'Primary key of the target table of this batch execution';
comment on column spar.ETL_EXECUTION_MAP.truncate_before_run        is 'If the target table should be truncated before the batch execution';
comment on column spar.ETL_EXECUTION_MAP.retry_errors        		is 'If true, this process will execute again old instances with errors in ETL_EXECUTION_LOG_HIST';
comment on column spar.ETL_EXECUTION_MAP.updated_at                 is 'Timestamp of the last time this record was updated';
comment on column spar.ETL_EXECUTION_MAP.created_at                 is 'Timestamp of the time this record was created';

create table spar.ETL_EXECUTION_SCHEDULE(
interface_id 	varchar(100) not null,
execution_id 	integer      not null,
last_run_ts		timestamp,
current_run_ts  timestamp,
updated_at      timestamp    default now() not null,
created_at  	timestamp    default now() not null,
constraint etl_execution_schedule_pk
	primary key (interface_id,execution_id)
);

comment on table  spar.ETL_EXECUTION_SCHEDULE 				is 'ETL Tool schedule table to define what delta time should be used in the next execution';
comment on column spar.ETL_EXECUTION_SCHEDULE.interface_id       is 'Unique interface name to represent a batch execution. Refer to EXECUTION_MAP table PK';
comment on column spar.ETL_EXECUTION_SCHEDULE.execution_id       is 'The execution ID that represent a batch execution. Refer to EXECUTION_MAP table PK';
comment on column spar.ETL_EXECUTION_SCHEDULE.last_run_ts        is 'Last timestamp this interface/execution_id was executed for batch execution';
comment on column spar.ETL_EXECUTION_SCHEDULE.current_run_ts     is 'Current timestamp this interface was executed of this batch execution. It will be the next last_run_ts for this execution.';
comment on column spar.ETL_EXECUTION_SCHEDULE.updated_at         is 'Timestamp of the last time this record was updated';
comment on column spar.ETL_EXECUTION_SCHEDULE.created_at         is 'Timestamp of the time this record was created';


create table spar.ETL_EXECUTION_LOG_HIST(
interface_id 				varchar(100) not null,
execution_id 				integer 	 not null,
execution_status 			varchar(100) not null,
execution_details 			text,
source_connect_timedelta 	interval,
source_extract_timedelta 	interval,
source_extract_row_count 	integer,
target_connect_timedelta 	interval,
target_load_timedelta 		interval,
target_load_row_count 		integer,
process_started_at 			timestamp,
process_finished_at 		timestamp,
process_timedelta   		interval,
last_run_ts 				timestamp,
current_run_ts 				timestamp,
retry_process				boolean 	default false,
updated_at  				timestamp   default now() not null,
created_at  				timestamp   default now() not null
);


comment on table  spar.ETL_EXECUTION_LOG_HIST is 'ETL Tool monitoring table to store all executed instances of batch processing interfaces';
comment on column spar.ETL_EXECUTION_LOG_HIST.interface_id       		is 'Unique interface name to represent a batch execution. Refer to EXECUTION_MAP table PK';
comment on column spar.ETL_EXECUTION_LOG_HIST.execution_id       		is 'The execution ID that represent a batch execution. Refer to EXECUTION_MAP table PK';
comment on column spar.ETL_EXECUTION_LOG_HIST.execution_status       	is 'Status of this execution. FAILED or SUCCESS expected.';
comment on column spar.ETL_EXECUTION_LOG_HIST.execution_details         is 'Reference text of this interface instance execution';
comment on column spar.ETL_EXECUTION_LOG_HIST.source_connect_timedelta  is 'Timedelta referring to how much time was needed to stablish a connection in the source database';
comment on column spar.ETL_EXECUTION_LOG_HIST.source_extract_timedelta  is 'Timedelta referring to how much time was needed to execute a extract statement in the source database';
comment on column spar.ETL_EXECUTION_LOG_HIST.source_extract_row_count  is 'Number of rows extracted from the source database for this execution.';
comment on column spar.ETL_EXECUTION_LOG_HIST.target_connect_timedelta  is 'Timedelta referring to how much time was needed to stablish a connection in the target database';
comment on column spar.ETL_EXECUTION_LOG_HIST.target_load_timedelta     is 'Timedelta referring to how much time was needed to load the extracted data in the target database';
comment on column spar.ETL_EXECUTION_LOG_HIST.target_load_row_count     is 'Number of rows inserted or updated in the target database for this execution.';
comment on column spar.ETL_EXECUTION_LOG_HIST.process_started_at        is 'Timestamp when this execution instance was started';
comment on column spar.ETL_EXECUTION_LOG_HIST.process_finished_at       is 'Timestamp when this execution instance was finished';
comment on column spar.ETL_EXECUTION_LOG_HIST.process_timedelta         is 'Timedelta referring how much time was spent to execute the whole process.';
comment on column spar.ETL_EXECUTION_LOG_HIST.last_run_ts               is 'Last timestamp this interface instance was executed for batch execution';
comment on column spar.ETL_EXECUTION_LOG_HIST.current_run_ts            is 'Current timestamp this interface instance was executed of this batch execution';
comment on column spar.ETL_EXECUTION_LOG_HIST.retry_process             is 'If true, this log instance will be processed again (with last_run_ts and current_run_ts parameters)';
comment on column spar.ETL_EXECUTION_LOG_HIST.updated_at                is 'Timestamp of the last time this record was updated';
comment on column spar.ETL_EXECUTION_LOG_HIST.created_at                is 'Timestamp of the time this record was created';


/*
-- DML for Generic interface_id for generic running
*/

/* ORACLE TO POSTGRES ORCHESTRATION: TEST EXECUTION */
insert into spar.etl_execution_map(execution_id, execution_parent_id ,interface_id, source_file,source_name, source_table, source_db_type,
                                   target_file,target_name, target_table, target_db_type,target_primary_key,
								   truncate_before_run , execution_order)
select 0 				as execution_id,
       null 			as execution_parent_id ,
       'ETL-RUN-ORACLE-TO-POSTGRES-TEST' 		as interface_id,
       null 			as source_file,
       'MAIN PROCESS FROM ORACLE' 	as source_name,
       null 			as source_table,
       null 			as source_db_type,
       null 			as target_file,
       'MAIN PROCESS TO POSTGRES' 	as target_name,
       null 			as target_table,
       null 			as target_db_type,
       null 			as target_primary_key,
       false 			as truncate_before_run ,
	   0 				as execution_order
where not exists (select 1 from spar.etl_execution_map where interface_id = 'ETL-RUN-ORACLE-TO-POSTGRES-TEST');

insert into spar.etl_execution_map(execution_id, execution_parent_id ,interface_id, source_file,source_name, source_table, source_db_type,
                                   target_file,target_name, target_table, target_db_type,target_primary_key,
								   truncate_before_run ,retry_errors, execution_order)
select 1 										as execution_id,
       0 										as execution_parent_id ,
       'SPAR-SEEDLOT-ORACLE-TO-POSTGRES-TEST' 	    as interface_id,
       '/SQL/SPAR/ORACLE_SEEDLOT_EXTRACT.sql'   as source_file,
       'ORACLE THE'                 			as source_name,
       'SEEDLOT'               	    			as source_table,
       'ORACLE'               	    			as source_db_type,
       '/SQL/SPAR/POSTGRES_SEEDLOT_UPSERT.sql' 	as target_file,
       'NEW SPAR' 								as target_name,
       'spar.seedlot' 							as target_table,
       'POSTGRES' 								as target_db_type,
       'seedlot_number' 						as target_primary_key,
       true 									as truncate_before_run ,
       false 									as retry_errors ,
	   1 										as execution_order
where not exists (select 1 from spar.etl_execution_map where interface_id = 'SPAR-SEEDLOT-ORACLE-TO-POSTGRES-TEST');

/* POSTGRES TO ORACLE ORCHESTRATION: TEST EXECUTION */
insert into spar.etl_execution_map(execution_id, execution_parent_id ,interface_id, source_file,source_name, source_table, source_db_type,
                                   target_file,target_name, target_table, target_db_type,target_primary_key,
								   truncate_before_run , execution_order)
select 2 				as execution_id,
       null 			as execution_parent_id ,
       'ETL-RUN-POSTGRES-TO-ORACLE-TEST' 		as interface_id,
       null 			as source_file,
       'MAIN PROCESS FROM `POSTGRES' 	    as source_name,
       null 			as source_table,
       null 			as source_db_type,
       null 			as target_file,
       'MAIN PROCESS TO ORACLE' 	        as target_name,
       null 			as target_table,
       null 			as target_db_type,
       null 			as target_primary_key,
       false 			as truncate_before_run ,
	   0 				as execution_order
where not exists (select 1 from spar.etl_execution_map where interface_id = 'ETL-RUN-POSTGRES-TO-ORACLE-TEST');

insert into spar.etl_execution_map(execution_id, execution_parent_id ,interface_id, source_file,source_name, source_table, source_db_type,
                                   target_file,target_name, target_table, target_db_type,target_primary_key,
								   truncate_before_run , retry_errors, execution_order)
select 3 										as execution_id,
       2 										as execution_parent_id ,
       'SEEDLOT-ORACLE-TO-SPAR-POSTGRES-TEST' 	    as interface_id,
       '/SQL/SPAR/POSTGRES_SEEDLOT_EXTRACT.sql' as source_file,
       'NEW SPAR'                    			as source_name,
       'spar.seedlot'          	    			as source_table,
       'POSTGRES'          	    				as source_db_type,
       '/SQL/SPAR/ORACLE_SEEDLOT_LOAD.sql' 	    as target_file,
       'ORACLE THE' 							as target_name,
       'SEEDLOT' 							    as target_table,
       'ORACLE' 							    as target_db_type,
       'seedlot_number' 						as target_primary_key,
       false 									as truncate_before_run ,
       true 									as retry_errors ,
	   1 										as execution_order
where not exists (select 1 from spar.etl_execution_map where interface_id = 'SEEDLOT-ORACLE-TO-SPAR-POSTGRES-TEST');
