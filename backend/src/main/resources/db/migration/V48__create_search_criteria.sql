CREATE TABLE spar.search_criteria (
  user_id          VARCHAR(70)  NOT NULL,
  page_id          VARCHAR(100) NOT NULL,
  criteria_json    JSONB        NOT NULL,
  update_timestamp TIMESTAMP    NOT NULL DEFAULT NOW(),
  revision_count   INTEGER      NOT NULL DEFAULT 0,
  CONSTRAINT search_criteria_pk PRIMARY KEY (user_id, page_id)
);

CREATE OR REPLACE FUNCTION spar.set_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.update_timestamp = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_update_timestamp
BEFORE UPDATE ON spar.search_criteria
FOR EACH ROW
EXECUTE PROCEDURE spar.set_update_timestamp();
