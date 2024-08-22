import logging
import ast
from datetime import datetime
from pandas import DataFrame
from datetime import timedelta
import json
from sqlalchemy import text

logger = logging.getLogger(__name__)

"""
    Gets the Execution map data from this execution

    Args:
        database_conn (object): Database connection to monitoring DB
        database_schema (str): Database schema of monitoring DB

    Returns:
        list of dict: All executions to be processed
    """
def get_execution_map (track_db_conn: object, 
                       database_schema: str,
                       execution_id: int) -> list:
    
    select_sync_id_stm = f"""
       select interface_id , execution_id, execution_order,
              source_name, source_file, source_table,source_db_type,
              target_name, target_file, target_table,target_primary_key,target_db_type,
              run_mode,upsert_with_delete_key,ignore_columns_on_update,retry_errors,
              case when execution_parent_id is null then 'ORCHESTRATION' else 'PROCESS' end as process_type
        from  {database_schema}.etl_execution_map
        where (execution_id = {execution_id} or execution_parent_id = {execution_id})
              and execution_order >= 0
        order by process_type , execution_order"""    
    records = track_db_conn.select(select_sync_id_stm)        
    return records.mappings().all()

def get_scheduler(track_db_conn:object, database_schema:str) -> list:
    #Start two days from last successful run (plus a microsecond so we don't get rows we selected last run)
    #or two days ago if no successful run
    select_sync_id_stm = f"""
        select 
            COALESCE(MAX(to_timestamp) + INTERVAL '1 microsecond'
                   , CURRENT_TIMESTAMP - INTERVAL '3 days') as current_start_time,
            CURRENT_TIMESTAMP as current_end_time,
            (select run_status
               from spar.etl_execution_log
              order by from_timestamp desc
              limit 1) as last_run_status
        from {database_schema}.etl_execution_log
        where run_status = 'SUCCESS' """    
    records = track_db_conn.select(select_sync_id_stm)
    return records.mappings().all()

def get_log_hist_schedules_to_process(track_db_conn,database_schema,execution_id,interface_id) -> list:
    select_sync_id_stm = f"""
       select es.last_run_ts    as last_start_time,
	        es.current_run_ts as current_start_time,
	        CURRENT_TIMESTAMP as current_end_time
        from {database_schema}.etl_execution_log_hist es
        where  execution_id = {execution_id} and interface_id = '{interface_id}' 
          AND retry_process = true
        ORDER BY 1,2 """    
    records = track_db_conn.select(select_sync_id_stm)
    return records.mappings().all()

"""
    Validate if the Execution map data is correct

    Args:
       execution_map (list): All processes and orchestrations to be executed in this run
       
    Returns:
        bool: true if data is correct, false otherwise
"""
def validate_execution_map (execution_map) -> bool:
    ret = True
    exist_process = False
    logger.debug("-- Validating the execution process to be executed")
    for row in execution_map:
        if row["process_type"]=="ORCHESTRATION":
            print("--------------------------")
            print("-- Executing Orchestration for group executor: " + row["interface_id"])
            print("--------------------------")
        else:
            exist_process = True
            if row["source_file"] == "":
                print("[EXECUTION MAP ERROR] Source file does not exist in Interface Id " + row["interface_id"])
                ret = False
            if row["target_file"] == "":
                print("[EXECUTION MAP ERROR] Target file does not exist in Interface Id " + row["interface_id"])
                ret = False
            if row["source_db_type"] == "":
                print("[EXECUTION MAP ERROR] Source DB Type is not filled for Interface Id " + row["interface_id"])
                ret = False
            if row["target_db_type"] == "":
                print("[EXECUTION MAP ERROR] Target DB Type is not filled for Interface Id " + row["interface_id"])
                ret = False
            if not row["source_db_type"] in ['ORACLE','POSTGRES']:
                print(f"[EXECUTION MAP ERROR] Source DB Type is {row['source_db_type']} and not 'ORACLE' or 'POSTGRES' for Interface Id {row['interface_id']}" )
                ret = False
            if not row["target_db_type"] in ['ORACLE','POSTGRES']:
                print(f"[EXECUTION MAP ERROR] Target DB Type is {row['target_db_type']} and not 'ORACLE' or 'POSTGRES' for Interface Id  {row['interface_id']}")
                ret = False
            if row["target_file"] == "":
                print("[EXECUTION MAP ERROR] Target file does not exist in Interface Id " + row["interface_id"])
                ret = False
    return (ret and exist_process)

"""
    Filters only processes to be executed from a execution_map list

    Args:
       execution_map (list): All processes and orchestrations to be executed in this run
       
    Returns:
        list: All processes except the parent id orchestrator (if exists)
"""
def get_processes_execution_map (execution_map) -> list:
    logger.debug("-- Getting all processes to be executed in order ")
    processes = []
    for row in execution_map:
        if row["process_type"] == "PROCESS":
            processes.append(row)
    return processes

