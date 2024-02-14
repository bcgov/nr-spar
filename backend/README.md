# SPAR Back end REST API

This repository holds a set of policies, standards, guides, and pipelines to
get started with a back-end API. Before writing your first line of code, please
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
in this service. And also everything you need to get started, build locally, test
and deploy it. 

- Java REST API
  - [Apache Maven](https://maven.apache.org/)
  - [Java 17](https://www.oracle.com/java/technologies/downloads/#java17)
  - [Spring Boot Web](https://spring.io/guides/gs/spring-boot/)
  - [Hibernate ORM](https://hibernate.org/orm/)
- Testing
  - [JUnit 5](https://junit.org/junit5/)
  - [Mockito](https://site.mockito.org/)
  - [Spring Mock MVC](https://docs.spring.io/spring-framework/reference/testing/spring-mvc-test-framework.html)
  - [Automated tests with Postman and Newman](https://learning.postman.com/docs/collections/using-newman-cli/installing-running-newman/)
- Relational Database
  - [PostgreSQL](https://www.postgresql.org/) + [PostGIS](https://postgis.net/)
  - [Flyway](https://flywaydb.org/)
- DevOps
  - [Docker](https://www.docker.com/)
  - [Docker Compose](https://docs.docker.com/compose/)
  - [SonarCloud](https://docs.sonarcloud.io/)
  - [OpenShift](https://www.redhat.com/en/technologies/cloud-computing/openshift)
  - CI/CD with [GitHub Actions](https://docs.github.com/en/actions)
- Tools (Recommendations)
  - [IntelliJ IDEA](https://www.jetbrains.com/idea/) or [Microsoft Visual Studo Code](https://code.visualstudio.com/)
  - [Postman](https://www.postman.com/)
  - [DBeaver](https://dbeaver.io/)

# Getting started

Once you have cloned this repository, can get it running on your computer by typing
in the project root directory:

```sh
./mvnw spring-boot:run
```

⚠️ You'll need a PostgreSQL database running. Here's how you can get it up 
and running with Docker and Docker Compose:

Run (from the project root):
```sh
docker-compose up database -d
```

Then head to http://localhost:8090/actuator/health to check if the service was successfully launched:
the first `status` property should have the value **UP**.

Before writing your first line of code, and learn more about the checks, including
tests, please take a moment and check out our [CONTRIBUTING](CONTRIBUTING.md) guide.

## Developing locally with Docker

If you want to have all frontend, backend and database, just run:
```sh
docker compose up backend -d
```

But if you can see only the backend and databse, run from the `backend` directory:
```sh
./mvnw spring-boot:run -Pdocker-compose -Dspring-boot.run.profiles=docker-compose
```

If you need to change the code, no problem. Once you hit Ctrl+S keys
the service will be restarted! Enjoy

## Debugging inside Docker

This instruction is for **VSCode**. If you have another IDE, be aware that some
steps may change.

All you need to do is to click the "Run and Debug" button on VSCode, then
click the small cog button, to open a new file called `launch.json`.
Make sure you have these settings:

```json
"configurations": [
  {
    "type": "java",
    "name": "Debug (Attach)",
    "projectName": "BackendAPI",
    "request": "attach",
    "hostName": "127.0.0.1",
    "port": 5005
  },
]
```

Now you can select `Debug (Attach)` in the dropdown input and hit run, 
click the play button. 

## Running Checks

Here's how you can check if your changes looks good. This command
will ensure your code compiles, all checkstyle pass and all tests
pass.

```sh
./mvnw --no-transfer-progress clean compile verify package checkstyle:checkstyle -P all-tests
```

## Getting help

As mentioned, we're here to help. Feel free to start a conversation
on Rocket chat or ask a question on Stackoverflow.