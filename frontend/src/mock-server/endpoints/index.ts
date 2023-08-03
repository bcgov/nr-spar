import RecentActivitiesEndpoints from './RecentActivitiesEndpoints';
import SeedlotRegistrationEndpoints from './SeedlotRegistrationEndpoints';
import OrchardsEndpoints from './OrchardsEndpoint';
import FavouriteEndpoints from './FavouriteEndpoints';
import FilesAndDocsEndpoint from './FilesAndDocsEndpoint';
import ApplicantAgencyEndpoint from './ApplicantAgencyEndpoint';

export const endpoints = {
  recent: RecentActivitiesEndpoints,
  files: FilesAndDocsEndpoint,
  seedlotRegistration: SeedlotRegistrationEndpoints,
  orchards: OrchardsEndpoints,
  applicantAgencies: ApplicantAgencyEndpoint
};

export const jestEndpoints = {
  recent: RecentActivitiesEndpoints,
  seedlotRegistration: SeedlotRegistrationEndpoints,
  orchards: OrchardsEndpoints,
  favouriteActivities: FavouriteEndpoints,
  applicantAgencies: ApplicantAgencyEndpoint
};
