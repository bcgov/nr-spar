[![Issues](https://img.shields.io/github/issues/bcgov/nr-spar)](/../../issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/bcgov/nr-spar)](/../../pulls)
[![MIT License](https://img.shields.io/github/license/bcgov/nr-spar.svg)](/LICENSE.md)
[![Lifecycle](https://img.shields.io/badge/Lifecycle-Maturing-007EC6)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md)

#### Workflows
[![ETL Sync](https://github.com/bcgov/nr-spar/actions/workflows/job-sync.yml/badge.svg)](https://github.com/bcgov/nr-spar/actions/workflows/job-sync.yml)
[![Merge](https://github.com/bcgov/nr-spar/actions/workflows/merge.yml/badge.svg)](https://github.com/bcgov/nr-spar/actions/workflows/merge.yml)
[![Nightly](https://github.com/bcgov/nr-spar/actions/workflows/job-nightly.yml/badge.svg)](https://github.com/bcgov/nr-spar/actions/workflows/job-nightly.yml)

#### Frontend
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=nr-spar_frontend&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=nr-spar_frontend)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=nr-spar_frontend&metric=coverage)](https://sonarcloud.io/summary/new_code?id=nr-spar_frontend)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=nr-spar_frontend&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=nr-spar_frontend)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=nr-spar_frontend&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=nr-spar_frontend)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=nr-spar_frontend&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=nr-spar_frontend)

#### Backend
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=nr-spar_backend&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=nr-spar_backend)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=nr-spar_backend&metric=coverage)](https://sonarcloud.io/summary/new_code?id=nr-spar_backend)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=nr-spar_backend&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=nr-spar_backend)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=nr-spar_backend&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=nr-spar_backend)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=nr-spar_backend&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=nr-spar_backend)

#### Oracle-API
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=nr-spar_oracle-api&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=nr-spar_oracle-api)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=nr-spar_oracle-api&metric=coverage)](https://sonarcloud.io/summary/new_code?id=nr-spar_oracle-api)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=nr-spar_oracle-api&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=nr-spar_oracle-api)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=nr-spar_oracle-api&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=nr-spar_oracle-api)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=nr-spar_oracle-api&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=nr-spar_oracle-api)

# Natural Resources SPAR

This repository holds all SPAR directly related front-end client and back-end APIs codebase, and also
a set of policies, standards, guides, and pipelines. Before pushing your first commit, please
take a moment and check out our [CONTRIBUTING](CONTRIBUTING.md) guide.

## Our Policy

- Work in the open: That means that everything we do should be open, should be
public. Please, don't create private repositories unless you have a very strong
reason. Keeping things public is a must follow rule for BC Government.
- Customer centred services: All the work that's been created is to improve users,
customers, and friends usability and experience. Is important to keep that in mind 
because as engineers sometimes we face technical issues, however, our goal is
to have a good product.
- Community based work: Remember that you're not alone. It's very likely that
your problem is someone else's problem. Let's figure it out together. So, ask
a question using our channels. We have [our own Stackoverflow](https://stackoverflow.developer.gov.bc.ca/)
and [our Rocket Chat](https://chat.developer.gov.bc.ca/) channel.

# Stack

Here you can find a comprehensive list of all languages and tools that are been used
for all and every service. And also everything you need to get started, building locally,
testing and deploying. 

**SPAR Client**

- PWA - Progressive Web Application
  - [React](https://react.dev/)
  - [React Context](https://legacy.reactjs.org/docs/context.html)
  - [React Query](https://tanstack.com/query/v3/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [MirageJS](https://miragejs.com/)
  - [FAM Authentication](https://github.com/bcgov/nr-forests-access-management)
  - [Vitest](https://vitest.dev/)
  - [Vite](https://vitejs.dev/)
  - [Node 20](https://nodejs.org/download/release/v20.7.0/)

You can learn more about it [by looking its README](frontend/README.md)

**SPAR Back end - Postgres**
- REST API
  - [Java 17 with Spring Boot with GraalVM](https://docs.spring.io/spring-boot/docs/current/reference/html/native-image.html)
  - [Spring Boot Web](https://spring.io/guides/gs/spring-boot/)
  - [Apache Maven](https://maven.apache.org/)
  - [Hibernate ORM](https://hibernate.org/orm/)

You can learn more about it [by looking its README](backend/README.md)

**SPAR Back end - Oracle THE**
- REST API
  - [Java 17](https://www.oracle.com/java/technologies/downloads/#java17)
  - [Spring Boot Web](https://spring.io/guides/gs/spring-boot/)
  - [Apache Maven](https://maven.apache.org/)
  - [Hibernate ORM](https://hibernate.org/orm/)
  - [Oracle JDBC](https://www.oracle.com/database/technologies/appdev/jdbc-downloads.html)

You can learn more about it [by looking its README](oracle-api/README.md)

# Getting started

Once you have cloned this repository, you can get it running by typing at the 
project root directory

```sh
docker compose up -d
```

⚠️ Be aware of the `FORESTCLIENTAPI_KEY` that's not provided in the 
docker compose file. If you need that or want to have a fully working
environment, get in touch with a team member to request this API KEY.

If everything went well, you should be able to see three running
services in the output of `docker ps`. You'll find:

- SPAR Client - http://localhost:3000 
- SPAR Back end Postgres - http://localhost:8090/swagger-ui/index.html
- SPAR Postgres Database


⚠️ In case you may want to try the back end API, you'll need to unlock 
swagger, otherwhise you'll only see 401 responses. Follow the steps bellow
to get a JWT token to your user.

⚠️ Note that users needs to have one of these roles: `user_read` and `user_write`.

## Getting help

As mentioned, we're here to help. Feel free to start a conversation
on Rocket chat or ask a question on Stackoverflow.

# nr-spar-data-sync

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
