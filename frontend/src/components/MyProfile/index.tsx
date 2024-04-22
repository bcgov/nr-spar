import React, { useContext } from 'react';

import {
  SideNavLink
} from '@carbon/react';
import * as Icons from '@carbon/icons-react';

import AuthContext from '../../contexts/AuthContext';
import Avatar from '../Avatar';
import PanelSectionName from '../PanelSectionName';
import { useThemePreference } from '../../utils/ThemePreference';
import LoginProviders from '../../types/LoginProviders';
import { env } from '../../env';

import './style.scss';

const MyProfile = () => {
  const appVersion: string = env.VITE_NRSPARWEBAPP_VERSION || 'dev';

  const { theme, setTheme } = useThemePreference();
  const { user, signOut, selectedClientRoles } = useContext(AuthContext);

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

  const logOut = (): void => {
    if (theme === 'g100') {
      changeTheme();
    }
    signOut();
  };

  return (
    <>
      <div className="user-info-section">
        <div className="user-avatar">
          <Avatar
            size="md"
            initial={`${user?.firstName.charAt(0).toUpperCase()}${user?.lastName.charAt(0).toUpperCase()}`}
          />
        </div>
        <div className="user-data">
          <p className="user-name">{`${user?.firstName} ${user?.lastName}`}</p>
          {
            user?.provider === LoginProviders.IDIR && (
              <p>{`IDIR: ${user?.providerUsername}`}</p>
            )
          }
          {
            user?.provider === LoginProviders.BCEID_BUSINESS && (
              <p>{`BCeID: ${user?.providerUsername}`}</p>
            )
          }
          <p>{user?.email}</p>
          <p>{selectedClientRoles!.clientName}</p>
        </div>
      </div>
      <hr className="divisory" />
      <nav className="account-nav">
        <ul>
          <PanelSectionName title="Change account" light />
          <div>haha</div>
          <PanelSectionName title="Options" light />
          <SideNavLink
            renderIcon={Icons.DataEnrichment}
            onClick={() => changeTheme()}
          >
            Change theme
          </SideNavLink>
          <SideNavLink
            renderIcon={Icons.UserFollow}
            onClick={() => logOut()}
          >
            Log out
          </SideNavLink>
          {
            appVersion === 'dev'
              ? (
                <>
                  <PanelSectionName title="Dev Zone" light />
                  <SideNavLink
                    renderIcon={Icons.Pen}
                    // eslint-disable-next-line no-console
                    onClick={() => console.log(user)}
                  >
                    Log user object
                  </SideNavLink>
                  <SideNavLink
                    renderIcon={Icons.Copy}
                    onClick={() => navigator.clipboard.writeText(user?.jwtToken ?? '')}
                  >
                    Copy JWT
                  </SideNavLink>
                </>
              )
              : null
          }
        </ul>
      </nav>
    </>
  );
};

export default MyProfile;
