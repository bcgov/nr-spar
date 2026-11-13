SET @today = current_date;
SET @last_year = DATEADD(YEAR, -1, @today);
SET @next_year = DATEADD(YEAR, 1, @today);

INSERT INTO vegetation_code
(vegetation_code, description, effective_date, expiry_date, update_timestamp)
VALUES ('FDC', 'Coastal Douglas-fir', @last_year, @next_year, current_timestamp),
       ('PLI', 'Lodgepole pine', @last_year, @next_year, current_timestamp);

INSERT INTO SEED_PLAN_ZONE_CODE (SEED_PLAN_ZONE_CODE, DESCRIPTION, EFFECTIVE_DATE, EXPIRY_DATE)
VALUES ('M', 'Maritime', @last_year, @next_year),
       ('SM', 'Submaritime', @last_year, @next_year),
       ('GL', 'Georgia Lowlands', @last_year, @next_year),
       ('BV', 'Bulkley Valley', @last_year, @next_year),
       ('OLD', 'Expired zone', @last_year, @today),
       ('OPEN', 'No expiry', @last_year, NULL);

INSERT INTO SEED_PLAN_ZONE (SEED_PLAN_ZONE_ID, GENETIC_CLASS_CODE, SEED_PLAN_ZONE_CODE, VEGETATION_CODE)
VALUES (1, 'B', 'M', NULL),
       (2, 'B', 'SM', 'FDC'),
       (3, 'B', 'BV', 'PLI'),
       (4, 'A', 'GL', 'FDC'),
       (5, 'B', 'OLD', NULL);
