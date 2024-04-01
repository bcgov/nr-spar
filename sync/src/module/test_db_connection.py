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
            # ssl_args = {'ssl_context': ssl_context}
            connection = oracledb.connect(user=dbc['username'], password=dbc['password'],host=dbc['host'], port=dbc['port'], service_name=dbc['service_name'], ssl_context = ssl_context)
            cursor = connection.cursor()
            for row in cursor.execute("select 1 a, 2 b FROM DUAL"):
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
    
    def do_test_old(database_config):
        """ Test Connection """
        connection_string = test_db_connection.format_connection_string(database_config)
        ssl_args = test_db_connection.get_ssl_args(database_config)
        #print(ssl_args)
        #print(connection_string)
        engine = create_engine(connection_string,connect_args=ssl_args,)
        conn = engine.connect().execution_options(autocommit=False)
        result = conn.execute(text(database_config["test_query"]))
        return result        
        
    def get_ssl_args(database_config):
        import ssl
        ssl_args = {}
        if database_config['type'] == 'ORACLE':
            ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
            ssl_context.set_ciphers('DEFAULT@SECLEVEL=1')
            # print(ssl_context)
            ssl_args = {'ssl_context': ssl_context}
            # ssl_args = {'ssl':{'fake_flag_to_enable_tls': True}}
            
        return ssl_args        
        
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
        
    def format_connection_string_cx(database_config: str):
        """ Formats the connection string based on the database type and the connection configuration. 
         CX_ORACLE library is not possible to use because of the following error:
         DPI-1047: Cannot locate a 64-bit Oracle Client library: "libclntsh.so: cannot open shared object file: No such file or directory". See https://cx-oracle.readthedocs.io/en/latest/user_guide/installation.html for help
        """
        if database_config['type'] == 'ORACLE':
            import cx_Oracle
            #print("Oracle DB Connection to " + database_config['host'] + ", SN=" + database_config['service_name'])
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