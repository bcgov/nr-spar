-- seedlot
comment on table spar.seedlot is 'A quantity of seed of a particular species and quality collected from either a natural stand or seed Orchard in a given time period.';
comment on column spar.seedlot.seedlot_number is 'The unique number (key) assigned to a quantity of seed of a particular species and quality from a given location collected at a given time.';
comment on column spar.seedlot.seedlot_status_code is 'A code which represents the current status of a lot.';
comment on column spar.seedlot.applicant_client_number is 'A sequentially assigned number which uniquely identifies a Ministry client (applicant).';
comment on column spar.seedlot.applicant_locn_code is 'A code to uniquely identify, within each client (applicant), the addresses of different divisions or locations at which the client operates. The location code is sequentially assigned starting with "00" for the client´s permanent address.';
comment on column spar.seedlot.applicant_email_address is 'Email address of client applying to register the Seedlot';
comment on column spar.seedlot.vegetation_code is 'A code which represents a species of tree or brush.';
comment on column spar.seedlot.genetic_class_code is 'A code which represents the Genetic Quality of material (seed or cuttings). "A" class represents superior Orchard produced seed or cuttings. "B" class represents naturally collected seed or cuttings.';
comment on column spar.seedlot.seedlot_source_code is 'A code to indicate if an Orchard Seedlot is from tested Parent Trees, untested or custom.';
comment on column spar.seedlot.to_be_registrd_ind is 'An indicator which represents whether a Seedlot is intended to be registered for crown land reforestation use ("Y" yes) or not ("N" no).';
comment on column spar.seedlot.bc_source_ind is 'Indicates whether the source of the Seedlot is within British Columbia';
comment on column spar.seedlot.collection_client_number is 'A sequentially assigned number which uniquely identifies a Ministry client (collection).';
comment on column spar.seedlot.collection_locn_code is 'A code to uniquely identify, within each client (collection), the addresses of different divisions or locations at which the client operates. The location code is sequentially assigned starting with "00" for the client´s permanent address.';
comment on column spar.seedlot.collection_start_date is 'The actual start date (year, month, and day) that the cones (source for seedlots) were collected.';
comment on column spar.seedlot.collection_end_date is 'The actual end date (year, month, and day) that the cones (source for seedlots) were collected.';
comment on column spar.seedlot.no_of_containers is 'The number of containers (sacks of cones) that were collected.';
comment on column spar.seedlot.vol_per_container is 'The volume of cones, in hectolitres, that were collected per container (as reported on the cone collection form).';
comment on column spar.seedlot.clctn_volume is 'A code which represents the number of trees that the Seedlot was collected from.';
comment on column spar.seedlot.seedlot_comment is 'A free format text field used to enter general comments for a Seedlot.';
comment on column spar.seedlot.interm_strg_client_number is 'A sequentially assigned number which uniquely identifies a Ministry client (interm storage).';
comment on column spar.seedlot.interm_strg_locn_code is 'A code to uniquely identify, within each client (interm storage), the addresses of different divisions or locations at which the client operates. The location code is sequentially assigned starting with "00" for the client´s permanent address.';
comment on column spar.seedlot.interm_strg_st_date is 'The actual start date (year, month, and day) when the cone was stored during interim storage.';
comment on column spar.seedlot.interm_strg_end_date is 'The actual end date (year, month, and day) when the cone was stored during interim storage.';
comment on column spar.seedlot.interm_facility_code is 'A code which represents the type of facility where the seed was stored during interim storage.';
comment on column spar.seedlot.female_gametic_mthd_code is 'Code that describes the female gametic contribution method code for a Seedlot.';
comment on column spar.seedlot.male_gametic_mthd_code is 'Code that describes the male gametic contribution method code for a Seedlot.';
comment on column spar.seedlot.controlled_cross_ind is 'Indicates whether the lot was produced through controlled crosses.';
comment on column spar.seedlot.biotech_processes_ind is 'Indicates if biotechnological processes been used to produce this lot.';
comment on column spar.seedlot.pollen_contamination_ind is 'Indicates if pollen contamination was present in the seed Orchard';
comment on column spar.seedlot.pollen_contamination_pct is 'The proportion of contaminant pollen present in the seed Orchard.';
comment on column spar.seedlot.contaminant_pollen_bv is 'The estimated Breeding Value of the contaminant pollen in an Orchard.';
comment on column spar.seedlot.pollen_contamination_mthd_code is 'Code that describes the pollen contamination method.';
comment on column spar.seedlot.total_parent_trees is 'The total number of parents contributing to the Seedlot.';
comment on column spar.seedlot.smp_success_pct is 'The estimated success (percent) of the supplemental mass pollination mix on the Parent Trees in the Orchard.';
comment on column spar.seedlot.effective_pop_size is 'The calculated number of parents contributing to the Seedlot, representing the genetic variety.';
comment on column spar.seedlot.tested_parent_tree_cont_pct is 'Percentage of Parent Trees contributing to the Seedlot that were tested.';
comment on column spar.seedlot.coancestry is 'This value was taken from the SeedlotCertificationTemplate.xls (2005 version with Coancestry - sheet reference "PiPj  Cij"!P1) as used by the Tree Seed Centre to calculate Genetic Worth, Effective Population Size and Collection Geography prior to this fun.';
comment on column spar.seedlot.smp_parents_outside is 'The number of Parent Trees from outside an Orchard used in the supplemental mass pollination mix.';
comment on column spar.seedlot.non_orchard_pollen_contam_pct is 'Non-orchard pollen contamination (%) for the Seedlot.';
comment on column spar.seedlot.extractory_client_number is 'A sequentially assigned number which uniquely identifies a Ministry client (extractory).';
comment on column spar.seedlot.extractory_locn_code is 'A code to uniquely identify, within each client (extractory), the addresses of different divisions or locations at which the client operates. The location code is sequentially assigned starting with "00" for the client´s permanent address.';
comment on column spar.seedlot.extraction_st_date is 'The actual start date (year, month, and day) when the seed was extracted from the cones.';
comment on column spar.seedlot.extraction_end_date is 'The actual end date (year, month, and day) when the seed was extracted from the cones.';
comment on column spar.seedlot.storage_client_number is 'A sequentially assigned number which uniquely identifies a Ministry client (storage).';
comment on column spar.seedlot.storage_locn_code is 'A code to uniquely identify, within each client (storage), the addresses of different divisions or locations at which the client operates. The location code is sequentially assigned starting with "00" for the client´s permanent address.';
comment on column spar.seedlot.temporary_storage_start_date is 'Commencement date of temporary Seedlot storage.';
comment on column spar.seedlot.temporary_storage_end_date is 'End date of Seedlot temporary storage.';
comment on column spar.seedlot.declared_userid is 'The userid of the individual that declares the following: - that the information is true and correct - that they are the owner of the lot or are authorized by the owner(s) to submit the Seedlot application.';
comment on column spar.seedlot.declared_timestamp is 'The date and time that the following were declared by the declarer: - that the information is true and correct - that they are the owner of the lot or are authorized by the owner(s) to submit the Seedlot application.';
comment on column spar.seedlot.entry_userid is 'The userid of the individual that entered the Seedlot.';
comment on column spar.seedlot.entry_timestamp is 'The time and date a Seedlot was entered onto the system.';
comment on column spar.seedlot.update_userid is 'The userid of the individual that changed the Seedlot.';
comment on column spar.seedlot.update_timestamp is 'The time and date a Seedlot was last updated on the system.';
comment on column spar.seedlot.revision_count is 'A counter used to ensure data integrity. This item should be incremented during each update.';

