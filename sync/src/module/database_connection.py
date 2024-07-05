import logging
#import cx_Oracle
import oracledb
import csv
import pandas as pd
import numpy
import math

from io import StringIO
from sqlalchemy import create_engine, text

logger = logging.getLogger(__name__)

class database_connection(object):
    """ Class used to control database connections. """
    def __init__(self, database_config: str):
        self.conn = None
        self.engine = None
        self.database_config = database_config
        self.database_type = database_config['type']
        self.conn_string = self.format_connection_string(database_config)

    def __enter__(self):
        if self.conn_string == 'ORACLE':
            self.engine = self.get_oracle_engine()
        else:
            self.engine = create_engine(self.conn_string)
        self.conn = self.engine.connect().execution_options(autocommit=False)
       
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.engine.dispose()
    
    def execute(self, query, params):
        """ Runs a SQL statement. """
        self.conn.execute(text(query), params)
        
    def select(self, query, params=None):
        """ Runs a SQL statement. """
        result = self.conn.execute(text(query), params)
        return result
        
    def health_check(self) -> bool:
        """ Runs a simple query to check if database is still active/working. """
        query = 'SELECT 1' 
        if self.database_type == 'ORACLE':
            query = ' '.join([query, 'FROM DUAL'])
        
        try:            
            self.conn.execute(text(query))
        except:
            logger.critical('Connection health check resulted in an error', exc_info=True)
            return False
        else:
            return True
    
    def commit(self):
        """ Runs a SQL statement. """
        self.conn.commit()
        
    def rollback(self):
        """ Runs a SQL statement. """
        self.conn.rollback()
     
    def get_oracle_engine(self):
        import ssl
        import oracledb
        dbc = self.database_config # aliasok i
        ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
        ssl_context.set_ciphers('DEFAULT@SECLEVEL=1')
        return create_engine(f'oracle+oracledb://:@',
                        connect_args={
                            "user": dbc['username'],
                            "password": dbc['password'],
                            "dsn": f"(DESCRIPTION=(ADDRESS=(PROTOCOL=TCPS)(HOST={dbc['host']})(PORT={dbc['port']}))(CONNECT_DATA=(SERVICE_NAME={dbc['service_name']})))",
                            "externalauth":False,
                            "ssl_context": ssl_context
                        })
        
    def format_connection_string(self, database_config: str):
        """ Formats the connection string based on the database type and the connection configuration. """
        if database_config['type'] == 'ORACLE':
            return 'ORACLE'

        if database_config['type'] == 'POSTGRES':
            req= ''
            if database_config['ssl_required']=='Y':
                conn_string  = 'postgresql+psycopg2://{}:{}@{}:{}/{}?sslmode={}'
                req = 'require'
            else:
                conn_string = 'postgresql+psycopg2://{}:{}@{}:{}/{}{}'

            connection_string = conn_string.format(
                database_config['username'], 
                database_config['password'], 
                database_config['host'], 
                database_config['port'],
                database_config['database'],
                req)

        return connection_string
    
    def create_temp_table(self, table_name:str, from_what_table:str, only_structure:bool):
        complement = ""
        if only_structure:
            complement = " WHERE 1=2"

        query = "CREATE TEMP TABLE {} as SELECT * FROM {} {}".format(table_name,from_what_table,complement)
        logger.debug("TEMP TABLE {} created: {}".format(table_name, query) )
        self.conn.execute(text(query), None)

    def execute_upsert(self, dataframe:object, table_name:str, table_pk:str, db_type:str, run_mode:str, ignore_columns_on_update:str) -> int:
        if db_type=="POSTGRES":
            n = 1000
            i = 0
            k = 0 
            list_df = numpy.array_split(dataframe, math.ceil(len(dataframe)/n))
            logger.debug(f"Dataframe being processed into Postgres by chunks of {n} rows.")
            # Splitting dataframe in small chunks to improve performance
            for df in list_df:
                k = k + 1
                logger.debug(f"Dataframe being processed into Postgres chunks {k} / {len(list_df)}.")
                i = i + self.bulk_upsert_postgres(dataframe=df,table_name=table_name,table_pk=table_pk,if_data_exists="append",index_data=False)

            return i
        
        if db_type=="ORACLE":
            orcldataframe = convertTypesToOracle(dataframe)
            return self.bulk_upsert_oracle(dataframe=orcldataframe, table_name=table_name, table_pk=table_pk, run_mode=run_mode, ignore_columns_on_update=ignore_columns_on_update)
        
        return None

    def bulk_upsert_postgres(self, dataframe:object, table_name:str, table_pk:str, if_data_exists: str, index_data:bool ) -> int:
        onconflictstatement = ""
        logger.debug('Starting UPSERT statement in Postgres Database')
        table_clean = clean_table_from_schema(table_name)
        if table_pk != "":
            columnspk = table_pk.split(",")
            df2 = dataframe.drop(columns=columnspk)  # Remove table PK from the column lists for SET operation   
            onconflictstatement = f"""
            ON CONFLICT ({table_pk})               
            DO UPDATE SET {' , '.join(df2.columns.values + '= EXCLUDED.'+df2.columns.values)} 
            WHERE {' OR '.join(table_clean+"."+df2.columns.values + '!= EXCLUDED.'+df2.columns.values)}
            """
        
        sql_text = f"""         
        INSERT INTO {table_name}({', '.join(dataframe.columns.values)})                
        VALUES(:{', :'.join(dataframe.columns.values)})                
        {onconflictstatement}"""
        
        result = self.conn.execute(text(sql_text), dataframe.to_dict('records'))
        self.commit()  # If everything is ok, a commit will be executed.
        return result.rowcount  # Number of rows affected

    def delete_seedlot_owner_quantity(self,seedlot_number, table_name, soqdf) -> int:
        #special delete processing for soq - delete any owners from oracle not in postgres
        logger.debug('Executing seedlot_owner_quantity delete for seedlot '+seedlot_number)
        log_message = ""
        
        # Initializing metric variables
        #stored_metrics['process_start_time'] = time.time()
        #stored_metrics['time_source_extract'] = None
        #stored_metrics['rows_from_source'] = 0
        #stored_metrics['time_conn_target'] = None
        #stored_metrics['rows_target_processed'] = 0
        #stored_metrics['time_target_load'] = None
        #stored_metrics['time_conn_source'] = None

        sql_text = f""" 
            DELETE FROM {table_name}
                WHERE seedlot_number = :p_seedlot_number 
                    AND (seedlot_number,client_number,client_locn_code) NOT IN 
                        (  """
        params = {}
        params["p_seedlot_number"] = seedlot_number
        for owner in soqdf.itertuples():
            params["p_seedlot_number"+str(owner.Index)] = seedlot_number
            params["p_client_number"+str(owner.Index)] = owner.client_number
            params["p_client_locn_code"+str(owner.Index)] = owner.client_locn_code
            if owner.Index > 0:
                sql_text = sql_text + ","
            sql_text = sql_text + f""" (:p_seedlot_number{str(owner.Index)},:p_client_number{str(owner.Index)},:p_client_locn_code{str(owner.Index)}) """
        
        sql_text = sql_text + ")"
        logger.debug("==================soq sql==========================================")
        logger.debug(sql_text)
        logger.debug(params)
        logger.debug("===================================================================")

        result = self.conn.execute(text(sql_text), params)
        
        self.commit()  # If everything is ok, a commit will be executed.

        #process_log = data_sync_ctl.include_process_log_info(stored_metrics=stored_metrics, 
        #                                                    log_message=log_message,
        #                                                    execution_status='SKIPPED', ## No error, but
        #                                                    )
        logger.debug('Finished soq deletion')
        #data_sync_ctl.save_execution_log(track_db_conn,track_db_schema,process["interface_id"],process["execution_id"],process_log)

        return result.rowcount

    def delete_seedlot_child_table(self, table_name:str, seedlot_number:str ) -> int:
        logger.debug("-------------------processing delete on row-----------------")
        logger.debug(f"seedlot number is {seedlot_number}")
        logger.debug("-------------------processing delete on row-----------------")
        sql_text = f""" 
            DELETE FROM {table_name}
            WHERE seedlot_number = :p_seedlot_number """
        params = {}
        params["p_seedlot_number"] = seedlot_number
        
        logger.debug("-------------------delete text-----------------")
        logger.debug(sql_text)
        logger.debug("-------------------delete text-----------------")
        result = self.conn.execute(text(sql_text), params)
        
        self.commit()  # If everything is ok, a commit will be executed.
        return result.rowcount  # Number of rows affected

    def bulk_upsert_oracle(self, dataframe:object, table_name:str, table_pk:str, run_mode:str, ignore_columns_on_update:str ) -> int:
        logger.debug('Starting UPSERT statement in Oracle Database')
        logger.debug('run_mode is '+run_mode)
        onconflictstatement = ""

        i = 0
        for row in dataframe.itertuples():
            i = i + 1
            logger.debug(f'---Including row {i}')
            params = {}
            for column in dataframe.columns.values:
                params[column] = getattr(row,column)
            if table_pk != "":
                columnspk = table_pk.split(",")
                whStatement = "WHERE 1=1"
                #add pk to WHERE clause
                for column in columnspk:
                    params["p_"+column] = getattr(row,column)
                    whStatement = f"""{whStatement}  AND  {column} = :p_{column}"""                

                # Remove table PK from the column lists for SET operation 
                df2 = dataframe.drop(columns=columnspk)  
                #**add checking for changes to WHERE clause - RR this does not consider nulls -removing
                #whStatement2 = f" AND ({' OR '.join(df2.columns.values + '!= :q_' + df2.columns.values)})"
                whStatement2 = ""
                
                #some tables will insert all columns in query but not update all. Find and remove them from the UPDATE col list
                if ignore_columns_on_update:
                    insertonlycols = ignore_columns_on_update.split(",")
                    df2 = df2.drop(columns=insertonlycols)

                for column in dataframe.columns.values:
                    params["s_"+column] = getattr(row,column)
                    params["q_"+column] = getattr(row,column)
                onconflictstatement = f"""
                EXCEPTION
                WHEN DUP_VAL_ON_INDEX THEN
                    UPDATE  {table_name} 
                    SET {' , '.join(df2.columns.values + '= :s_'+df2.columns.values)} 
                    {whStatement} {whStatement2};"""
        
            sql_text = f""" 
            BEGIN
                INSERT INTO {table_name}({', '.join(dataframe.columns.values)}) 
                    VALUES(:{', :'.join(dataframe.columns.values)})   ;
                {onconflictstatement}
            END; """
            logger.debug(f'---Executing statement for row {i}')
            logger.debug(sql_text)
            result = self.conn.execute(text(sql_text), params)
        
        self.commit()  # If everything is ok, a commit will be executed.
        return result.rowcount  # Number of rows affected

