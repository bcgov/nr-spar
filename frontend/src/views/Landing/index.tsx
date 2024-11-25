import React, { useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import {
  Button, Grid,
  Column, Loading,
  ActionableNotification
} from '@carbon/react';
import { Login } from '@carbon/icons-react';
import { useQueries } from '@tanstack/react-query';

import BCGovLogo from '../../components/BCGovLogo';
import Seeding from '../../assets/img/cone.jpeg';
import LoginProviders from '../../types/LoginProviders';
import AuthContext from '../../contexts/AuthContext';
import { SPAR_DEPENDENCIES } from '../ServiceStatus/constants';
import { THIRTY_SECONDS } from '../../config/TimeUnits';

import './styles.scss';

const Landing = () => {
  const { signIn } = useContext(AuthContext);
  const [searchParams] = useSearchParams();

  const statusQueries = useQueries({
    queries: SPAR_DEPENDENCIES.map((dependencyObj) => ({
      queryKey: [dependencyObj.queryKey],
      queryFn: () => fetch(dependencyObj.healthCheckUrl, { mode: 'no-cors' }),
      refetchInterval: THIRTY_SECONDS,
      refetchIntervalInBackground: false,
      retry: 0
    }))
  });

  const loginCode = searchParams.get('code');

  if (!loginCode) {
    return (
      <Grid fullWidth className="landing-grid">
        {/* First - Column */}
        <Column sm={4} md={5} lg={10}>
          {/* Logo */}
          <BCGovLogo />

          {
            statusQueries.filter((query) => query.status === 'error').length > 0
              ? (
                <ActionableNotification
                  role="alert"
                  aria-live="assertive"
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
                    You can check the&nbsp;
                    <Link
                      role="link"
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

          {/* Welcome - Title and Subtitle */}
          <h1 data-testid="landing-title" className="landing-title">Welcome to SPAR</h1>
          <h2 data-testid="landing-subtitle" className="landing-subtitle">
            Seed Planning and Registry Application
          </h2>

          {/* Description */}
          <p data-testid="landing-desc" className="landing-desc">
            Register and store your seed and meet your annual
            reforestation needs using
            <span className="spar-span">{' SPAR'}</span>
          </p>

          {/* Login buttons */}
          <Button
            type="button"
            role="button"
            onClick={() => { signIn(LoginProviders.IDIR); }}
            size="md"
            renderIcon={Login}
            data-testid="landing-button__idir"
            className="btn-landing"
          >
            Login with IDIR
          </Button>

          <Button
            type="button"
            kind="tertiary"
            onClick={() => { signIn(LoginProviders.BCEID_BUSINESS); }}
            size="md"
            renderIcon={Login}
            data-testid="landing-button__bceid"
            className="btn-landing"
            id="bceid-login-btn"
          >
            Login with Business BCeID
          </Button>
        </Column>

        {/* Second - Column */}
        <Column className="seeding-img-column" sm={4} md={3} lg={6}>
          <img
            src={Seeding}
            alt="Spruce tree branches with needles and cones"
            className="seeding-img"
          />
        </Column>
      </Grid>
    );
  }
  return <Loading />;
};

export default Landing;
