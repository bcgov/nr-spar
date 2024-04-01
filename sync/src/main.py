import requests
import json
import module.data_synchronization as data_sync
from logging import config as logging_config
import os
import sys

def env_var_is_filled(variable):
    if os.environ.get(variable) is None:
        print("Error: "+variable+" environment variable is None")
        return False
    return True
    
def db_config_test(type_,schema_):
    dbconfig = {}
    if type_ == "ORACLE":
        dbconfig = {
            "type": "ORACLE",
            "username": os.environ.get("ORACLE_USER"),
            "password": os.environ.get("ORACLE_PASSWORD"),
            "host": os.environ.get("ORACLE_HOST"),
            "port": os.environ.get("ORACLE_PORT"),
            "service_name": os.environ.get("ORACLE_SN"),
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
    print("-- 1. Checking if required variables are defined")
    print("-------------------------------------")
    
    if not env_var_is_filled("test_mode") or \
       not env_var_is_filled("POSTGRES_HOST") or  \
       not env_var_is_filled("POSTGRES_USER") or \
       not env_var_is_filled("POSTGRES_PASSWORD") or \
       not env_var_is_filled("POSTGRES_DATABASE") or \
       not env_var_is_filled("ORACLE_HOST") or \
       not env_var_is_filled("ORACLE_SN") or \
       not env_var_is_filled("ORACLE_USER") or \
       not env_var_is_filled("ORACLE_PASSWORD"):
       ret = False        
        
    if ret:
        print("Required variable tests passed!")
    else:
        raise Exception("Not all required variables to execute a instance of Data Sync Engine exists.")
    
def testOracleConnection():
    print("-- 3. Checking if Oracle connection is available and reachable")
    dbConfig = db_config_test("ORACLE","THE") 
    #response = os.system("ping -c 1 " + dbConfig["host"] )
    #if response == 0:
    #    print("ORACLE Host ("+dbConfig["host"]+") is reachable")
    #else:
    #    print("ORACLE Host ("+dbConfig["host"]+") is unreachable")
    #    
    d = test_db_connection.do_test(dbConfig)
    print(d)
    
def testPostgresConnection():
    print("-------------------------------------")
    print("-- 2. Checking if Postgres connection is available and reachable")
    print("-------------------------------------")
    from module.test_db_connection import test_db_connection
    dbConfig = db_config_test("POSTGRES","spar")
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
        # vault_url = 'https://knox.io.nrs.gov.bc.ca/v1/groups/data/spar/test'
        headers = {'X-Vault-Token': vault_token}
        res = requests.get(vault_url, headers=headers)
        # print(res.text)    
        j = json.loads(res.text)
        # print(j)
        
    else:
        print("Vault cannot be reached as required variables are not correctly informed")


def main() -> None:
    logging_config.fileConfig(os.path.join(os.path.dirname(__file__), "logging.ini"), 
                              disable_existing_loggers=False)   
    data_sync.data_sync()

if __name__ == '__main__':
    definitiion_of_yes = ["Y","YES","1","T","TRUE"]
    if os.environ.get("test_mode") is None:
        print("Error: test mode variable is None")
    else:
        this_is_a_test = os.environ.get("test_mode")
        if this_is_a_test in definitiion_of_yes:
            print("Executing in Test mode")
            required_variables_exists()
            testPostgresConnection()
            # Vault disabled
            # testVault()
        else:            
            print("Starting main process ...")
            # main()

