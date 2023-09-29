import React, { useCallback, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  SideNavLink
} from '@carbon/react';
import * as Icons from '@carbon/icons-react';

import { AuthContext } from '../../contexts/AuthContext';

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
  const { user } = useContext(AuthContext);

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
          <AvatarImage userName={`${user?.firstName} ${user?.lastName}`} size="large" />
        </div>
        <div className="user-data">
          <p className="user-name">{`${user?.firstName} ${user?.lastName}`}</p>
          <p>{`IDIR: ${user?.idirUsername}`}</p>
          <p>{user?.email}</p>
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
