import React from 'react';

import {
  Button,
  Header,
  HeaderGlobalBar,
  HeaderGlobalAction,
  Theme
} from '@carbon/react';
import {
  Search,
  Notification,
  UserAvatar
} from '@carbon/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import './styles.scss';

const BCHeader = () => {
  const navigate = useNavigate();

  const goOut = () => {
    navigate('/logout');
  };

  return (
    <Theme theme="g100">
      <Header aria-label="BC Gov's NR Sample App" data-testid="header">
        <Link to="/dashboard" className="header-link" data-testid="header-name">
          SPAR
          <span className="header-full-name"> Seed Planning and Registry System</span>
        </Link>
        <HeaderGlobalBar>
          <Button
            onClick={() => goOut()}
            size="sm"
          >
            Logout
          </Button>
          <HeaderGlobalAction aria-label="Search" data-testid="header-button__search">
            <Search size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="Notifications" data-testid="header-button__notifications">
            <Notification size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="User Settings" tooltipAlignment="end" data-testid="header-button__user">
            <UserAvatar size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>
    </Theme>
  );
};

export default BCHeader;
