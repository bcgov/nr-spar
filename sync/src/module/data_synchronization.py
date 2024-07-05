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
def execute_instance(oracle_config, postgres_config, track_config):
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
        logger.info('Get Delta times to load from source')
        schedule_times = data_sync_ctl.get_scheduler(track_db_conn,track_config['schema'])
        schedule_times = schedule_times[0]
        logger.debug("=============== s c h e d u l e   d a t e s ==================")
        logger.debug(schedule_times)
        logger.debug("=============== s c h e d u l e   d a t e s ==================")
        logger.info('Insert execution log - signal RUNNING')
        data_sync_ctl.insert_execution_log(database_conn=track_db_conn, 
                                        database_schema=track_config['schema'],
                                        from_timestamp=schedule_times['current_start_time'],
                                        to_timestamp=schedule_times['current_end_time'],
                                        run_status='RUNNING')
        stored_metrics['time_conn_monitor'] = timedelta(seconds=(temp_time-stored_metrics['sync_start_time']))
        #execution_map  = data_sync_ctl.get_execution_map(track_db_conn,track_config['schema'],execution_id)

        logger.info('Validating Execution instructions')
        try:
            #if not data_sync_ctl.validate_execution_map(execution_map):
            #    raise ETLConfigurationException ("ETL configuration validation failed")
            
            process_seedlots(oracle_config, postgres_config, track_config, track_db_conn, schedule_times)
        
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
        run_status = "FAILURE"
    else:
        stored_metrics["time_process"]=timedelta(seconds=sync_elapsed_time)
        print_process_metrics(stored_metrics)
        run_status = "SUCCESS"
    
    data_sync_ctl.update_execution_log(database_conn=track_db_conn, 
                    database_schema=track_config['schema'],
                    from_timestamp=schedule_times['current_start_time'],
                    to_timestamp=schedule_times['current_end_time'],
                    run_status=run_status)

    logger.info('***** Finish ETL Run *****')

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

def delete_seedlot_child_tables(seedlot_number,target_db_conn, processes, stored_metrics):
    logger.debug('Executing delete for seedlot '+seedlot_number)
    log_message = ""
    
    # Initializing metric variables
    stored_metrics['process_start_time'] = time.time()
    stored_metrics['time_source_extract'] = None
    stored_metrics['rows_from_source'] = 0
    stored_metrics['time_conn_target'] = None
    stored_metrics['rows_target_processed'] = 0
    stored_metrics['time_target_load'] = None
    stored_metrics['time_conn_source'] = None

    #processes are in RI order - reverse order for deletes to avoid RI constraint errors
    for tablerow in reversed(processes):
        table = tablerow[0]
        if table['target_table'] != "the.seedlot" and table['run_mode'] == "UPSERT_WITH_DELETE":
            logger.debug(f"calling delete for {seedlot_number} table {table['target_table']}")
            stored_metrics['rows_target_processed'] = target_db_conn.delete_seedlot_child_table(table['target_table'],seedlot_number)

    stored_metrics['process_delta'] = timedelta(seconds=(time.time()-stored_metrics['process_start_time']))
    stored_metrics['process_end_time'] = datetime.now()
                
    #process_log = data_sync_ctl.include_process_log_info(stored_metrics=stored_metrics, 
    #                                                    log_message=log_message,
    #                                                    execution_status='SKIPPED', ## No error, but
    #                                                    )
    logger.debug('Finished deletions')
    #data_sync_ctl.save_execution_log(track_db_conn,track_db_schema,process["interface_id"],process["execution_id"],process_log)

    return stored_metrics