-- seedlot_collection_method
comment on table spar.seedlot_collection_method is 'The collection methods in which the cones of a Seedlot were collected.';
comment on column spar.seedlot_collection_method.seedlot_number is 'The unique number (key) assigned to a quantity of seed of a particular species and quality from a given location collected at a given time.';
comment on column spar.seedlot_collection_method.cone_collection_method_code is 'A code representing the method in which the cones were collected.';
comment on column spar.seedlot_collection_method.cone_collection_method_other_desc is 'A description of the method in which the cones were collected - used only when the user selects the option "Other".';
comment on column spar.seedlot_collection_method.entry_userid is 'The userid of the individual that entered the Seedlot collection method.';
comment on column spar.seedlot_collection_method.entry_timestamp is 'The time and date a Seedlot collection method was entered onto the system.';
comment on column spar.seedlot_collection_method.update_userid is 'The userid of the individual that changed the Seedlot collection method.';
comment on column spar.seedlot_collection_method.update_timestamp is 'The time and date a Seedlot collection method was last updated on the system.';
comment on column spar.seedlot_collection_method.revision_count is 'A counter used to ensure data integrity. This item should be incremented during each update.';

-- seedlot_owner_quantity
comment on table spar.seedlot_owner_quantity is 'A Seedlot may be owned by more than one owner. Each owner owns a specific quantity of seed which may be reserved for the use of that owner and/or surplus and available for use by others.';
comment on column spar.seedlot_owner_quantity.seedlot_number is 'The unique number (key) assigned to a quantity of seed of a particular species and quality from a given location collected at a given time.';
comment on column spar.seedlot_owner_quantity.owner_client_number is 'A sequentially assigned number which uniquely identifies a Ministry client (owner).';
comment on column spar.seedlot_owner_quantity.owner_locn_code is 'A code to uniquely identify, within each client (owner), the addresses of different divisions or locations at which the client operates. The location code is sequentially assigned starting with "00" for the client´s permanent address.';
comment on column spar.seedlot_owner_quantity.original_pct_owned is 'The original percentage of seed that was owned by a client.';
comment on column spar.seedlot_owner_quantity.original_pct_rsrvd is 'The original percentage of seed from an owner´s portion of a Seedlot that has been declared reserved.';
comment on column spar.seedlot_owner_quantity.original_pct_srpls is 'The original percentage of seed from an owner´s portion of a Seedlot that has been declared surplus.';
comment on column spar.seedlot_owner_quantity.method_of_payment_code is 'A code which represents the method of payment for services where payment is required.';
comment on column spar.seedlot_owner_quantity.spar_fund_srce_code is 'A code which represents the source funds for payment of the request.';
comment on column spar.seedlot_owner_quantity.entry_userid is 'The userid of the individual that entered the Seedlot owner quantity.';
comment on column spar.seedlot_owner_quantity.entry_timestamp is 'The time and date a Seedlot owner quantity was entered onto the system.';
comment on column spar.seedlot_owner_quantity.update_userid is 'The userid of the individual that changed the Seedlot owner quantity.';
comment on column spar.seedlot_owner_quantity.update_timestamp is 'The time and date a Seedlot owner quantity was last updated on the system.';
comment on column spar.seedlot_owner_quantity.revision_count is 'A counter used to ensure data integrity. This item should be incremented during each update.';

