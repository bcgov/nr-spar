import time
import logging
import numpy as np
import pandas as pd
import module.metadata_handler as meta
import module.database_connection as db_conn
import module.data_sync_control as data_sync_ctl
import transformations as transf

from typing import Tuple
from os import listdir, path, sep as separator
from datetime import timedelta, datetime
from sqlalchemy.exc import SQLAlchemyError
from module.custom_exception import TransformException, LoadException, ExtractException, ETLConfigurationException

logger = logging.getLogger(__name__)

"""
    Execute data synchronization between 2 data sources
    1. Gather what process will be executed in order (SEE ETL_EXECUTION MAP TABLE)
    2. Execute source.sql from process to Load data in a in-memory dataframe
    3. Execute bulk Upserts in the target connection using 
    4. Store metrics and other execution info in the ETL_EXECUTION_LOG_HIST table
"""
def execute_instance(oracle_config, postgres_config, track_config, execution_id):
    stored_metrics = {}
    stored_metrics['sync_start_time'] = time.time()
    stored_metrics['record_start_time'] = datetime.now()
    stored_metrics['rows_from_source'] = 0
    stored_metrics['rows_target_processed'] = 0
    stored_metrics['time_conn_monitor'] = None
    stored_metrics['time_conn_source'] = None
    stored_metrics['time_conn_target'] =None
    stored_metrics['time_source_extract'] = None
    stored_metrics['time_target_load'] = None
    logger.info('Starting ETL Tool execution instance')
    current_cwd = path.join(path.abspath(path.dirname(__file__).split('src')[0]) , "config")
    logger.info('Initializing Tracking Database Connection')
    is_error = False
    
    with db_conn.database_connection(track_config) as track_db_conn:
        temp_time = time.time()
        stored_metrics['time_conn_monitor'] = timedelta(seconds=(temp_time-stored_metrics['sync_start_time']))
        logger.info('Getting Execution instructions for execution id {}'.format(str(execution_id)))
        execution_map  = data_sync_ctl.get_execution_map(track_db_conn,track_config['schema'],execution_id)

        logger.info('Validating Execution instructions')
        try:
            if not data_sync_ctl.validate_execution_map(execution_map):
                raise ETLConfigurationException ("ETL configuration validation failed")
            
            processes = data_sync_ctl.get_processes_execution_map(execution_map)
            logger.info('Initializing Source Database Connection')

            # All processes to be executed from configuration in ETL_EXECUTION_MAP
            for process in processes:
                #1. There are old instances to execute?
                logger.info('Checking for executions waiting to be re-processed')
                reprocess_logged_executions(track_db_conn,
                                            track_config['schema'],
                                            process, 
                                            current_cwd, 
                                            oracle_config, 
                                            postgres_config, 
                                            stored_metrics)

                #2. Process current instances 
                logger.info('Get Delta times to load from source')
                schedule_times = data_sync_ctl.get_scheduler(track_db_conn,track_config['schema'],process['execution_id'],process['interface_id'])

                logger.info('Executing process')
                print('SCHEDULER TIMES /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/')
                print(schedule_times[0])
                print('SCHEDULER TIMES /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/')
                stored_metrics = execute_process(base_dir=current_cwd, 
                                                 track_db_conn=track_db_conn, 
                                                 track_db_schema=track_config['schema'], 
                                                 process=process, 
                                                 oracle_config=oracle_config, 
                                                 postgres_config=postgres_config, 
                                                 stored_metrics=stored_metrics, 
                                                 schedule_times=schedule_times[0],
                                                 is_reprocess=False)
                logger.info('Execution process finished')
                #3. There are any errors to be retried?                
        
        # Exception when validate_execution_map is false
        except ETLConfigurationException:
            is_error = True
            print("ETLConfigurationException - Impossible to execute or determine what process will be executed (or no process to be executed)")
            logger.critical('ETLConfigurationException - Impossible to execute or determine what process will be executed (or no process to be executed)')

        except Exception as err:
            is_error = True
            logger.critical(f"A fatal error has occurred ({type(err)}): {err}", exc_info = True)            

    sync_elapsed_time = time.time() - stored_metrics['sync_start_time']
    if is_error:
        logger.info('***** ETL Process finished with error *****')
        logger.info(f'ETL Tool whole process took {timedelta(seconds=sync_elapsed_time)}')
    else:
        stored_metrics["time_process"]=timedelta(seconds=sync_elapsed_time)
        print_process_metrics(stored_metrics)
    
    logger.info('***** Finish ETL Run *****')