def convertTypesToOracle(dataframe):
    dataframe = dataframe.fillna(numpy.nan).replace([numpy.nan], [None])
    for column in dataframe.columns.values:
        if dataframe[column].dtype =='Int64':
            dataframe=dataframe.astype({column:int},errors="ignore")
    
    return dataframe

def psql_insert_copy(table, conn, keys, data_iter):
    """
    Execute SQL statement inserting data

    Parameters
    ----------
    table : pandas.io.sql.SQLTable
    conn : sqlalchemy.engine.Engine or sqlalchemy.engine.Connection
    keys : list of str
        Column names
    data_iter : Iterable that iterates the values to be inserted
    """
    # gets a DBAPI connection that can provide a cursor
    #from psycopg2 import sql
    dbapi_conn = conn.connection
    with dbapi_conn.cursor() as cur:
        s_buf = StringIO()
        writer = csv.writer(s_buf)
        writer.writerows(data_iter)
        s_buf.seek(0)

        columns = ', '.join('"{}"'.format(k) for k in keys)
        if table.schema:
            table_name = '{}.{}'.format(table.schema, table.name)
        else:
            table_name = table.name

        sql_text = 'COPY {} ({}) FROM STDIN WITH CSV'.format(table_name, columns)
        cur.copy_expert(sql=sql_text, file=s_buf)

def clean_table_from_schema(table_name:str) -> str:
    if(table_name.find("."))==-1:
        return table_name
    
    idx = table_name.find(".")+1
    return table_name[idx:]