-- seedlot_orchard
comment on table spar.seedlot_orchard is 'Orchard location where cuttings or A class seed is produced.';
comment on column spar.seedlot_orchard.seedlot_number is 'The unique number (key) assigned to a quantity of seed of a particular species and quality from a given location collected at a given time.';
comment on column spar.seedlot_orchard.orchard_id is 'A unique identifier which is assigned to a location where cuttings or A class seed is produced.';
comment on column spar.seedlot_orchard.entry_userid is 'The userid of the individual that entered the Seedlot Orchard.';
comment on column spar.seedlot_orchard.entry_timestamp is 'The time and date a Seedlot Orchard was entered onto the system.';
comment on column spar.seedlot_orchard.update_userid is 'The userid of the individual that changed the Seedlot Orchard.';
comment on column spar.seedlot_orchard.update_timestamp is 'The time and date a Seedlot Orchard was last updated on the system.';
comment on column spar.seedlot_orchard.revision_count is 'A counter used to ensure data integrity. This item should be incremented during each update.';

-- seedlot_parent_tree
comment on table spar.seedlot_parent_tree is 'The contribution of Parent Trees (with their cone and pollen quantity of each Parent Tree) to an Orchard Seedlot (Genetic Class = "A")';
comment on column spar.seedlot_parent_tree.seedlot_number is 'The unique number (key) assigned to a quantity of seed of a particular species and quality from a given location collected at a given time.';
comment on column spar.seedlot_parent_tree.parent_tree_id is 'A unique identifier for each Parent Tree.';
comment on column spar.seedlot_parent_tree.cone_count is 'The number of cones counted or estimated from each Parent Tree for a Seedlot.';
comment on column spar.seedlot_parent_tree.pollen_count is 'The amount of pollen counted or estimated for each Parent Tree in the Seedlot.';
comment on column spar.seedlot_parent_tree.smp_success_pct is 'The estimated success (percent) of the supplemental mass pollination mix on the Parent Trees in the Orchard.';
comment on column spar.seedlot_parent_tree.non_orchard_pollen_contam_pct is 'Non-orchard pollen contamination (%).';
comment on column spar.seedlot_parent_tree.entry_userid is 'The userid of the individual that entered the Seedlot Parent Tree.';
comment on column spar.seedlot_parent_tree.entry_timestamp is 'The time and date a Seedlot Parent Tree was entered onto the system.';
comment on column spar.seedlot_parent_tree.update_userid is 'The userid of the individual that changed the Seedlot Parent Tree.';
comment on column spar.seedlot_parent_tree.update_timestamp is 'The time and date a Seedlot Parent Tree was last updated on the system.';
comment on column spar.seedlot_parent_tree.revision_count is 'A counter used to ensure data integrity. This item should be incremented during each update.';

