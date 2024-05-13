import requests
import json
import module.data_synchronization as data_sync
from logging import config as logging_config, basicConfig as loggingBasicConfig, DEBUG as loggingDEBUG, INFO as loggingINFO
import os
import sys

def env_var_is_filled(variable):
    if os.environ.get(variable) is None:
        print("Error: "+variable+" environment variable is None")
        return False
    return True
    
def generate_db_config(type_,schema_):
    dbconfig = {}
    if type_ == "ORACLE":
        dbconfig = {
            "type": "ORACLE",
            "username": os.environ.get("ORACLE_USER"),
            "password": os.environ.get("ORACLE_PASSWORD"),
            "host": os.environ.get("ORACLE_HOST"),
            "port": os.environ.get("ORACLE_PORT"),
            "service_name": os.environ.get("ORACLE_SERVICE"),
            "schema": schema_,
            "test_query": "SELECT 'SUCCESS' a FROM DUAL"
        }
    if type_ == "POSTGRES":
        dbconfig = {
            "type": "POSTGRES",
            "username": os.environ.get("POSTGRES_USER"),
            "password": os.environ.get("POSTGRES_PASSWORD"),
            "host": os.environ.get("POSTGRES_HOST"),
            "database": os.environ.get("POSTGRES_DATABASE"),
            "port": os.environ.get("POSTGRES_PORT"),
            "schema": schema_,
            "test_query": "SELECT 'SUCCESS' a"
        }
    return dbconfig

def required_variables_exists():
    ret = True
    
    print("-------------------------------------")
    print("----- ETL Tool: Unit test Execution  ")
    print("----- 1. Checking if required variables are defined")
    print("-------------------------------------")
    
    if not env_var_is_filled("test_mode") or \
       not env_var_is_filled("EXECUTION_ID") or  \
       not env_var_is_filled("POSTGRES_HOST") or  \
       not env_var_is_filled("POSTGRES_PORT") or  \
       not env_var_is_filled("POSTGRES_USER") or \
       not env_var_is_filled("POSTGRES_PASSWORD") or \
       not env_var_is_filled("POSTGRES_DATABASE") or \
       not env_var_is_filled("ORACLE_PORT") or \
       not env_var_is_filled("ORACLE_HOST") or \
       not env_var_is_filled("ORACLE_SERVICE") or \
       not env_var_is_filled("ORACLE_USER") or \
       not env_var_is_filled("ORACLE_PASSWORD"):
       ret = False        
        
    if ret:
        print("Required variable tests passed!")
    else:
        raise Exception("Not all required variables to execute a instance of Data Sync Engine exists.")
    
def testOracleConnection():
    print("-------------------------------------")
    print("-- 3. Checking if Oracle connection is available and reachable")
    print("-------------------------------------")
    from module.test_db_connection import test_db_connection
    dbConfig = generate_db_config("ORACLE","THE") 
    d = test_db_connection.do_test(dbConfig)
    print(d)
    
def testPostgresConnection():
    print("-------------------------------------")
    print("-- 2. Checking if Postgres connection is available and reachable")
    print("-------------------------------------")
    from module.test_db_connection import test_db_connection
    dbConfig = generate_db_config("POSTGRES","spar")
    d = test_db_connection.do_test(dbConfig)
    print(d)
        
# -- Vault is deprecated
def testVault():  
    ret = True        
    vault_url = os.environ['vurl']  # Vault url
    if vault_url.startswith('https://'):
        print("Vault URL looks good")
    else:
        ret = False
        print("Vault URL value is not expected")
    
    vault_token = os.environ['vtoken']  # Copying my token from vault
    if vault_token.startswith('hvs.'):
        print("Vault token variable looks good (it not means token is correct)")
    else:
        ret = False
        print("Vault token value is not in the pattern requested")
    
    if ret:
        headers = {'X-Vault-Token': vault_token}
        res = requests.get(vault_url, headers=headers)
        j = json.loads(res.text)
        
    else:
        print("Vault cannot be reached as required variables are not correctly informed")

def main() -> None:
    definition_of_yes = ["Y","YES","1","T","TRUE"]
    # print(os.environ.get("test_mode"))
    if os.environ.get("test_mode") is None:
        print("Error: test mode variable is None")
    elif os.environ.get("EXECUTION_ID") is None:
        print("Error: EXECUTION_ID is None, no execution defined to be executed in this run.")
    else:
        this_is_a_test = os.environ.get("test_mode")
        if this_is_a_test in definition_of_yes:
            print("Executing in Test mode")
            required_variables_exists()
            testPostgresConnection()
            testOracleConnection()
            # Vault disabled
            # testVault()
        else:            
            print("-------------------------------------")
            print("Starting ETL main process ")
            print("-------------------------------------")
            
            dbOracle = generate_db_config("ORACLE","THE") 
            dbPostgres = generate_db_config("POSTGRES","spar")
            execute_etl(dbPostgres, dbOracle, os.environ.get("EXECUTION_ID"))

            print("-------------------------------------")
            print("ETL Main process finished ")
            print("-------------------------------------")

# MAIN Execution
def execute_etl(dbPostgres, dbOracle, execution_id) -> None:
    #logging_config.fileConfig(os.path.join(os.path.dirname(__file__), "logging.ini"), disable_existing_loggers=False)   
    #loggingBasicConfig(level=loggingDEBUG, stream=sys.stdout)
    loggingBasicConfig(level=loggingINFO, stream=sys.stdout)
    # data_sync.data_sync( source_config = dbOracle, target_config = dbPostgres ,track_config = dbPostgres )
    data_sync.execute_instance( oracle_config = dbOracle, postgres_config = dbPostgres ,track_config = dbPostgres, execution_id = execution_id )

if __name__ == '__main__':
    main()

