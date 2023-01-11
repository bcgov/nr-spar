import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  HeaderContainer,
  Header,
  SkipToContent,
  HeaderMenuButton,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderPanel,
  SideNav,
  SideNavItems,
  SideNavLink
} from '@carbon/react';
import * as Icons from '@carbon/icons-react';

import { env } from '../../env';

import RightPanelTitle from '../RightPanelTitle';
import MyProfile from '../MyProfile';
import NotificationsCentral from '../NotificationsCentral';
import PanelSectionName from '../PanelSectionName';

import LeftPanelItems from '../../mock-data/LeftPanelItems';

import './styles.scss';

interface ListItem {
  name: string;
  icon: string;
  link: string;
  disabled: boolean;
}
interface ListItems {
  name: string;
  items: ListItem[]
}

const listItems = LeftPanelItems;

const BCHeader = () => {
  const version: string = `Version: ${env.REACT_APP_NRSPARWEBAPP_VERSION}`;
  const [myProfile, setMyProfile] = React.useState<boolean>(false);
  const [notifications, setNotifications] = React.useState<boolean>(false);
  const [overlay, setOverlay] = React.useState<boolean>(false);

  const handleNotificationsPanel = React.useCallback((): void => {
    if (notifications) {
      setOverlay(false);
      setNotifications(false);
    } else {
      setOverlay(true);
      setNotifications(true);
    }
    setMyProfile(false);
  }, [notifications]);

  const handleMyProfilePanel = React.useCallback((): void => {
    if (myProfile) {
      setOverlay(false);
      setMyProfile(false);
    } else {
      setOverlay(true);
      setMyProfile(true);
    }
    setNotifications(false);
  }, [myProfile]);

  const closeNotificationsPanel = React.useCallback((): void => {
    setOverlay(false);
    setNotifications(false);
  }, []);

  const closeMyProfilePanel = React.useCallback((): void => {
    setOverlay(false);
    setMyProfile(false);
  }, []);

  const navigate = useNavigate();

  return (
    <HeaderContainer
      render={({ isSideNavExpanded, onClickSideNavExpand }: any) => (
        <Header
          aria-label="Seed Planning and Registry System"
          className="spar-header"
          data-testid="header"
        >
          <SkipToContent />
          <HeaderMenuButton
            aria-label="Open menu"
            onClick={onClickSideNavExpand}
            isActive={isSideNavExpanded}
          />
          <Link to="/dashboard" className="header-link" data-testid="header-name">
            SPAR
            <span className="header-full-name"> Seed Planning and Registry System</span>
          </Link>
          <HeaderGlobalBar>
            <HeaderGlobalAction
              aria-label="Search"
              data-testid="header-button__search"
            >
              <Icons.Search size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction
              aria-label="Notifications"
              data-testid="header-button__notifications"
              onClick={handleNotificationsPanel}
              isActive={notifications}
            >
              <Icons.Notification size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction
              aria-label="User Settings"
              tooltipAlignment="end"
              data-testid="header-button__user"
              onClick={handleMyProfilePanel}
              isActive={myProfile}
            >
              <Icons.UserAvatar size={20} />
            </HeaderGlobalAction>
          </HeaderGlobalBar>
          <HeaderPanel expanded={notifications} className="notifications-panel">
            <RightPanelTitle
              title="Notifications"
              closeFn={closeNotificationsPanel}
            />
            <NotificationsCentral />
          </HeaderPanel>
          <HeaderPanel expanded={myProfile} className="profile-panel">
            <RightPanelTitle
              title="My Profile"
              closeFn={closeMyProfilePanel}
            />
            <MyProfile />
          </HeaderPanel>
          <div className={overlay ? 'overlay-element active' : 'overlay-element'} />
          <SideNav isChildOfHeader expanded={isSideNavExpanded} aria-label="Side menu">
            <SideNavItems>
              {listItems.map((item: ListItems) => (
                <div key={item.name}>
                  <PanelSectionName title={item.name} />
                  {item.items.map((subItem: ListItem) => {
                    const IconComponent = Icons[subItem.icon];
                    return (
                      <SideNavLink
                        key={subItem.name}
                        renderIcon={IconComponent || ''}
                        onClick={() => {
                          navigate(`${subItem.link}`);
                        }}
                        isActive={window.location.pathname === subItem.link}
                      >
                        {subItem.name}
                      </SideNavLink>
                    );
                  })}
                </div>
              ))}
              <div className="support-section">
                <PanelSectionName title="Support" />
                <SideNavLink renderIcon={Icons.Help}>Need help?</SideNavLink>
                <PanelSectionName title={version} />
              </div>
            </SideNavItems>
          </SideNav>
        </Header>
      )}
    />
  );
};

export default BCHeader;
