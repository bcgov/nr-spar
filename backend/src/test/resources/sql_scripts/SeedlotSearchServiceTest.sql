insert into seedlot_status_list (seedlot_status_code, description, effective_date, expiry_date, update_timestamp)
values
  ('PND', 'Pending', '1905-01-01', '9999-12-31', current_timestamp),
  ('SUB', 'Submitted', '1905-01-01', '9999-12-31', current_timestamp);

insert into genetic_class_list (genetic_class_code, description, effective_date, expiry_date, update_timestamp)
values
  ('A', 'Orchard Seed or Cuttings', '1905-01-01', '9999-12-31', current_timestamp),
  ('B', 'Natural Stand Seed or Cuttings', '1905-01-01', '9999-12-31', current_timestamp);

insert into seedlot_source_list (seedlot_source_code, description, effective_date, expiry_date, update_timestamp)
values ('TPT', 'Tested Parent Trees', '2005-07-25', '9999-12-31', current_timestamp);

-- 63001..63003 belong to client 00012797; 63004..63005 belong to client 00099999
insert into seedlot (
  seedlot_number, seedlot_status_code, genetic_class_code, applicant_client_number,
  applicant_locn_code, applicant_email_address, vegetation_code, seedlot_source_code,
  to_be_registrd_ind, bc_source_ind, collection_start_date,
  entry_userid, entry_timestamp, update_userid, update_timestamp, revision_count
) values
  ('63001', 'PND', 'A', '00012797', '01', 'a@domain.com', 'FDI', 'TPT', true,  true, '2026-03-01',
   'IDIR', '2026-01-01 10:00:00', 'IDIR', '2026-05-01 10:00:00', 0),
  ('63002', 'SUB', 'A', '00012797', '01', 'a@domain.com', 'PLI', 'TPT', false, true, '2026-06-15',
   'IDIR', '2026-01-02 10:00:00', 'IDIR', '2026-05-02 10:00:00', 0),
  ('63003', 'PND', 'B', '00012797', '01', 'a@domain.com', 'SX',  'TPT', true,  true, null,
   'IDIR', '2026-01-03 10:00:00', 'IDIR', '2026-05-03 10:00:00', 0),
  ('63004', 'SUB', 'A', '00099999', '01', 'b@domain.com', 'SX',  'TPT', true,  true, '2025-12-01',
   'IDIR', '2026-01-04 10:00:00', 'IDIR', '2026-05-04 10:00:00', 0),
  ('63005', 'PND', 'A', '00099999', '01', 'b@domain.com', 'FDI', 'TPT', true,  true, null,
   'IDIR', '2026-01-05 10:00:00', 'IDIR', '2026-05-05 10:00:00', 0);

-- Child tables: orchards and owners
insert into method_of_payment_list (method_of_payment_code, description, default_method_ind, effective_date, expiry_date, update_timestamp)
values ('CLA', 'Invoice to client address', true, '1905-01-01', '9999-12-31', current_timestamp);

-- 63001: orchard 405 (primary) + 210; 63002: orchard 210 (primary); 63004: orchard 405 (primary); others none
insert into seedlot_orchard (seedlot_number, orchard_id, primary_ind, entry_userid, entry_timestamp, update_userid, update_timestamp, revision_count)
values
  ('63001', '405', true,  'IDIR', current_timestamp, 'IDIR', current_timestamp, 0),
  ('63001', '210', false, 'IDIR', current_timestamp, 'IDIR', current_timestamp, 0),
  ('63002', '210', true,  'IDIR', current_timestamp, 'IDIR', current_timestamp, 0),
  ('63004', '405', true,  'IDIR', current_timestamp, 'IDIR', current_timestamp, 0);

-- 63001: owned by 00012797 and 00055555; 63002: owned by 00012797
insert into seedlot_owner_quantity (seedlot_number, owner_client_number, owner_locn_code, original_pct_owned, original_pct_rsrvd, original_pct_srpls, method_of_payment_code, spar_fund_srce_code, entry_userid, entry_timestamp, update_userid, update_timestamp, revision_count)
values
  ('63001', '00012797', '01', 50, 50, 0, 'CLA', 'ITC', 'IDIR', current_timestamp, 'IDIR', current_timestamp, 0),
  ('63001', '00055555', '02', 50, 50, 0, 'CLA', 'BCT', 'IDIR', current_timestamp, 'IDIR', current_timestamp, 0),
  ('63002', '00012797', '01', 100, 100, 0, 'CLA', 'ITC', 'IDIR', current_timestamp, 'IDIR', current_timestamp, 0);