def reprocess_logged_executions(track_db_conn,track_db_schema,process, current_cwd, oracle_config, postgres_config, stored_metrics):
    schedules = data_sync_ctl.get_log_hist_schedules_to_process(track_db_conn,track_db_schema,process['execution_id'],process['interface_id'])
    for schedule in schedules:
        execute_process(base_dir=current_cwd, 
                        track_db_conn=track_db_conn, 
                        track_db_schema=track_db_schema, 
                        process=process, 
                        oracle_config=oracle_config, 
                        postgres_config=postgres_config, 
                        stored_metrics=stored_metrics, 
                        schedule_times=schedule,
                        is_reprocess=True)
        data_sync_ctl.unset_reprocess(track_db_conn,track_db_schema,process['execution_id'],process['interface_id'],schedule)

def identifyQueryParams(query, db_type, params) -> object: 
    if db_type == 'ORACLE':
        if ':start_time' not in query or ':end_time' not in query:
            return {}
    if db_type == 'POSTGRES':
        if '%(start_time)' not in query or '%(end_time)' not in query:
            return {}
    return params

def print_process_metrics(stored_metrics):
    logger.info(f"ETL Tool whole process took {stored_metrics['time_process']}")
    logger.info(f"ETL Tool monitoring database connection took {stored_metrics['time_conn_monitor']}")
    logger.info(f"ETL Tool source database connection took {stored_metrics['time_conn_source']}")
    logger.info(f"ETL Tool source extract data took {stored_metrics['time_source_extract']} gathering {stored_metrics['rows_from_source']} rows")
    logger.info(f"ETL Tool target database connection took {stored_metrics['time_conn_target']}")
    logger.info(f"ETL Tool target load data took {stored_metrics['time_target_load']} processing {stored_metrics['rows_target_processed']} rows")


