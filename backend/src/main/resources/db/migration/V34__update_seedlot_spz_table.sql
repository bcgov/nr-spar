ALTER TABLE
  spar.seedlot_seed_plan_zone
ADD
  COLUMN primary_ind boolean default false,
ADD
  COLUMN seed_plan_zone_description varchar(120),
ALTER
  COLUMN entry_timestamp DROP NOT NULL,
ALTER
  COLUMN update_timestamp DROP NOT NULL;


CREATE OR REPLACE FUNCTION ensure_single_primary_ind()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.primary_ind THEN
        IF EXISTS (
            SELECT 1
            FROM spar.seedlot_seed_plan_zone AS sspz
            WHERE sspz.seedlot_number = NEW.seedlot_number
            AND sspz.primary_ind = true
            AND sspz.seed_plan_zone_code <> NEW.seed_plan_zone_code
        ) THEN
            RAISE EXCEPTION 'Only one row per seedlot_number can have primary_ind = true';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_primary_ind_trigger
BEFORE INSERT OR UPDATE ON spar.seedlot_seed_plan_zone
FOR EACH ROW EXECUTE FUNCTION ensure_single_primary_ind();
