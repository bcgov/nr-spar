import React from 'react';

import { Outlet } from 'react-router-dom';
import { Content } from '@carbon/react';

import BCHeader from '../../components/BCHeader';

import LeftPanel from '../../components/LeftPanel';

import './styles.scss';

import LeftPanelItems from '../../mock-data/LeftPanelItems';

const listItems = LeftPanelItems;

const Layout = () => (
  <>
    <BCHeader />
    <div className="mainContainer">
      <LeftPanel listItems={listItems} />
      <Content className="page-content">
        <Outlet />
      </Content>
    </div>
  </>
);

export default Layout;
