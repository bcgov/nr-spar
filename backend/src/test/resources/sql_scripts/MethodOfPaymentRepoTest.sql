insert into
  method_of_payment_list (
    method_of_payment_code,
    description,
    default_method_ind,
    effective_date,
    expiry_date,
    update_timestamp
  )
values
  (
    'CLA',
    'Invoice to MOF Client Account',
    null,
    '1905-01-01',
    '9999-12-31',
    current_timestamp
  ),
  (
    'CSH',
    'Cash Sale',
    null,
    '1905-01-01',
    '9999-12-31',
    current_timestamp
  ),
  (
    'ITC',
    'Invoice to Client Address',
    true,
    '1905-01-01',
    '9999-12-31',
    current_timestamp
  ),
  (
    'ITO',
    'Invoice to Other Address',
    null,
    '1905-01-01',
    '9999-12-31',
    current_timestamp
  ),
  (
    'JV',
    'Journal Voucher',
    null,
    '1905-01-01',
    '9999-12-31',
    current_timestamp
  ),
  (
    'NC',
    'Non-chargeable',
    null,
    '1905-01-01',
    '9999-12-31',
    current_timestamp
  );