def execute_process(base_dir, track_db_conn, track_db_schema, process, oracle_config, postgres_config, stored_metrics,schedule_times, is_reprocess):
    process_stop = False
    log_message = ""
    source_config  = data_sync_ctl.get_config(oracle_config=oracle_config, postgres_config=postgres_config,db_type=process["source_db_type"])
    target_config  = data_sync_ctl.get_config(oracle_config=oracle_config, postgres_config=postgres_config,db_type=process["target_db_type"])
    # Get Deltas to filter source
    #
    schedule_param = {"start_time": schedule_times['current_start_time'], "end_time": schedule_times['current_end_time']}
    
    # Initializing metric variables
    stored_metrics['process_start_time'] = time.time()
    stored_metrics['time_source_extract'] = None
    stored_metrics['rows_from_source'] = 0
    stored_metrics['time_conn_target'] = None
    stored_metrics['rows_target_processed'] = 0
    stored_metrics['time_target_load'] = None
    stored_metrics['time_conn_source'] = None
    retry=False
    tag_reprocess = ''
    if is_reprocess:
        tag_reprocess = '[REPROCESSED] '

    try:
        logger.debug('Connecting into Source Database')
        with db_conn.database_connection(source_config) as source_db_conn:
            stored_metrics['time_conn_source'] = timedelta(seconds=(time.time()-stored_metrics['process_start_time']))
            logger.debug('Source Database connection stablished')
            temp_time = time.time()

            data_sync_ctl.print_process(process)
            load_file = base_dir+process['source_file'].replace("/",separator)
            logger.debug(f"Reading Extract query from: {load_file}")
            
            query_sql = open(load_file).read()
            # logger.debug(f"Query to be executed in Source database is: {query_sql}")
            
            params = identifyQueryParams(query_sql, process["source_db_type"],  schedule_param)

            table_df = pd.read_sql_query(sql=query_sql, con=source_db_conn.engine, params=params)
            logger.debug('Source Database data loaded on in-memory dataframe')
            
            stored_metrics['time_source_extract'] = timedelta(seconds=(time.time()-temp_time))
            stored_metrics['rows_from_source'] = table_df.shape[0]
            if stored_metrics['rows_from_source'] < 1:
                process_stop = True
                log_message = f"{tag_reprocess}There is no data to extract from source for execution id: {process['execution_id']} and interface id: {process['interface_id']}. Process will be skipped."
                logger.warning(log_message)

            temp_time = time.time()
            if not process_stop:
                logger.debug('Connecting into Target Database')
                with db_conn.database_connection(target_config) as target_db_conn:
                    logger.debug('Target Database connection stablished')
                    stored_metrics['time_conn_target'] = timedelta(seconds=(time.time()-temp_time))
                    temp_time = time.time()
                    
                    table_df=table_df.convert_dtypes()
                    
                    logger.debug('Starting load process into Target database using in-memory dataframe')
                    stored_metrics['rows_target_processed'] = target_db_conn.execute_upsert(dataframe=table_df, 
                                                                        table_name=process["target_table"],
                                                                        table_pk=process["target_primary_key"], 
                                                                        db_type=process["target_db_type"])

                    # READ FROM TEMP TABLE:
                    logger.debug('Target Database data load finished')
                    stored_metrics['time_target_load'] = timedelta(seconds=(time.time()-temp_time))

                    #RECORD LOG

                    log_message=f"{tag_reprocess}Execution finished successfully"
                    stored_metrics['process_end_time']=datetime.now()
                    stored_metrics['process_delta'] = timedelta(seconds=(time.time()-stored_metrics['process_start_time']))
                    retry=False #Execution processed with success don't need to be reprocessed
                    
                    process_log = data_sync_ctl.include_process_log_info(stored_metrics=stored_metrics, 
                                                                        log_message=log_message,
                                                                        execution_status='SUCCESS', 
                                                                        retry=retry)
                    
                    logger.debug('Updating schedule times for next execution')
                    data_sync_ctl.update_schedule_times(track_db_conn,track_db_schema,process["interface_id"],process["execution_id"],schedule_times)
                    logger.debug('Including process execution log information')
                    data_sync_ctl.save_execution_log   (track_db_conn,track_db_schema,process["interface_id"],process["execution_id"],process_log)
            else:
                stored_metrics['process_delta'] = timedelta(seconds=(time.time()-stored_metrics['process_start_time']))
                stored_metrics['process_end_time'] = datetime.now()
                retry=False #Process just don't have any source data to work with, so no need to be reprocessed
                
                process_log = data_sync_ctl.include_process_log_info(stored_metrics=stored_metrics, 
                                                                    log_message=log_message,
                                                                    execution_status='SKIPPED', ## No error, but
                                                                    retry = retry)
                logger.debug('Including process execution log information')
                data_sync_ctl.save_execution_log(track_db_conn,track_db_schema,process["interface_id"],process["execution_id"],process_log)
    except Exception as err:
        logger.critical(f"{tag_reprocess}A fatal error has occurred", exc_info = True)
        log_message =f"{tag_reprocess}Error type: {type(err)}: {err}" 
        stored_metrics['process_delta'] = timedelta(seconds=(time.time()-stored_metrics['process_start_time']))
        stored_metrics['process_end_time'] = datetime.now()
        #Process is mapped to retry errors, so it will be tagged to be reprocessed in next instance execution, except when a retry raised an error
        if process['retry_errors'] and not is_reprocess:
            retry=True 

        process_log = data_sync_ctl.include_process_log_info(stored_metrics=stored_metrics, 
                                                            log_message=log_message,
                                                            execution_status='ERROR',
                                                            retry = retry)
        logger.debug('Including process execution log information')
        data_sync_ctl.save_execution_log(track_db_conn,track_db_schema,process["interface_id"],process["execution_id"],process_log)

    return stored_metrics


