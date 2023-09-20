[![Issues](https://img.shields.io/github/issues/bcgov/nr-spar)](/../../issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/bcgov/nr-spar)](/../../pulls)
[![MIT License](https://img.shields.io/github/license/bcgov/nr-spar.svg)](/LICENSE.md)
[![Lifecycle](https://img.shields.io/badge/Lifecycle-Maturing-007EC6)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md)

#### Workflows
[![Merge to Main](https://github.com/bcgov/nr-spar/actions/workflows/merge-main.yml/badge.svg)](https://github.com/bcgov/nr-spar/actions/workflows/merge-main.yml)
[![CI](https://github.com/bcgov/nr-spar/actions/workflows/ci.yml/badge.svg)](https://github.com/bcgov/nr-spar/actions/workflows/ci.yml)
[![Cypress Nightly](https://github.com/bcgov/nr-spar/actions/workflows/cypress-nightly.yml/badge.svg)](https://github.com/bcgov/nr-spar/actions/workflows/cypress-nightly.yml)

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
  - [Spring Boot Web](https://spring.io/guides/gs/spring-boot/)
  - [Apache Maven](https://maven.apache.org/)
  - [Hibernate ORM](https://hibernate.org/orm/)
  - [Oracle JDBC](https://www.oracle.com/database/technologies/appdev/jdbc-downloads.html)

You can learn more about it [by looking its README](oracle-api/README.md)

# Getting started

Once you have cloned this repository, can get it running by typing at the 
project root directory

```sh
docker compose up -d
```

⚠️ Be aware of the `FORESTCLIENTAPI_KEY` that's not provided in the 
docker compose file. If you need that or want to have a fully working
environment, get in touch with a team member to request this API KEY.

If everything went well, you should be able to see three running
services in the output of `docker ps`.

You can see the SPAR client at http://localhost:3000 and
You also can see SPAR back end running at http://localhost:8090/swagger-ui/index.html


⚠️ in case you may want to try the back end API, you'll need to unlock 
swagger, otherwhise you'll only see 401 responses. Follow the steps bellow
to get a JWT token to your user.

⚠️ Note that you user (or any user that will do the request) needs to have
these roles: `user_read` and `user_write`.

**Getting a JWT token for SPAR services**

- Head to [BC Gov Keycloak OIDC Playground page](https://bcgov.github.io/keycloak-example-apps/)
- Expand the first dropdown *Keycloak OIDC Config* option
- Update *Auth server* with: **https://test.loginproxy.gov.bc.ca/auth**
- Keep *Realm* as is, **standard**
- Update *Client id* with: **seed-planning-test-4296**
- Hit **Upate**
- Click the **Login** button
- Hit **ID Token Raw** token
- Optional: You can check your user's JWT token properties by checking the **Token Parsed** tab

## Getting help

As mentioned, we're here to help. Feel free to start a conversation
on Rocket chat or ask a question on Stackoverflow.