def print_process(process):
    print("--------------------------")
    print(f"--Process Execution ID: ({process['interface_id']}):")
    print(f"--Process Execution order: {process['execution_order']} ")
    print(f"--Process Source: (table: {process['source_table']}, file: {process['source_file']})." )
    print(f"--Process Target: (table: {process['target_table']}, PK: {process['target_primary_key']}).") 
    print("--------------------------")

def get_config(oracle_config, postgres_config, db_type):
    if db_type=="ORACLE":
        return oracle_config
    elif db_type=="POSTGRES":
        return postgres_config
    else:
        return None
    
       
def include_process_log_info(stored_metrics, log_message,execution_status):
    process_log = {} 
    process_log["source_connect_timedelta"]=stored_metrics['time_conn_source']
    process_log["source_extract_timedelta"]=stored_metrics['time_source_extract']
    process_log["source_extract_row_count"]=stored_metrics['rows_from_source']
    process_log["target_connect_timedelta"]=stored_metrics['time_conn_target']
    process_log["target_load_timedelta"]   =stored_metrics['time_target_load']
    process_log["target_load_row_count"]   =stored_metrics['rows_target_processed']
    process_log["execution_details"]       =log_message
    process_log["execution_status"]        =execution_status
    process_log["process_started_at"]      =stored_metrics['record_start_time']
    process_log["process_finished_at"]     =stored_metrics['process_end_time']
    process_log["process_timedelta"]       =stored_metrics['process_delta'] 
    return process_log


def update_schedule_times(db_conn, db_schema, interface_id, execution_id, schedule_times):
    sql_text = f"""
                insert into {db_schema}.etl_execution_schedule (interface_id, execution_id, last_run_ts, current_run_ts)
                VALUES('{interface_id}',{execution_id},:current_start_time, :current_end_time)
                on conflict (interface_id, execution_id) 
                do update 
                set last_run_ts = EXCLUDED.last_run_ts,
                    current_run_ts = EXCLUDED.current_run_ts
                """
    schedule = {"current_start_time": schedule_times['current_start_time'], "current_end_time": schedule_times['current_end_time']}
    result = db_conn.execute(sql_text, schedule)
    db_conn.commit()  # If everything is ok, a commit will be executed.
    return None

def save_execution_log(db_conn, db_schema, process_log):
    
    sql_text = f"""         
    INSERT INTO {db_schema}.etl_execution_log_hist (log_details)                
    VALUES (:p_log_details) 
    """
    params = {}
    print("0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.")
    print(process_log)
    print(text(str(process_log)))
    params['p_log_details'] = json.dumps(process_log)
    print(params)
    print("0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.")
    result = db_conn.execute(sql_text,params)
    db_conn.commit()  # If everything is ok, a commit will be executed.
    
def unset_reprocess(db_conn,db_schema,execution_id,interface_id,schedule):
    params = {}
    params['interface_id'] = interface_id
    params['execution_id'] = execution_id
    params['last_run_ts'] = schedule['last_start_time']
    params['current_run_ts'] = schedule['current_start_time']

    sql_text = f"""UPDATE {db_schema}.etl_execution_log_hist
    SET retry_process = false
    where interface_id = :interface_id
    and execution_id = :execution_id
    and last_run_ts = :last_run_ts
    and current_run_ts =:current_run_ts
    and retry_process=true
    """
    result = db_conn.execute(sql_text, params)
    db_conn.commit()  # If everything is ok, a commit will be executed.




def get_running_data_sync_id(database_conn: object, 
                             database_schema: str) -> int:
    """
    Gets the data_sync_id for the current running execution from the data_sync_control table.

    Args:
        database_conn (object): Database connection
        database_schema (str): Database schema

    Returns:
        int: Current data_sync_id for the running execution
    """
    select_sync_id_stm = "select max(data_sync_id)  \
                          from {}.data_sync_control \
                          where status = 'Running'".format(database_schema)
                        
    record = database_conn.select(select_sync_id_stm)
    
    return record.first()[0]

def get_last_completed_data_sync_id(database_conn: object, 
                                    database_schema: str) -> int:
    """
    Gets the data_sync_id for the last successfully completed execution from the data_sync_control table.

    Args:
        database_conn (object): Database connection
        database_schema (str): Database schema

    Returns:
        int: data_sync_id from last successfully completed execution
    """
    select_sync_id_stm = "select max(data_sync_id)  \
                          from {}.data_sync_control \
                          where status = 'Completed'".format(database_schema)
                        
    record = database_conn.select(select_sync_id_stm)
    
    return record.first()[0]
    
def get_next_data_sync_id(database_conn: object, 
                          database_schema: str) -> int:
    """
    Gets the next data_sync_id to be used in the current running execution.

    Args:
        database_conn (object): Database connection
        database_schema (str): Database schema

    Returns:
        int: data_sync_id to be used in the current running execution
    """
    select_sync_id_stm = "select COALESCE(max(data_sync_id) + 1,1)  \
                          from {}.data_sync_control".format(database_schema)
                        
    record = database_conn.select(select_sync_id_stm)
    next_data_sync_id = record.first()[0]
    
    return next_data_sync_id if next_data_sync_id else 1

