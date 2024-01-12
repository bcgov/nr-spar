import { redirect } from 'react-router-dom';
import { SPAR_REDIRECT_PATH } from '../shared-constants/shared-constants';

export const protectedRouteLoader = async (signed: boolean) => {
  if (signed) {
    const storedPath = localStorage.getItem(SPAR_REDIRECT_PATH);
    if (storedPath) {
      localStorage.removeItem(SPAR_REDIRECT_PATH);
      return redirect('/seedlots');
    }
  }
  return null;
};
