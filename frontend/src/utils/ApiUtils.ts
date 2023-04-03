import { env } from '../env';
import ApiAddresses from './ApiAddresses';

const serverUrl = (): string => {
  if (env.REACT_APP_ENABLE_MOCK_SERVER === 'true') {
    return '/mock-api';
  }

  return env.REACT_APP_SERVER_URL;
};

const getUrl = (apiAddress: ApiAddresses, mockServer: boolean = false): string => {
  // Favourite activities
  let favouriteActivitiesRetrieveUrl = '/api/favourite-activities';
  let favouriteActivitiesUpdateUrl = '/api/favourite-activities/:id';
  let favouriteActivitiesDeleteUrl = '/api/favourite-activities/:id';
  let favouriteActivitiesCreateUrl = '/api/favourite-activities';

  // Recent activities
  let recentActivitiesRetrieveAll = '/api/recent-activities';

  // Genetic classes
  let geneticClassesRetrieveAll = '/api/genetic-classes';

  // Applicant Info
  let applicantInfoRetrieveAll = '/api/application-info';

  // A Class Seedlot Register
  let aClassSeedlotPostUrl = '/api/register-a-class';

  // Retrieve one seedlot
  let seedlotRetrieveOneUrl = '/api/seedlot/:seedlotnumber';

  // Retrieve all seedlots
  let seedlotRetrieveAllUrl = '/api/seedlot';

  // Seedlot orchard step register
  let seedlotOrchardPostUrl = '/api/seedlot/orchard/:seedlotnumber';

  // Retrieve one orchard
  let orchardRetrieveOneUrl = '/api/orchard/:orchardnumber';

  // Seedlot Registration - Interim Storage Step Register
  let interimStoragePostUrl = '/api/seedlot/registration/:seedlotnumber';

  // Seedlot Registration - Ownership Step Register
  let seedlotOwnerRegister = '/api/seedlot/register-ownership/:seedlotnumber';

  // Mocks
  if (env.REACT_APP_ENABLE_MOCK_SERVER === 'true') {
    // Favourite activities
    favouriteActivitiesRetrieveUrl = '/favourite-activities';
    favouriteActivitiesUpdateUrl = '/favourite-activities/del/:id';
    favouriteActivitiesDeleteUrl = '/favourite-activities/up/:id';
    favouriteActivitiesCreateUrl = '/favourite-activities';

    // Recent activities
    recentActivitiesRetrieveAll = '/recent-activities';

    // Genetic classes
    geneticClassesRetrieveAll = '/genetic-classes';

    // Applicant Info
    applicantInfoRetrieveAll = '/application-info';

    // A Class Seedlot Register
    aClassSeedlotPostUrl = '/register-a-class';

    // Retrieve one seedlot
    seedlotRetrieveOneUrl = '/seedlot/:seedlotnumber';

    // Interim Storage Post
    interimStoragePostUrl = '/seedlot/registration/:seedlotnumber';

    // Seedlot Registration Ownership endpoint
    seedlotOwnerRegister = '/seedlot/register-ownership/:seedlotnumber';

    // Seedlot orchard step register
    seedlotOrchardPostUrl = '/seedlot/orchard/:seedlotnumber';

    // Retrieve one orchard
    orchardRetrieveOneUrl = '/orchard/:orchardnumber';

    // Retrieve all seedlot
    seedlotRetrieveAllUrl = '/seedlot';
  }

  let server = serverUrl();
  if (mockServer) {
    server = '';
  }

  switch (apiAddress) {
    case ApiAddresses.FavouriteActiviteRetrieveAll:
      return `${server}${favouriteActivitiesRetrieveUrl}`;
    case ApiAddresses.FavouriteActiviteSave:
      return `${server}${favouriteActivitiesUpdateUrl}`;
    case ApiAddresses.FavouriteActiviteDelete:
      return `${server}${favouriteActivitiesDeleteUrl}`;
    case ApiAddresses.FavouriteActiviteCreate:
      return `${server}${favouriteActivitiesCreateUrl}`;
    case ApiAddresses.RecentActivitiesRetrieveAll:
      return `${server}${recentActivitiesRetrieveAll}`;
    case ApiAddresses.GeneticClassesRetrieveAll:
      return `${server}${geneticClassesRetrieveAll}`;
    case ApiAddresses.ApplicantInfoRetrieveAll:
      return `${server}${applicantInfoRetrieveAll}`;
    case ApiAddresses.AClassSeedlotPost:
      return `${server}${aClassSeedlotPostUrl}`;
    case ApiAddresses.SeedlotRetrieveOne:
      return `${server}${seedlotRetrieveOneUrl}`;
    case ApiAddresses.SeedlotRetrieveAll:
      return `${server}${seedlotRetrieveAllUrl}`;
    case ApiAddresses.SeedlotOrchardPost:
      return `${server}${seedlotOrchardPostUrl}`;
    case ApiAddresses.OrchardRetriveOne:
      return `${server}${orchardRetrieveOneUrl}`;
    case ApiAddresses.InterimStoragePost:
      return `${server}${interimStoragePostUrl}`;
    case ApiAddresses.SeedlotOwnerRegister:
      return `${server}${seedlotOwnerRegister}`;
    default:
      return '';
  }
};

export default getUrl;
