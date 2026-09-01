# nr-spar Project Overview

**Project**: Natural Resources SPAR (Seed Planning and Registry)
**Type**: Full-stack BC Government application
**Repository**: bcgov/nr-spar
**Policy**: Work in the open; all code public; customer-centered services; community-based work

## Service Structure
- **frontend/**: React PWA (TypeScript, Node 20+, Vite, Cypress)
- **backend/**: Spring Boot REST API (Java 17, Maven)
- **oracle-api/**: Spring Boot API for Oracle data integration (Java 17, Maven)
- **common/**: Shared database and initialization scripts
- **schemaspy/**: Database schema documentation

## Code Style & Linting
- **Java**: Google Java Style Guide (both backend and oracle-api)
  - Check with: `./mvnw checkstyle:checkstyle -Dcheckstyle.skip=false`
- **TypeScript/JavaScript**: Airbnb ESLint
  - Check with: `npm run lint`
  - Fix with: `npm run lint --fix`
- Conventional commits required for all services

## Git Workflow
- Git flow model
- Pull request required for all changes
- PR template provided in repo
- Copilot instructions: `.github/copilot-instructions.md` (defines code style, build commands, testing conventions)
