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

- React PWA
  - TypeScript
  - Context API
  - React Query
  - MirageJS

You can learn more about this service [looking its README](frontend/README.md)

**SPAR Back-end REST API - Postgres**

- Java ecosystem
  - Maven
  - Open JDK 17
  - Spring Web MVC Framework
  - JPA and Hibernate Framework

You can learn more about this service [looking its README](backend/README.md)

**SPAR Back-end REST API - Oracle THE**

- Java ecosystem
  - Maven
  - Open JDK 17
  - Spring Web MVC Framework
  - JPA and Hibernate Framework

You can learn more about this service [looking its README](oracle-api/README.md)

# Getting started

Once you have cloned this repository, can get it running by typing: `./mvnw spring-boot:run`
from the project root directory, if it's one of the Java services. You **must** provide some environment
variables for database access configuration, depending on what service you're trying to run. Please
see each service README to learn more details.

## Quick look

But if all you want is to take a quick look at the running services and client, you can do it by using
Docker Compose.

Run with:
```sh
docker-compose up --build -d
```

There should be four running services:

You can clean and remove the containers with
```sh
docker-compose down --remove-orphans
```

⚠️ You may want to try one or more available back-end APIs. To do so, you can rely on Swagger UI, provided
on both back-end services. Once the service is running, head to http://localhost:8090/swagger-ui/index.html.
Also note that you'll need to unlock swagger, otherwhise you'll only see 401 responses. Follow the steps bellow
to get a JWT token to your user.

⚠️ Be awere the port may change due to docker parameters.

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
