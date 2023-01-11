import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  SideNavLink
} from '@carbon/react';
import * as Icons from '@carbon/icons-react';

import KeycloakService from '../../service/KeycloakService';

import AvatarImage from '../AvatarImage';
import PanelSectionName from '../PanelSectionName';

import AccountOptions from '../../mock-data/AccountOptions';

import './style.scss';

const MyProfile = () => {
  const userData = KeycloakService.getUser();

  const navigate = useNavigate();

  const goTo = React.useCallback((url: string) => {
    navigate(url);
  }, []);

  const goOut = React.useCallback(() => {
    navigate('/logout');
  }, []);

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
          <PanelSectionName title="Change account" />
          {AccountOptions.map((option) => {
            const IconComponent = Icons[option.icon];
            return (
              <SideNavLink
                key={option.header}
                renderIcon={IconComponent || ''}
                onClick={goTo(option.url)}
              >
                {option.header}
              </SideNavLink>
            );
          })}
          <PanelSectionName title="Options" />
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
