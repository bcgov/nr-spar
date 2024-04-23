import React, { useContext } from 'react';
import { FlexGrid, Row, Column } from '@carbon/react';

import RoleSelection from '../../components/RoleSelection';
import AuthContext from '../../contexts/AuthContext';
import { TEXT } from './constants';

import './styles.scss';

const LoginRoleSelection = () => {
  const { user } = useContext(AuthContext);

  return (
    <FlexGrid className="login-role-selection-grid">
      <Row className="row-container">
        <Column className="col-container" sm={4} md={6} lg={14} xlg={10} max={8}>
          <section className="title-section">
            <h2 className="title-text">
              Organization selection
            </h2>
            <p className="subtitle-text">
              {`${user?.firstName} ${user?.lastName} (${user?.providerUsername}) ${TEXT.subtitle}`}
            </p>
          </section>
          <RoleSelection />
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default LoginRoleSelection;