-- seedlot_parent_tree_gen_qlty
comment on table spar.seedlot_parent_tree_gen_qlty is 'The Genetic Worth value(s) for an Orchard Seedlot (Genetic Class = "A") calculated from the Genetic Quality (Breeding Values) of the Parent Trees contributing to the Seedlot.';
comment on column spar.seedlot_parent_tree_gen_qlty.seedlot_number is 'The unique number (key) assigned to a quantity of seed of a particular species and quality from a given location collected at a given time.';
comment on column spar.seedlot_parent_tree_gen_qlty.parent_tree_id is 'A unique identifier for each Parent Tree.';
comment on column spar.seedlot_parent_tree_gen_qlty.genetic_type_code is 'Describes the comparative measure of genetic value for a specific genetic trait of a Parent Tree.  Examples are BV (Breeding Value) and CV (Clonal Value).';
comment on column spar.seedlot_parent_tree_gen_qlty.genetic_worth_code is 'A code describing various Genetic Worths.';
comment on column spar.seedlot_parent_tree_gen_qlty.genetic_quality_value is 'The Genetic Quality value based on the test assessment for a Parent Tree from a test no. and series.';
comment on column spar.seedlot_parent_tree_gen_qlty.estimated_ind is 'Indicates whether or not the test result was estimated. A Genetic Quality value of 2.0 is estimated for Untested Parent Trees (i.e. Parent Trees without an Area of Use) or for Tested Parent Trees (i.e. Parent Trees with an Area of Use) without a Genetic.';
comment on column spar.seedlot_parent_tree_gen_qlty.untested_ind is 'Indicates whether or not the test result was estimated for an untested Parent Tree.';
comment on column spar.seedlot_parent_tree_gen_qlty.entry_userid is 'The userid of the individual that entered the Seedlot Parent Tree Genetic Quality.';
comment on column spar.seedlot_parent_tree_gen_qlty.entry_timestamp is 'The time and date a Seedlot Parent Tree Genetic Quality was entered onto the system.';
comment on column spar.seedlot_parent_tree_gen_qlty.update_userid is 'The userid of the individual that changed the Seedlot Parent Tree Genetic Quality.';
comment on column spar.seedlot_parent_tree_gen_qlty.update_timestamp is 'The time and date a Seedlot Parent Tree Genetic Quality was last updated on the system.';
comment on column spar.seedlot_parent_tree_gen_qlty.revision_count is 'A counter used to ensure data integrity. This item should be incremented during each update.';

