import React from 'react';

import { Outlet } from 'react-router-dom';
import { Content } from '@carbon/react';

import { env } from '../../env';
import makeServer from '../../mock-api/server';

import BCHeader from '../../components/BCHeader';

import './styles.scss';

if (env.REACT_APP_ENABLE_MOCK_SERVER === 'true') {
  makeServer();
}

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
