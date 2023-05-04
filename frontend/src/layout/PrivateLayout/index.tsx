import React from 'react';

import { Outlet } from 'react-router-dom';
import { Content } from '@carbon/react';

import BCHeader from '../../components/BCHeader';

import './styles.scss';

const Layout = () => (
  <>
    <BCHeader />
    <div className="mainContainer">
      <Content className="page-content">
        <Outlet />
      </Content>
    </div>
  </>
);

export default Layout;