# OLD EXECUTION APPROACH            
def data_sync(source_config, target_config, track_config):
    """ 
    Runs the data synchronization between source and target databases for all defined domains - one at a time.
    """
    sync_start_time = time.time()
    logger.info('***** Start Data Sync *****')
    
    # Loading database parameters from configuration file
    current_cwd = path.abspath(path.dirname(__file__).split('src')[0]) 
    db_config = meta.open_json_file(path.abspath(path.join(current_cwd, 'config', 'database_config.json')))
    
    # Loading source and target database connections parameters
    source_db_config = source_config #db_config['postgres_local']
    target_db_config = target_config #['oracle_local']
    track_db_config = track_config 
    
    # Getting all the folders under domains folder and creating a sorted list of domains
    domains_path = path.abspath(path.join(current_cwd, 'domains'))
    domains_folders = {int(folder_name.split('_', 1)[0]): folder_name for folder_name in listdir(domains_path)}
    domain_loading_order = list(domains_folders.keys())
    domain_loading_order.sort()
    
    logger.info('Initializing Tracking Database Connection')
    with db_conn.database_connection(track_db_config) as track_db_conn:

        logger.info('Getting Execution instructions')
        execution_map = data_sync_ctl.get_execution_map(track_db_conn,track_db_config['schema'],0)

        logger.info('Validating Execution instructions')
        try:
            if not data_sync_ctl.validate_execution_map(execution_map):
                raise ETLConfigurationException ("ETL configuration validation failed")

            logger.info('Initializing Source Database Connection')        
            with db_conn.database_connection(source_db_config) as source_db_conn:
                
                try:
                    data_sync_id = data_sync_ctl.get_next_data_sync_id(track_db_conn, track_db_config['schema'])
                    data_sync_ctl.insert_data_sync_control(track_db_conn, track_db_config['schema'], data_sync_id)
                    
                    logger.info('Initializing Target Database Connection')
                    with db_conn.database_connection(target_db_config) as target_db_conn:

                        for i in domain_loading_order:
                            domain_folder_path = path.abspath(path.join(domains_path, domains_folders[i]))
                            domain_name = domains_folders[i].split('_', 1)[1]
                            logger.info(f'Sync {domain_name} Domain ({i}/{len(domain_loading_order)})')
                            sync_domain(track_db_conn, track_db_config['schema'], source_db_conn, source_db_config['schema'], target_db_conn, domain_folder_path, domain_name)
                
                except ExtractException:
                    data_sync_ctl.update_data_sync_control(track_db_conn, track_db_config['schema'], data_sync_id, 'Failed')
                    logger.critical('ExtractException - A fatal error has occurred during data extraction')
                except TransformException:
                    data_sync_ctl.update_data_sync_control(track_db_conn, track_db_config['schema'], data_sync_id, 'Failed')
                    logger.critical('TransformException - A fatal error has occurred during data transformation')
                except LoadException:
                    data_sync_ctl.update_data_sync_control(track_db_conn, track_db_config['schema'], data_sync_id, 'Failed')
                    logger.critical('LoadException - A fatal error has occurred during data loading')
                except Exception:
                    data_sync_ctl.update_data_sync_control(track_db_conn, track_db_config['schema'], data_sync_id, 'Failed')
                    logger.critical('A fatal error has occurred', exc_info = True)
                else:        
                    data_sync_ctl.update_data_sync_control(track_db_conn, track_db_config['schema'], data_sync_id, 'Completed')
                    
        # Exception when validate_execution_map is false
        except ETLConfigurationException:
            print("ETLConfigurationException - Impossible to determine what process will be executed (or no process to be executed)")
            logger.critical('ETLConfigurationException - Impossible to determine what process will be executed (or no process to be executed)')
    
    sync_elapsed_time = time.time() - sync_start_time
    logger.debug(f'Data Sync process took {timedelta(seconds=sync_elapsed_time)}')
    logger.info('***** Finish Data Sync *****')
        
