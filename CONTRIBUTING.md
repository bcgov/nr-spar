# Contributing guide

Thanks for taking a moment and reading this guide. It's very important to have
everyone on the same page. This guide describes how to:
- Set up your environment
- Run this application
- Run tests
- Submit pull requests
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
at least the version 16.10 (that includes yarn)

### IDE

If you like, Microsoft Visual Studio can be a great option. Lots of plugins
and integrations. You can learn how to install [here](https://code.visualstudio.com/).

### Check-style

To enforce a better solution and a stronger product we decided to use
the Airbnb ESLint check-style. This way also helps us to have a dedicated
pipeline to check for common errors and possible bugs.

## Run this application

Now that your environment is all set up, we can run the application.
To do that, first you need to install required dependencies. Run
`yarn install` and once is finished, you can get it up and running
by typing `yarn start` in the project root directory.

## Run tests

You can run tests running `yarn test`. Tests coverage reports can be seen
on you command line window and also on GitHub, in your commits and pull requests.

## Submit pull requests

We use git flow, so all code changes happen through Pull Requests. There's a
Pull Request template that you can fill. The more complete the better. If you
have images, screen capture or diagrams, that helps a lot. Don't forget to add
reviewers, assign to yourself and add a label.

## Follow our best practices

- Typescript source code must be formatted according to
[Google Java Style Guide](https://google.github.io/styleguide/javaguide.html),
as mentioned. There's a pipeline to ensure all of our code is good to go.
- We try to use [conventional commits](https://www.conventionalcommits.org/)
because it makes the process of generating changelogs way easier. So we encourage
you to read at least the [summary](https://www.conventionalcommits.org/en/v1.0.0/#summary) and learn a bit about it.