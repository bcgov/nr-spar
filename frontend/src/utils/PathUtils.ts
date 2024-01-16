import PathConstants from '../routes/pathConstants';
import { SPAR_REDIRECT_PATH } from '../shared-constants/shared-constants';

export const getStoredPath = () => {
  let storedPath = null;
  storedPath = localStorage.getItem(SPAR_REDIRECT_PATH);
  if (storedPath) {
    localStorage.removeItem(SPAR_REDIRECT_PATH);
    return storedPath === PathConstants.ROOT ? PathConstants.DASHBOARD : storedPath;
  }
  return PathConstants.DASHBOARD;
};
