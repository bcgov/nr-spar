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
  SideNavLink
} from '@carbon/react';
import * as Icons from '@carbon/icons-react';

import RightPanelTitle from '../RightPanelTitle';
import MyProfile from '../MyProfile';
import NotificationsCentral from '../NotificationsCentral';
import PanelSectionName from '../PanelSectionName';
import useWindowSize from '../../hooks/UseWindowSize';
import { MEDIUM_SCREEN_WIDTH } from '../../shared-constants/shared-constants';

import {
  HOME_LINK,
  VERSION,
  defaultPanelState,
  componentTexts,
  navItems,
  supportItems
} from './constants';
import { RightPanelType, HearderContainerProps } from './definitions';
import UserButton from './UserButton';

import './styles.scss';

const BCHeader = () => {
  const [rightPanel, setRightPanel] = useState<RightPanelType>(defaultPanelState);
  const [overlay, setOverlay] = useState<boolean>(false);

  const windowSize = useWindowSize();

  const handleRightPanel = (panel: keyof RightPanelType) => {
    // Using clearPanelState here so that it cleans all other
    // panel options before setting the one we actually want,
    // this solves the case where the user wants to open a new
    // panel, when other one is already open.
    if (rightPanel[panel]) {
      setOverlay(false);
      setRightPanel(defaultPanelState);
    } else {
      setOverlay(true);
      setRightPanel({
        ...defaultPanelState,
        [panel]: true
      });
    }
  };

  const closeRightPanel = (panel: keyof RightPanelType) => {
    setOverlay(false);
    setRightPanel({
      ...rightPanel,
      [panel]: false
    });
  };

  const handleClosePanel = () => {
    if (rightPanel.notifications) {
      closeRightPanel('notifications');
    } else { closeRightPanel('myProfile'); }
  };

  const onKeyDownFunction = (event: any) => {
    if (event.key === 'Enter' || event.key === 'Escape') {
      handleClosePanel();
    }
  };

  const navigate = useNavigate();

  return (
    <HeaderContainer
      render={({ isSideNavExpanded, onClickSideNavExpand }: HearderContainerProps) => (
        <Header
          aria-label={componentTexts.completeTitle}
          className="spar-header"
          data-testid="header"
          onClick={isSideNavExpanded ? onClickSideNavExpand : null}
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
              className="header-action-btn btn-disabled"
            >
              <Icons.Search size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction
              aria-label={componentTexts.notifications.title}
              data-testid="header-button__notifications"
              className="header-action-btn btn-disabled"
              isActive={rightPanel.notifications}
            >
              <Icons.Notification size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction
              className="user-header-global-action"
              aria-label={componentTexts.profile.headerAriaLabel}
              data-testid="header-button__user"
              tooltipAlignment={
                windowSize.innerWidth > MEDIUM_SCREEN_WIDTH
                  ? 'center'
                  : 'end'
              }
              onClick={() => handleRightPanel('myProfile')}
              isActive={rightPanel.myProfile}
            >
              <UserButton />
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
              ? (
                <div
                  className="overlay-element"
                  role="button"
                  tabIndex={0}
                  aria-label="close right panel"
                  onKeyDown={onKeyDownFunction}
                  onClick={handleClosePanel}
                />
              )
              : null
          }
          <SideNav
            isChildOfHeader
            expanded={isSideNavExpanded}
            aria-label={componentTexts.sideMenuAriaLabel}
            inert={undefined}
            className="spar-side-nav"
            onClick={isSideNavExpanded ? onClickSideNavExpand : null}
          >
            <div className="side-nav-top">
              {
                navItems.map((category) => (
                  <div key={category.name}>
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
                  </div>
                ))
              }
            </div>
            <div>
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
            </div>
          </SideNav>
        </Header>
      )}
    />
  );
};

export default BCHeader;
