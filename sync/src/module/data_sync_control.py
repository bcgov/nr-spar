import ast
from datetime import datetime
from pandas import DataFrame

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
    
    select_sync_id_stm = "select interface_id , execution_id, execution_order, group_executor,  \
                              source_name, source_file, source_table, \
                              target_name, target_file, target_table, target_primary_key, \
                              truncate_before_run, case when group_executor then 'ORCHESTRATION' else 'PROCESS' end as process_type \
                              from {}.etl_execution_map \
                              where (execution_id = {} or execution_parent_id = {} )  and execution_order >= 0 \
                              order by group_executor desc, execution_order".format(database_schema,execution_id,execution_id)
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
    print("-- Validating the execution process to be executed")
    for row in execution_map:
        if row["group_executor"]:
            print("-- Executing group executor: " + row["interface_id"])
        else:
            exist_process = True
            if row["source_file"] == "":
                print("[EXECUTION MAP ERROR] Source file does not exist in Interface Id " + row["interface_id"])
                ret = False
            if row["target_file"] == "":
                print("[EXECUTION MAP ERROR] Target file does not exist in Interface Id " + row["interface_id"])
                ret = False
            if row["truncate_before_run"] and row["target_table"]=="":
                print("[EXECUTION MAP ERROR] Target table is not filled for truncate statement in Interface Id" + row["interface_id"])
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
    print("-- Getting all processes to be executed in order ")
    processes = []
    for row in execution_map:
        if row["process_type"] == "PROCESS":
            processes.append(row)

    return processes

def print_process(process):
    print("--------------------------")
    print("--Process Execution ID: ({}):".format(process["interface_id"]) )
    print("--Process Execution order: {} , truncate_before_run:".format(process["execution_order"], str(process["truncate_before_run"])) )
    print("--Process Source: {} (table: {}, file: {}):".format(process["source_name"], process["source_table"],process["source_file"]) )
    print("--Process Target: {} (table: {}, file: {}):".format(process["target_name"], process["target_table"],process["target_file"]) )
    print("--------------------------")
    
       
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

def insert_data_sync_control(database_conn: object, 
                             database_schema: str,
                             data_sync_id: str):
    """
    Inserts a new record in the data_sync_control table with a Running status.

    Args:
        database_conn (object): Database connection
        database_schema (str): Database schema
        data_sync_id (str): Next available data_sync_id
    """
    insert_stm= "insert into {}.data_sync_control                      \
                    (data_sync_id, status, start_dt, end_dt)           \
                values                                                 \
                    (:data_sync_id, 'Running', current_timestamp, null)".format(database_schema)

    params = {'data_sync_id': data_sync_id}
    database_conn.select(insert_stm, params)
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
