# Contributing guide

Thanks for taking a moment and reading this guide. Is very important to have 
everyone on the same page. This guide covers:
- Setting up local development
- Runing SPAR locally
- Opening and Reviewing PRs
- Deployment and CI/CD
- General code practices

(If you are new to GitHub, you might start with a [basic tutorial](https://help.github.com/articles/set-up-git) and check out a more detailed guide to [pull requests](https://help.github.com/articles/using-pull-requests/).)

All contributors retain the original copyright to their stuff, but by
contributing to this project, you grant a world-wide, royalty-free, 
perpetual, irrevocable, non-exclusive, transferable license to all 
users **under the terms of the [license](./LICENSE.md) under which 
this project is distributed**.

# Setting up local development

> If all you want is to run SPAR locally, you can do it
with Docker, without intalling all required tools for
local development. Please go to the next
section.

## Git

Make sure you have Git installed on your machine. You can follow
[this link](https://git-scm.com/downloads) for download and install instructions.

## Docker

You can use Docker and the Compose plugin to speed up local development!

⚠️ Note: *Docker may requires super user (root) to be fully functional, but things can be a lot easier if you configure your computer to allow your regular user to run it without superpowers.*

Take a look
[here](https://docs.docker.com/engine/install/#server) to learn how to get it
installed.

## NodeJS and Yarn (NPM)

⚠️ Note: *Please skip this step if you're going to work only with backend tasks.*

NodeJS is required to build and start SPAR Client. You can look for install
instructions [here](https://nodejs.org/en/download/). Make sure you have
at least the version 18 (yarn should be included).

## Java and Maven

⚠️ Note: *Please skip this step if you're going to work only with frontend tasks.*

SPAR uses Java OpenJDK 17 for development and [Apache Maven](https://maven.apache.org/)
for project magament.

An easy way of getting both Java and Maven on your machine is using 
SDK Man. Take a look [here](https://sdkman.io/) to learn how to get it installed.
For this project we're using OpenJDK Java 17.

## IDE

**Front-end**: **Microsoft VS Code** can be a great option. Lots of extensions
and integrations. You can learn how to get installed [here](https://code.visualstudio.com/).

Please consider adding these suggested extensions:
- ESLint - Link: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
- GitLens - Link: https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens

**Back-end**: We recommend **IntelliJ IDEA Community**, because all of its plugins and
configurations possibilities, here's [the website](https://www.jetbrains.com/idea/download).
But feel free to use Eclipse or other IDE of your choice.

## Code style

**Front-end**: To enforce a better solution and a stronger product we decided to use
the **Airbnb ESLint** check-style. SPAR CI/CD Workflows also have a dedicated
pipeline to check for common errors and possible bugs.

You cab run `yarn lint` before opening a PR, so any style error not addressed
can be checked and you can use `yarn lint --fix` to fix small issues.

> Note that if you choose VS Code as your IDE, we highly recommend above mentioned extension **ESLint**, by Microsoft.
> Here's the link to the Marketplace: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint

**Back-end**: Our back-end code is formatted following the [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html).
A formatter and plugins based on it for Eclipse and IntelliJ are available and  make writing
style-conformant code quite easy. Check the installation notes on the
[formatter's project page](https://github.com/google/google-java-format).

We configured a tool to validate changes submitted to us in accordance to our style guide. **Passing
such validation, however, doesn't mean that the code conforms to the style guide**, as some rules
cannot be checked by this tool. We ask you to check if your code adheres to the following rules
before submitting it.

- [2.2 File encoding: UTF-8](https://google.github.io/styleguide/javaguide.html#s2.2-file-encoding)
- [5.2.2 Class names](https://google.github.io/styleguide/javaguide.html#s5.2.2-class-names)
- [5.2.3 Method names](https://google.github.io/styleguide/javaguide.html#s5.2.3-method-names)
- [5.2.4 Constant names](https://google.github.io/styleguide/javaguide.html#s5.2.4-constant-names)
- [5.3 Camel case: defined](https://google.github.io/styleguide/javaguide.html#s5.3-camel-case)
- [6.1 @Override: always used](https://google.github.io/styleguide/javaguide.html#s6.1-override-annotation)

You can check your code for possible checkstyle issues with:
```sh
./mvnw --no-transfer-progress checkstyle:checkstyle -Dcheckstyle.skip=false --file pom.xml
```

## Running SPAR Locally

The easiest way of getting all SPAR services running locally is with Docker and the compose plugin. If you
already have Docker on your computer, just run:

```sh
docker compose up -d
```

Here are some other usefull Docker commands:

**Look for all running containers:**
```sh
docker ps
```

**Stopping all components:**
```sh
docker compose down
```

You can get SPAR up and running by typing `./mvnw spring-boot:run` in the project
root directory.

In case you want to debug with remote JVM, you can do it with this command:
`./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"`

## Run tests

For unit tests, please use this command: `./mvnw test --file pom.xml`

And for integration tests, this one: `./mvnw verify -P integration-test --file pom.xml`

Tests coverage reports can be seen on your commits and pull requests. But in case you 
want to check locally, use this command to run all tests `./mvnw --no-transfer-progress clean verify -P all-tests --file pom.xml`,
and check out the files inside `target/coverage-reports/`

## Submit pull requests

We use git flow, so all code changes happen through Pull Requests. There's a
Pull Request template that you can fill. The more complete the better. If you
have images, screen capture or diagrams, that helps a lot. Don't forget to add
reviewers, assign to yourself and add a label.

## Follow our best practices

- Java source code must be formatted according to
[Google Java Style Guide](https://google.github.io/styleguide/javaguide.html),
as mentioned. There's a pipeline to unsure all of our code is good to go.
- We try to use [conventional commits](https://www.conventionalcommits.org/)
because it makes the process of generating changelogs way easier. So we encourage
you to read at least the [summary](https://www.conventionalcommits.org/en/v1.0.0/#summary)
that summarize and give some examples.
