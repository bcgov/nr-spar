-- Table ETL_EXECUTION_LOG does not exist as it was dropped from the database in
-- V33 and then not created again, however it does exist in the physical database
-- for TEST and PROD. This migration should ensure that any subsequent database
-- created from these migrations resembles the current state of the database,
-- while at the same time not modifying the physical table in TEST and PROD.

create table  IF NOT EXISTS spar.etl_execution_log(
from_timestamp timestamp not null,
to_timestamp   timestamp not null,
run_status varchar(100) not null,
updated_at  timestamp   default now() not null,
created_at  timestamp   default now() not null
);

comment on table spar.ETL_EXECUTION_LOG is 'ETL Tool monitoring table to store execution current instance of batch processing interfaces';
comment on column spar.ETL_EXECUTION_LOG.from_timestamp             is 'From timestamp for the run (i.e. update_timestamp between from_timestamp and to_timetsamp)';
comment on column spar.ETL_EXECUTION_LOG.to_timestamp               is 'To timestamp for the run (i.e. update_timestamp between from_timestamp and to_timetsamp)';
comment on column spar.ETL_EXECUTION_LOG.run_status                 is 'Status of ETL execution';
comment on column spar.ETL_EXECUTION_LOG.updated_at                 is 'Timestamp of the last time this record was updated';
comment on column spar.ETL_EXECUTION_LOG.created_at                 is 'Timestamp of the time this record was created';

-- etl execution log hist has a completely different definition than
-- the one that is defined in V33, where it gets dropped and re-created
-- Seeing as the table already exists and has data in it, this
-- attempts to not modify the physical table, but rather modify net
-- new migrations so that they create the same structure as currently
-- exists in TEST / PROD Databases.
--
-- new structure should only have:
--      entry_timestamp
--      log_details
-- as columns
alter table spar.etl_execution_log_hist
add column
IF NOT EXISTS entry_timestamp timestamp(6) not null default current_timestamp;

alter table spar.etl_execution_log_hist
add column
IF NOT EXISTS log_details jsonb not null;

alter table spar.etl_execution_log_hist
drop column
IF EXISTS interface_id ;

alter table spar.etl_execution_log_hist
drop column
IF EXISTS execution_id ;

alter table spar.etl_execution_log_hist
drop column
IF EXISTS execution_status ;

alter table spar.etl_execution_log_hist
drop column
IF EXISTS execution_details ;

alter table spar.etl_execution_log_hist
drop column
IF EXISTS source_connect_timedelta ;

alter table spar.etl_execution_log_hist
drop column
IF EXISTS source_extract_timedelta ;

alter table spar.etl_execution_log_hist
drop column
IF EXISTS source_extract_row_count ;

alter table spar.etl_execution_log_hist
drop column
IF EXISTS target_connect_timedelta ;

alter table spar.etl_execution_log_hist
drop column
IF EXISTS target_load_timedelta ;

alter table spar.etl_execution_log_hist
drop column
IF EXISTS target_load_row_count ;

alter table spar.etl_execution_log_hist
drop column
IF EXISTS process_started_at ;

alter table spar.etl_execution_log_hist
drop column
IF EXISTS process_finished_at ;

alter table spar.etl_execution_log_hist
drop column
IF EXISTS process_timedelta ;

alter table spar.etl_execution_log_hist
drop column
IF EXISTS last_run_ts ;

alter table spar.etl_execution_log_hist
drop column
IF EXISTS current_run_ts ;

alter table spar.etl_execution_log_hist
drop column
IF EXISTS retry_process ;

alter table spar.etl_execution_log_hist
drop column
IF EXISTS updated_at ;

alter table spar.etl_execution_log_hist
drop column
IF EXISTS created_at ;
