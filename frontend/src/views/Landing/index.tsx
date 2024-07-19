import React, { useContext } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  Button,
  Grid,
  Column,
  Loading
} from '@carbon/react';
import { Login } from '@carbon/icons-react';

import BCGovLogo from '../../components/BCGovLogo';
import Seeding from '../../assets/img/cone.jpeg';
import LoginProviders from '../../types/LoginProviders';
import AuthContext from '../../contexts/AuthContext';

import './styles.scss';

const Landing = () => {
  const { signIn } = useContext(AuthContext);
  const [searchParams] = useSearchParams();

  const loginCode = searchParams.get('code');

  if (!loginCode) {
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
            <span className="spar-span">{' SPAR'}</span>
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
  }
  return <Loading />;
};

export default Landing;
