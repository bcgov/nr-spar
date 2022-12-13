import React from 'react';
import { Outlet } from 'react-router-dom';

import { FlexGrid } from '@carbon/react';

import BCHeader from '../../components/BCHeader';

import './styles.css';

const Layout = () => (
  <>
    <BCHeader />
    <FlexGrid className="mainContainer">
      <Outlet />
    </FlexGrid>
  </>
);

export default Layout;