def sync_domain(track_db_conn: object,
                track_db_schema: str,
                source_db_conn: object,
                source_db_schema: str,
                target_db_conn: object,
                domain_folder_path: str,
                domain_name: str):
    """
    Sync all tables defined under a domain by extracting all data (staging and lookup tables included) from
    source database, transforming in memory using pandas, and loading data into target database.

    Args:
        source_db_conn (object): Source database connection
        source_db_schema (str): Source database schema where the control tables exist
        target_db_conn (str): Target database connection
        domain_folder_path (str): Full path to the domain folder to be synchronized
        domain_name (str): Domain name
    """
    
    # Defining the full path to the query files folder and loading source and target domain metadata 
    query_files_path = path.abspath(path.join(domain_folder_path, 'queries'))
    src_domain_metadata = meta.open_json_file(path.abspath(path.join(domain_folder_path, 'source.json')))
    tgt_domain_metadata = meta.open_json_file(path.abspath(path.join(domain_folder_path, 'target.json')))
    
    start_time = time.time()
    domain_dfs, staging_dfs = extract_domain(track_db_conn,track_db_schema, source_db_conn, source_db_schema,  query_files_path, domain_name, src_domain_metadata)
    elapsed_time = time.time() - start_time
    logger.debug(f'Extraction of {domain_name} took {timedelta(seconds=elapsed_time)}')
    
    start_time = time.time()
    domain_dfs = transform_domain(domain_dfs, staging_dfs, tgt_domain_metadata)
    elapsed_time = time.time() - start_time
    logger.debug(f'Transformation of {domain_name} took {timedelta(seconds=elapsed_time)}')
    
    start_time = time.time()
    load_domain(track_db_conn,track_db_schema,source_db_conn, source_db_schema, target_db_conn, domain_dfs, domain_name, tgt_domain_metadata, src_domain_metadata.get('leading_column'))
    elapsed_time = time.time() - start_time
    logger.debug(f'Loading of {domain_name} took {timedelta(seconds=elapsed_time)}')
    
