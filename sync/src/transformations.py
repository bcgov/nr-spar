import logging
import pandas as pd

logger = logging.getLogger(__name__)

def run_transformations(df: pd.DataFrame,
                        stage_dfs: dict, 
                        function_name: str) -> pd.DataFrame:
    try:
        print("--- Applying transformation: "+ function_name.lower())
        df = eval(function_name.lower())(df, stage_dfs)
    except NameError:
        logger.warning(f'{function_name} has no transformations to be applied. See transformations.py project file to implement this new transformation.')
        pass
    finally:
        return df

# Filename was changed from seedlot to oracle_seedlot to tag it to the Oracle database.         
def oracle_seedlot(df: pd.DataFrame, stage_dfs: dict) -> pd.DataFrame:
    return seedlot(df,stage_dfs)

def seedlot(df: pd.DataFrame, stage_dfs: dict) -> pd.DataFrame:
    logger.info('SEEDLOT Table Transformation')
    print(stage_dfs)
    try:
        if not stage_dfs: # Query type is not lookup or staging
            logger.info('Query type is not from lookup or staging, skipping transformations')
        else:
            logger.info('Executing transformation for collection_method')
            collection_method_cols = ['seedlot_number', 'cone_collection_method_code', 'cone_collection_method2_code']
            collection_method_df = pd.DataFrame(columns=collection_method_cols)
            collection_method_df = pd.concat([collection_method_df, stage_dfs['SEEDLOT_COLLECTION_METHOD']]).reset_index(drop=True)
    
            logger.info('Executing transformations for orchard')
            orchard_cols = ['seedlot_number', 'orchard_id', 'secondary_orchard_id']
            orchard_df = pd.DataFrame(columns=orchard_cols)
            orchard_df = pd.concat([orchard_df, stage_dfs['SEEDLOT_ORCHARD']]).reset_index(drop=True)
    
            orchard_df = orchard_df.join(collection_method_df.set_index('seedlot_number'), on='seedlot_number')
            df = df.join(orchard_df.set_index('seedlot_number'), on='seedlot_number')
    except Exception as e:
        logger.critical('SEEDLOT Table Transformation ERROR', exc_info=True)
        return None
    else: 
        return df
    
def seedlot_owner_quantity(df: pd.DataFrame, stage_dfs: dict) -> pd.DataFrame:
    logger.info('SEEDLOT_OWNER_QUANTITY Table Transformation')
    try:
        df['QTY_RESERVED'] = 0
        df['QTY_RSRVD_CMTD_PLN'] = 0
        df['QTY_RSRVD_CMTD_APR'] = 0
        df['QTY_SURPLUS'] = 0
        df['QTY_SRPLS_CMTD_PLN'] = 0
        df['QTY_SRPLS_CMTD_APR'] = 0
    except Exception as e:
        logger.critical('SEEDLOT_OWNER_QUANTITY Table Transformation ERROR', exc_info=True)
        return None
    else: 
        return df
    
def seedlot_parent_tree(df: pd.DataFrame, stage_dfs: dict) -> pd.DataFrame:
    logger.info('SEEDLOT_PARENT_TREE Table Transformation')
    try:
        df['TOTAL_GENETIC_WORTH_CONTRIB'] = 0
    except Exception as e:
        logger.critical('SEEDLOT_PARENT_TREE Table Transformation ERROR', exc_info=True)
        return None
    else: 
        return df