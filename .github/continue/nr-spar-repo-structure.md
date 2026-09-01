# nr-spar Repository Structure Reference

This file summarizes the high-level structure of the nr-spar monorepo.
Use it to orient backend and frontend guidance.

## Top-Level
- backend/: Java service and related config
- oracle-api/: Spring Boot Oracle REST API (main API workstream)
- frontend/: React + TypeScript app
- common/: shared scripts and database setup/deploy resources
- schemaspy/: database documentation/config artifacts
- tools/: operational helper scripts
- legacy_translated/: legacy translated logic/reference code

## oracle-api Highlights
- src/main/java/: API code (endpoints, services, repositories, entities, DTOs)
- src/main/resources/: application and framework configuration
- src/test/java/: unit/integration tests
- src/test/resources/: test resources
- pom.xml: Maven build definition

## frontend Highlights
- src/: React app source (components, routes, views, hooks, utils)
- cypress/: end-to-end tests
- package.json: npm scripts and dependencies
- vite.config.ts: Vite configuration

## Conventions for Guidance
- Backend flow: Entity -> Repository -> Service -> Endpoint -> Tests
- Frontend flow: Component structure -> State/data flow -> API integration -> Tests
- Prefer changes and examples aligned with existing module boundaries above.
