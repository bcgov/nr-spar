import RecentActivitiesEndpoints from './RecentActivitiesEndpoints';
import SeedlotRegistrationEndpoints from './SeedlotRegistrationEndpoints';
import OrchardsEndpoints from './OrchardsEndpoint';
import FavouriteEndpoints from './FavouriteEndpoints';

export const endpoints = {
  recent: RecentActivitiesEndpoints,
  seedlotRegistration: SeedlotRegistrationEndpoints,
  orchards: OrchardsEndpoints
};

export const jestEndpoints = {
  recent: RecentActivitiesEndpoints,
  seedlotRegistration: SeedlotRegistrationEndpoints,
  orchards: OrchardsEndpoints,
  favouriteActivities: FavouriteEndpoints
};
