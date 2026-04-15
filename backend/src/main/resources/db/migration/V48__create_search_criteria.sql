CREATE TABLE spar.search_criteria (
  user_id          VARCHAR(70)  NOT NULL,
  page_id          VARCHAR(100) NOT NULL,
  criteria_json    JSONB        NOT NULL,
  update_timestamp TIMESTAMP    NOT NULL DEFAULT NOW(),
  revision_count   INTEGER      NOT NULL DEFAULT 0,
  CONSTRAINT search_criteria_pk PRIMARY KEY (user_id, page_id)
);