-- seedlot_genetic_worth
comment on table spar.seedlot_genetic_worth is 'A subclassification of Genetic Quality for "A" class Seedlots.';
comment on column spar.seedlot_genetic_worth.seedlot_number is 'The unique number (key) assigned to a quantity of seed of a particular species and quality from a given location collected at a given time.';
comment on column spar.seedlot_genetic_worth.genetic_worth_code is 'A code which represents a subclassification of Genetic Quality for "A" class seedlots.';
comment on column spar.seedlot_genetic_worth.genetic_quality_value is 'The rating for a subclassification of Genetic Quality for "A" class seedlots.';
comment on column spar.seedlot_genetic_worth.entry_userid is 'The userid of the individual that entered the Seedlot Genetic Worth.';
comment on column spar.seedlot_genetic_worth.entry_timestamp is 'The time and date a Seedlot Genetic Worth was entered onto the system.';
comment on column spar.seedlot_genetic_worth.update_userid is 'The userid of the individual that changed the Seedlot Genetic Worth.';
comment on column spar.seedlot_genetic_worth.update_timestamp is 'The time and date a Seedlot Genetic Worth was last updated on the system.';
comment on column spar.seedlot_genetic_worth.revision_count is 'A counter used to ensure data integrity. This item should be incremented during each update.';

-- smp_mix
comment on table spar.smp_mix is 'A table listing the individual Parent Trees that contributed to the Supplemental Mass Pollination mix of an Orchard Seedlot (Genetic Class = "A").';
comment on column spar.smp_mix.seedlot_number is 'The unique number (key) assigned to a quantity of seed of a particular species and quality from a given location collected at a given time.';
comment on column spar.smp_mix.parent_tree_id is 'A unique identifier for each Parent Tree.';
comment on column spar.smp_mix.amount_of_material is 'The amount of Parent Tree material used for calculating the proportion of mix. Usually a volume recorded in mL.';
comment on column spar.smp_mix.proportion is 'The proportion of each Parent Tree material used for calculating SMP mix.';
comment on column spar.smp_mix.entry_userid is 'The userid of the individual that entered the SMP mix.';
comment on column spar.smp_mix.entry_timestamp is 'The time and date a SMP mix was entered onto the system.';
comment on column spar.smp_mix.update_userid is 'The userid of the individual that changed the SMP mix.';
comment on column spar.smp_mix.update_timestamp is 'The time and date a SMP mix was last updated on the system.';
comment on column spar.smp_mix.revision_count is 'A counter used to ensure data integrity. This item should be incremented during each update.';

