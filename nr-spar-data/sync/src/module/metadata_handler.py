import json
import numpy as np

def open_json_file(file: str) -> str:
    """
    Given a JSON file (with path and name), returns its properties.

    Args:
        file (str): Full path to with file name to the file

    Returns:
        str: Properties defined in the JSON
    """
    with open(file) as config_file:
        return json.load(config_file)

def get_query_from_file(full_file_path: str) -> str:
    """
    Given a SQL file, returns a string with the file query content.

    Args:
        full_file_path (str): Full file path (with file name)

    Returns:
        str: Query string
    """
    with open(full_file_path, 'r', encoding='utf-8') as query_file:
        query = query_file.read()
    return query
  
def get_inc_dt_qry_from_file(table_metadata: dict, full_file_path: str) -> str:
    """
    Get query string from file using incremental date as filter defined in the domain metadata.

    Args:
        table_metadata (dict): Table metadata
        full_file_path (str): Full file path (with file name)

    Returns:
        str: Query string using incremental date as filter
    """
    return ''.join([get_query_from_file(full_file_path), ' ', table_metadata['incremental_dt']])
    
def get_retry_records_qry_from_file(table_metadata: dict, full_file_path: str) -> str:
    """
    Get query string from file entity id (leading column or primary key) as filter defined in the domain metadata.

    Args:
        table_metadata (dict): Table metadata
        full_file_path (str): Full file path (with file name)

    Returns:
        str: Query string using entity id (leading column or primary key) as filter
    """
    return ''.join([get_query_from_file(full_file_path), ' ', table_metadata['retry_records']])

def get_staging_records_qry_from_file(table_metadata: dict, full_file_path: str) -> str:
    """
    Get query string from file entity id (leading column or primary key) as filter defined in the domain metadata.

    Args:
        table_metadata (dict): Table metadata
        full_file_path (str): Full file path (with file name)

    Returns:
        str: Query string using entity id (leading column or primary key) as filter
    """
    return ''.join([get_query_from_file(full_file_path), ' ', table_metadata['staging_records']])

def build_stm_params(table_metadata: str, row: object) -> dict:
    """
    Extracts the columns from the table metadata and builds a params dictionary with the values of the record (row).

    Args:
        table_metadata (str): Table metadata
        row (object): Record being processed

    Returns:
        dict: Params with key, value pair equals to column name, value
    """
    columns = table_metadata['columns']
    params = {}
    
    for key in columns:
        params[key] = getattr(row, key)
        
    params = handle_params_types(params)
    
    return params

def build_stm_pk_params(table_metadata: str, row: object) -> dict:
    """
    Extracts the primary key columns from the table metadata and builds a params dictionary with the values of the record (row).

    Args:
        table_metadata (str): Table metadata
        row (object): Record being processed

    Returns:
        dict: Params with key, value pair equals to column name, value for all primary key columns
    """
    columns = table_metadata['primary_key']
    params = {}
    
    for key in columns:
        params[key] = getattr(row, key)
        
    params = handle_params_types(params)
    
    return params

def handle_params_types(params: dict) -> dict:
    """
    Handles the parameter types so they are in accordance with SQLAlchemy supported types.

    Args:
        params (dict): Parameter dictionary

    Returns:
        dict: Parameter dictionary with types adjusted
    """
    for key in params:
        if isinstance(params[key], np.integer):
            params[key] = int(params[key])

    return params

def build_select_count_qry(table_metadata: str) -> str:
    """
    Builds a select statement that counts the number of records that match a given primary key.
    Used to identify if a record has to be inserted or updated on the target table.

    Args:
        table_metadata (str): Table metadata

    Returns:
        str: Select query string
    """
    primary_keys = table_metadata['primary_key']
    primary_keys_str = ''

    select_qry = 'SELECT COUNT(1) FROM {}.{} WHERE '.format(table_metadata['schema'], table_metadata['table_name'] )
        
    if len(primary_keys) >= 1:
        for i in range(len(primary_keys)):
            if i == 0:
                primary_keys_str = ''.join([primary_keys[0], ' = :', primary_keys[0]])
            else:
                primary_keys_str = ''.join([primary_keys_str, ' AND ', primary_keys[i], ' = :', primary_keys[i]])
    else: #If no primary key exists, then all records are eligible to insert 
        select_qry = ''.join([select_qry,'1=2'])

    select_qry = ''.join([
        select_qry, 
        primary_keys_str  
    ])
    
    return select_qry
    
def build_insert_stm(table_metadata: str) -> str:
    """
    Builds an insert statement string based on the columns defined on the table metadata.

    Args:
        table_metadata (str): Table metadata

    Returns:
        str: Insert statement string
    """
    columns = table_metadata['columns']
    columns_str = ''
    columns_values_str = ''

    insert_stm = 'INSERT INTO {}.{} ('.format(table_metadata['schema'], table_metadata['table_name'])

    for key in columns:
        columns_str = ''.join([columns_str, table_metadata['columns'][key], ','])
        columns_values_str = ''.join([columns_values_str, ':', key, ','])
        
    insert_stm = ''.join([
        insert_stm, 
        columns_str.rstrip(columns_str[-1]), 
        ') VALUES ( ', 
        columns_values_str.rstrip(columns_str[-1]), 
        ')'
    ])
    return insert_stm
    
def build_update_stm(table_metadata: str) -> str:
    """
    Builds an update statement string based on the columns defined on the table metadata.

    Args:
        table_metadata (str): Table metadata

    Returns:
        str: Update statement string
    """
    columns = table_metadata['columns']
    primary_keys = table_metadata['primary_key']
    columns_str = ''
    primary_keys_str = ''

    update_stm = 'UPDATE {}.{} SET '.format(table_metadata['schema'], table_metadata['table_name'] )

    for key in columns:
        if key not in primary_keys:
            columns_str = ''.join([columns_str, key, ' = :', key, ','])
        
    if len(primary_keys) > 1:
        for i in range(len(primary_keys)):
            if i == 0:
                pass
            else:
                primary_keys_str = ''.join([' AND ', primary_keys[i], ' = :', primary_keys[i]])

    update_stm = ''.join([
        update_stm, 
        columns_str.rstrip(columns_str[-1]),
        ' WHERE ',
        primary_keys[0],
        ' = :',
        primary_keys[0],
        primary_keys_str  
    ])
    
    return update_stm