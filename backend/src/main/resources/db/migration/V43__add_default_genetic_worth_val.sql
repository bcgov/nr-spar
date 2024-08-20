-- Step 1: Add the new column with decimal type
ALTER TABLE
  spar.genetic_worth_list
ADD
  COLUMN default_bv DECIMAL(3, 1) DEFAULT 0.0 NOT NULL;

-- Step 2: Update the row where genetic_worth_code is GVO
UPDATE
  spar.genetic_worth_list
SET
  default_bv = 2.0
WHERE
  genetic_worth_code = 'GVO';
