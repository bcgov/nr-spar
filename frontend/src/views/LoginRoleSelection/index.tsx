import React from 'react';
import { FlexGrid, Row, Column } from '@carbon/react';

import './styles.scss';
import { PAGE_TEXT } from './constants';

const LoginRoleSelection = () => {
  const a = 'b';

  return (
    <FlexGrid className="role-selection-grid">
      <Row className="row-container">
        <Column className="col-container" sm={4} md={6} lg={12} xlg={8} max={6}>
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
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default LoginRoleSelection;
