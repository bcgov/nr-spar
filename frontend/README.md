[![Lifecycle:Experimental](https://img.shields.io/badge/Lifecycle-Experimental-339999)](https://github.com/bcgov/nr-spar-webapp)
![Cypress nightly](https://github.com/bcgov/nr-spar-webapp/actions/workflows/cypress-nightly.yml/badge.svg)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=bcgov_nr-spar-webapp&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=bcgov_nr-spar-webapp)

# Natural Resources Front-End Starting Progressive Web Application

This repository holds a set of policies, standard, guides and pipelines to get
started with a Progressive Web Application. Before writing your first line of code, please take a
moment and check out our [CONTRIBUTING](CONTRIBUTING.md) guide.

## Our Policy

- Work in the open: That means that everything we do should be open, should be
public. Please, don't create private repositories unless you have a very strong
reason. Keeping things public is a must follow rule for BC Government.
- Customer centred services: All the work that's been created is to improve
users, customers, and friends usability and experience. Is important to keep
that in mind, because as engineers sometimes we face technical issues, however, our goal is to have a good product.
- Community based work: Remember that you're not alone. It's very likely that
your problem is someone else's problem. Let's figure it out together. So, ask
a question using our channels. We have [our own Stackoverflow](https://stackoverflow.developer.gov.bc.ca/)
and [our Rocket Chat](https://chat.developer.gov.bc.ca/) channel.

# Stack

Here you will find a comprehensive list of all the languages and tools that are
been used in this app. And also everything you need to get started, build,
test and deploy.

- React Progressive Web Application
  - TypeScript
  - Context API
  - React Query
  - MirageJS
  - React Testing Library
  - Jest
  - Cypress
- Lint
  - Airbnb ESLint
- Tools
  - Docker
  - Microsoft Visual Studio Code
- Styling
  - Carbon Design System
- Authentication
  - Keycloak

# Getting started

Once you have cloned this repository, you can get the app running by typing
`yarn install` and then `yarn start` from the project root directory. Then
head to http://localhost:3000.

Be aware of the required environment variables:

```sh
REACT_APP_NRSPARWEBAPP_VERSION=dev
REACT_APP_SERVER_URL=http://localhost:8090
REACT_APP_ORACLE_SERVER_URL=https://nr-spar-test-oracle-api.apps.silver.devops.gov.bc.ca
REACT_APP_KC_URL=https://test.loginproxy.gov.bc.ca/auth
REACT_APP_KC_REALM=standard
REACT_APP_KC_CLIENT_ID=seed-planning-test-4296
CYPRESS_USERNAME=LOAD-3-TEST
CYPRESS_PASSWORD=[password-here]
```

✅ You can export all environment variables from a .env file with this command (On Linux):

```sh
export $(cat .env | xargs)
```

To run the unit tests all you need is `yarn test`. For end-to-end test you need to run `yarn cypress run` to run on console or `yarn cypress open` to use the Cypress IDE.

> Note that to run locally you'll need those environment variables: CYPRESS_USERNAME and CYPRESS_PASSWORD

For more details about end-to-end tests check out our [confluence page](https://apps.nrs.gov.bc.ca/int/confluence/display/FSADT2/Test+strategy)

Before writing your first line of code, please take a moment and check out
our [CONTRIBUTING](CONTRIBUTING.md) guide.

## Quick look

But if all you want is to take a quick look on the running service, you can do it by
using Docker Compose.

Run with (from the project root):
```sh
docker compose up --build frontend -d
```

## Developing locally with Docker

Just run:
```sh
docker compose up frontend -d
```

Then every change you made in the code base will be update in the running instance.
Happy coding!

## Getting help

As mentioned, we're here to help. Feel free to start a conversation
on Rocket chat, you can search for `@matheus.gaseta`, `@igor.melo`, `@ricardo.campos` or `@annibal.silva`.
