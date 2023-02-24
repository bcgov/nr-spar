import FavouriteEndpoints from './FavouriteEndpoints';
import RecentActivitiesEndpoints from './RecentActivitiesEndpoints';
import GeneticClassesEndpoints from './GeneticClassesEndpoints';
import SeedlotRegistrationEndpoint from './SeedlotRegistrationEndpoint';

const endpoints = {
  favourites: FavouriteEndpoints,
  recent: RecentActivitiesEndpoints,
  geneticClasses: GeneticClassesEndpoints,
  seedlotRegistration: SeedlotRegistrationEndpoint
};

export default endpoints;
