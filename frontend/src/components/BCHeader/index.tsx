import React, { useState } from 'react';
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

import RightPanelTitle from '../RightPanelTitle';
import MyProfile from '../MyProfile';
import NotificationsCentral from '../NotificationsCentral';
import PanelSectionName from '../PanelSectionName';

import {
  HOME_LINK,
  VERSION,
  clearPanelState,
  componentTexts,
  navItems,
  supportItems
} from './constants';
import { RightPanelType } from './definitions';

import './styles.scss';

const BCHeader = () => {
  const [rightPanel, setRightPanel] = useState<RightPanelType>(clearPanelState);
  const [overlay, setOverlay] = useState<boolean>(false);

  const handleRightPanel = (panel: string) => {
    // Using clearPanelState here so that it cleans all other
    // panel options before setting the one we actually want,
    // this solves the case where the user wants to open a new
    // panel, when other one is already open.
    if (rightPanel[panel]) {
      setOverlay(false);
      setRightPanel(clearPanelState);
    } else {
      setOverlay(true);
      setRightPanel({
        ...clearPanelState,
        [panel]: true
      });
    }
  };

  const closeRightPanel = (panel: string) => {
    setOverlay(false);
    setRightPanel({
      ...rightPanel,
      [panel]: false
    });
  };

  const navigate = useNavigate();

  return (
    <HeaderContainer
      render={({ isSideNavExpanded, onClickSideNavExpand }: any) => (
        <Header
          aria-label={componentTexts.completeTitle}
          className="spar-header"
          data-testid="header"
        >
          <SkipToContent />
          <HeaderMenuButton
            aria-label={componentTexts.openMenu}
            onClick={onClickSideNavExpand}
            isActive={isSideNavExpanded}
          />
          <Link to={HOME_LINK} className="header-link" data-testid="header-name">
            {componentTexts.headerTitle}
            <span className="header-full-name">{componentTexts.completeTitle}</span>
          </Link>
          <HeaderGlobalBar>
            <HeaderGlobalAction
              aria-label={componentTexts.searchAriaLabel}
              data-testid="header-button__search"
            >
              <Icons.Search size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction
              aria-label={componentTexts.notifications.title}
              data-testid="header-button__notifications"
              onClick={() => handleRightPanel('notifications')}
              isActive={rightPanel.notifications}
            >
              <Icons.Notification size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction
              aria-label={componentTexts.profile.controllerAriaLabel}
              tooltipAlignment="end"
              data-testid="header-button__user"
              onClick={() => handleRightPanel('myProfile')}
              isActive={rightPanel.myProfile}
            >
              <Icons.UserAvatar size={20} />
            </HeaderGlobalAction>
          </HeaderGlobalBar>
          <HeaderPanel
            aria-label={componentTexts.notifications.headerAriaLabel}
            expanded={rightPanel.notifications}
            className="notifications-panel"
          >
            <RightPanelTitle
              title={componentTexts.notifications.title}
              closeFn={() => closeRightPanel('notifications')}
            />
            <NotificationsCentral />
          </HeaderPanel>
          <HeaderPanel
            aria-label={componentTexts.profile.headerAriaLabel}
            expanded={rightPanel.myProfile}
            className="profile-panel"
          >
            <RightPanelTitle
              title={componentTexts.profile.title}
              closeFn={() => closeRightPanel('myProfile')}
            />
            <MyProfile />
          </HeaderPanel>
          {
            overlay
              ? <div className="overlay-element" />
              : null
          }
          <SideNav
            isChildOfHeader
            expanded={isSideNavExpanded}
            aria-label={componentTexts.sideMenuAriaLabel}
            inert={undefined}
          >
            {
              navItems.map((category) => (
                <SideNavItems key={category.name}>
                  <SideNavLink className="side-nav-category-name">
                    {category.name}
                  </SideNavLink>
                  {
                    category.items.map((navItem) => (
                      <SideNavLink
                        key={navItem.name}
                        className={navItem.disabled ? 'disabled-side-nav-option' : ''}
                        renderIcon={Icons[navItem.icon]}
                        isActive={window.location.pathname === navItem.link}
                        onClick={navItem.disabled ? null : () => navigate(navItem.link)}
                      >
                        {navItem.name}
                      </SideNavLink>
                    ))
                  }
                </SideNavItems>
              ))
            }
            <SideNavLink className="side-nav-category-name">
              {supportItems.name}
            </SideNavLink>
            {
              supportItems.items.map((supportItem) => (
                <SideNavLink
                  key={supportItem.name}
                  renderIcon={Icons[supportItem.icon]}
                  className={supportItem.disabled ? 'disabled-side-nav-option' : ''}
                  onClick={supportItem.disabled ? null : () => navigate(supportItem.link)}
                >
                  {supportItem.name}
                </SideNavLink>
              ))
            }
            <PanelSectionName title={VERSION} />
          </SideNav>
        </Header>
      )}
    />
  );
};

export default BCHeader;
