import FavouriteEndpoints from './FavouriteEndpoints';
import RecentActivitiesEndpoints from './RecentActivitiesEndpoints';
import GeneticClassesEndpoints from './GeneticClassesEndpoints';
import SeedlotRegistrationEndpoints from './SeedlotRegistrationEndpoints';
import OrchardsEndpoints from './OrchardsEndpoint';

const endpoints = {
  favourites: FavouriteEndpoints,
  recent: RecentActivitiesEndpoints,
  geneticClasses: GeneticClassesEndpoints,
  seedlotRegistration: SeedlotRegistrationEndpoints,
  orchards: OrchardsEndpoints
};

export default endpoints;
