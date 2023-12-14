import module.data_synchronization as data_sync
from logging import config as logging_config
import os

def do_tests_in_jenkins():
    print("Starting tests")
    
    # Testing Secrets variable from Jenkins Credentials Plugin    
    print(os.environ['Usr_teste'] + " " + os.environ['Psw_Test'] ) 
    
    if os.environ['Usr_teste'] == "usuario_teste":
        print("Usr credential accepted")
    else:
        print("Usr credential incorrect")
        
    if os.environ['Psw_Test'] == "senha":
        print("Password credential accepted")
    else:
        print("Password credential incorrect")

def main() -> None:
    logging_config.fileConfig(os.path.join(os.path.dirname(__file__), "logging.ini"), 
                              disable_existing_loggers=False)   
    data_sync.data_sync()    
    
if __name__ == '__main__':
    main()