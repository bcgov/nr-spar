interface ActivityIconsProps {
  [key: string]: string
}

const ActivityIcons: ActivityIconsProps = {
  SEEDLOT: 'SoilMoistureField',
  VEGETATIVE_LOT: 'SoilMoistureField',
  PARENT_TREE: 'Tree',
  NURSERY: 'CropHealth',
  SEEDLING: 'CropGrowth',
  ORCHARD: 'MapBoundaryVegetation',
  TREE_SEED_CENTER: 'Enterprise',
  FINANCIAL: 'Money',
  TESTS: 'Chemistry',
  SEARCH: 'Search',
  ACTIVITY_STATUS: 'ProgressBar',
  REPORTS: 'Report',
  INVENTORY: 'Store',
  GENERIC: 'Application'
};

export default ActivityIcons;