def extract_domain(track_db_conn: object,
                   track_schema: str,
                   database_conn: object,
                   database_schema: str,
                   query_files_path: str,
                   domain_name: str,
                   domain_metadata: str) -> Tuple[dict, dict]:
    """
    Extracts all data related to the domain been synchronized - staging and lookup tables included.

    Args:
        database_conn (object): Database connection
        database_schema (str): Database schema where the control tables exist
        query_files_path (str): Full path to the query files folder
        domain_name (str): Domain name
        domain_metadata (str): Extraction domain metadata

    Returns:
        Tuple[dict, dict]: Two dictionaries (one for main tables and other for staging and lookup tables) 
        with all extracted data where the keys are the table names (based on the query file name) and 
        the values are table data on a Pandas DataFrame object
    """
    
    logger.info('***** Start Extraction Session *****')
    domain_dfs = {}
    
    try:
        # Getting metadata for each extraction table defined in the domain metadata
        tables_metadata = {table['reference_table']: table for table in domain_metadata['tables'] if table['query_type'] == 'extract'}
        # Getting incremental data to be used in the extraction
        print('--- DATABASE SCHEMA IS:' + track_schema)
        incremental_dt = data_sync_ctl.get_incrementa_dt(track_db_conn, track_schema)
        params = {'incremental_dt': incremental_dt}
        
        print('--- incremental_dt IS:' + incremental_dt.strftime("%B %d, %Y"))
            
        for table_name in tables_metadata:
            logger.info(f'{table_name} : Table Extraction')
            print('----- Loading query: ')
            print(path.abspath(path.join(query_files_path, tables_metadata[table_name]['file_name'])))
            # Extracting all data using incremental date from last completed execution
            table_df = pd.read_sql(meta.get_inc_dt_qry_from_file(tables_metadata[table_name],
                                                                path.abspath(path.join(query_files_path, 
                                                                                        tables_metadata[table_name]['file_name']))), 
                                database_conn.engine,
                                params = params)
        
            if domain_metadata.get('leading_column'):
                # Extracting records that had some errors and were marked for retry based on the leading column defined for the domain
                print('----- Extracting records by leading column: ')
                retry_df = extract_retry_records(track_db_conn,
                                                track_schema,
                                                database_conn,
                                                database_schema,
                                                domain_name,
                                                meta.get_retry_records_qry_from_file(tables_metadata[table_name],
                                                                                    path.abspath(path.join(query_files_path, 
                                                                                                            tables_metadata[table_name]['file_name']))))
            else:
                # Extracting records that had some errors and were marked for retry based on the table's primary key
                print('----- Extracting records by PK: ')
                retry_df = extract_retry_records(track_db_conn,
                                                track_schema,
                                                database_conn,
                                                database_schema,
                                                table_name.lower(),
                                                meta.get_retry_records_qry_from_file(tables_metadata[table_name],
                                                                                    path.abspath(path.join(query_files_path, 
                                                                                                            tables_metadata[table_name]['file_name']))))
            # Adding extracted table data to the dictionary
            domain_dfs[table_name] = pd.concat([table_df, retry_df]).reset_index(drop=True)
            logger.info(f'{len(domain_dfs[table_name].index)} rows extracted')
        
        # Getting metadata for each stagging/lookup table defined in the domain metadata 
        print('--- Staging Dataframe gathering: ')
        stagings_metadata = {table['reference_table']: table for table in domain_metadata['tables'] if table['query_type'] in ('staging', 'lookup')}
        staging_dfs = {}   
        
        for table_name in stagings_metadata:
            logger.info(f'{table_name} Lookup/Stage Table Extract')
            stg_table_df = pd.DataFrame()
            if stagings_metadata[table_name]['query_type'] == 'lookup' or not(domain_metadata.get('leading_column')):
                # Getting all data from lookup table - no filters applied
                stg_table_df = pd.read_sql(meta.get_query_from_file(path.abspath(path.join(query_files_path,
                                                                                        stagings_metadata[table_name]['file_name']))), 
                                        database_conn.engine)
            else:
                # Getting all leading values driving the domain sync
                leading_values = list_leading_values(domain_dfs, domain_metadata['leading_column'])
                for value in leading_values:
                    params = {domain_metadata['leading_column']: value}
                    # Fetching table data filtering the leading column by each leading value
                    df = pd.read_sql(meta.get_staging_records_qry_from_file(stagings_metadata[table_name],
                                                                            path.abspath(path.join(query_files_path,
                                                                                                stagings_metadata[table_name]['file_name']))),
                                    database_conn.engine,
                                    params=params)
                    stg_table_df = pd.concat([stg_table_df, df]).reset_index(drop=True)
            
            logger.info(f'{len(stg_table_df.index)} rows extracted')
            # Adding extracted staging and lookup table data to the dictionary
            staging_dfs[table_name] = stg_table_df
    except:
        logger.critical('Error extracting data', exc_info=True)
        raise ExtractException
    else:
        return domain_dfs, staging_dfs

def extract_retry_records(track_db_conn: object,
                          track_schema: str,
                          database_conn: object,
                          database_schema: str,
                          entity_name: str,
                          retry_records_qry: str) -> pd.DataFrame:
    """
    Given a select statement, extracts all records that had an error and were marked to retry.

    Args:
        database_conn (object): Database connection
        database_schema (str): Database schema where the control tables exist
        entity_name (str): Entity name - table or domain name
        retry_records_qry (str): Query to fetch data

    Returns:
        pd.DataFrame: Table data retrieved for retry records
    """
    logger.info('-- Extract Retry records from old execution errors')
    retry_df = pd.DataFrame()
    data_sync_id = data_sync_ctl.get_last_completed_data_sync_id(track_db_conn, track_schema)
    
    if data_sync_id:
        # Getting all entity ids that were marked to be retrieved
        entities = data_sync_ctl.get_entity_id_for_retry(track_db_conn, track_schema, data_sync_id, entity_name)       
        for entity_id in entities:
            # Retrieving data for each entity id, one at a time
            df = pd.read_sql(retry_records_qry, database_conn.engine, params=entity_id)
            retry_df = pd.concat([retry_df, df]).reset_index(drop=True)
            
    return retry_df       

