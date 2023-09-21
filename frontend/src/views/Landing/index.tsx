import React, { useEffect } from 'react';

import {
  Button,
  Grid,
  Column
} from '@carbon/react';
import { Login } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';

import BCGovLogo from '../../components/BCGovLogo';
import Seeding from '../../assets/img/seeding.png';
import { signIn } from '../../service/AuthService';
import LoginProviders from '../../types/LoginProviders';
import getUrlQueryParam from '../../utils/UrlUtils';

import './styles.scss';
import { useAuth } from '../../contexts/AuthContext';

const Landing = () => {
  const { signed } = useAuth();
  const navigate = useNavigate();
  const homePage = '/dashboard';

  useEffect(() => {
    if (signed) {
      navigate(getUrlQueryParam(window.location, 'page') || homePage);
    }
  }, []);

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
          onClick={() => { signIn(LoginProviders.IDIR); }}
          size="md"
          renderIcon={Login}
          data-testid="landing-button__idir"
          className="btn-landing"
        >
          Login with IDIR
        </Button>

        <Button
          kind="tertiary"
          onClick={() => { signIn(LoginProviders.BCEID_BUSINESS); }}
          size="md"
          renderIcon={Login}
          data-testid="landing-button__bceid"
          className="btn-landing"
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
