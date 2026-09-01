---
name: nr-spar-pr-review
description: 'Review another developer PR in nr-spar with stack-aware checks for frontend, backend, and oracle-api, including architecture fit, code conventions, and required test/lint gates from CONTRIBUTING.md.'
argument-hint: 'Optional: risk focus (security, performance, data integrity, API compatibility, UI regression)'
user-invocable: true
---

# NR-SPAR PR Review

Use this skill to perform a consistent, high-signal review of pull requests in the `nr-spar` repository.

## When To Use
- Reviewing code before approval in `frontend/`, `backend/`, `oracle-api/`, or shared config files.
- Verifying that changes follow project structure and coding conventions.
- Checking that the correct test/lint suite has been run for touched services.

## Inputs
- The reviewer checks out the branch to review before invoking this skill.
- Optional: risk focus (`security`, `performance`, `data integrity`, `API compatibility`, `UI regression`).

## Review Workflow
1. Scope the PR.
2. Classify impacted areas (`frontend`, `backend`, `oracle-api`, `common`, CI/config).
3. Run architecture and structure checks for each impacted area.
4. Run quality and correctness checks (bugs, regressions, security, maintainability).
5. Verify required test/lint commands by impacted area.
6. Produce findings ordered by severity with clear file references and actionable fixes.
7. Decide outcome (`approve`, `request changes`, `comment only`) with rationale.

## Step 1: Scope The PR

### 1a. Detect changed files automatically
Run these git commands from the repo root to build the touched-file map:
```sh
# Find the merge-base of the current branch against main
git fetch origin main
git diff --name-only origin/main...HEAD
```
If there is no `origin/main`, fall back to:
```sh
git diff --name-only $(git merge-base HEAD main)..HEAD
```
Group the output by top-level directory (`frontend/`, `backend/`, `oracle-api/`, `common/`, `.github/`, root).

### 1b. Review context and commit hygiene
- Read the PR description, linked issue, and acceptance criteria.
- Check branch naming follows git flow (`feat/`, `fix/`, `bugfix/` + optional ticket number).
- Confirm commit messages follow conventional commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, etc.).
- Build a concern map from the file list:
  - API/controller/service/repository/entity
  - UI/component/hook/context
  - migrations, config, workflow, infra

## Step 2: Service-Specific Checks

### Frontend (`frontend/`)
- Ensure React + TypeScript + Vite patterns are respected.
- Validate React Query key conventions:
  - `/posts` -> `['posts']`
  - `/posts/1` -> `['posts', post.id]`
  - `/posts?author=1` -> `['posts', { author: 1 }]`
  - `/posts/2/comments` -> `['posts', post.id, 'comments']`
- Check for snapshot impact and confirm snapshot updates where needed.
- Look for UI regressions, accessibility issues, error/loading/empty-state handling, and brittle test selectors.

### Backend (`backend/`)
- Validate Spring Boot layering and separation of concerns (controller/service/repository).
- Check request validation, authorization boundaries, and error handling paths.
- Ensure DB schema changes are versioned appropriately (Flyway) when relevant.
- Verify Java style and naming consistency with Google Java Style expectations.

### Oracle API (`oracle-api/`)
- Validate endpoint tests use `@WebMvcTest`, `@MockBean`, `MockMvc`, and security context where applicable.
- Validate service tests use Mockito patterns (`@ExtendWith(MockitoExtension.class)`, `@Mock`, `@InjectMocks`).
- Check repository/query changes for projection safety and entity/repository boundaries.
- Validate numeric/string column metadata (`length`, `precision`, `scale`, `nullable`) when entities change.

### Shared/Config (`common/`, `.github/`, root)
- Check CI/workflow updates for unintended scope, secrets handling, and branch protections impact.
- Verify docker/openshift/config changes are consistent with service contracts and environments.

## Step 3: Required Test And Lint Matrix
Use the touched paths to determine required commands.

To lint only changed files in a PR:
```sh
# Get list of changed frontend files and lint them
cd frontend
git diff --name-only origin/main...HEAD | grep '^frontend/' | sed 's|^frontend/||' | xargs -r npx eslint
```

### If `frontend/` is touched
- `cd frontend && npm run lint` (lint all files) **OR** `npx eslint "src/views/CONSEP/TestingActivities/TestSearch/**"` (lint changed files)
- `cd frontend && npm run test`
- If e2e behavior/auth/routing changed: `cd frontend && npm run cypress run`

### If `backend/` is touched
- `cd backend && ./mvnw test --file pom.xml`
- `cd backend && ./mvnw verify -P integration-test --file pom.xml` (for integration-impacting changes)
- `cd backend && ./mvnw --no-transfer-progress checkstyle:checkstyle -Dcheckstyle.skip=false --file pom.xml` **OR** lint changed files only with: `git diff --name-only origin/main...HEAD | grep '^backend/' | sed 's|^backend/||' | xargs -r ./mvnw checkstyle:check`

### If `oracle-api/` is touched
- `cd oracle-api && ./mvnw test --file pom.xml`
- `cd oracle-api && ./mvnw verify -P integration-test --file pom.xml` (for integration-impacting changes)
- `cd oracle-api && ./mvnw --no-transfer-progress checkstyle:checkstyle -Dcheckstyle.skip=false --file pom.xml` **OR** lint changed files only with: `git diff --name-only origin/main...HEAD | grep '^oracle-api/' | sed 's|^oracle-api/||' | xargs -r ./mvnw checkstyle:check`

### If cross-service core behavior changed
- Recommend full suite for changed services and confirm PR pipelines pass before approval.

## Step 4: Severity Rules For Findings
- `High`: functional breakage, data loss/corruption, auth/security flaws, contract breaking changes.
- `Medium`: likely regressions, missing edge-case handling, fragile tests, performance risks.
- `Low`: style/readability/nit improvements without behavioral risk.

## Step 5: Review Output Template
Return findings first, ordered by severity.

1. `[High|Medium|Low]` Issue summary.
2. Impact/risk in one sentence.
3. File reference(s) and relevant logic path.
4. Concrete change request.
5. Test evidence required to close.

Then include:
- Open questions/assumptions.
- Final recommendation (`approve`/`request changes`/`comment only`).

## Completion Checklist
- Impacted services identified.
- Architecture and conventions checked per service.
- Required tests/lint mapped from touched files.
- Findings are actionable, prioritized, and evidence-based.
- No approval unless required quality gates are green.

## Reference Files
- `../../../CONTRIBUTING.md`
- `../../../frontend/CONTRIBUTING.md`
- `../../../backend/CONTRIBUTING.md`
- `../../../oracle-api/CONTRIBUTING.md`
- `../../../README.md`
- Also use the following memory references for deeper context:
	- `/memories/repo/nr-spar-build-commands.md` for build/run/test commands.
	- `/memories/repo/nr-spar-conventions.md` for coding and project conventions.
	- `/memories/repo/nr-spar-project-overview.md` for architecture and module responsibilities.
	- `/memories/repo/nr-spar-tech-stack.md` for framework/tooling context.
