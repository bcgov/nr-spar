import React, { useEffect } from 'react';

import {
  Button,
  Grid,
  Column
} from '@carbon/react';
import { Login } from '@carbon/icons-react';
import { KeycloakLoginOptions } from 'keycloak-js';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import BCGovLogo from '../../components/BCGovLogo';
import Seeding from '../../assets/img/seeding.png';

import LoginProviders from '../../types/LoginProviders';

import './styles.scss';

import getUrlQueryParam from '../../utils/UrlUtils';

const Landing = () => {
  const { startKeycloak, login, signed } = useAuth();
  const navigate = useNavigate();
  const homePage = '/dashboard';

  const handleLogin = (provider: LoginProviders) => {
    if (signed) {
      navigate(getUrlQueryParam(window.location, 'page') || homePage);
      return;
    }

    const idpHint = provider;
    const loginOptions: KeycloakLoginOptions = {
      redirectUri: `${window.location.origin}${homePage}`,
      idpHint
    };

    login(loginOptions);
  };

  useEffect(() => {
    if (signed) {
      navigate(getUrlQueryParam(window.location, 'page') || homePage);
    } else {
      startKeycloak();
    }
  }, [signed]);

  return (
    <Grid fullWidth className="landing-grid">
      {/* First - Column */}
      <Column sm={4} md={5} lg={10}>
        {/* Logo */}
        <BCGovLogo />

        {/* Welcome - Title and Subtitle */}
        <h1 data-testid="landing-title" className="landing-title">Welcome to SPAR</h1>
        <h2 data-testid="landing-subtitle" className="landing-subtitle">
          Seed Planning and Registry Application
        </h2>

        {/* Description */}
        <p data-testid="landing-desc" className="landing-desc">
          Register and store your seed and meet your annual
          reforestation needs using
          <span className="spar-span"> SPAR</span>
        </p>

        {/* Login buttons */}
        <Button
          onClick={() => { handleLogin(LoginProviders.IDIR); }}
          size="md"
          renderIcon={Login}
          data-testid="landing-button__idir"
          className="btn-landing"
        >
          Login with IDIR
        </Button>

        <Button
          kind="tertiary"
          onClick={() => { handleLogin(LoginProviders.BCEID_BUSINESS); }}
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
          alt="Small green seedling on the dirt and watered"
          className="seeding-img"
        />
      </Column>
    </Grid>
  );
};

export default Landing;