def get_incrementa_dt(database_conn: object, 
                      database_schema: str) -> datetime:
    """
    Gets the start date from the last successfully completed execution to be used as an incremental date filter in the data extraction.

    Args:
        database_conn (object): Database connection
        database_schema (str): Database schema

    Returns:
        datetime: Incremental date filter
    """
    DEFAULT_INCREMENTAL_DT = '01/01/2023 00:00:00'

    defatult_inc_dt = datetime.strptime(DEFAULT_INCREMENTAL_DT, '%m/%d/%Y %H:%M:%S')
    
    select_inc_dt_stm = "select COALESCE(max(start_dt),'1900-01-01')       \
                         from {}.data_sync_control  \
                         where status = 'Completed'".format(database_schema)
                        
    record = database_conn.select(select_inc_dt_stm)
    incremental_dt = record.first()[0]
    
    return incremental_dt if incremental_dt else defatult_inc_dt
  
def get_entity_id_for_retry(database_conn: object,
                            database_schema: str,
                            data_sync_id: int,
                            entity_name: str) -> list:
    """
    Gets the entity ids for a given entity based on the data_sync_id of the last successfully completed execution.
    Those entity ids will be used in a retry attempt to load records into the target database.

    Args:
        database_conn (object): Database connection
        database_schema (str): Database schema
        data_sync_id (int): data_sync_id of the last successfully completed execution
        entity_name (str): Entity name (table or domain name)

    Returns:
        list: List of entity ids
    """
    select_entity_id_stm = 'select entity_id                    \
                            from {}.data_sync_error             \
                            where data_sync_id >= :data_sync_id \
                                and entity_name = :entity_name'.format(database_schema)

    entity_ids = []
    params = {'data_sync_id': data_sync_id, 'entity_name': entity_name}
    retry_records = database_conn.select(select_entity_id_stm, params)
    
    for row in retry_records:
        entity_ids.append(ast.literal_eval(row[0]))
        
    return entity_ids  

def insert_execution_log(database_conn: object, 
                             database_schema: str,
                             from_timestamp: str,
                             to_timestamp: str,
                             run_status: str):
    insert_stm= f"""insert into {database_schema}.etl_execution_log 
                    (from_timestamp,to_timestamp,run_status,updated_at,created_at)           
                values                                                 
                    (:from_timestamp, :to_timestamp, :run_status , current_timestamp, current_timestamp) """

    params = {'from_timestamp': from_timestamp, 'to_timestamp': to_timestamp, 'run_status': run_status}
    database_conn.select(insert_stm, params)
    database_conn.commit()

def update_execution_log(database_conn: object, 
                        database_schema: str,
                        from_timestamp: str,
                        to_timestamp: str,
                        run_status: str):
    update_stm= f"""update {database_schema}.etl_execution_log 
                       set run_status = :run_status
                         , updated_at = current_timestamp
                     where from_timestamp = :from_timestamp
                       and to_timestamp = :to_timestamp  """

    params = {'run_status': run_status, 'from_timestamp': from_timestamp, 'to_timestamp': to_timestamp}
    database_conn.select(update_stm, params)
    database_conn.commit()

def update_data_sync_control(database_conn: object, 
                             database_schema: str,
                             data_sync_id: str,
                             status: str):
    """
    Updates the status and end_dt for the current execution in the data_sync_control_table.

    Args:
        database_conn (object): Database connection
        database_schema (str): Database schema
        data_sync_id (str): Current data_sync_id for the running execution
        status (str): Status to be updated (either Completed or Failed)
    """
    update_stm = "update {}.data_sync_control       \
                  set status = :status,             \
                    end_dt = current_timestamp      \
                  where data_sync_id = :data_sync_id".format(database_schema)
                   
    params = {'status': status, 'data_sync_id': data_sync_id}    
    database_conn.select(update_stm, params)
    database_conn.commit()
    
def insert_error_record(database_conn: object, 
                        database_schema: str,
                        entity_name: str, 
                        entity_id: dict):
    """
    Inserts identification for records that had errors during the load phase in order for them to be retried in the next execution.

    Args:
        database_conn (object): Database connection
        database_schema (str): Database schema
        entity_name (str): Entity name (table or domain name)
        entity_id (dict): Entity id (leading column or primary key)
    """
    insert_error_stm = 'insert into {}.data_sync_error      \
            (data_sync_id, entity_name, entity_id) values   \
            (:data_sync_id, :entity_name, :entity_id)'.format(database_schema)
    
    data_sync_id = get_running_data_sync_id(database_conn, database_schema)
    params = {'data_sync_id': data_sync_id, 'entity_name': entity_name, 'entity_id': str(entity_id)}

    database_conn.execute(insert_error_stm, params)
    database_conn.commit()
