from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.engine import URL

class test_db_connection:
    """ Class used to test database connections. """
    
    def do_test (database_config):
        if database_config['type'] == 'ORACLE':
            import ssl
            import oracledb
            dbc = database_config # alias
            ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
            ssl_context.set_ciphers('DEFAULT@SECLEVEL=1')
            #connection = oracledb.connect(user=dbc['username'], password=dbc['password'],host=dbc['host'], port=dbc['port'], service_name=dbc['service_name'], ssl_context = ssl_context)
            connection = oracledb.connect(user=dbc['username'], password=dbc['password'],dsn=f"(DESCRIPTION=(ADDRESS=(PROTOCOL=TCPS)(HOST={dbc['host']})(PORT={dbc['port']}))(CONNECT_DATA=(SERVICE_NAME={dbc['service_name']})))",externalauth=False, ssl_context = ssl_context)
            cursor = connection.cursor()
            for row in cursor.execute("select 'SUCCESS' b FROM DUAL"):
                print(row)
            # close the connection
            connection.close()
        
        if database_config['type'] == 'POSTGRES':
            import psycopg2
            connection_string = test_db_connection.format_connection_string(database_config)
            engine = create_engine(connection_string)
            conn = engine.connect().execution_options(autocommit=False)
            sql_query = text(database_config["test_query"])
            results = conn.execute(sql_query).fetchall()
            for record in results:
                print(record)
            return results
        
    def format_connection_string(database_config: str):
        """ Formats the connection string based on the database type and the connection configuration. """
        if database_config['type'] == 'ORACLE':
            import oracledb
            #print("Oracle DB Connection to " + database_config['host'] + ", SN=" + database_config['service_name'])
            cp = oracledb.ConnectParams(
                host=database_config['host'],
                port=database_config['port'],
                service_name=database_config['service_name'])
                
            connection_string = URL.create(
                "oracle+oracledb",
                host=cp.get_connect_string(),
                username=database_config['username'],
                password=database_config['password'],
            )

        if database_config['type'] == 'POSTGRES':
            connection_string = 'postgresql+psycopg2://{}:{}@{}:{}/{}'.format(
                database_config['username'], 
                database_config['password'], 
                database_config['host'], 
                database_config['port'],
                database_config['database'])

        return connection_string
