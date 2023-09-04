import cx_Oracle
import psycopg2
from sqlalchemy import create_engine, text

class database_connection(object):
    """ Class used to control database connections. """
    def __init__(self, database_config: str):
        self.conn_string = self.format_connection_string(database_config)
        self.engine = None
        self.conn = None
        
    def __enter__(self):
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
    
    def commit(self):
        """ Runs a SQL statement. """
        self.conn.commit()
        
    def rollback(self):
        """ Runs a SQL statement. """
        self.conn.rollback()
        
    def format_connection_string(self, database_config: str):
        """ Formats the connection string based on the database type and the connection configuration. """
        if database_config['type'] == 'ORACLE':
            dsn = cx_Oracle.makedsn(
                database_config['host'], 
                database_config['port'], 
                service_name=database_config['service_name']
            )

            connection_string = (
                'oracle+cx_oracle://{}:{}@'.format(
                    database_config['username'], 
                    database_config['password']
                ) + dsn
            )

        if database_config['type'] == 'POSTGRES':
            connection_string = 'postgresql+psycopg2://{}:{}@{}:{}/{}'.format(
                database_config['username'], 
                database_config['password'], 
                database_config['host'], 
                database_config['port'],
                database_config['database'])

        return connection_string