def execute_process(seedlot_number,base_dir, track_db_conn, track_db_schema, target_db_conn, process, oracle_config, postgres_config, stored_metrics):
    logger.debug('Executing process for seedlot '+seedlot_number)
    process_stop = False
    log_message = ""
    source_config  = data_sync_ctl.get_config(oracle_config=oracle_config, postgres_config=postgres_config,db_type=process["source_db_type"])
    target_config  = data_sync_ctl.get_config(oracle_config=oracle_config, postgres_config=postgres_config,db_type=process["target_db_type"])
    
    # Initializing metric variables
    stored_metrics['process_start_time'] = time.time()
    stored_metrics['time_source_extract'] = None
    stored_metrics['rows_from_source'] = 0
    stored_metrics['time_conn_target'] = None
    stored_metrics['rows_target_processed'] = 0
    stored_metrics['time_target_load'] = None
    stored_metrics['time_conn_source'] = None

    logger.debug('Connecting into Source Database')
    with db_conn.database_connection(source_config) as source_db_conn:
        stored_metrics['time_conn_source'] = timedelta(seconds=(time.time()-stored_metrics['process_start_time']))
        logger.debug('Source Database connection established')
        temp_time = time.time()

        data_sync_ctl.print_process(process)
        load_file = base_dir+process['source_file'].replace("/",separator)
        logger.debug(f"Reading Extract query from: {load_file}")
        
        query_sql = open(load_file).read()
        # logger.debug(f"Query to be executed in Source database is: {query_sql}")
        
        params = {}
        params["p_seedlot_number"] = seedlot_number

        table_df = pd.read_sql_query(sql=query_sql, con=source_db_conn.engine, params=params)
        logger.debug('Source Database data loaded on in-memory dataframe')
        
        stored_metrics['time_source_extract'] = timedelta(seconds=(time.time()-temp_time))
        stored_metrics['rows_from_source'] = table_df.shape[0]
        if stored_metrics['rows_from_source'] < 1:
            process_stop = True
            log_message = f"There is no data to extract from source for execution id: {process['execution_id']} and interface id: {process['interface_id']}. Process will be skipped."
            logger.debug(log_message)
            logger.warning(log_message)

        temp_time = time.time()
        if not process_stop:
            logger.debug('Connecting into Target Database')
            with db_conn.database_connection(target_config) as target_db_conn:
                logger.debug('Target Database connection established')
                stored_metrics['time_conn_target'] = timedelta(seconds=(time.time()-temp_time))
                temp_time = time.time()
                
                table_df=table_df.convert_dtypes()
                
                logger.debug("--****************************************************************--")
                logger.debug(" ")
                logger.debug(process)
                logger.debug(process["run_mode"])
                logger.debug(table_df)
                logger.debug(" ")
                logger.debug("--****************************************************************--")

                #unicorn processing for soq
                if process['target_table'] == 'the.seedlot_owner_quantity':
                    stored_metrics['rows_target_processed'] = target_db_conn.delete_seedlot_owner_quantity(seedlot_number=seedlot_number,
                                                                                            table_name=process["target_table"],
                                                                                            soqdf=table_df)

                #TODO some cleanup to do here- i.e. other modes then common handling after
                if process["run_mode"] == "UPSERT" or process["run_mode"] == "UPSERT_WITH_DELETE":
                    logger.debug(f"Calling upsert for {seedlot_number}")
                    stored_metrics['rows_target_processed'] = target_db_conn.execute_upsert(dataframe=table_df, 
                                                                                            table_name=process["target_table"],
                                                                                            table_pk=process["target_primary_key"], 
                                                                                            db_type=process["target_db_type"],
                                                                                            run_mode=process["run_mode"],
                                                                                            ignore_columns_on_update=process["ignore_columns_on_update"])

                    # READ FROM TEMP TABLE:
                    logger.debug('Target Database data load finished')
                    stored_metrics['time_target_load'] = timedelta(seconds=(time.time()-temp_time))

                #RECORD LOG

                log_message=f"Execution finished successfully"
                stored_metrics['process_end_time']=datetime.now()
                stored_metrics['process_delta'] = timedelta(seconds=(time.time()-stored_metrics['process_start_time']))
                
                #process_log = data_sync_ctl.include_process_log_info(stored_metrics=stored_metrics, 
                #                                                    log_message=log_message,
                #                                                    execution_status='SUCCESS')
                
                logger.debug('Updating schedule times for next execution')
                #data_sync_ctl.update_schedule_times(track_db_conn,track_db_schema,process["interface_id"],process["execution_id"],schedule_times)
                logger.debug('Including process execution log information')
                #data_sync_ctl.save_execution_log   (track_db_conn,track_db_schema,process["interface_id"],process["execution_id"],process_log)
        else:
            stored_metrics['process_delta'] = timedelta(seconds=(time.time()-stored_metrics['process_start_time']))
            stored_metrics['process_end_time'] = datetime.now()
            
            #process_log = data_sync_ctl.include_process_log_info(stored_metrics=stored_metrics, 
            #                                                    log_message=log_message,
            #                                                    execution_status='SKIPPED', ## No error, but
            #                                                    )
            logger.debug('Including process execution log information')
            #data_sync_ctl.save_execution_log(track_db_conn,track_db_schema,process["interface_id"],process["execution_id"],process_log)

    return stored_metrics

