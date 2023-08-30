insert into seedlot_source_code ();

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
  NOW(),
  'IDIR',
  NOW(),
  0
);
