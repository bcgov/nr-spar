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

  // Recent activities
  let recentActivitiesRetrieveAll = '/api/recent-activities';

  // Mocks
  if (env.REACT_APP_ENABLE_MOCK_SERVER === 'true') {
    // Favourite activities
    favouriteActivitiesRetrieveUrl = '/favourite-activities';
    favouriteActivitiesUpdateUrl = '/favourite-activities/del/:id';
    favouriteActivitiesDeleteUrl = '/favourite-activities/up/:id';

    // Recent activities
    recentActivitiesRetrieveAll = '/recent-activities';
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
    case ApiAddresses.RecentActivitiesRetrieveAll:
      return `${server}${recentActivitiesRetrieveAll}`;
    default:
      return '';
  }
};

export default getUrl;