def process_seedlots(oracle_config, postgres_config, track_config, track_db_conn, schedule_times):
    stored_metrics = {}
    is_error = False
    process_stop = False
    log_message = ""
    # Get Deltas to filter source
    #
    current_cwd = path.join(path.abspath(path.dirname(__file__).split('src')[0]) , "config")
    logger.debug("::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::")
    logger.debug(schedule_times)
    logger.debug(schedule_times['current_start_time'])
    logger.debug("::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::")
    schedule_param = {"start_time": schedule_times['current_start_time'], "end_time": schedule_times['current_end_time']}
    
    logger.debug('Connecting into Source Database to get Seedlots')
    with db_conn.database_connection(postgres_config) as source_db_conn:
        logger.debug('Source Database connection established')
        temp_time = time.time()

        #TODO FIX AND SAVE DATE LAST RUN
        query_sql = """SELECT seedlot_number FROM spar.seedlot 
                        WHERE update_timestamp between %(start_time)s AND %(end_time)s 
                        ORDER BY seedlot_number """
        logger.debug(f"Main driver query to be executed in Source database is: {query_sql}")
        
        params = identifyQueryParams(query_sql, "POSTGRES",  schedule_param)
        logger.debug("*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_")
        logger.debug(params)
        logger.debug("*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_")

        seedlots_df = pd.read_sql_query(sql=query_sql, con=source_db_conn.engine, params=params)
        logger.debug('Main driver SEEDLOT data loaded on in-memory dataframe')
        
        processes = [[{"interface_id":"SEEDLOT_EXTRACT","execution_id":"101","execution_order":"10","source_file":"/SQL/SPAR/POSTGRES_SEEDLOT_EXTRACT.sql","source_table":"spar.seedlot","source_db_type":"POSTGRES","target_table":"the.seedlot","target_primary_key":"seedlot_number","target_db_type":"ORACLE","run_mode":"UPSERT","ignore_columns_on_update":"extraction_st_date,extraction_end_date,seed_store_client_number,seed_store_client_locn,temporary_storage_start_date,temporary_storage_end_date,seedlot_status_code"}]
                    ,[{"interface_id":"SEEDLOT_OWNER_QUANTITY_EXTRACT","execution_id":"102","execution_order":"20","source_file":"/SQL/SPAR/POSTGRES_SEEDLOT_OWNER_QUANTITY_EXTRACT.sql","source_table":"spar.seedlot_owner_quantity","source_db_type":"POSTGRES","target_table":"the.seedlot_owner_quantity","target_primary_key":"seedlot_number,client_number,client_locn_code","target_db_type":"ORACLE","run_mode":"UPSERT","ignore_columns_on_update":"qty_reserved,qty_rsrvd_cmtd_pln,qty_rsrvd_cmtd_apr,qty_surplus,qty_srpls_cmtd_pln,qty_srpls_cmtd_apr"}]
                    ,[{"interface_id":"SEEDLOT_SEED_PLAN_ZONE_EXTRACT","execution_id":"103","execution_order":"30","source_file":"/SQL/SPAR/POSTGRES_SEEDLOT_SEED_PLAN_ZONE_EXTRACT.sql","source_table":"spar.seedlot_seed_plan_zone","source_db_type":"POSTGRES","target_table":"the.seedlot_plan_zone","target_primary_key":"seedlot_number,seed_plan_zone_code","target_db_type":"ORACLE","run_mode":"UPSERT_WITH_DELETE","ignore_columns_on_update":""}]
                    ,[{"interface_id":"SEEDLOT_GENETIC_WORTH_EXTRACT","execution_id":"104","execution_order":"40","source_file":"/SQL/SPAR/POSTGRES_SEEDLOT_GENETIC_WORTH_EXTRACT.sql","source_table":"spar.seedlot_genetic_worth","source_db_type":"POSTGRES","target_table":"the.seedlot_genetic_worth","target_primary_key":"seedlot_number,genetic_worth_code","target_db_type":"ORACLE","run_mode":"UPSERT_WITH_DELETE","ignore_columns_on_update":""}]
                    ,[{"interface_id":"SEEDLOT_PARENT_TREE_EXTRACT","execution_id":"105","execution_order":"50","source_file":"/SQL/SPAR/POSTGRES_SEEDLOT_PARENT_TREE_EXTRACT.sql","source_table":"spar.seedlot_parent_tree","source_db_type":"POSTGRES","target_table":"the.seedlot_parent_tree","target_primary_key":"seedlot_number,parent_tree_id","target_db_type":"ORACLE","run_mode":"UPSERT_WITH_DELETE","ignore_columns_on_update":""}]
                    ,[{"interface_id":"SEEDLOT_PARENT_TREE_GEN_QLTY","execution_id":"106","execution_order":"60","source_file":"/SQL/SPAR/POSTGRES_SEEDLOT_PARENT_TREE_GEN_QLTY.sql","source_table":"spar.seedlot_parent_tree_gen_qlty","source_db_type":"POSTGRES","target_table":"the.seedlot_parent_tree_gen_qlty","target_primary_key":"seedlot_number,parent_tree_id,genetic_type_code,genetic_worth_code","target_db_type":"ORACLE","run_mode":"UPSERT_WITH_DELETE","ignore_columns_on_update":""}]
                    ,[{"interface_id":"SEEDLOT_PARENT_TREE_SMP_MIX","execution_id":"107","execution_order":"70","source_file":"/SQL/SPAR/POSTGRES_SEEDLOT_PARENT_TREE_SMP_MIX.sql","source_table":"spar.seedlot_parent_tree_smp_mix","source_db_type":"POSTGRES","target_table":"the.seedlot_parent_tree_smp_mix","target_primary_key":"seedlot_number,parent_tree_id,genetic_type_code,genetic_worth_code","target_db_type":"ORACLE","run_mode":"UPSERT_WITH_DELETE","ignore_columns_on_update":""}]
                    ,[{"interface_id":"SMP_MIX_EXTRACT","execution_id":"108","execution_order":"80","source_file":"/SQL/SPAR/POSTGRES_SMP_MIX_EXTRACT.sql","source_table":"spar.smp_mix","source_db_type":"POSTGRES","target_table":"the.smp_mix","target_primary_key":"seedlot_number,parent_tree_id","target_db_type":"ORACLE","run_mode":"UPSERT_WITH_DELETE","ignore_columns_on_update":""}]
                    ,[{"interface_id":"SMP_MIX_GEN_QLTY_EXTRACT","execution_id":"109","execution_order":"90","source_file":"/SQL/SPAR/POSTGRES_SMP_MIX_GEN_QLTY_EXTRACT.sql","source_table":"spar.smp_mix_gen_qlty","source_db_type":"POSTGRES","target_table":"the.smp_mix_gen_qlty","target_primary_key":"seedlot_number,parent_tree_id,genetic_type_code,genetic_worth_code","target_db_type":"ORACLE","run_mode":"UPSERT_WITH_DELETE","ignore_columns_on_update":""}]
                    ]

        with db_conn.database_connection(oracle_config) as target_db_conn:
            try:
                for seedlot in seedlots_df.itertuples():
                    temp_time = time.time()

                    #delete all tables in RI order (reversing order of processes dataframe)
                    #note - special handling for seedlot_owner_quantity
                    stored_metrics = delete_seedlot_child_tables(seedlot_number=seedlot.seedlot_number,
                                                    target_db_conn=target_db_conn,
                                                    processes=processes, 
                                                    stored_metrics=stored_metrics)

                    # All processes to be executed from configuration 
                    for processrow in processes:
                        try:
                            process = processrow[0]
                            
                            logger.info('Get Delta times to load from source')
                            
                            stored_metrics = execute_process(seedlot_number=seedlot.seedlot_number,
                                                        base_dir=current_cwd, 
                                                        track_db_conn=track_db_conn, 
                                                        track_db_schema=track_config['schema'], 
                                                        target_db_conn=target_db_conn,
                                                        process=process, 
                                                        oracle_config=oracle_config, 
                                                        postgres_config=postgres_config, 
                                                        stored_metrics=stored_metrics)
                            logger.info('Execution process finished')
                        except Exception as err:
                            logger.critical("A fatal error has occurred", exc_info = True)
                            log_message =f"Error type: {type(err)}: {err}" 
                    
                    #data_sync_ctl.save_execution_log(track_db_conn,track_config['schema'],process["interface_id"],process["execution_id"],process_log)
                
            except Exception as err:
                logger.critical("A fatal error has occurred", exc_info = True)
                log_message =f"Error type: {type(err)}: {err}" 
            
            #data_sync_ctl.save_execution_log(track_db_conn,track_config['schema'],process["interface_id"],process["execution_id"],process_log)
            target_db_conn.commit

    return stored_metrics
        
    
