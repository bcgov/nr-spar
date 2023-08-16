insert into
  seedlot_status_list (
    seedlot_status_code,
    description,
    effective_date,
    expiry_date,
    update_timestamp
  )
values
  (
    'APP',
    'Approved',
    '1905-01-01',
    '9999-12-31',
    current_timestamp
  ),
  (
    'CAN',
    'Cancelled',
    '1905-01-01',
    '9999-12-31',
    current_timestamp
  ),
  (
    'COM',
    'Complete',
    '1905-01-01',
    '9999-12-31',
    current_timestamp
  ),
  (
    'INC',
    'Incomplete',
    '1905-01-01',
    '9999-12-31',
    current_timestamp
  ),
  (
    'PND',
    'Pending',
    '1905-01-01',
    '9999-12-31',
    current_timestamp
  ),
  (
    'EXP',
    'Expired',
    '1905-01-01',
    '9999-12-31',
    current_timestamp
  ),
  (
    'SUB',
    'Submitted',
    '1905-01-01',
    '9999-12-31',
    current_timestamp
  );
