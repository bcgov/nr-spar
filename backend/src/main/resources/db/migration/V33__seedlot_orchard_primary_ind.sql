-- Step 1: Add the 'primary_ind' column
ALTER TABLE spar.seedlot_orchard
ADD COLUMN primary_ind boolean NOT NULL DEFAULT false;

-- Step 2: Update 'primary_ind' for existing rows based on the least recent update_timestamp
UPDATE spar.seedlot_orchard AS s1
SET primary_ind = TRUE
FROM (
    SELECT seedlot_number, MIN(update_timestamp) AS min_update_time
    FROM spar.seedlot_orchard
    GROUP BY seedlot_number
) AS s2
WHERE s1.seedlot_number = s2.seedlot_number
AND s1.update_timestamp = s2.min_update_time;

-- Step 3: Change the primary key to (seedlot_number, primary_ind)
ALTER TABLE spar.seedlot_orchard
DROP CONSTRAINT IF EXISTS seedlot_orchard_pk,
ADD PRIMARY KEY (seedlot_number, primary_ind);

-- Step 4: Create a unique key constraint for (seedlot_number, orchard_id)
ALTER TABLE spar.seedlot_orchard
ADD CONSTRAINT unique_seedlot_orchard_key UNIQUE (seedlot_number, orchard_id);
