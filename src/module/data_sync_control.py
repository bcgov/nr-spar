import ast
from datetime import datetime
       
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
    select_sync_id_stm = "select max(data_sync_id) + 1  \
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
    DEFATUL_INCREMENTAL_DT = '01/01/2023 00:00:00'

    defatult_inc_dt = datetime.strptime(DEFATUL_INCREMENTAL_DT, '%m/%d/%Y %H:%M:%S')
    
    select_inc_dt_stm = "select max(start_dt)       \
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
