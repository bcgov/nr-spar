create table if not exists spar.ETL_EXECUTION_MAP(
interface_id varchar(100) not null,
source_file varchar(200),
source_name varchar(100),
source_table varchar(100),
target_file varchar(200),
target_name varchar(100),
target_table varchar(100),
truncate_before_run boolean default false not null,
updated_at  timestamp   default now() not null,
created_at  timestamp   default now() not null,
constraint etl_execution_map_pk
    primary key (interface_id)
);

comment on table spar.ETL_EXECUTION_MAP is 'ETL Tool monitoring table to store execution details of batch processing interfaces';
comment on column spar.ETL_EXECUTION_MAP.interface_id               is 'Unique interface name to represent a batch execution';
comment on column spar.ETL_EXECUTION_MAP.source_file                is 'Source instruction file for batch execution'; 
comment on column spar.ETL_EXECUTION_MAP.source_name                is 'Source name of this batch execution'; 
comment on column spar.ETL_EXECUTION_MAP.source_table               is 'Source table (if it is a single table) of this batch execution';
comment on column spar.ETL_EXECUTION_MAP.target_file                is 'Target instruction file for batch execution'; 
comment on column spar.ETL_EXECUTION_MAP.target_name                is 'Target name of this batch execution'; 
comment on column spar.ETL_EXECUTION_MAP.target_table               is 'Target table (if it is a single table) of this batch execution'; 
comment on column spar.ETL_EXECUTION_MAP.truncate_before_run        is 'If the target table should be truncated before the batch execution'; 
comment on column spar.ETL_EXECUTION_MAP.updated_at                 is 'Timestamp of the last time this record was updated'; 
comment on column spar.ETL_EXECUTION_MAP.created_at                 is 'Timestamp of the time this record was created'; 


create table spar.ETL_EXECUTION_LOG(
interface_id varchar(100) not null,
last_run_ts timestamp,
current_run_ts timestamp,
updated_at  timestamp   default now() not null,
created_at  timestamp   default now() not null
);


comment on table spar.ETL_EXECUTION_LOG is 'ETL Tool monitoring table to store execution current instance of batch processing interfaces';
comment on column spar.ETL_EXECUTION_LOG.interface_id               is 'Unique interface name to represent a batch execution';
comment on column spar.ETL_EXECUTION_LOG.last_run_ts                is 'Last timestamp this interface was executed for batch execution'; 
comment on column spar.ETL_EXECUTION_LOG.current_run_ts             is 'Current timestamp this interface was executed of this batch execution'; 
comment on column spar.ETL_EXECUTION_LOG.updated_at                 is 'Timestamp of the last time this record was updated'; 
comment on column spar.ETL_EXECUTION_LOG.created_at                 is 'Timestamp of the time this record was created'; 

create table spar.ETL_EXECUTION_LOG_HIST(
interface_id varchar(100) not null,
last_run_ts timestamp,
current_run_ts timestamp,
execution_details text,
updated_at  timestamp   default now() not null,
created_at  timestamp   default now() not null
);


comment on table spar.ETL_EXECUTION_LOG_HIST is 'ETL Tool monitoring table to store all executed instances of batch processing interfaces';
comment on column spar.ETL_EXECUTION_LOG_HIST.interface_id               is 'Unique interface name to represent a batch execution';
comment on column spar.ETL_EXECUTION_LOG_HIST.last_run_ts                is 'Last timestamp this interface was executed for batch execution'; 
comment on column spar.ETL_EXECUTION_LOG_HIST.current_run_ts             is 'Current timestamp this interface was executed of this batch execution'; 
comment on column spar.ETL_EXECUTION_LOG_HIST.execution_details          is 'Reference text of this interface instance execution'; 
comment on column spar.ETL_EXECUTION_LOG_HIST.updated_at                 is 'Timestamp of the last time this record was updated'; 
comment on column spar.ETL_EXECUTION_LOG_HIST.created_at                 is 'Timestamp of the time this record was created'; 