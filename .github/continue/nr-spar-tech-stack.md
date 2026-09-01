# Technology Stack

## Frontend
- React (PWA)
- TypeScript
- Vite (build tool)
- Node 20+
- Testing: Jest, React Testing Library, Cypress
- Styling: Carbon Design System
- State: Context API, React Query
- Linting: Airbnb ESLint + TypeScript plugin + JSDoc plugin
- Authentication: FAM (FAM used for Keycloak integration)
- ci/cd: GitHub Actions
- Coverage: SonarCloud

## Backend (Spring Boot)
- Java 17 (OpenJDK)
- Maven (build tool)
- Spring Boot 3.5.11
- Spring Web, Security, OAuth2, JDBC
- Hibernate ORM 6.6.42
- Testing: JUnit 5, Mockito, Spring Mock MVC
- Database: PostgreSQL (local), Oracle (prod)
- DevOps: Docker, OpenShift, SonarCloud, GitHub Actions

## Oracle-API (Spring Boot)
- Java 17 (OpenJDK)
- Maven (build tool)
- Spring Boot 3.5.11
- Secure Oracle JDBC connection (via VPN)
- Hibernate, Spring Security, OAuth2
- Testing: JUnit 5, Mockito, Spring Mock MVC
- Native image support (GraalVM in Docker)
- Docker multi-stage build with eclipse-temurin base
- Port: 8091
- Health check: `/actuator/health`

## Shared
- Docker for containerization
- docker-compose for local orchestration
- PostgreSQL for databases
- Checkstyle for Java code validation
- SonarCloud for code quality
- GitHub Actions for CI/CD
