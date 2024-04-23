import logging
#import cx_Oracle
import oracledb
import csv

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
        dbc = self.database_config # alias
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
            connection_string = 'postgresql+psycopg2://{}:{}@{}:{}/{}'.format(
                database_config['username'], 
                database_config['password'], 
                database_config['host'], 
                database_config['port'],
                database_config['database'])

        return connection_string
    
    def create_temp_table(self, table_name:str, from_what_table:str, only_structure:bool):
        complement = ""
        if only_structure:
            complement = " WHERE 1=2"

        query = "CREATE TEMP TABLE {} as SELECT * FROM {} {}".format(table_name,from_what_table,complement)
        print("TEMP TABLE {} created: {}".format(table_name, query) )
        self.conn.execute(text(query), None)


    def bulk_upsert(self, dataframe:object, table_name:str, table_pk:str, if_data_exists: str, index_data:bool ) -> int:
        onconflictstatement = ""
        if table_pk != "":
            columnspk = table_pk.split(",")
            df2 = dataframe.drop(columns=columnspk)  # Remove table PK from the column lists for SET operation   
            onconflictstatement = f"""
            ON CONFLICT ({table_pk})               
            DO UPDATE SET {' , '.join(df2.columns.values + '= EXCLUDED.'+df2.columns.values)} """
       
        sql_text = f"""         
        INSERT INTO {table_name}({', '.join(dataframe.columns.values)})                
        VALUES(:{', :'.join(dataframe.columns.values)})                
        {onconflictstatement}"""
        
        result = self.conn.execute(text(sql_text), dataframe.to_dict('records'))
        self.commit()  # If everything is ok, a commit will be executed.
        return result.rowcount  # Number of rows affected
    
    def bulk_load(self, dataframe:object, table_name:str, if_data_exists: str, index_data:bool ) -> int:
        return dataframe.to_sql(name=table_name,con=self.conn.engine,if_exists=if_data_exists, index=index_data, method=psql_insert_copy)

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
