insert into seedlot_status_list (
  seedlot_status_code,
  description,
  effective_date,
  expiry_date,
  update_timestamp
) values (
  'PND',
  'Pending',
  '1905-01-01',
  '9999-12-31',
  current_timestamp
);

insert into seedlot_source_list (
  seedlot_source_code,
  description,
  effective_date,
  expiry_date,
  update_timestamp
) values (
  'TPT',
  'Tested Parent Trees',
  '2005-07-25',
  '9999-12-31',
  current_timestamp
);

insert into seedlot (
  seedlot_number,
  seedlot_status_code,
  applicant_client_number,
  applicant_locn_code,
  applicant_email_address,
  vegetation_code,
  seedlot_source_code,
  to_be_registrd_ind,
  bc_source_ind,
  entry_userid,
  entry_timestamp,
  update_userid,
  update_timestamp,
  revision_count
) values (
  '63000',
  'PND',
  '00012797',
  '01',
  'user.lastname@domain.com',
  'FDI',
  'TPT',
  true,
  true,
  'IDIR',
  current_timestamp,
  'IDIR',
  current_timestamp,
  0
);