def transform_domain(domain_dfs: dict,
                     staging_dfs: dict,
                     domain_metadata: str) -> dict:
    """
    Runs data customized data transformations and adjusts columns (renaming 
    and dropping unwanted columns) for each table extracted on the domain.

    Args:
        domain_dfs (dict): Dictionary with all extraction tables data (as Pandas DataFrames objects)
        staging_dfs (dict): Dictionary with all stagging and lookup tables data (as Pandas DataFrames objects)
        domain_metadata (str): Target domain metadata 

    Returns:
        dict: Dictionary with all target tables data transformed, ready to be loaded (as Pandas DataFrames objects)
    """
    logger.info('***** Start Transformation Session *****')
    
    for key in domain_dfs:
        # Running transformations for each target table
        domain_dfs[key] = transf.run_transformations(domain_dfs[key], staging_dfs, key)
        if domain_dfs[key] is None:
            raise TransformException
        
    # Adjusting columns name and dropping non used columns as mapped on the target domain metadata file
    domain_dfs = adjust_columns(domain_dfs, domain_metadata)
    
    return domain_dfs

def adjust_columns(domain_dfs: dict,
                   domain_metadata: str) -> dict:
    """
    Adjusts the columns for all extraction tables data by renaming and dropping unwanted columns 
    using the mapping defined on the target domain metadata. Sorts the DataFrame based on the 
    primary key columns defined on the table metadata.

    Args:
        domain_dfs (dict): Dictionary with all extraction tables data (as Pandas DataFrames objects)
        domain_metadata (str): Target domain metadata 

    Returns:
        dict: Dictionary with all target tables columns adjusted (as Pandas DataFrames objects)
    """
    logger.info('Adjusting and Mapping Columns')
    
    # Check metadata
    try:
        for table_metadata in domain_metadata['tables']:
            columns_map = table_metadata['columns']
            rename_columns = {columns_map[key]: key for key in columns_map}
            # Renaming columns as mapped in the target domain metadata
            domain_dfs[table_metadata['table_name']].rename(columns=rename_columns, inplace=True)
            #domain_dfs[table_metadata['table_name']].rename(columns={"COLLECTION_CLI_NUMBER": "collection_client_number"}, inplace=True)
          
          # Removing unwanted columns as mapped in the target domain metadata
            domain_dfs[table_metadata['table_name']] = domain_dfs[table_metadata['table_name']][list(columns_map)]
            domain_dfs[table_metadata['table_name']] = domain_dfs[table_metadata['table_name']].sort_values(by=table_metadata['primary_key'])
            domain_dfs[table_metadata['table_name']] = domain_dfs[table_metadata['table_name']].replace(np.nan, None)
            domain_dfs[table_metadata['table_name']] = domain_dfs[table_metadata['table_name']].replace('NaT', '') # Include it specially for data/time structures
    except Exception:
        logger.critical('Error while Adjusting and Mapping Columns', exc_info=True)
        raise TransformException
    else:
        return domain_dfs

