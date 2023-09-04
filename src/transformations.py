import pandas as pd

def run_transformations(df: pd.DataFrame,
                        stage_dfs: dict, 
                        function_name: str) -> pd.DataFrame:
    try:
        df = eval(function_name.lower())(df, stage_dfs)
    except NameError as e:
        pass
    finally:
        return df

def seedlot(df: pd.DataFrame, stage_dfs: dict) -> pd.DataFrame:
    try:
        collection_method_cols = ['seedlot_number', 'cone_collection_method_code', 'cone_collection_method2_code']
        collection_method_df = pd.DataFrame(columns=collection_method_cols)
        collection_method_df = pd.concat([collection_method_df, stage_dfs['SEEDLOT_COLLECTION_METHOD']]).reset_index(drop=True)

        orchard_cols = ['seedlot_number', 'orchard_id', 'secondary_orchard_id']
        orchard_df = pd.DataFrame(columns=orchard_cols)
        orchard_df = pd.concat([orchard_df, stage_dfs['SEEDLOT_ORCHARD']]).reset_index(drop=True)

        orchard_df = orchard_df.join(collection_method_df.set_index('seedlot_number'), on='seedlot_number')
        df = df.join(orchard_df.set_index('seedlot_number'), on='seedlot_number')
    except Exception as e:
        print(e)
    finally: 
        return df
    
def seedlot_owner_quantity(df: pd.DataFrame, stage_dfs: dict) -> pd.DataFrame:
    try:
        df['QTY_RESERVED'] = 0
        df['QTY_RSRVD_CMTD_PLN'] = 0
        df['QTY_RSRVD_CMTD_APR'] = 0
        df['QTY_SURPLUS'] = 0
        df['QTY_SRPLS_CMTD_PLN'] = 0
        df['QTY_SRPLS_CMTD_APR'] = 0
    except Exception as e:
        print(e)
    finally: 
        return df