-- smp_mix_gen_qlty
comment on table spar.smp_mix_gen_qlty is 'The calculated Genetic Worth value(s) for the Supplemental Mass Pollination mix that contributed to an Orchard Seedlot (Genetic Class = "A") the Parent Trees contributing to a Seedlot.';
comment on column spar.smp_mix_gen_qlty.seedlot_number is 'The unique number (key) assigned to a quantity of seed of a particular species and quality from a given location collected at a given time.';
comment on column spar.smp_mix_gen_qlty.parent_tree_id is 'A unique identifier for each Parent Tree.';
comment on column spar.smp_mix_gen_qlty.genetic_type_code is 'Describes the comparative measure of genetic value for a specific genetic trait of a Parent Tree. Examples are BV (Breeding Value) and CV (Clonal Value).';
comment on column spar.smp_mix_gen_qlty.genetic_worth_code is 'A code describing various Genetic Worths.';
comment on column spar.smp_mix_gen_qlty.genetic_quality_value is 'The Genetic Quality value based on the test assessment for a Parent Tree from a test no. and series.';
comment on column spar.smp_mix_gen_qlty.entry_userid is 'The userid of the individual that entered the SMP mix Genetic Quality.';
comment on column spar.smp_mix_gen_qlty.entry_timestamp is 'The time and date a SMP mix Genetic Quality was entered onto the system.';
comment on column spar.smp_mix_gen_qlty.update_userid is 'The userid of the individual that changed the SMP mix Genetic Quality.';
comment on column spar.smp_mix_gen_qlty.update_timestamp is 'The time and date a SMP mix Genetic Quality was last updated on the system.';
comment on column spar.smp_mix_gen_qlty.revision_count is 'A counter used to ensure data integrity. This item should be incremented during each update.';

-- seedlot_parent_tree_smp_mix
comment on table spar.seedlot_parent_tree_smp_mix is 'Supplemental Mass Polination for a given Seedlot, Parent Tree, Genetic Type and Genetic worth combination.';
comment on column spar.seedlot_parent_tree_smp_mix.seedlot_number is 'The unique number (key) assigned to a quantity of seed of a particular species and quality from a given location collected at a given time.';
comment on column spar.seedlot_parent_tree_smp_mix.parent_tree_id is 'A unique identifier for each Parent Tree.';
comment on column spar.seedlot_parent_tree_smp_mix.genetic_type_code is 'Describes the comparative measure of genetic value for a specific genetic trait of a Parent Tree. Examples are BV (Breeding Value) and CV (Clonal Value).';;
comment on column spar.seedlot_parent_tree_smp_mix.genetic_worth_code is 'A code describing various Genetic Worths.';;
comment on column spar.seedlot_parent_tree_smp_mix.genetic_quality_value is 'The Genetic Quality value based on the test assessment for a Parent Tree from a test no. and series.';
comment on column spar.seedlot_parent_tree_smp_mix.entry_userid is 'The userid of the individual that entered the Parent Tree SMP mix';
comment on column spar.seedlot_parent_tree_smp_mix.entry_timestamp is 'The time and date a Parent Tree SMP mix was entered onto the system.';
comment on column spar.seedlot_parent_tree_smp_mix.update_userid is 'The userid of the individual that changed the Parent Tree SMP mix.';
comment on column spar.seedlot_parent_tree_smp_mix.update_timestamp is 'The time and date a Parent Tree SMP mix was last updated on the system.';
comment on column spar.seedlot_parent_tree_smp_mix.revision_count is 'A counter used to ensure data integrity. This item should be incremented during each update.';

-- active_orchard_spu
comment on table spar.active_orchard_spu is 'It is used to control which orchard can be used in the Seedlot registration process and also to indicate which legacy seed plan unit id should to be used.';
comment on column spar.active_orchard_spu.orchard_id is 'A unique identifier which is assigned to a location where cuttings or A class seed is produced.';
comment on column spar.active_orchard_spu.seed_plan_unit_id is 'A unique identifier which is assigned to a legacy Seed Planning Unit. It is used for historical porpuse and to link data to Oracle database. A -1 indicates that the orchard has no SPU associated with it.';
comment on column spar.active_orchard_spu.active_ind is 'Indicates if the combined orchard and SPU are the ones to be used and are active.';
comment on column spar.active_orchard_spu.retired_ind is 'Indicates retired orchards that should only be used to show legacy information.';
comment on column spar.active_orchard_spu.no_spu_ind is 'Indicates a new orchard that has not a SPU assigned yet.';
