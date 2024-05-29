import React, { useContext } from 'react';
import { FlexGrid, Row, Column } from '@carbon/react';

import OrganizationSelection from '../../components/OrganizationSelection';
import AuthContext from '../../contexts/AuthContext';

import './styles.scss';

const LoginOrgSelection = () => {
  const { user } = useContext(AuthContext);

  return (
    <FlexGrid className="login-org-selection-grid">
      <Row className="row-container">
        <Column className="col-container" sm={4} md={6} lg={14} xlg={10} max={8}>
          <section className="title-section">
            <h2 className="title-text">
              Organization selection
            </h2>
            <p className="subtitle-text">
              {`${user?.firstName} ${user?.lastName} (${user?.providerUsername}) select which organization you're representing.`}
            </p>
          </section>
          <OrganizationSelection />
        </Column>
      </Row>
    </FlexGrid>
  );
};

export default LoginOrgSelection;
