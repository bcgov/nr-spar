import ROUTES from '../routes/constants';
import { SPAR_REDIRECT_PATH } from '../shared-constants/shared-constants';

export const getStoredPath = () => {
  let storedPath = null;
  storedPath = localStorage.getItem(SPAR_REDIRECT_PATH);
  if (storedPath) {
    localStorage.removeItem(SPAR_REDIRECT_PATH);
    return storedPath === ROUTES.ROOT ? ROUTES.DASHBOARD : storedPath;
  }
  return ROUTES.DASHBOARD;
};

// Split on the ':' character, since it is where
// the param will be mapped to, by definition,
// and append the param value
export const addParamToPath = (path: string, param: string): string => `${path.split(':')[0]}${param}`;
