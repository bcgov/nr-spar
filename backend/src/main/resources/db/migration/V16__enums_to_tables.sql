-- ConeCollectionMethodEnum
create table spar.cone_collection_method_code (
	cone_collection_method_code varchar(3) not null,
	description 				varchar(120) not null,
	effective_date 				timestamp not null,
	expiry_date 				timestamp not null,
	update_timestamp 			timestamp not null,
	constraint cone_collection_method_code_pk
		primary key(cone_collection_method_code)
);

comment on table spar.cone_collection_method_code is 'A list of valid Cone based Collection Method Codes.';
comment on column spar.cone_collection_method_code.cone_collection_method_code is 'A code describing various Cone Collection Methods.';
comment on column spar.cone_collection_method_code.description is 'A description for the affiliated code.';
comment on column spar.cone_collection_method_code.effective_date is 'The effective date the code is in effect';
comment on column spar.cone_collection_method_code.expiry_date is 'The date the code expires on.';
comment on column spar.cone_collection_method_code.update_timestamp is 'The date and time of the last update.';

insert into spar.cone_collection_method_code (cone_collection_method_code, description, effective_date, expiry_date, update_timestamp) values
	('01', 'Aerial raking', '1905-01-01 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('02', 'Aerial clipping/topping', '1905-01-01 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('03', 'Felled trees', '1905-01-01 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('04', 'Climbing', '1905-01-01 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('05', 'Squirrel cache', '1905-01-01 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('06', 'Ground, Ladder and/or Hydraulic Lift', '1905-01-01 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('07', 'Unknown', '1905-01-01 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('08', 'Squirrel harvesting/dropping', '2013-12-03 00:00:00', '9999-12-31 00:00:00', current_timestamp);

alter table spar.seedlot_collection_method alter column cone_collection_method_code type varchar(3);
alter table spar.seedlot_collection_method add constraint seedlot_cone_col_met_code_fk
		foreign key(cone_collection_method_code) references spar.cone_collection_method_code(cone_collection_method_code);

-- GeneticClassEnum
create table spar.genetic_class_code (
	genetic_class_code 	varchar(1) not null,
	description 		varchar(120) not null,
	effective_date 		timestamp not null,
	expiry_date 		timestamp not null,
	update_timestamp 	timestamp not null,
	constraint genetic_class_code_pk
		primary key(genetic_class_code)
);

comment on table spar.genetic_class_code is 'A list of valid Genetic Class Codes that indicate if a lot is collected from Parent Trees in an Orchard or from a natural stand.';
comment on column spar.genetic_class_code.genetic_class_code is 'A code describing various Genetic Classes.';
comment on column spar.genetic_class_code.description is 'A description for the affiliated code.';
comment on column spar.genetic_class_code.effective_date is 'The effective date the code is in effect';
comment on column spar.genetic_class_code.expiry_date is 'The date the code expires on.';
comment on column spar.genetic_class_code.update_timestamp is 'The date and time of the last update.';

insert into spar.genetic_class_code (genetic_class_code, description, effective_date, expiry_date, update_timestamp) values
	('A', 'Orchard Seed or Cuttings', '1905-01-01 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('B', 'Natural Stand Seed or Cuttings', '1905-01-01 00:00:00', '9999-12-31 00:00:00', current_timestamp);

alter table spar.seedlot add constraint seedlot_genetic_class_code_fk
		foreign key(genetic_class_code) references spar.genetic_class_code(genetic_class_code);

-- GeneticWorthEnum
create table spar.genetic_worth_code (
	genetic_worth_code 	varchar(3) not null,
	description 		varchar(120) not null,
	effective_date 		timestamp not null,
	expiry_date 		timestamp not null,
	update_timestamp 	timestamp not null,
	constraint genetic_worth_code_pk
		primary key(genetic_worth_code)
);

comment on table spar.genetic_worth_code is 'A list of valid codes that describe the genetic trait(s) of Parent Trees, Seedlots and Vegetative Lots.';
comment on column spar.genetic_worth_code.genetic_worth_code is 'A code describing various Genetic Worths.';
comment on column spar.genetic_worth_code.description is 'A description for the affiliated code.';
comment on column spar.genetic_worth_code.effective_date is 'The effective date the code is in effect';
comment on column spar.genetic_worth_code.expiry_date is 'The date the code expires on.';
comment on column spar.genetic_worth_code.update_timestamp is 'The date and time of the last update.';

insert into spar.genetic_worth_code (genetic_worth_code, description, effective_date, expiry_date, update_timestamp) values
	('D', 'Relative Wood Density', '1998-07-15 00:00:00', '2018-05-29 00:00:00', current_timestamp),
	('G', 'Growth and Volume', '1905-01-01 00:00:00', '2018-05-29 00:00:00', current_timestamp),
	('GVO', 'Volume Growth', '2018-05-29 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('WVE', 'Wood Velocity Measures', '2018-05-29 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('WWD', 'Wood Density', '2018-05-29 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('R', 'Pest Resistance', '1905-01-01 00:00:00', '2018-05-29 00:00:00', current_timestamp),
	('M', 'Major Gene Resistance', '2006-09-06 00:00:00', '2018-05-29 00:00:00', current_timestamp),
	('WDU', 'Durability', '2018-05-29 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('AD', 'Deer', '2018-05-29 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('DFS', 'Dothistroma Needle Blight (Dothistroma septosporum)', '2018-05-29 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('DFU', 'Cedar Leaf Blight (Didymascella thujina)', '2018-05-29 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('DFW', 'Swiss Needle Cast (Phaeocryptopus gaumanni)', '2018-05-29 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('DSB', 'White pine Blister Rust (Cronartium ribicola)', '2018-05-29 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('DSC', 'Comandra Blister Rust (Cronartium comandrae)', '2018-05-29 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('DSG', 'Western Gall Rust (Endocronartium harknessii)', '2018-05-29 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('IWS', 'White pine Weevil (on Spruce) (Pissodes strobi)', '2018-05-29 00:00:00', '9999-12-31 00:00:00', current_timestamp);

alter table spar.seedlot_parent_tree_gen_qlty add constraint seedlot_pt_genqlt_genwor_cd_fk
		foreign key(genetic_worth_code) references spar.genetic_worth_code(genetic_worth_code);

alter table spar.seedlot_genetic_worth add constraint seedlot_genetic_worth_code_fk
		foreign key(genetic_worth_code) references spar.genetic_worth_code(genetic_worth_code);

alter table spar.smp_mix_gen_qlty add constraint smp_mix_gen_qlty_gen_wor_cd_fk
		foreign key(genetic_worth_code) references spar.genetic_worth_code(genetic_worth_code);

alter table spar.seedlot_parent_tree_smp_mix add constraint seedlot_pt_smpmix_genwor_cd_fk
		foreign key(genetic_worth_code) references spar.genetic_worth_code(genetic_worth_code);

-- MaleFemaleMethodologyEnum
create table spar.gametic_methodology_code (
	gametic_methodology_code 	varchar(3) not null,
	description 				varchar(120) not null,
	pli_species_ind 			boolean not null,
	effective_date 				timestamp not null,
	expiry_date 				timestamp not null,
	update_timestamp 			timestamp not null,
	constraint gametic_methodology_code_pk
		primary key(gametic_methodology_code)
);

comment on table spar.gametic_methodology_code is 'A list of valid codes indicating the methods used in a seed Orchard to estimate the female or male component of gamete contributions to a Seedlot.';
comment on column spar.gametic_methodology_code.gametic_methodology_code is 'Code that describes the gametic contribution method code for a seedlot';
comment on column spar.gametic_methodology_code.description is 'A description for the affiliated code.';
comment on column spar.gametic_methodology_code.pli_species_ind is 'A flag that indicates if the methodology can be used by a PLI species or not';
comment on column spar.gametic_methodology_code.effective_date is 'The effective date the code is in effect';
comment on column spar.gametic_methodology_code.expiry_date is 'The date the code expires on.';
comment on column spar.gametic_methodology_code.update_timestamp is 'The date and time of the last update.';

insert into spar.gametic_methodology_code (gametic_methodology_code, description, pli_species_ind, effective_date, expiry_date, update_timestamp) values
	('F1', 'Visual Estimate', false, '2005-07-25 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('F2', 'Measured Cone Volume', false, '2005-07-25 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('F3', 'Cone Weight', false, '2005-07-25 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('F4', 'Cone Number from Weight', false, '2005-07-25 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('F5', 'Cone Number from Standard Volume', false, '2005-07-25 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('F6', 'Sample of Seeds', false, '2005-07-25 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('F7', 'Filled Seeds', false, '2005-07-25 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('F8', 'Ramet Proportion by Clone', true, '2015-06-03 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('F9', 'Ramet Proportion by Age and Expected Production', true, '2015-06-03 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('M1', 'Portion of Ramets in Orchard', false, '2005-07-25 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('M2', 'Pollen Volume Estimate by Partial Survey', false, '2005-07-25 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('M3', 'Pollen Volume Estimate by 100% Survey', false, '2005-07-25 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('M4', 'Ramet Proportion by Clone', true, '2015-06-03 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('M5', 'Ramet Proportion by Age and Expected Production', true, '2015-06-03 00:00:00', '9999-12-31 00:00:00', current_timestamp);

alter table spar.seedlot add constraint seedlot_female_game_mthd_cd_fk
		foreign key(female_gametic_mthd_code) references spar.gametic_methodology_code(gametic_methodology_code);
alter table spar.seedlot add constraint seedlot_male_game_mthd_cd_fk
		foreign key(male_gametic_mthd_code) references spar.gametic_methodology_code(gametic_methodology_code);

-- PaymentMethodEnum
create table spar.method_of_payment_code (
	method_of_payment_code 	varchar(3) not null,
	description 			varchar(120) not null,
	effective_date 			timestamp not null,
	expiry_date 			timestamp not null,
	update_timestamp 		timestamp not null,
	constraint method_of_payment_code_pk
		primary key(method_of_payment_code)
);

comment on table spar.method_of_payment_code is 'A list of valid Method of Payment Codes.';
comment on column spar.method_of_payment_code.method_of_payment_code is 'A code describing various Method of Payments.';
comment on column spar.method_of_payment_code.description is 'A description for the affiliated code.';
comment on column spar.method_of_payment_code.effective_date is 'The effective date the code is in effect';
comment on column spar.method_of_payment_code.expiry_date is 'The date the code expires on.';
comment on column spar.method_of_payment_code.update_timestamp is 'The date and time of the last update.';

insert into spar.method_of_payment_code (method_of_payment_code, description, effective_date, expiry_date, update_timestamp) values
	('CLA', 'Invoice to MOF Client Account', '1905-01-01 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('CSH', 'Cash Sale', '1905-01-01 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('ITC', 'Invoice to Client Address', '1905-01-01 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('ITO', 'Invoice to Other Address', '1905-01-01 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('JV', 'Journal Voucher', '1905-01-01 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('NC', 'Non-chargeable', '1905-01-01 00:00:00', '9999-12-31 00:00:00', current_timestamp);

alter table spar.seedlot_owner_quantity add constraint seedlot_own_qnt_meth_pay_cd_fk
		foreign key(method_of_payment_code) references spar.method_of_payment_code(method_of_payment_code);

-- SeedlotSourceEnum
create table spar.seedlot_source_code (
	seedlot_source_code varchar(3) not null,
	description 		varchar(120) not null,
	effective_date 		timestamp not null,
	expiry_date 		timestamp not null,
	update_timestamp 	timestamp not null,
	constraint seedlot_source_code_pk
		primary key(seedlot_source_code)
);

comment on table spar.seedlot_source_code is 'A list of valid Lot Source Codes.';
comment on column spar.seedlot_source_code.seedlot_source_code is 'A code to indicate if an orchard seedlot is from tested parent trees, untested or custom.';
comment on column spar.seedlot_source_code.description is 'A description for the affiliated code.';
comment on column spar.seedlot_source_code.effective_date is 'The effective date the code is in effect';
comment on column spar.seedlot_source_code.expiry_date is 'The date the code expires on.';
comment on column spar.seedlot_source_code.update_timestamp is 'The date and time of the last update.';

insert into spar.seedlot_source_code (seedlot_source_code, description, effective_date, expiry_date, update_timestamp) values
	('CUS', 'Custom Lot', '2005-07-25 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('TPT', 'Tested Parent Trees', '2005-07-25 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('UPT', 'Untested Parent Trees', '2005-07-25 00:00:00', '9999-12-31 00:00:00', current_timestamp);

alter table spar.seedlot add constraint seedlot_seedlot_source_code_fk
		foreign key(seedlot_source_code) references spar.seedlot_source_code(seedlot_source_code);

-- SeedlotStatusEnum
create table spar.seedlot_status_code (
	seedlot_status_code varchar(3) not null,
	description 		varchar(120) not null,
	effective_date 		timestamp not null,
	expiry_date 		timestamp not null,
	update_timestamp 	timestamp not null,
	constraint seedlot_status_code_pk
		primary key(seedlot_status_code)
);

comment on table spar.seedlot_status_code is 'A list of valid Seedlot based Status Codes.';
comment on column spar.seedlot_status_code.seedlot_status_code is 'A code describing various Seedlot Statuses.';
comment on column spar.seedlot_status_code.description is 'A description for the affiliated code.';
comment on column spar.seedlot_status_code.effective_date is 'The effective date the code is in effect';
comment on column spar.seedlot_status_code.expiry_date is 'The date the code expires on.';
comment on column spar.seedlot_status_code.update_timestamp is 'The date and time of the last update.';

insert into spar.seedlot_status_code (seedlot_status_code, description, effective_date, expiry_date, update_timestamp) values
	('APP', 'Approved', '1905-01-01 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('CAN', 'Cancelled', '1905-01-01 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('COM', 'Complete', '1905-01-01 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('INC', 'Incomplete', '1905-01-01 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('PND', 'Pending', '1905-01-01 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('EXP', 'Expired', '1905-01-01 00:00:00', '9999-12-31 00:00:00', current_timestamp),
	('SUB', 'Submitted', '1905-01-01 00:00:00', '9999-12-31 00:00:00', current_timestamp);

alter table spar.seedlot add constraint seedlot_seedlot_status_code_fk
		foreign key(seedlot_status_code) references spar.seedlot_status_code(seedlot_status_code);

alter table spar.seedlot_orchard drop column primary_ind;
