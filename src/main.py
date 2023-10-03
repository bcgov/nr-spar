import module.data_synchronization as data_sync
from logging import config as logging_config
import os.path

def main() -> None:
    logging_config.fileConfig(os.path.join(os.path.dirname(__file__), "logging.ini"), 
                              disable_existing_loggers=False)   
    data_sync.data_sync()

if __name__ == '__main__':
    main()