insert into
  seedlot_source_list (
    seedlot_source_code,
    description,
    effective_date,
    expiry_date,
    update_timestamp
  )
values
  (
    'CUS',
    'Custom Lot',
    '2005-07-25',
    '9999-12-31',
    current_timestamp
  ),
  (
    'TPT',
    'Tested Parent Trees',
    '2005-07-25',
    '9999-12-31',
    current_timestamp
  ),
  (
    'UPT',
    'Untested Parent Trees',
    '2005-07-25',
    '9999-12-31',
    current_timestamp
  );
