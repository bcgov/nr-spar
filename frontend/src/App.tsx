import React, { useContext, useEffect } from 'react';
import {
  createBrowserRouter, Navigate, RouterProvider
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import './styles/custom.scss';
import 'react-toastify/dist/ReactToastify.css';

import { Amplify } from 'aws-amplify';
import Layout from './layout/PrivateLayout';
import Landing from './views/Landing';

import awsconfig from './aws-exports';
import AuthContext from './contexts/AuthContext';
// import { SPAR_REDIRECT_PATH } from './shared-constants/shared-constants';
import routes from './routes';
import PathConstants from './routes/pathConstants';
import FourOhFour from './views/FourOhFour';
// import ProtectedRoute from './routes/ProtectedRoute';

Amplify.configure(awsconfig);

/**
 * Create an app structure containing all the routes.
 *
 * @returns {JSX.Element} instance of the app ready to use.
 */
const App: React.FC = () => {
  const { signed, isCurrentAuthUser } = useContext(AuthContext);
  console.log(signed);
  // const navigate = useNavigate();

  useEffect(() => {
    isCurrentAuthUser(window.location.pathname);
  }, [signed]);

  // useEffect(() => {
  //   if (signed) {
  //     const storedPath = localStorage.getItem(SPAR_REDIRECT_PATH);
  //     if (storedPath) {
  //       // navigate(storedPath === '/' ? '/dashboard' : storedPath);
  //       localStorage.removeItem(SPAR_REDIRECT_PATH);
  //     } else if (window.location.pathname === '/') {
  //       // navigate('/dashboard');
  //     }
  //   }
  // }, [signed]);

  const router = createBrowserRouter([
    {
      path: PathConstants.HOME,
      element: <Navigate to={signed ? PathConstants.DASHBOARD : PathConstants.LOGIN} replace />,
      children: [
        {
          element: <Layout />,
          children: routes
        }
      ]
    },
    {
      path: PathConstants.LOGIN,
      element: <Landing />
    },
    {
      path: PathConstants.ALL_ROUTES,
      element: <FourOhFour />
    }
  ]);

  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  );
};

export default App;
