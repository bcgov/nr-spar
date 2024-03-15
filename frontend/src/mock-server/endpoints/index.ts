import RecentActivitiesEndpoints from './RecentActivitiesEndpoints';
import OrchardsEndpoints from './OrchardsEndpoint';
import FilesAndDocsEndpoint from './FilesAndDocsEndpoint';
import ApplicantAgencyEndpoint from './ApplicantAgencyEndpoint';

export const endpoints = {
  recent: RecentActivitiesEndpoints,
  files: FilesAndDocsEndpoint,
  orchards: OrchardsEndpoints,
  applicantAgencies: ApplicantAgencyEndpoint
};

export const jestEndpoints = {
  recent: RecentActivitiesEndpoints,
  orchards: OrchardsEndpoints,
  applicantAgencies: ApplicantAgencyEndpoint
};
