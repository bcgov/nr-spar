# Contributing guide

Thanks for taking a moment to read this guide. It's very important to have
everyone on the same page. This guide describes how to:
- Set up your environment
- Run the application
- Run tests
- Submit Pull Requests
- Follow our code practices

(If you are new to GitHub, you might start with a [basic tutorial](https://help.github.com/articles/set-up-git) and check out a more detailed guide to [pull requests](https://help.github.com/articles/using-pull-requests/).)

All contributors retain the original copyright to their stuff, but by
contributing to this project, you grant a world-wide, royalty-free,
perpetual, irrevocable, non-exclusive, transferable license to all
users **under the terms of the [license](./LICENSE.md) under which
this project is distributed**.

## Set up your environment

### Git

Make sure you have Git installed on your machine. You can follow
[this link](https://git-scm.com/downloads) for instructions.

### NPM

NodeJS is required to build and start this app. You can look for install
instructions [here](https://nodejs.org/en/download/). Make sure you have
at least the version 18.

### IDE

If you like, Microsoft VS Code can be a great option. Lots of extensions
and integrations. You can learn how to install [here](https://code.visualstudio.com/).

Here are some suggested extensions:
- ESLint - Link: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
- GitLens - Link: https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens

### Check-style

To enforce a better solution and a stronger product we decided to use
the Airbnb ESLint check-style. This way also helps us to have a dedicated
pipeline to check for common errors and possible bugs.

Also, run `npm run lint` before making a PR, so any style error not addressed
can be checked and you can use `npm run lint --fix` to fix small issues.

> Note that if you choose VS Code as your IDE, we highly recommend above mentioned extension **ESLint**, by Microsoft.
> Here's the link to the Marketplace: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint

## Run this application

Now that your environment is all set up, we can run the application.
To do that, first you need to install required dependencies.

Remember of setting up the required environment variables. You can create a `.env` file containing:

```
VITE_NRSPARWEBAPP_VERSION=
VITE_KC_URL=
VITE_KC_REALM=
VITE_KC_CLIENT_ID=
```

And if you want to run Cypress, please add:
```
CYPRESS_USERNAME=
CYPRESS_PASSWORD=
```

> If don't have these values, please reach a member of the team

Just run:
```
npm install
```

Once is finished, you can get it up and running by typing

```
npm run start
```

## Run tests

You can run tests running `npm run test`. Tests coverage reports can be seen
on you command line window and also on GitHub, in your commits and pull requests.

PS: We have snapshot tests, so keep in mind the tests may break if you forget to update snapshots. To update them run `npm run test`

## Submit pull requests

We use git flow, so all code changes happen through Pull Requests. There's a
Pull Request template that you can fill. The more complete the better. If you
have images, screen capture or diagrams, that helps, but it's not required.
Don't forget to add reviewers, assign to yourself and add labels.

## React Query Conventions
- `/posts` -> `['posts']`
- `/posts/1` -> `['posts', post.id]`
- `/posts?author=1` -> `['posts', { author: 1 }]`
- `/posts/2/comments` -> `['posts', post.id, 'comments']`

## Follow our best practices

- TypeScript source code must be formatted according to Airbnb ESLint,
as mentioned. Make sure to follow this rule and you're good to go.
- We use [conventional commits](https://www.conventionalcommits.org/)
because it makes the process of generating changelogs possible. If that's new for you, please take a moment to read it. You can start with the [summary](https://www.conventionalcommits.org/en/v1.0.0/#summary) and go from there.
  - Basically you need to write your commits messages starting with a tag
  that is related with the change that you're doing. Tags can be one of:
  - **build**: Changes that affect the build system or external dependencies
  - **ci**: Changes to our CI configuration files and scripts
  - **docs**: Documentation only changes
  - **feat**: A new feature
  - **fix**: A bug fix
  - **perf**: A code change that improves performance
  - **refactor**: A code change that neither fixes a bug nor adds a feature
  - **test**: Adding missing tests or correcting existing tests

Take a look [here](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format) to read more about the commit message format.
