# Contributing guide

Thanks for taking a moment and reading this guide. Is very important to have 
everyone on the same page. This guide covers:

- Setting up local development
- Runing SPAR locally
- Opening and Reviewing PRs
- Deployment and CI/CD
- General code practices

> If you are new to GitHub, you might start with a
[basic tutorial](https://help.github.com/articles/set-up-git) and check out a
more detailed guide to
[pull requests](https://help.github.com/articles/using-pull-requests/).

All contributors retain the original copyright to their stuff, but by
contributing to this project, you grant a world-wide, royalty-free, 
perpetual, irrevocable, non-exclusive, transferable license to all 
users **under the terms of the [license](./LICENSE.md) under which 
this project is distributed**.

# Setting up local development

> If all you want is to run SPAR locally, you can do it with Docker, without
intalling all required tools for local development. Please go to the next
section.

## Git

Make sure you have Git installed on your machine. You can follow
[this link](https://git-scm.com/downloads) for download and install
instructions.

## Docker

You can use Docker and the Compose plugin to speed up local development!

⚠️ Note: *Docker may requires super user (root) to be fully functional, but
things can be a lot easier if you configure your computer to allow your regular
user to run it without superpowers.*

Take a look
[here](https://docs.docker.com/engine/install/#server) to learn how to get it
installed.

## NodeJS

⚠️ Note: *Please skip this step if you're going to work only with back-end
tasks.*

NodeJS is required to build and start SPAR Client. You can look for install
instructions [here](https://nodejs.org/en/download/). Make sure you have
at least the version 18.

## Java and Maven

⚠️ Note: *Please skip this step if you're going to work only with front-end
tasks.*

SPAR uses Java OpenJDK 17 for development and 
[Apache Maven](https://maven.apache.org/) for project magament.

An easy way of getting both Java and Maven on your machine is using SDK Man.
Take a look [here](https://sdkman.io/) to learn how to get it installed. For
this project we're using OpenJDK Java 17.

## IDE

**Front-end**: **Microsoft VS Code** can be a great option. Lots of extensions
and integrations. You can learn how to get installed
[here](https://code.visualstudio.com/).

Please consider adding these suggested extensions:
- ESLint -
[Link here](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- GitLens -
[Link here](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)

**Back-end**: **IntelliJ IDEA Community** is strongly recommend, because all of its
plugins and configurations possibilities, here's
[the website](https://www.jetbrains.com/idea/download). But feel free to use
Eclipse or other IDE of your choice.

## Code style

**Front-end**: To enforce a better solution and a stronger product the
**Airbnb ESLint** check-style was chosen. SPAR CI/CD Workflows also have a dedicated
pipeline to check for common errors and possible bugs.

You cab run `npm run lint` before opening a PR, so any style error not addressed can be checked and you can use `npm run lint --fix` to fix small issues.

> Note that if you choose VS Code, the above mentioned extension **ESLint**, by Microsoft is strongly recommend.
> Here's the link to the Marketplace: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint

**Back-end**: The back-end code is formatted following the [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html).
A formatter and plugins based on it for Eclipse and IntelliJ are available and  make writing
style-conformant code quite easy. Check the installation notes on the
[formatter's project page](https://github.com/google/google-java-format).

There's a tool to validate changes submitted in accordance to the style guide. **Passing
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

# Running SPAR Locally

The easiest way of getting all SPAR services running locally is with Docker and the Compose plugin. If you
already have these on your computer, just run:

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

**And if you need, you can start only one component with**:
```sh
docker compose up database -d
```

You may need to run both back-end or front-end in your local computer, instead of
containers. To do that you'll need above mentioned development tools. Java and Maven
for the back-end, and NodeJS for the front-end.

**Front-end**: After setting you local nodejs setup, you can run:

```sh
cd frontend
npm install
npm run start
```

If you want to understand more about the front-end component, you can read
the [README](frontend/README.md) or the [CONTRIBUTING](frontend/CONTRIBUTING.md) files.

**Back-end**: With your local Java setup done, you can get SPAR up and
running by typing (in the project root directory):

```sh
cd backend
./mvnw spring-boot:run
```

And in case you want to debug with remote JVM, you can do it with:

```sh
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
```
If you want to understand more about the back-end component, you can read
the [README](backend/README.md) or the [CONTRIBUTING](backend/CONTRIBUTING.md) files.

# Opening and Reviewing PRs

All code changes happen through Pull Requests. There's a template that you
can fill. The more complete the better. If you have images, screen capture
or diagrams, that helps a lot. Don't forget to add reviewers, assign to
yourself and add labels.

Git flow suggests that the branch name starts with the keywork based on the task.
Starting with **feat** for features, **bufix** or **fix** for fixes, and so on.
If you started your work based on a jira task, it's a good idea to put the task
number at the beginning of the branch name as well. Same thing for issues. Consider
these examples:

Task from Jira about a new feature:

```sh
git checkout -b feat/655-create-orchard-api
```

Task from GitHub issues about a bug fix:

```sh
git checkout -b bugfix/16-user-component-issues
```

When openning PRs make sure all the pipelines pass. That's a critical condition
to get your PR merged. The first reviewer of your code should be yourself. Take
a look and make sure no warnings or issues are thrown when running you change.

When reviewing PRs remember to be clear, if you need, you can add links and 
explanations why you think another way should be considered for a particular
case.

PRs also are the best place to discuss changes before they get approved. 

# Deployment and CI/CD

SPAR uses GitHub Actions for deployments, CI and CD. All working code gets
deployed into OpenShift Cloud. You can look for the deployments under
the namespace **b9d53b**.

These are the existing workflows:

**Analysis** - Runs linting, tests, and security scanning on PRs and main -
[Link here](https://github.com/bcgov/nr-spar/actions/workflows/analysis.yml)

**CodeQL** - Automated code security scanning for vulnerabilities -
[Link here](https://github.com/bcgov/nr-spar/actions/workflows/codeql.yml)

**PR** - Runs for every open pull request -
[Link here](https://github.com/bcgov/nr-spar/actions/workflows/pr-open.yml)

**PR Close** - Runs for all closed PRs - 
[Link here](https://github.com/bcgov/nr-spar/actions/workflows/pr-close.yml)

**Merge** - Runs for all merges to main and deploys to TEST - 
[Link here](https://github.com/bcgov/nr-spar/actions/workflows/merge.yml)

**Release** - Deploys to PROD environment -
[Link here](https://github.com/bcgov/nr-spar/actions/workflows/release.yml)

**Nightly** - Scheduled nightly maintenance tasks -
[Link here](https://github.com/bcgov/nr-spar/actions/workflows/job-nightly.yml)

## CodeQL Security Scanning

CodeQL automatically scans the codebase for security vulnerabilities:
- Runs on all pull requests (opened, reopened, new commits, ready for review)
- Runs on pushes to main branch
- Scheduled to run weekly on Mondays at 2 AM UTC
- Can be manually triggered from the Actions tab

To manually trigger CodeQL:
1. Go to the [Actions tab](https://github.com/bcgov/nr-spar/actions)
2. Select "CodeQL" workflow
3. Click "Run workflow" button
4. Select the branch and click "Run workflow"

Results are visible in the Security tab under "Code scanning alerts".

# General code practices

- All source code must be formatted according to its configured tool, Google CheckStyle
for Java and AirBnb ESLint for TypeScript.
- Try to stick to [conventional commits](https://www.conventionalcommits.org/)
because it makes the process of generating changelogs way easier. You may want to
take a look as this link, to read at least the
[summary](https://www.conventionalcommits.org/en/v1.0.0/#summary)
and understand what is this thing about.
