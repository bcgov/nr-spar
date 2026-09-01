# Build, Test & Run Commands

## Frontend (npm-based)
- Install: `npm install`
- Start dev: `npm run start`
- Build: `npm run build`
- Lint: `npm run lint` / `npm run lint --fix`
- Unit tests: `npm run test`
- E2E tests: `npm run cypress run` (headless) or `npm run cypress open` (IDE)
- Required env vars: VITE_SERVER_URL, VITE_USER_POOLS_ID, VITE_USER_POOLS_WEB_CLIENT_ID, CYPRESS_USERNAME, CYPRESS_PASSWORD

## Backend & Oracle-API (Maven-based)
- Run: `./mvnw spring-boot:run`
- Debug: `./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"`
- Unit tests: `./mvnw test --file pom.xml`
- Integration tests: `./mvnw verify -P integration-test --file pom.xml`
- All tests: `./mvnw clean verify -P all-tests --file pom.xml`
- Coverage report: `target/coverage-reports/merged-test-report/index.html`
- Code style check: `./mvnw checkstyle:checkstyle -Dcheckstyle.skip=false --file pom.xml`
- Oracle-API requires: BCGov VPN connection

## Docker & Compose
- Frontend: `docker compose up frontend -d`
- Oracle-API with Oracle: `docker compose --profile oracle up -d`
- Services auto-reload on code changes
