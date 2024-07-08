--
-- Drops the triggers
--
-- Cone collection method list
drop trigger set_update_timestamp on spar.cone_collection_method_list;

-- Gametic methodology list
drop trigger set_update_timestamp on spar.gametic_methodology_list;

-- Genetic class list
drop trigger set_update_timestamp on spar.genetic_class_list;

-- Genetic worth list
drop trigger set_update_timestamp on spar.genetic_worth_list;

-- Method of payment list
drop trigger set_update_timestamp on spar.method_of_payment_list;

-- Seedlot source list
drop trigger set_update_timestamp on spar.seedlot_source_list;

-- Seedlot status list
drop trigger set_update_timestamp on spar.seedlot_status_list;

-- Seedlot
drop trigger set_entry_timestamp on spar.seedlot;
drop trigger set_update_timestamp on spar.seedlot;

-- Seedlot collection method
drop trigger set_entry_timestamp on spar.seedlot_collection_method;
drop trigger set_update_timestamp on spar.seedlot_collection_method;

-- Seedlot genetic worth
drop trigger set_entry_timestamp on spar.seedlot_genetic_worth;
drop trigger set_update_timestamp on spar.seedlot_genetic_worth;

-- Seedlot orchard
drop trigger set_entry_timestamp on spar.seedlot_orchard;
drop trigger set_update_timestamp on spar.seedlot_orchard;

-- Seedlot owner quantity
drop trigger set_entry_timestamp on spar.seedlot_owner_quantity;
drop trigger set_update_timestamp on spar.seedlot_owner_quantity;

-- Seedlot parent tree
drop trigger set_entry_timestamp on spar.seedlot_parent_tree;
drop trigger set_update_timestamp on spar.seedlot_parent_tree;

-- Seedlot parent tree genetic quality
drop trigger set_entry_timestamp on spar.seedlot_parent_tree_gen_qlty;
drop trigger set_update_timestamp on spar.seedlot_parent_tree_gen_qlty;  

-- Seedlot parent tree smp mix
drop trigger set_entry_timestamp on spar.seedlot_parent_tree_smp_mix;
drop trigger set_update_timestamp on spar.seedlot_parent_tree_smp_mix;

-- Seedlot smp mix
drop trigger set_entry_timestamp on spar.smp_mix;
drop trigger set_update_timestamp on spar.smp_mix;

-- Smp mix genetic quality
drop trigger set_entry_timestamp on spar.smp_mix_gen_qlty;
drop trigger set_update_timestamp on spar.smp_mix_gen_qlty;

-- Seedlot smp mix
drop trigger set_entry_timestamp on spar.seedlot_smp_mix;
drop trigger set_update_timestamp on spar.seedlot_smp_mix;

-- Seedlot seed plan zone
drop trigger set_entry_timestamp on spar.seedlot_seed_plan_zone;
drop trigger set_update_timestamp on spar.seedlot_seed_plan_zone;

-- Favourite activities - for consistency
drop trigger set_entry_timestamp on spar.favourite_activity;
drop trigger set_update_timestamp on spar.favourite_activity;

-- Seedlot registration a class save
drop trigger set_entry_timestamp on spar.seedlot_registration_a_class_save;
drop trigger set_update_timestamp on spar.seedlot_registration_a_class_save;

--
-- Drops the functions
--
drop function trigger_set_entry_timestamp;
drop function trigger_set_update_timestamp;
