insert into
  method_of_payment_list (
    method_of_payment_code,
    description,
    effective_date,
    expiry_date,
    update_timestamp
  )
values
  (
    'CLA',
    'Invoice to MOF Client Account',
    '1905-01-01',
    '9999-12-31',
    current_timestamp
  ),
  (
    'CSH',
    'Cash Sale',
    '1905-01-01',
    '9999-12-31',
    current_timestamp
  ),
  (
    'ITC',
    'Invoice to Client Address',
    '1905-01-01',
    '9999-12-31',
    current_timestamp
  ),
  (
    'ITO',
    'Invoice to Other Address',
    '1905-01-01',
    '9999-12-31',
    current_timestamp
  ),
  (
    'JV',
    'Journal Voucher',
    '1905-01-01',
    '9999-12-31',
    current_timestamp
  ),
  (
    'NC',
    'Non-chargeable',
    '1905-01-01',
    '9999-12-31',
    current_timestamp
  );
