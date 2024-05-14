import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  SideNavLink
} from '@carbon/react';
import * as Icons from '@carbon/icons-react';

import KeycloakService from '../../service/KeycloakService';

import AvatarImage from '../AvatarImage';
import PanelSectionName from '../PanelSectionName';

import { useThemePreference } from '../../utils/ThemePreference';

import './style.scss';

const accountOptions = [
  {
    icon: 'UserAvatar',
    header: 'My nursery account',
    url: '#'
  },
  {
    icon: 'UserAvatar',
    header: 'My orchard account',
    url: '#'
  },
  {
    icon: 'UserFollow',
    header: 'Add a different profile',
    url: '#'
  }
];

const MyProfile = () => {
  const { theme, setTheme } = useThemePreference();
  const userData = KeycloakService.getUser();

  const [goToURL, setGoToURL] = useState<string>('');
  const [goTo, setGoTo] = useState<boolean>(false);

  const navigate = useNavigate();

  const goOut = useCallback(() => {
    if (theme === 'g100') {
      setTheme('g10');
      localStorage.setItem('mode', 'light');
    }
    navigate('/logout');
  }, []);

  const changeTheme = () => {
    if (theme === 'g10') {
      setTheme('g100');
      localStorage.setItem('mode', 'dark');
    }
    if (theme === 'g100') {
      setTheme('g10');
      localStorage.setItem('mode', 'light');
    }
  };

  useEffect(() => {
    if (goTo) {
      setGoTo(false);
      navigate(goToURL);
    }
  }, [goTo]);

  return (
    <>
      <div className="user-info-section">
        <div className="user-image">
          <AvatarImage userName={`${userData.firstName} ${userData.lastName}`} size="large" />
        </div>
        <div className="user-data">
          <p className="user-name">{`${userData.firstName} ${userData.lastName}`}</p>
          <p>{`IDIR: ${userData.idirUsername}`}</p>
          <p>{userData.email}</p>
        </div>
      </div>
      <hr className="divisory" />
      <nav className="account-nav">
        <ul>
          <PanelSectionName title="Change account" light />
          {accountOptions.map((option) => {
            const IconComponent = Icons[option.icon];
            return (
              <SideNavLink
                key={option.header}
                renderIcon={IconComponent || ''}
                onClick={() => {
                  setGoToURL(option.url);
                  setGoTo(true);
                }}
              >
                {option.header}
              </SideNavLink>
            );
          })}
          <PanelSectionName title="Options" light />
          <SideNavLink
            renderIcon={Icons.DataEnrichment}
            onClick={() => { changeTheme(); }}
          >
            Change theme
          </SideNavLink>
          <SideNavLink
            renderIcon={Icons.UserFollow}
            onClick={goOut}
          >
            Sign out
          </SideNavLink>
        </ul>
      </nav>
    </>
  );
};

export default MyProfile;