def load_domain(track_database_conn: object,
                track_database_schema: str,
                source_database_conn: object,
                source_database_schema: str,
                target_database_conn: object,
                domain_dfs: dict,
                domain_name: str,
                domain_metadata: str,
                src_leading_column: str):
    """
    Loads data (inserts and updates) into target tables and marks values to be retried as database error happens.

    Args:
        source_database_conn (object): Source database connection
        source_database_schema (str): Source database schema
        target_database_conn (object): Target database connection
        domain_dfs (dict): Dictionary with all target tables data (as Pandas DataFrames objects)
        domain_name (str): Domain name
        domain_metadata (str): Target domain metadata
        src_leading_column (str): Leading column for the extraction domain - used to mark error records for retry
    """
    logger.info('***** Start Loading Session *****')
    tables_metadata = {table['loading_order']: table for table in domain_metadata['tables']}
    loading_order = list(tables_metadata.keys())
    loading_order.sort()
    
    if domain_metadata.get('leading_column'):
        # Retrieving all values for the leading column. All the tables in the domain will be synced at once - one leading value at a time
        leading_column = domain_metadata['leading_column']
        leading_values = list_leading_values(domain_dfs, leading_column)
        for value in leading_values:
            logger.info(f'Domain Loading - {leading_column} = {value}')
            if target_database_conn.health_check():
                try:
                    # Starting loading each table in the domain for the current leading value
                    for i in loading_order:
                        table_name = tables_metadata[i]['table_name']
                        filtered_df = domain_dfs[table_name].loc[domain_dfs[table_name][leading_column] == value] 
                        for row in filtered_df.itertuples():
                            upsert_record(target_database_conn, row, tables_metadata[i])                            
                except SQLAlchemyError as e:
                    # Rollback all tables loaded for the leading value if any database errors happened
                    target_database_conn.rollback()
                    # Marking the leading value that had an error for retry
                    entity_id = {src_leading_column: value}
                    logger.error(f'Domain Loading SQL ALCHEMY ERROR - {leading_column} = {value} - Error message: {e}')
                    data_sync_ctl.insert_error_record(track_database_conn, track_database_schema, domain_name, entity_id)
                else:        
                    target_database_conn.commit()
            else:
                raise LoadException
    else:
        for i in loading_order:
            table_name = tables_metadata[i]['table_name']
            logger.info(f'{table_name} Table Loading')
            if target_database_conn.health_check():
                for row in domain_dfs[table_name].itertuples():
                    try:
                        # Starting loading each table in the domain - one primary key at a time
                        upsert_record(target_database_conn, row, tables_metadata[i])                                               
                    except SQLAlchemyError as e:
                        # Rollback the table loaded for the primary key if any database errors happened
                        target_database_conn.rollback()
                        # Marking the primary key that had an error for retry
                        pk_values = meta.build_stm_pk_params(tables_metadata[i], row)
                        entity_id = {tables_metadata[i]['columns'][pk_column]: pk_values[pk_column] for pk_column in pk_values}
                        logger.error(f'Table Loading ERROR - {table_name} - Entity ID: {entity_id} - Error message: {e}')
                        data_sync_ctl.insert_error_record(track_database_conn, source_database_schema, domain_name, entity_id)
                    else:
                        target_database_conn.commit()
            else:
                raise LoadException

def list_leading_values(domain_dfs: dict,
                        leading_column: str) -> list:
    """
    Given a set of different tables data (DataFrames), retrieves a list with all the values for a leading column

    Args:
        domain_dfs (dict): Dictionary with all tables data (as Pandas DataFrames objects)
        leading_column (str): Leading column that drives the domain logic

    Returns:
        list: List of leading values
    """
    leading_values = []
    for key in domain_dfs:
        # Extracting the leading values for each table
        leading_values.extend(domain_dfs[key][leading_column].values.tolist())
    # Removing duplicates and sorting
    leading_values = sorted(set(leading_values))
    
    return leading_values

def upsert_record(database_conn: object,
                  row: object,
                  table_metadata: str):
    """
    Inserts or updates a record on a target table.

    Args:
        database_conn (object): Database connection
        row (object): Single record to be inserted or updated
        table_metadata (str): Table metadata as defined in the domain metadata
    """
    # Retrieve the number of records from the target table that matches the primary key
    count_qry = meta.build_select_count_qry(table_metadata)
    params = meta.build_stm_pk_params(table_metadata, row)
    record_exists = database_conn.select(count_qry, params)
    
    # If the record does not exist in the target table, the inserts it, otherwise updates it
    if record_exists.first()[0] == 0:
        execute_stm = meta.build_insert_stm(table_metadata)
    else:
        execute_stm = meta.build_update_stm(table_metadata)
    
    params = meta.build_stm_params(table_metadata, row)
    database_conn.execute(execute_stm, params)