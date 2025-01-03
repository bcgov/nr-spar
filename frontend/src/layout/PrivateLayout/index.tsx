import React from 'react';
import { Outlet, Link } from 'react-router';

import { Content, ActionableNotification } from '@carbon/react';
import { useQueries } from '@tanstack/react-query';

import { SPAR_DEPENDENCIES } from '../../views/ServiceStatus/constants';
import BCHeader from '../../components/BCHeader';
import ScrollToTop from '../../components/ScrollToTop';

import { THIRTY_SECONDS } from '../../config/TimeUnits';

import './styles.scss';

const Layout = () => {
  const statusQueries = useQueries({
    queries: SPAR_DEPENDENCIES.map((dependencyObj) => ({
      queryKey: [dependencyObj.queryKey],
      queryFn: () => fetch(dependencyObj.healthCheckUrl, { mode: 'no-cors' }),
      refetchInterval: THIRTY_SECONDS,
      refetchIntervalInBackground: false,
      retry: 0
    }))
  });

  return (
    <>
      <BCHeader />
      <ScrollToTop />
      <div className="main-container">
        {
          statusQueries.filter((query) => query.status === 'error').length > 0
            ? (
              <ActionableNotification
                className="dependency-notification"
                kind="warning"
                lowContrast
                title="SPAR Dependency Failure"
                actionButtonLabel=""
                hideCloseButton
              >
                <span className="notification-subtitle">
                  <br />
                  SPAR&apos;s service is impacted due to server connection issue.
                  Please save your work if possible.
                  <br />
                  You can check the&nbsp;
                  <Link
                    target="_blank"
                    to="/service-status"
                  >
                    SPAR dependency status page
                  </Link>
                &nbsp;for details.
                </span>
              </ActionableNotification>
            )
            : null
        }
        <Content className="page-content">
          <Outlet />
        </Content>
      </div>
    </>
  );
};

export default Layout;
