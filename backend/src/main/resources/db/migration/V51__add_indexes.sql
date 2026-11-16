-- =============================================================================
-- V52: Add indexes to spar schema
--
-- No indexes existed prior to this migration beyond those created automatically
-- by PRIMARY KEY and UNIQUE constraints. These indexes target the actual query
-- patterns used by the Spring Boot backend and the B-class registration wizard.
--
-- Priority order (highest impact first):
--   1. seedlot_audit(seedlot_number)            - fires on every seedlot write via trigger
--   2. seedlot(applicant_client_number)          - seedlot list page for non-admin users
--   3. seedlot(update_timestamp)                 - default sort for all paginated list queries
--   4. seedlot(genetic_class_code)               - B-class list filtering
--   5. seedlot(seedlot_status_code)              - admin/batch status filtering
--   6. seedlot((cast(seedlot_number as int)))    - findNextSeedlotNumber on create
-- =============================================================================

-- 1. seedlot_audit — seedlot_number lookup
--    The audit trigger runs:
--      SELECT MAX(audit_revision_version) FROM spar.seedlot_audit WHERE seedlot_number = ?
--    on every INSERT, UPDATE, or DELETE on spar.seedlot. Without this index that is a full
--    table scan that grows unboundedly.
create index idx_seedlot_audit_seedlot_number
  on spar.seedlot_audit (seedlot_number);

-- 2. seedlot — applicant_client_number
--    SeedlotRepository.findAllByApplicantClientNumber uses this with ORDER BY update_timestamp DESC.
--    Covers the seedlot list page for all non-TSC-Admin users (filtered by their client number).
create index idx_seedlot_applicant_client_number
  on spar.seedlot (applicant_client_number);

-- 3. seedlot — update_timestamp (DESC)
--    All paginated list queries (findAll and findAllByApplicantClientNumber) sort by
--    AuditInformation.UpdateTimestamp DESC. This avoids a full sort on every list page load.
create index idx_seedlot_update_timestamp
  on spar.seedlot (update_timestamp desc);

-- 4. seedlot — genetic_class_code
--    Required for B-class list filtering (show only B/B+ rows, or display Genetic Class column).
--    Also useful for any admin queries that separate A-class from B-class seedlots.
create index idx_seedlot_genetic_class_code
  on spar.seedlot (genetic_class_code);

-- 5. seedlot — seedlot_status_code
--    Used in admin and batch queries to filter by status (INC, PND, SUB, APP, CAN, etc.).
create index idx_seedlot_status_code
  on spar.seedlot (seedlot_status_code);

-- 6. seedlot — functional index on cast(seedlot_number as int)
--    SeedlotRepository.findNextSeedlotNumber runs:
--      SELECT max(cast(s.id as int)) FROM Seedlot s WHERE cast(s.id as int) BETWEEN ? AND ?
--    This is called on every seedlot create to find the next available number.
--    Without this, Postgres casts and scans all rows; with it, the cast is pre-computed.
create index idx_seedlot_number_int
  on spar.seedlot ((cast(seedlot_number as integer)));
