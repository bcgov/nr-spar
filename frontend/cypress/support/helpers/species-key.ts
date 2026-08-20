// Represents the species keys that are created during the create-a-class-seedlot feature
// This ensures consistency across all tests that depend on seedlot creation
export const CREATED_SPECIES_KEYS = ['pli', 'cw', 'dr', 'ep', 'fdc'] as const;

export type CreatedSpeciesKey = typeof CREATED_SPECIES_KEYS[number];
