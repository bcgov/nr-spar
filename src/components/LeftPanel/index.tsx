import React from 'react';

import { SideNav, SideNavItems, SideNavLink } from '@carbon/react';

import * as Icons from '@carbon/icons-react';
import { env } from '../../env';

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

interface LeftPanelProps {
  listItems: ListItems[];
}

const LeftPanel = ({ listItems }: LeftPanelProps) => {
  const version: string = `Version: ${env.REACT_APP_NRFESAMPLEAPP_VERSION}`;

  return (
    <SideNav isFixedNav expanded isChildOfHeader aria-label="Side navigation">
      <SideNavItems>
        {listItems.map((item: ListItems) => (
          <div key={item.name}>
            <SideNavLink key={item.name} title={item.name} disabled>
              {item.name}
            </SideNavLink>
            {item.items.map((subItem: ListItem) => {
              const IconComponent = Icons[subItem.icon];
              return (
                <SideNavLink
                  key={subItem.name}
                  renderIcon={IconComponent || ''}
                  href={!subItem.disabled ? subItem.link : null}
                  isActive={window.location.pathname === subItem.link}
                >
                  {subItem.name}
                </SideNavLink>
              );
            })}
          </div>
        ))}
        <div className="support-section">
          <SideNavLink disabled>Support</SideNavLink>
          <SideNavLink renderIcon={Icons.Help}>Need help?</SideNavLink>
          <SideNavLink disabled>{version}</SideNavLink>
        </div>
      </SideNavItems>
    </SideNav>
  );
};

export default LeftPanel;
