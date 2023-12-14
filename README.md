# nr-spar-data-sync
[![Lifecycle:Maturing](https://img.shields.io/badge/Lifecycle-Maturing-007EC6)](<https://github.com/bcgov/nr-spar-data-sync/blob/main/README.md>)

Engine to sync data for SPAR application (from Postgres to Oracle). The application extracts, transforms, and loads data based on a few parameters/configurations.

## Running the application
The application has a **main.py** module with a main function that triggers the data synchronization process based on parameters/configurations described on the next session.

## Configuring each domain (source and target tables)
A domain folder has to be created for each domain to be synced. For example, the seedlot domain will sync a few tables that are related, such as SEEDLOT, SEEDLOT_GENETIC_WORTH, and SEEDLOT_PARENT_TREE.

Data to be extracted are defined on the **source.json** files as well as the select statements that will be executed.

A **target.json** file holds the target tables that will be synced with the mapping between source and target columns.

There are times when a table synchronization won´t be so simple and just column mapping won´t be enough. When more complex data manipulation needs to be performed, a transformation function named after the table being synced can be created on the **transformations.py** file, and changes can be made to the columns using Pandas DataFrame.

Lookups and stage tables can be defined on the **source.json** file and data from those tables can be used on the transformation function if needed.

There is also a **database_config.json** file that holds database parameters to be used in the process. That will be changed to fetch database credentials from Vault.

## How does the engine move data?
The engine extracts data for each domain at once, one table at a time. The order tables are extracted is defined in the **source.json** file within the domain. Data are filtered based on the process's last execution date - only records that were updated after the last execution date will be fetched. Also, records mapped to be retried on the **data_sync_error** table will also be retrieved.

Data transformation is performed only if necessary, and if so, a function should be created with all data manipulation in the **transformation.py** file The function will have access to all lookup/stage tables extracted.

There are two ways domains can be loaded. The first one is when all the tables in the domain are related and have a single column that drives them all - called in the process **leading_column**. For example, all tables on the seedlot domain have a seedlot_number column. In this case, all the tables in a domain will be synced for each **leading_column** value before committing the changes. If any database error happens then a rollback will undo all the changes made to the tables for that leading_column value, the value will be stored on the **data_sync_error** (and retried in the next execution) and the next **leading_column** value will start to be loaded.

The second way is when tables in a domain are not related to each other. In this case, the sync will happen one row at a time and if an error happens that row will be rollbacked and stored on the data_sync_error table.

Database errors during the load phase do not stop the process, it will roll back the related records, log them on data_sync_error, and move to the next record.

In order for the process to work, the source database schema should have two control tables: **data_sync_control** and **data_sync_error**. The first one will handle each execution, its status, start and end date and will be used by the process to define the date to be used to extract data incrementally. The second one will be used to log any database errors that happened during the load phase and will store the identification of the records that had problems so they can be retried in the next execution.

