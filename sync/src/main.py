import requests
import json
import module.data_synchronization as data_sync
from logging import config as logging_config
import os
import sys

def required_variables_exists():
    ret = True
    print("Checking if required variables are defined")
    
    if os.environ.get("teste") is None:
        print("Error: teste variable is None")
        ret = False
        
    if os.environ.get("vtoken") is None:
        print("Error: vtoken variable is None")
        ret = False
        
    if os.environ.get("vurl") is None:
        print("Error: vurl variable is None")
        ret = False
        
    if os.environ.get("test_mode") is None:
        print("Error: test mode variable is None")
        ret = False
        
    if ret:
        print("Required variable test passed!")
    else:
        raise Exception("Not all required variables to execute a instance of Data Sync Engine exists.")
    
        
def testVault():  
    ret = True
    
    teste = os.environ['teste']  # Copying my token from vault
    if teste =='123':
        print("Test control variable is ok")
    else:
        ret = False
        print("Test Control variable value is not expected")
        
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
        vault_url = 'https://knox.io.nrs.gov.bc.ca/v1/groups/data/spar/test'
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
    this_is_a_test = sys.argv[1]
    if this_is_a_test in definitiion_of_yes:
        print("Executing in Test mode")
        required_variables_exists()
        testVault()
        
    else:
        main()
   