# Testing & Development Conventions

## React/TypeScript Frontend
- React Query key convention:
  - `/posts` → `['posts']`
  - `/posts/1` → `['posts', post.id]`
  - `/posts?author=1` → `['posts', { author: 1 }]`
  - `/posts/2/comments` → `['posts', post.id, 'comments']`
- Snapshot tests present; must update snapshots when changing tests
- Coverage reports in SonarCloud and GitHub PR checks
- Cypress E2E tests run nightly and on PR
- Test files: `**/*.test.ts`, `**/*.spec.ts`, files in `cypress/`

## Java Backend Tests
- Unit tests: `src/test/java`
- Integration tests: marked with `@IntegrationTest` or similar
- Use Mockito for mocking
- Use Spring Mock MVC for controller testing
- Coverage included in SonarCloud CI/CD
- Postman collection tests available in `backend/test/postman/`

## Oracle-API Endpoint Testing (Controller)
- Use `@WebMvcTest(EndpointClass.class)` for testing HTTP endpoints
- Mock service layer with `@MockBean`
- Use `@WithMockUser(username = "...", roles = "...")` for security testing
- Test via `MockMvc` for HTTP request/response behavior
- Include tests for: success paths, error handling, validation, HTTP status codes, response content types
- Use `csrf()` for POST/PATCH/DELETE requests
- Verify service method calls with Mockito `verify()`

## Oracle-API Service Testing
- Use `@ExtendWith(MockitoExtension.class)` for unit tests
- Mock repository and other dependencies with `@Mock`
- Use `@InjectMocks` on the service being tested
- Test business logic, validation, error conditions, and state changes
- Arrange-Act-Assert pattern for test structure
- Use Mockito `when()`, `thenReturn()`, `thenThrow()`, `verify()` for behavior setup
- Test both success and failure scenarios (errors, exceptions, edge cases)
- Cache/reuse expensive operations (e.g., database lookups) by storing in maps

## JPA Entity @Column Best Practices
- `name`: exact database column name
- `nullable`: whether DB column can be NULL (`nullable = false` for required fields)
- `length`: max length for String/VARCHAR columns — ignored for numeric types
- `precision`: total number of digits for numeric columns
- `scale`: digits to the right of decimal point (only meaningful with precision)
- Rule of thumb: String fields → use `length`; numeric fields → use `precision`/`scale`; required fields → `nullable = false`
- Examples: `precision=5, scale=0` = up to 5-digit integer; `precision=10, scale=2` = up to 12345678.90

## JPA JPQL Projection Best Practices
- Constructor projection (`SELECT new full.package.Dto(...)`) is the safest and most explicit way to map query results to a DTO record
- Without constructor projection, Spring Data may auto-map scalar fields to DTO by position/type — fragile if field names or types drift
- Alternative: return the entity from repository, then map entity → DTO in service (clean separation, protects API contract)
- For read-only views, remove `@GeneratedValue` from the `@Id` field — views don't auto-generate IDs
- Keep repository bound to one entity (one JpaRepository generic per domain concept)

## Code Review & PR Standards
- All PRs require review before merge
- Conventional commits required (feat:, fix:, refactor:, test:, docs:, etc.)
- Code style must pass checks (ESLint, Checkstyle) before merge
- SonarCloud quality gate must pass
- Coverage reports visible on PR

## Development Environment Setup
- IDE recommendations: VS Code (frontend), IntelliJ IDEA Community (backend)
- Extensions recommended: ESLint, GitLens (frontend)
- Google Java Format plugin available for IDE code formatting
- Code must comply with Google Java Style Guide manual review (some rules can't be auto-checked)

## Oracle-API Targeted Checkstyle Command
- Run checkstyle only for selected files:
  - `./mvnw --no-transfer-progress checkstyle:checkstyle -Dcheckstyle.skip=false --file pom.xml -Dcheckstyle.includes=src/main/java/ca/bc/gov/oracleapi/endpoint/consep/GerminationTestEndpoint.java,src/main/java/ca/bc/gov/oracleapi/service/consep/TestResultService.java,src/test/java/ca/bc/gov/oracleapi/endpoint/consep/GerminationTestEndpointTest.java,src/main/java/ca/bc/gov/oracleapi/entity/consep/DailyAbnormalEntity.java,src/main/java/ca/bc/gov/oracleapi/entity/consep/DailyAbnormalRepository.java,src/test/java/ca/bc/gov/oracleapi/service/consep/TestResultServiceTest.java`
