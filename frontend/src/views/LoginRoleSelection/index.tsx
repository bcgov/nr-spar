import React from 'react';
import { FlexGrid, Row, Column } from '@carbon/react';

import RoleSelection from '../../components/RoleSelection';

import { PAGE_TEXT } from './constants';

import './styles.scss';

const LoginRoleSelection = () => (
  <FlexGrid className="login-role-selection-grid">
    <Row className="row-container">
      <Column className="col-container" sm={4} md={6} lg={14} xlg={10} max={8}>
        <section className="title-section">
          <h2 className="title-text">
            Organization selection
          </h2>
          <p className="subtitle-text">
            {PAGE_TEXT.subtitlePtOne}
          </p>
          <p className="subtitle-text">
            {PAGE_TEXT.subtitlePtTwo}
          </p>
        </section>
        <RoleSelection />
      </Column>
    </Row>
  </FlexGrid>
);

export default LoginRoleSelection;
